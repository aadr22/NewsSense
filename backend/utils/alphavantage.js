const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Ensure this is set in your .env file
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch daily time series data for a given stock or fund symbol.
 * @param {string} symbol - The stock or fund symbol (e.g., "AAPL", "GOOGL").
 * @returns {Promise<Object>} - The JSON response from Alpha Vantage.
 */
const fetchFundData = async (symbol) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    if (!response.data || response.data['Error Message']) {
      throw new Error(`Failed to fetch data for symbol: ${symbol}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching fund data for ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Fetch intraday time series data for a given stock or fund symbol.
 * @param {string} symbol - The stock or fund symbol (e.g., "AAPL", "GOOGL").
 * @param {string} interval - The interval between data points (e.g., "1min", "5min").
 * @returns {Promise<Object>} - The JSON response from Alpha Vantage.
 */
const getIntradayData = async (symbol, interval = '5min') => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: interval,
        apikey: API_KEY,
      },
    });

    if (!response.data || response.data['Error Message']) {
      throw new Error(`Failed to fetch intraday data for symbol: ${symbol}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching intraday data for ${symbol}:`, error.message);
    throw error;
  }
};

/**
 * Fetch mutual fund holdings data.
 * @param {string} fundSymbol - Mutual fund symbol (e.g., "FIDELITY.MF").
 * @returns {Promise<Object>} - Holdings information for the mutual fund.
 */
const fetchHoldings = async (fundSymbol) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: fundSymbol,
        apikey: API_KEY,
      },
    });

    if (!response.data || response.data['Error Message']) {
      throw new Error(`Failed to fetch holdings for mutual fund: ${fundSymbol}`);
    }

    // Process the holdings data
    const holdings = [];
    if (response.data && response.data.holdings) {
      for (const holding of response.data.holdings) {
        holdings.push({
          companyName: holding.name,
          symbol: holding.symbol,
          percentage: parseFloat(holding.percentage) || 0
        });
      }
    }

    return holdings;
  } catch (error) {
    console.error(`Error fetching holdings for mutual fund ${fundSymbol}:`, error.message);
    // Return empty array instead of throwing error
    return [];
  }
};

module.exports = { fetchFundData, getIntradayData, fetchHoldings };
