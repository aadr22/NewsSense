const { pipeline } = require('@huggingface/inference');
require('dotenv').config();

// Load Hugging Face sentiment analysis pipeline
const sentimentPipeline = pipeline('sentiment-analysis', {
  model: 'distilbert-base-uncased-finetuned-sst-2-english', // Pre-trained sentiment model
});

/**
 * Analyzes sentiment of a given text using Hugging Face's sentiment analysis pipeline.
 * @param {string} text - The text to analyze.
 * @returns {Promise<Object>} - Sentiment result with label and score.
 */
const analyzeSentiment = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      return { label: 'NEUTRAL', score: 0 }; // Default for empty or invalid text
    }

    const result = await sentimentPipeline(text);
    const sentiment = result[0]; // Extract first result

    // Map sentiment labels to custom labels
    const labelMapping = {
      POSITIVE: 'POSITIVE',
      NEGATIVE: 'NEGATIVE',
      NEUTRAL: 'NEUTRAL',
    };

    return {
      label: labelMapping[sentiment.label] || 'NEUTRAL',
      score: sentiment.score,
    };
  } catch (error) {
    console.error('Error during sentiment analysis:', error.message);
    return { label: 'NEUTRAL', score: 0 };
  }
};

/**
 * Batch processes multiple articles for sentiment analysis.
 * @param {Array} articles - List of articles with content to analyze.
 * @returns {Promise<Array>} - List of articles with analyzed sentiment.
 */
const analyzeSentimentsForArticles = async (articles) => {
  const processedArticles = [];

  for (const article of articles) {
    const sentiment = await analyzeSentiment(article.content);
    processedArticles.push({ ...article, sentiment });
  }

  return processedArticles;
};

module.exports = { analyzeSentiment, analyzeSentimentsForArticles };
