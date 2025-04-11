const News = require('../models/News');
const Fund = require('../models/Fund');
const Correlation = require('../models/Correlation');
const { runScraper } = require('../services/scraper');
const { analyzeSentiment } = require('../services/nlp/sentiment');
const { extractEntities } = require('../services/nlp/entities');
const { resolveEntities } = require('../utils/entityResolver');

// Get all news articles with pagination
exports.getAllNews = async (req, res) => {
  try {
    const { limit = 20, page = 1, source, sentiment } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (source) query.source = source;
    if (sentiment) query['sentiment.label'] = sentiment.toUpperCase();

    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await News.countDocuments(query);

    res.json({
      news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get news by keyword
exports.getNewsByKeyword = async (req, res) => {
  try {
    const { keyword } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const news = await News.find(
      { $text: { $search: keyword } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await News.countDocuments({ $text: { $search: keyword } });

    res.json({
      news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get news related to a specific fund
exports.getNewsByFund = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Find the fund
    const fund = await Fund.findOne({ symbol });
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }

    // Find correlations for this fund
    const correlations = await Correlation.find({ fundId: fund._id })
      .sort({ correlationScore: -1, date: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('newsId');

    const news = correlations.map((corr) => ({
      ...corr.newsId.toObject(),
      correlationScore: corr.correlationScore,
      impactType: corr.impactType,
    }));

    const total = await Correlation.countDocuments({ fundId: fund._id });

    res.json({
      news,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Run the news scraper
exports.scrapeNews = async (req, res) => {
  try {
    const { source } = req.query;

    // Run the appropriate scraper
    const articles = await runScraper(source);

    // Process and store articles
    const savedArticles = [];
    for (const article of articles) {
      // Check if article already exists
      const existingArticle = await News.findOne({ url: article.url });
      if (existingArticle) continue;

      // Process the article content
      const sentiment = await analyzeSentiment(
        article.title + ' ' + article.content
      );
      const entities = await extractEntities(
        article.title + ' ' + article.content
      );

      // Create new article
      const newArticle = new News({
        title: article.title,
        content: article.content,
        summary: article.summary || article.title,
        url: article.url,
        source: article.source,
        publishedAt: new Date(article.publishedAt),
        sentiment: {
          score: sentiment.score,
          label: sentiment.label,
        },
        entities: entities.map((e) => ({
          text: e.text,
          type: e.type,
          relevance: e.relevance,
        })),
        keywords: article.keywords || [],
      });

      const saved = await newArticle.save();
      savedArticles.push(saved);

      // Link to related funds
      await exports.linkNewsToFunds(saved);
    }

    res.json({
      message:
        savedArticles.length > 0
          ? `${savedArticles.length} articles scraped and saved successfully.`
          : 'No new articles were found.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Link news to related funds using entity resolution
exports.linkNewsToFunds = async (newsArticle) => {
  try {
    // Resolve entities to funds
    const relatedFundsSymbols = await resolveEntities(newsArticle.content);

    for (const symbol of relatedFundsSymbols) {
      const fund = await Fund.findOne({ symbol });

      if (!fund) continue;

      // Calculate correlation score (simple example)
      const correlationScore =
        Math.random() * (0.9 - 0.5) + 0.5; // Random score between 0.5 and 0.9

      // Save correlation in database
      await Correlation.findOneAndUpdate(
        { fundId: fund._id, newsId: newsArticle._id },
        { $setOnInsert: { correlationScore, impactType: 'DIRECT' } },
        { upsert: true }
      );

      console.log(`Linked ${newsArticle.title} to ${fund.symbol}`);
    }
  } catch (err) {
    console.error('Error linking news to funds:', err.message);
  }
};
