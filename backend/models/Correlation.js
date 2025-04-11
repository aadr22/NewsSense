const mongoose = require('mongoose');

const correlationSchema = new mongoose.Schema({
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
    required: true,
    min: 0,
    max: 1
  },
  impactType: {
    type: String,
    enum: ['DIRECT', 'INDIRECT', 'NEGATIVE'],
    default: 'DIRECT'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for faster lookups
correlationSchema.index({ fundId: 1, newsId: 1 }, { unique: true });
correlationSchema.index({ correlationScore: -1 });

const Correlation = mongoose.model('Correlation', correlationSchema);

module.exports = Correlation;
