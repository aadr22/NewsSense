const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

// Get all funds
router.get('/', fundController.getAllFunds);

// Get fund by symbol
router.get('/:symbol', fundController.getFundBySymbol);

// Update fund data
router.put('/:symbol', fundController.updateFund);

// Update all funds
router.post('/update-all', fundController.updateAllFunds);

module.exports = router; 