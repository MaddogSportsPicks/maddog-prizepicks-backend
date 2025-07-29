const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const scraper = require('./scraper.cjs');
const dataProcessor = require('./dataProcessor.cjs');
const dataStore = require('./dataStore.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Add Railway-specific configuration
const RAILWAY_STATIC_URL = process.env.RAILWAY_STATIC_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://iridescent-tartufo-7f5846.netlify.app';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    FRONTEND_URL,
    /\.netlify\.app$/,
    /\.railway\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/props/goblin-total-bases', (req, res) => {
  const data = dataStore.getGoblinPicks('Total Bases');
  res.json(data);
});

app.get('/api/props/goblin-fantasy-score', (req, res) => {
  const data = dataStore.getGoblinPicks('Fantasy Score');
  res.json(data);
});

app.get('/api/props/goblin-strikeouts', (req, res) => {
  const data = dataStore.getGoblinPicks('Strikeouts');
  res.json(data);
});

app.get('/api/props/all-goblins', (req, res) => {
  const data = dataStore.getAllGoblinPicks();
  res.json(data);
});

app.get('/api/scrape-status', (req, res) => {
  const status = dataStore.getScrapeStatus();
  res.json(status);
});

app.post('/api/manual-scrape', async (req, res) => {
  try {
    console.log('Manual scrape initiated...');
    await performScrape();
    res.json({ success: true, message: 'Manual scrape completed' });
  } catch (error) {
    console.error('Manual scrape failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scraping function
async function performScrape() {
  try {
    dataStore.updateScrapeStatus('running', 'Scraping PrizePicks data...');
    
    console.log('Starting PrizePicks scrape...');
    const rawData = await scraper.scrapePrizePicks();
    
    console.log('Processing scraped data...');
    const goblinPicks = dataProcessor.identifyGoblinPicks(rawData);
    
    console.log('Storing goblin picks...');
    dataStore.storeGoblinPicks(goblinPicks);
    
    dataStore.updateScrapeStatus('completed', `Found ${goblinPicks.length} goblin picks`);
    console.log(`✅ Scrape completed. Found ${goblinPicks.length} goblin picks.`);
    
  } catch (error) {
    console.error('❌ Scrape failed:', error);
    dataStore.updateScrapeStatus('error', error.message);
    throw error;
  }
}

// Schedule scrapes for 12 PM and 5 PM EST
// 12 PM EST = 17:00 UTC (during standard time)
cron.schedule('0 17 * * *', async () => {
  console.log('🕐 Running scheduled 12 PM EST scrape...');
  await performScrape();
}, {
  timezone: "America/New_York"
});

// 5 PM EST = 22:00 UTC (during standard time)
cron.schedule('0 22 * * *', async () => {
  console.log('🕔 Running scheduled 5 PM EST scrape...');
  await performScrape();
}, {
  timezone: "America/New_York"
});

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Serve React app for all other routes in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 MLB Prop Scraper server running on port ${PORT}`);
  console.log(`📅 Scheduled scrapes: 12:00 PM and 5:00 PM EST daily`);
  
  // Initial scrape on startup (for development)
  setTimeout(() => {
    console.log('🔄 Running initial scrape...');
    performScrape().catch(console.error);
  }, 5000);
});