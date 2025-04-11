const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: String,
  url: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  sentiment: {
    score: Number,
    label: {
      type: String,
      enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL']
    }
  },
  entities: [{
    text: String,
    type: String,
    relevance: Number
  }],
  keywords: [String],
  relatedFunds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund'
  }]
}, { timestamps: true });

// Text index for search functionality
NewsSchema.index({ title: 'text', content: 'text', summary: 'text' });
NewsSchema.index({ publishedAt: -1 });
NewsSchema.index({ 'entities.text': 1 });

module.exports = mongoose.model('News', NewsSchema);
