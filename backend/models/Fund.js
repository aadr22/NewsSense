const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['ETF', 'MUTUAL_FUND', 'STOCK'], required: true },
  priceHistory: [{
    date: Date,
    price: Number,
    change: Number,
    changePercent: Number
  }],
  relatedEntities: [String]
});

module.exports = mongoose.model('Fund', FundSchema);  // ← Critical export
