const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Get all news articles
router.get('/', newsController.getAllNews);

// Get news by keyword
router.get('/search/:keyword', newsController.getNewsByKeyword);

// Get news by fund
router.get('/fund/:symbol', newsController.getNewsByFund);

// Run scraper manually
router.post('/scrape', newsController.scrapeNews);

module.exports = router; 