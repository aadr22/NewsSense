// services/nlp/summarizer.js
const { InferenceClient } = require('@huggingface/inference');
const hf = new InferenceClient(process.env.HUGGINGFACE_ACCESS_TOKEN);

const summarizeText = async (text) => {
  try {
    const response = await hf.textGeneration({
      inputs: text,
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
