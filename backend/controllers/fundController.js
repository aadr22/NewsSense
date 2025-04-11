const Fund = require('../models/Fund');
const { fetchFundData, fetchHoldings } = require('../utils/alphavantage');
const NodeCache = require('node-cache');
const fundCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Get all funds
exports.getAllFunds = async (req, res) => {
  try {
    const funds = await Fund.find().sort({ symbol: 1 });
    res.json(funds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get fund by symbol
exports.getFundBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const fund = await Fund.findOne({ symbol });

    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }

    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update fund data
exports.updateFund = async (req, res) => {
  try {
    const { symbol } = req.params;
    const fundData = req.body;

    const fund = await Fund.findOneAndUpdate(
      { symbol },
      { $set: fundData },
      { new: true, upsert: true }
    );

    res.json(fund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update all funds
exports.updateAllFunds = async (req, res) => {
  try {
    // This is a placeholder for the actual implementation
    // In a real application, this would fetch data from an external API
    console.log('Updating all funds...');

    // Simulate updating funds
    const funds = await Fund.find();
    for (const fund of funds) {
      // Update fund data (placeholder)
      fund.lastUpdated = new Date();
      await fund.save();
    }

    res.json({ message: `Updated ${funds.length} funds successfully` });
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
        // Fetch fresh data
        const fundData = await fetchFundData(fund.symbol);
        if (!fundData || !fundData.timeSeries) {
          console.error(`Invalid fund data for ${fund.symbol}`);
          continue;
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
        const holdings = await fetchHoldings(fund.symbol);
        const fundType =
          fundData.assetType === 'ETF'
            ? 'ETF'
            : fundData.assetType === 'MUTUAL_FUND'
              ? 'MUTUAL_FUND'
              : 'STOCK';

        // Update database
        await Fund.findOneAndUpdate(
          { symbol: fund.symbol },
          {
            $set: {
              name: fundData.name || fund.symbol,
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
        fundCache.set(fund.symbol, { symbol: fund.symbol, type: fundType, lastUpdated: Date.now() });

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
    return { updatedCount: 0, error: error.message };
  }
};
