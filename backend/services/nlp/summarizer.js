// services/nlp/summarizer.js
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const hf = new HfInference(process.env.HUGGINGFACE_ACCESS_TOKEN);

/**
 * Summarizes a given text using Hugging Face's text generation.
 * @param {string} text - The text to summarize.
 * @returns {Promise<string>} - The summarized text.
 */
const summarizeText = async (text) => {
  try {
    // Truncate text if too long (Hugging Face has token limits)
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;

    const response = await hf.textGeneration({
      model: 'facebook/bart-large-cnn',
      inputs: `Summarize the following text: ${truncatedText}`,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7
      }
    });

    return response.generated_text;
  } catch (error) {
    console.error('Summarization error:', error);
    return text.substring(0, 150) + '...'; // Fallback
  }
};

/**
 * Runs a question-answering system on the given context.
 * @param {string} question - The question to answer.
 * @param {string} context - The context to extract the answer from.
 * @returns {Promise<string>} - The answer to the question.
 */
const runQA = async (question, context) => {
  try {
    // Truncate context if too long
    const truncatedContext = context.length > 1000 ? context.substring(0, 1000) + '...' : context;

    const response = await hf.questionAnswering({
      model: 'deepset/roberta-base-squad2',
      inputs: {
        question: question,
        context: truncatedContext
      }
    });

    return response.answer;
  } catch (error) {
    console.error('QA error:', error);
    return "I couldn't find an answer to your question in the available information.";
  }
};

module.exports = { summarizeText, runQA };
