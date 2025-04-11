const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  url: { 
    type: String, 
    required: true, 
    unique: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  sentiment: { 
    type: String 
  },
  entities: [String],
  keywords: [String]
});

module.exports = mongoose.model('News', NewsSchema);
