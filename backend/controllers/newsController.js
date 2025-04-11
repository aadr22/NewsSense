// controllers/newsController.js
const News = require('../models/News');
const { spawn } = require('child_process');

// Get all news articles
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get news articles by keyword
exports.getNewsByKeyword = async (req, res) => {
  try {
    const news = await News.find({ keywords: req.params.keyword });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get news related to a specific fund
exports.getNewsByFund = async (req, res) => {
  try {
    const { symbol } = req.params;
    const news = await News.find({ entities: symbol });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Run the news scraper
exports.scrapeNews = async (req, res) => {
  try {
    const scraper = spawn('python', ['scrapers/news_scraper.py']);
    
    let data = '';
    scraper.stdout.on('data', (chunk) => {
      data += chunk;
    });
    
    scraper.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'News scraping failed' });
      }
      
      try {
        const articles = JSON.parse(data);
        
        // Process and store articles
        const savedArticles = [];
        for (const article of articles) {
          const existingArticle = await News.findOne({ url: article.link });
          
          if (!existingArticle) {
            // Analyze the article content using NLP
            const nlp = spawn('python', ['nlp/nlp_pipeline.py']);
            
            nlp.stdin.write(JSON.stringify({ text: article.title }));
            nlp.stdin.end();
            
            let nlpData = '';
            nlp.stdout.on('data', (chunk) => {
              nlpData += chunk;
            });
            
            nlp.on('close', async (nlpCode) => {
              if (nlpCode === 0) {
                const nlpResult = JSON.parse(nlpData);
                
                const newArticle = new News({
                  title: article.title,
                  url: article.link,
                  timestamp: new Date(article.timestamp),
                  sentiment: nlpResult.sentiment[0].label,
                  entities: nlpResult.entities.map(e => e.text),
                  keywords: nlpResult.keywords
                });
                
                const saved = await newArticle.save();
                savedArticles.push(saved);
              }
            });
          }
        }
        
        res.json({ message: 'News scraping completed', count: savedArticles.length });
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse scraper response' });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
