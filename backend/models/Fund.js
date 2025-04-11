const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  performance: {
    oneDay: Number,
    oneWeek: Number,
    oneMonth: Number,
    threeMonths: Number,
    sixMonths: Number,
    oneYear: Number,
    threeYears: Number,
    fiveYears: Number,
    sinceInception: Number
  }
}, {
  timestamps: true
});

// Create text index for search
fundSchema.index({ name: 'text', description: 'text' });

const Fund = mongoose.model('Fund', fundSchema);

module.exports = Fund;
