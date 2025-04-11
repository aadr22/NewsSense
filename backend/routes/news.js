const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Endpoint to fetch all news articles (with pagination and filtering by source/sentiment)
router.get('/', newsController.getAllNews);

// Endpoint to fetch news articles by keyword
router.get('/search/:keyword', newsController.getNewsByKeyword);

// Endpoint to fetch news related to a specific fund
router.get('/related/:symbol', newsController.getNewsByFund);

// Endpoint to manually scrape news from specified sources
router.post('/scrape', newsController.scrapeNews);

module.exports = router;
