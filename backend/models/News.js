const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
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
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
    }
  },
  entities: [
    {
      text: String,
      type: String,
      relevance: Number
    }
  ],
  keywords: [String],
  relatedFunds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund'
  }]
}, {
  timestamps: true
});

// Create text index for search
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ 'entities.text': 1 });

const News = mongoose.model('News', newsSchema);

module.exports = News;
