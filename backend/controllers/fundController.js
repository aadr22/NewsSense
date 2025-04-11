// controllers/fundController.js
const Fund = require('../models/Fund');
const { getFundData } = require('../utils/alphavantage');

// Get all funds
exports.getAllFunds = async (req, res) => {
  try {
    const funds = await Fund.find();
    res.json(funds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific fund by symbol
exports.getFundBySymbol = async (req, res) => {
  try {
    const fund = await Fund.findOne({ symbol: req.params.symbol });
    if (!fund) return res.status(404).json({ message: 'Fund not found' });
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update fund data from Alpha Vantage
exports.updateFundData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await getFundData(symbol);
    
    if (!data || !data['Time Series (Daily)']) {
      return res.status(400).json({ message: 'Invalid data from Alpha Vantage' });
    }
    
    const timeSeries = data['Time Series (Daily)'];
    const priceHistory = Object.keys(timeSeries).map(date => {
      const dayData = timeSeries[date];
      const previousDate = Object.keys(timeSeries)[Object.keys(timeSeries).indexOf(date) + 1];
      const previousPrice = previousDate ? parseFloat(timeSeries[previousDate]['4. close']) : parseFloat(dayData['4. close']);
      const currentPrice = parseFloat(dayData['4. close']);
      const change = currentPrice - previousPrice;
      const changePercent = (change / previousPrice) * 100;
      
      return {
        date: new Date(date),
        price: currentPrice,
        change: change,
        changePercent: changePercent
      };
    });
    
    const fund = await Fund.findOneAndUpdate(
      { symbol },
      { 
        $set: { priceHistory }
      },
      { new: true, upsert: true }
    );
    
    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
