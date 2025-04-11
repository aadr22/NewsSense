const natural = require('natural');
const { JaroWinklerDistance } = natural;

/**
 * Extracts entities from text using natural language processing.
 * @param {string} text - The text to extract entities from.
 * @returns {Promise<Array>} - List of extracted entities with their types and relevance scores.
 */
const extractEntities = async (text) => {
    try {
        if (!text || text.trim().length === 0) {
            return [];
        }

        // Tokenize the text
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(text.toLowerCase());

        // Common entity patterns
        const patterns = {
            COMPANY: /^[A-Z][a-z]+(?:[ -][A-Z][a-z]+)*$/,
            TICKER: /^[A-Z]{1,5}$/,
            PERCENTAGE: /^\d+(?:\.\d+)?%$/,
            CURRENCY: /^\$?\d+(?:\.\d{2})?$/,
            DATE: /^\d{4}-\d{2}-\d{2}$/
        };

        const entities = [];
        const seen = new Set();

        // Process each token
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Skip if we've already processed this token
            if (seen.has(token)) continue;
            seen.add(token);

            // Check for entity patterns
            for (const [type, pattern] of Object.entries(patterns)) {
                // Convert token to proper case for pattern matching
                const properCaseToken = token.charAt(0).toUpperCase() + token.slice(1);

                if (pattern.test(properCaseToken)) {
                    entities.push({
                        text: properCaseToken,
                        type,
                        relevance: 1.0
                    });
                    break;
                }
            }

            // Check for multi-word entities
            if (i < tokens.length - 1) {
                const bigram = `${token} ${tokens[i + 1]}`;
                if (!seen.has(bigram)) {
                    seen.add(bigram);

                    // Convert bigram to proper case for pattern matching
                    const properCaseBigram = bigram.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    for (const [type, pattern] of Object.entries(patterns)) {
                        if (pattern.test(properCaseBigram)) {
                            entities.push({
                                text: properCaseBigram,
                                type,
                                relevance: 0.8
                            });
                            break;
                        }
                    }
                }
            }
        }

        return entities;
    } catch (error) {
        console.error('Error extracting entities:', error.message);
        return [];
    }
};

module.exports = { extractEntities }; 