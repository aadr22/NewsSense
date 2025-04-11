// utils/scheduler.js
const cron = require('node-cron');
const { spawn } = require('child_process');
const Fund = require('../models/Fund');
const { getFundData } = require('./alphavantage');

// Update fund data every hour
const scheduleFundUpdates = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const funds = await Fund.find();
      
      for (const fund of funds) {
        try {
          const data = await getFundData(fund.symbol);
          
          if (!data || !data['Time Series (Daily)']) {
            console.error(`Invalid data for ${fund.symbol}`);
            continue;
          }
          
          const timeSeries = data['Time Series (Daily)'];
          const priceHistory = Object.keys(timeSeries).map(date => {
            const dayData = timeSeries[date];
            const previousDate = Object.keys(timeSeries)[Object.keys(timeSeries).indexOf(date) + 1];
            const previousPrice = previousDate ? parseFloat(timeSeries[previousDate]['4. close']) : parseFloat(dayData['4. close']);
            const currentPrice = parseFloat(dayData['4. close']);
            const change = currentPrice - previousPrice;
            const changePercent = (change / previousPrice) * 100;
            
            return {
              date: new Date(date),
              price: currentPrice,
              change: change,
              changePercent: changePercent
            };
          });
          
          await Fund.findOneAndUpdate(
            { symbol: fund.symbol },
            { 
              $set: { priceHistory }
            }
          );
          
          console.log(`Updated ${fund.symbol}`);
        } catch (error) {
          console.error(`Error updating ${fund.symbol}:`, error);
        }
      }
      
      console.log('Fund updates completed');
    } catch (error) {
      console.error('Fund update scheduler error:', error);
    }
  });
};

// Scrape news every 30 minutes
const scheduleNewsScraping = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const scraper = spawn('python', ['scrapers/news_scraper.py']);
      
      let data = '';
      scraper.stdout.on('data', (chunk) => {
        data += chunk;
      });
      
      scraper.on('close', async (code) => {
        if (code !== 0) {
          console.error('News scraping failed');
          return;
        }
        
        try {
          const articles = JSON.parse(data);
          console.log(`Scraped ${articles.length} articles`);
          
          // Process and store articles
          // Similar to the controller logic
          
          console.log('News scraping completed');
        } catch (error) {
          console.error('Failed to parse scraper response:', error);
        }
      });
    } catch (error) {
      console.error('News scraping scheduler error:', error);
    }
  });
};

module.exports = {
  scheduleFundUpdates,
  scheduleNewsScraping
};
