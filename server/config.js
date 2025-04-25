// server/config.js
require('dotenv').config();

// MongoDB Configuration
const MONGODB_USER = process.env.MONGODB_USER || 'colonelfn';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'Qwertyasdf1';
const MONGODB_DB = process.env.MONGODB_DB || 'farm-management';
const MONGODB_URI = process.env.MONGODB_URI || 
  `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.8mae022.mongodb.net/${MONGODB_DB}?retryWrites=true&w=majority`;

// API Keys - these should be set as environment variables in production
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY || '0ff1aa92a6ff5efafcc218d4f9a14f67';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '7a8e434a4a9b4200b64183519252702';

module.exports = {
  // MongoDB
  MONGODB_URI,
  
  // App
  PORT: process.env.PORT || 3000,
  
  // API
  API_URL: process.env.API_URL || '/api',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // API Keys
  OPEN_WEATHER_API_KEY,
  WEATHER_API_KEY
};