# MLB Prop Scraper - Goblin Picks Finder

A real-time MLB prop betting scraper that identifies the lowest available lines ("goblin picks") from PrizePicks.

## Features

- **Real-time scraping** of PrizePicks MLB props
- **Goblin pick identification** - finds the lowest available lines
- **Automated scheduling** - scrapes at 12 PM and 5 PM EST daily
- **Manual scraping** - trigger scrapes on demand
- **Responsive dashboard** - view picks by prop type
- **Live status updates** - see scraping progress and next scheduled run

## Architecture

### Frontend (Netlify)
- React + TypeScript + Tailwind CSS
- Real-time dashboard with prop tables
- Status monitoring and manual controls

### Backend (Railway)
- Node.js + Express API
- Puppeteer web scraping
- Automated cron scheduling
- Data processing and storage

## Deployment

### Backend Deployment (Railway)

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Deploy from GitHub**:
   - Connect your GitHub account
   - Select this repository
   - Railway will auto-detect the Node.js backend
3. **Environment Variables**: Set in Railway dashboard:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-netlify-url.netlify.app`
4. **Custom Start Command**: `node server/index.cjs`

### Frontend Deployment (Netlify)

1. **Update Backend URL**: Set environment variable in Netlify:
   - `VITE_BACKEND_URL=https://your-railway-app.railway.app`
2. **Redeploy**: Trigger a new build with the updated backend URL

## Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Backend only
npm run server

# Frontend only (after backend is running)
vite
```

## API Endpoints

- `GET /api/props/all-goblins` - Get all goblin picks grouped by type
- `GET /api/props/goblin-total-bases` - Get Total Bases goblin picks
- `GET /api/props/goblin-fantasy-score` - Get Fantasy Score goblin picks  
- `GET /api/props/goblin-strikeouts` - Get Strikeouts goblin picks
- `GET /api/scrape-status` - Get current scraping status
- `POST /api/manual-scrape` - Trigger manual scrape
- `GET /health` - Health check endpoint

## Prop Types

- **Total Bases** - Lowest available total bases lines
- **Fantasy Score** - Lowest available fantasy score lines  
- **Strikeouts** - Lowest available strikeout lines (pitchers only)

## Scheduling

Automated scrapes run daily at:
- 12:00 PM EST
- 5:00 PM EST

## Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Puppeteer, node-cron
- **Deployment**: Netlify (frontend), Railway (backend)
- **Data Source**: PrizePicks

## Notes

- Scraping may take 30-60 seconds due to page loading
- Chrome browser is automatically installed for Puppeteer
- CORS is configured for cross-origin requests
- Error handling includes fallbacks and retry logic