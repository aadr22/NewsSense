const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  isin: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['STOCK', 'ETF', 'MUTUAL_FUND'],
    required: true
  },
  amc: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: null
  },
  priceHistory: [
    {
      date: {
        type: Date,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      change: Number,
      changePercent: Number,
      volume: Number
    }
  ],
  holdings: [
    {
      companyName: String,
      symbol: String,
      percentage: Number
    }
  ],
  relatedEntities: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
FundSchema.index({ symbol: 1 });
FundSchema.index({ isin: 1 });
FundSchema.index({ type: 1 });

module.exports = mongoose.model('Fund', FundSchema);
