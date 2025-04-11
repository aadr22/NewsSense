const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// Endpoint to answer natural language questions about fund performance
router.post('/', queryController.answerQuery);

module.exports = router;
