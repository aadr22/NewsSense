const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.KAAHTJ38GFWZKDD9;
const BASE_URL = 'https://www.alphavantage.co/query';

const getFundData = async (symbol) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fund data:', error);
    throw error;
    
  }
};

module.exports = { getFundData };  // ← Critical export
