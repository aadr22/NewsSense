# NewsSense

A news aggregation and analysis platform for financial markets.

## Features

- Scrapes news from multiple financial news sources (Economic Times, MoneyControl, LiveMint)
- Analyzes news sentiment and extracts entities
- Correlates news with financial instruments
- Provides API endpoints for accessing news and fund data

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/newssense
   NODE_ENV=development
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### News

- `GET /api/news` - Get all news articles
- `GET /api/news/search/:keyword` - Search news by keyword
- `GET /api/news/fund/:symbol` - Get news related to a specific fund
- `POST /api/news/scrape` - Manually trigger news scraping

### Funds

- `GET /api/funds` - Get all funds
- `GET /api/funds/:symbol` - Get fund by symbol
- `PUT /api/funds/:symbol` - Update fund data
- `POST /api/funds/update-all` - Update all funds

## Scheduled Tasks

- Fund data is updated daily at midnight
- News is scraped hourly from configured sources

## Technologies Used

- Node.js
- Express
- MongoDB
- Cheerio (for web scraping)
- Node-cron (for scheduled tasks)
