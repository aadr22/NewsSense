// app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { scheduleFundUpdates, scheduleNewsScraping } = require('./utils/scheduler');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3
