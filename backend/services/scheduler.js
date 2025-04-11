const cron = require('node-cron');
const fundController = require('../controllers/fundController');
const { runScraper } = require('./scraper');

/**
 * Initializes scheduled tasks for updating fund data and scraping news.
 */
const initializeScheduledTasks = () => {
  console.log('Initializing scheduled tasks...');

  // Task 1: Update all funds every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled task: Update all funds');
    try {
      await fundController.updateAllFunds();
      console.log('Fund update task completed successfully.');
    } catch (error) {
      console.error('Error during fund update task:', error.message);
    }
  });

  // Task 2: Scrape news every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled task: Scrape news');
    try {
      const sources = ['economictimes', 'moneycontrol', 'livemint'];
      for (const source of sources) {
        try {
          const articles = await runScraper(source);
          console.log(`News scraping for ${source} completed successfully. Found ${articles.length} articles.`);
        } catch (error) {
          console.error(`Error scraping ${source}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error during news scraping task:', error.message);
    }
  });
};

module.exports = { initializeScheduledTasks };
