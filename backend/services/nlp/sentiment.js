const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);

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

    // Truncate text if too long (Hugging Face has token limits)
    const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;

    const result = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: truncatedText
    });

    // Map sentiment labels to custom labels
    const labelMapping = {
      POSITIVE: 'POSITIVE',
      NEGATIVE: 'NEGATIVE',
      NEUTRAL: 'NEUTRAL',
    };

    return {
      label: labelMapping[result[0].label] || 'NEUTRAL',
      score: result[0].score,
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
