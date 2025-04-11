const mongoose = require('mongoose');

const EntityMapSchema = new mongoose.Schema({
  entityName: {
    type: String,
    required: true
  },
  aliases: [String],
  symbols: [String],
  isins: [String],
  type: {
    type: String,
    enum: ['COMPANY', 'SECTOR', 'INDEX', 'AMC', 'COUNTRY'],
    required: true
  },
  sector: String,
  industry: String
}, { timestamps: true });

// Text index for fuzzy matching
EntityMapSchema.index({ entityName: 'text', aliases: 'text' });
EntityMapSchema.index({ symbols: 1 });
EntityMapSchema.index({ isins: 1 });

module.exports = mongoose.model('EntityMap', EntityMapSchema);
