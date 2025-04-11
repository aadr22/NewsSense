const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

// Endpoint to fetch all funds (with pagination and filtering by type)
router.get('/', fundController.getAllFunds);

// Endpoint to fetch details of a specific fund by symbol
router.get('/:symbol', fundController.getFundBySymbol);

// Endpoint to update fund data (e.g., from Alpha Vantage or other sources)
router.post('/:symbol/update', fundController.updateFundData);

module.exports = router;
