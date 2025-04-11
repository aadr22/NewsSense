const mongoose = require('mongoose');

const CorrelationSchema = new mongoose.Schema({
  fundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund',
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
  impactType: {
    type: String,
    enum: ['DIRECT', 'INDIRECT', 'SECTOR', 'MACRO'],
    default: 'DIRECT'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for uniqueness
CorrelationSchema.index({ fundId: 1, newsId: 1 }, { unique: true });
CorrelationSchema.index({ date: -1 });

module.exports = mongoose.model('Correlation', CorrelationSchema);
