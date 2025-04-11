const Fund = require('../models/Fund');
const { fetchFundData, fetchHoldings } = require('../utils/alphavantage');
const NodeCache = require('node-cache');
const fundCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Get all funds
exports.getAllFunds = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = type ? { type } : {};
    const funds = await Fund.find(query)
      .select('symbol name type lastUpdated')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Fund.countDocuments(query);

    res.json({
      funds,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific fund by symbol
exports.getFundBySymbol = async (req, res) => {
  try {
    const fund = await Fund.findOne({ symbol: req.params.symbol });
    if (!fund) return res.status(404).json({ message: 'Fund not found' });

    // Get the latest price data
    const latestPrice = fund.priceHistory.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    res.json({
      ...fund.toObject(),
      latestPrice,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update fund data from Alpha Vantage or other sources
exports.updateFundData = async (req, res) => {
  try {
    const { symbol } = req.params;

    // Check cache first
    const cachedData = fundCache.get(symbol);
    if (cachedData) return res.json(cachedData);

    // Fetch fresh data
    const fundData = await fetchFundData(symbol);
    if (!fundData || !fundData.timeSeries) {
      return res.status(400).json({ message: 'Invalid fund data' });
    }

    // Process price history
    const priceHistory = Object.keys(fundData.timeSeries).map((date) => {
      const entry = fundData.timeSeries[date];
      return {
        date: new Date(date),
        price: parseFloat(entry['4. close']),
        volume: parseInt(entry['5. volume'], 10) || 0,
      };
    });

    // Fetch holdings and determine type
    const holdings = await fetchHoldings(symbol);
    const fundType =
      fundData.assetType === 'ETF'
        ? 'ETF'
        : fundData.assetType === 'MUTUAL_FUND'
        ? 'MUTUAL_FUND'
        : 'STOCK';

    // Update database
    const updatedFund = await Fund.findOneAndUpdate(
      { symbol },
      {
        $set: {
          name: fundData.name || symbol,
          type: fundType,
          priceHistory,
          holdings,
          relatedEntities: holdings.map((h) => h.companyName),
          lastUpdated: Date.now(),
        },
      },
      { new: true, upsert: true }
    );

    // Cache the result
    fundCache.set(symbol, updatedFund);

    res.json(updatedFund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update all funds (for scheduler)
exports.updateAllFunds = async () => {
  try {
    const funds = await Fund.find().select('symbol type lastUpdated');

    // Update funds that haven't been updated in the last day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fundsToUpdate = funds.filter(
      (fund) => !fund.lastUpdated || fund.lastUpdated < oneDayAgo
    );

    console.log(`Updating ${fundsToUpdate.length} funds...`);

    for (let i = 0; i < fundsToUpdate.length; i++) {
      const fund = fundsToUpdate[i];
      try {
        await this.updateFundData({ params: { symbol: fund.symbol } }, {});
        console.log(`Updated ${fund.symbol}`);
        if (i < fundsToUpdate.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 12000)); // Respect API rate limits
        }
      } catch (error) {
        console.error(`Error updating ${fund.symbol}:`, error);
      }
    }

    return { updatedCount: fundsToUpdate.length };
  } catch (error) {
    console.error('Error updating all funds:', error);
  }
};
