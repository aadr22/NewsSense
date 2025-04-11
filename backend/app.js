// app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

// Import routes
const fundRoutes = require('./routes/funds');
const newsRoutes = require('./routes/news');
const queryRoutes = require('./routes/query');

// Import schedulers
const { scheduleFundUpdates, scheduleNewsScraping } = require('./utils/scheduler');

// Initialize app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/funds', fundRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/query', queryRoutes);

// Start scheduled tasks
scheduleFundUpdates();
scheduleNewsScraping();

// Root route for testing
app.get('/', (req, res) => {
  res.send('NewsSense API is running!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
