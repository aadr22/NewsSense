// models/Correlation.js
const mongoose = require('mongoose');

const CorrelationSchema = new mongoose.Schema({
  fundSymbol: {
    type: String,
    required: true
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  correlationScore: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Correlation', CorrelationSchema);
