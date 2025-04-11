// routes/funds.js
const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

// Get all funds
router.get('/', fundController.getAllFunds);

// Get a specific fund by symbol
router.get('/:symbol', fundController.getFundBySymbol);

// Update fund data from Alpha Vantage
router.post('/:symbol/update', fundController.updateFundData);

module.exports = router;
