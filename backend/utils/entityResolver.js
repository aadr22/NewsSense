const Fund = require('../models/Fund');
const natural = require('natural');
const { JaroWinklerDistance } = natural;

/**
 * Resolves entities (e.g., company names, tickers, ISINs) from a given text and matches them to funds in the database.
 * @param {string} text - The text to resolve entities from (e.g., news article content).
 * @returns {Promise<Array>} - A list of matched fund symbols.
 */
const resolveEntities = async (text) => {
  try {
    const tokens = text.split(/\s+/).map((token) => token.toLowerCase());
    const funds = await Fund.find().select('symbol isin name relatedEntities');

    const matchedFunds = [];

    for (const fund of funds) {
      const fundTerms = [
        fund.symbol.toLowerCase(),
        ...(fund.isin ? [fund.isin.toLowerCase()] : []),
        ...fund.name.toLowerCase().split(/\s+/),
        ...(fund.relatedEntities || []).map((entity) => entity.toLowerCase()),
      ];

      for (const term of fundTerms) {
        if (tokens.includes(term)) {
          matchedFunds.push(fund.symbol);
          break;
        }

        // Use fuzzy matching for approximate matches
        if (
          tokens.some((token) => JaroWinklerDistance(token, term) > 0.85)
        ) {
          matchedFunds.push(fund.symbol);
          break;
        }
      }
    }

    return [...new Set(matchedFunds)]; // Remove duplicates
  } catch (error) {
    console.error('Error resolving entities:', error.message);
    return [];
  }
};

module.exports = { resolveEntities };
