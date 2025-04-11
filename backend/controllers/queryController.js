const Fund = require('../models/Fund');
const News = require('../models/News');
const Correlation = require('../models/Correlation');
const { resolveEntities } = require('../utils/entityResolver');
const { runQA } = require('../services/nlp/summarizer');

// Answer natural language queries
exports.answerQuery = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Extract potential entities from the question
    const resolvedEntities = await resolveEntities(question);

    // Fetch relevant funds and news based on resolved entities
    const funds = await Fund.find({
      $or: [
        { symbol: { $in: resolvedEntities } },
        { isin: { $in: resolvedEntities } },
        { relatedEntities: { $in: resolvedEntities } }
      ]
    });

    const fundIds = funds.map((fund) => fund._id);

    const correlations = await Correlation.find({ fundId: { $in: fundIds } })
      .populate('newsId')
      .sort({ correlationScore: -1 })
      .limit(10); // Limit to top 10 relevant correlations

    const contextText = correlations.map((corr) => {
      const news = corr.newsId;
      return `${news.title}. ${news.summary || news.content}`;
    }).join('\n');

    // Run the QA system to generate an answer
    const answer = await runQA(question, contextText);

    res.json({
      question,
      answer,
      contextUsed: contextText,
      fundsMatched: funds.map((fund) => fund.symbol)
    });
  } catch (err) {
    console.error('Error answering query:', err.message);
    res.status(500).json({ message: 'Server error while processing query' });
  }
};
