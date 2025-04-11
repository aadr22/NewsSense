// routes/news.js
const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Get all news articles
router.get('/', newsController.getAllNews);

// Get news articles by keyword
router.get('/search/:keyword', newsController.getNewsByKeyword);

// Get news related to a specific fund
router.get('/related/:symbol', newsController.getNewsByFund);

// Run the news scraper
router.post('/scrape', newsController.scrapeNews);

module.exports = router;
