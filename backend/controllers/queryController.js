// controllers/queryController.js
const { spawn } = require('child_process');
const Fund = require('../models/Fund');
const News = require('../models/News');

exports.answerQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Extract potential fund symbols from the question
    const words = question.split(/\s+/);
    const potentialSymbols = words.filter(word => 
      word.length >= 2 && word.length <= 5 && word === word.toUpperCase()
    );
    
    // Get relevant fund data
    let fundData = [];
    if (potentialSymbols.length > 0) {
      fundData = await Fund.find({ symbol: { $in: potentialSymbols } });
    }
    
    // Get relevant news data
    // This is a simple approach - in a real system, you'd use more sophisticated NLP
    const keywords = words.filter(word => word.length > 3);
    const newsData = await News.find({ 
      $or: [
        { keywords: { $in: keywords } },
        { entities: { $in: potentialSymbols } }
      ]
    }).sort({ timestamp: -1 }).limit(10);
    
    // Prepare context for the QA system
    const context = {
      question,
      funds: fundData,
      news: newsData
    };
    
    // Call Python QA system
    const qa = spawn('python', ['nlp/qa_system.py']);
    
    let data = '';
    qa.stdin.write(JSON.stringify(context));
    qa.stdin.end();
    
    qa.stdout.on('data', (chunk) => {
      data += chunk;
    });
    
    qa.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'QA system failed' });
      }
      
      try {
        const answer = JSON.parse(data);
        res.json(answer);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse QA response' });
      }
    });
  } catch (error) {
    console.error('QA endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
};
