const puppeteer = require('puppeteer');

class PrizePicksScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async scrapeMLBProps() {
    try {
      console.log('Navigating to PrizePicks...');
      await this.page.goto('https://app.prizepicks.com/', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait for the page to load
      await this.page.waitForTimeout(3000);

      // Check if login is required
      const loginRequired = await this.page.$('input[type="email"], input[type="password"], .login-form, [data-testid="login"]');
      if (loginRequired) {
        console.log('⚠️  Login appears to be required. Attempting to access public props...');
        
        // Try to navigate directly to props page
        await this.page.goto('https://app.prizepicks.com/board', { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        // Check again if login is still required
        const stillRequiresLogin = await this.page.$('input[type="email"], input[type="password"], .login-form, [data-testid="login"]');
        if (stillRequiresLogin) {
          throw new Error('Login required to access PrizePicks data. Public access may have been restricted.');
        }
      }
      // Try to find and click MLB sport selector
      try {
        // Wait for page to fully load
        await this.page.waitForTimeout(5000);
        
        // Try multiple selectors for MLB
        const mlbSelectors = [
          '[data-testid="sport-MLB"]',
          'button[data-sport="MLB"]',
          '[data-sport-id="MLB"]',
          'button:has-text("MLB")',
          '.sport-tab[data-sport="MLB"]',
          'button[aria-label*="MLB"]',
          'button[title*="MLB"]'
        ];
        
        let mlbSelected = false;
        for (const selector of mlbSelectors) {
          try {
            await this.page.waitForSelector(selector, { timeout: 3000 });
            await this.page.click(selector);
            console.log(`Selected MLB using selector: ${selector}`);
            mlbSelected = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!mlbSelected) {
          console.log('Could not find MLB selector, proceeding with default view');
        }
        
        console.log('Selected MLB sport');
      } catch (error) {
        console.log('MLB selector not found, proceeding with available props');
      }

      await this.page.waitForTimeout(3000);

      // Scrape player props
      console.log('Scraping player props...');
      const props = await this.page.evaluate(() => {
        // Try multiple selectors for prop cards
        const selectors = [
          '[data-testid^="pick-card"]',
          '.pick-card',
          '.player-prop',
          '[data-testid="prop-card"]',
          '.prop-item',
          '.pick-item',
          '[class*="pick"]',
          '[class*="prop"]'
        ];
        
        let propElements = [];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            propElements = elements;
            console.log(`Found ${elements.length} elements with selector: ${selector}`);
            break;
          }
        }
        
        const scrapedProps = [];

        propElements.forEach(element => {
          try {
            // Try multiple selectors for each field
            const playerSelectors = [
              '[data-testid="player-name"]',
              '.player-name',
              '.name',
              '[class*="player"]',
              '[class*="name"]'
            ];
            
            let playerName = null;
            for (const selector of playerSelectors) {
              const element_player = element.querySelector(selector);
              if (element_player?.textContent?.trim()) {
                playerName = element_player.textContent.trim();
                break;
              }
            }
            
            const teamSelectors = [
              '[data-testid="team"]',
              '.team',
              '[class*="team"]'
            ];
            
            let team = null;
            for (const selector of teamSelectors) {
              const element_team = element.querySelector(selector);
              if (element_team?.textContent?.trim()) {
                team = element_team.textContent.trim();
                break;
              }
            }
            
            const propTypeSelectors = [
              '[data-testid="stat-type"]',
              '.stat-type',
              '.prop-type',
              '[class*="stat"]',
              '[class*="prop"]'
            ];
            
            let propType = null;
            for (const selector of propTypeSelectors) {
              const element_prop = element.querySelector(selector);
              if (element_prop?.textContent?.trim()) {
                propType = element_prop.textContent.trim();
                break;
              }
            }
            
            const lineSelectors = [
              '[data-testid="line"]',
              '.line',
              '.value',
              '[class*="line"]',
              '[class*="value"]'
            ];
            
            let line = null;
            for (const selector of lineSelectors) {
              const element_line = element.querySelector(selector);
              if (element_line?.textContent?.trim()) {
                line = element_line.textContent.trim();
                break;
              }
            }
            
            // If we can't find specific fields, try to extract from text content
            if (!playerName || !propType || !line) {
              const fullText = element.textContent || '';
              console.log('Fallback text extraction for element:', fullText.substring(0, 100));
            }

            if (playerName && propType && line) {
              // Filter for our target prop types
              const targetProps = ['total bases', 'fantasy score', 'strikeouts', 'bases', 'fantasy', 'strikeout', 'k\'s', 'so'];
              const normalizedPropType = propType.toLowerCase();
              
              if (targetProps.some(target => normalizedPropType.includes(target))) {
                scrapedProps.push({
                  player: playerName,
                  team: team || 'TBD',
                  opponent: 'TBD', // Will be filled in later if available
                  propType: propType,
                  line: line,
                  gameTime: new Date().toISOString(), // Default to current time
                  scrapedAt: new Date().toISOString(),
                  source: 'PrizePicks'
                });
              }
            }
          } catch (error) {
            console.log('Error parsing prop element:', error.message);
          }
        });

        console.log(`Scraped ${scrapedProps.length} props total`);
        return scrapedProps;
      });

      console.log(`Found ${props.length} MLB props`);
      return props;

    } catch (error) {
      console.error('Error scraping PrizePicks:', error);
      // Return empty array instead of throwing to allow fallback
      return [];
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Mock data generator for development/demo purposes
function generateMockMLBData() {
  const players = [
    { name: 'Ronald Acuña Jr.', team: 'ATL', position: 'OF' },
    { name: 'Mookie Betts', team: 'LAD', position: 'OF' },
    { name: 'Aaron Judge', team: 'NYY', position: 'OF' },
    { name: 'Freddie Freeman', team: 'LAD', position: '1B' },
    { name: 'José Altuve', team: 'HOU', position: '2B' },
    { name: 'Gerrit Cole', team: 'NYY', position: 'P' },
    { name: 'Shane Bieber', team: 'CLE', position: 'P' },
    { name: 'Jacob deGrom', team: 'TEX', position: 'P' },
    { name: 'Manny Machado', team: 'SD', position: '3B' },
    { name: 'Trea Turner', team: 'PHI', position: 'SS' }
  ];

  const opponents = ['NYM', 'SF', 'BOS', 'MIA', 'SEA', 'TB', 'OAK', 'DET', 'WSH', 'COL'];
  const props = [];

  players.forEach((player, index) => {
    const opponent = opponents[index % opponents.length];
    const gameTime = new Date();
    gameTime.setHours(19 + (index % 3), 10, 0, 0);

    // Total Bases for hitters (non-pitchers)
    if (player.position !== 'P') {
      const totalBasesLines = [0.5, 1.5, 2.5];
      props.push({
        player: player.name,
        team: player.team,
        opponent: opponent,
        position: player.position,
        propType: 'Total Bases',
        line: `Over ${totalBasesLines[Math.floor(Math.random() * totalBasesLines.length)]}`,
        gameTime: gameTime.toISOString(),
        scrapedAt: new Date().toISOString(),
        source: 'PrizePicks'
      });
    }

    // Fantasy Score for all players
    const fantasyScoreLines = [2.5, 4.5, 6.5, 8.5, 12.5];
    props.push({
      player: player.name,
      team: player.team,
      opponent: opponent,
      position: player.position,
      propType: 'Fantasy Score',
      line: `Over ${fantasyScoreLines[Math.floor(Math.random() * fantasyScoreLines.length)]}`,
      gameTime: gameTime.toISOString(),
      scrapedAt: new Date().toISOString(),
      source: 'PrizePicks'
    });

    // Strikeouts for pitchers only
    if (player.position === 'P') {
      const strikeoutLines = [2.5, 4.5, 6.5, 8.5];
      props.push({
        player: player.name,
        team: player.team,
        opponent: opponent,
        position: player.position,
        propType: 'Strikeouts',
        line: `Over ${strikeoutLines[Math.floor(Math.random() * strikeoutLines.length)]}`,
        gameTime: gameTime.toISOString(),
        scrapedAt: new Date().toISOString(),
        source: 'PrizePicks'
      });
    }
  });

  return props;
}

async function scrapePrizePicks() {
  // Use real scraper for live data
  const scraper = new PrizePicksScraper();
  try {
    await scraper.init();
    const data = await scraper.scrapeMLBProps();
    return data;
  } finally {
    await scraper.close();
  }

  // Fallback to mock data if scraping fails
  // console.log('Generating mock MLB data for demo...');
  // return generateMockMLBData();
}

module.exports = {
  scrapePrizePicks
};