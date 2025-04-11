
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

// Import routes
const fundRoutes = require('./routes/funds');
const newsRoutes = require('./routes/news');
const queryRoutes = require('./routes/query');

// Import scheduler
const { initializeScheduledTasks } = require('./services/scheduler');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/funds', fundRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/query', queryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Initialize scheduled tasks
initializeScheduledTasks();

// Start server
app.listen(port, () => {
  console.log(`NewsSense API running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
