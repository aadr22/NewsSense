// routes/query.js
const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// Answer a question
router.post('/', queryController.answerQuestion);

module.exports = router;
