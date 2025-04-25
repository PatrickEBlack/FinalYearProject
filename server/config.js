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

// Firebase Configuration - these should be set as environment variables in production
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'fir-ionic-project-1849e';
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID || '1:373997035978:web:dbbc0438a03d5879f4ef33';
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'fir-ionic-project-1849e.firebasestorage.app';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBrGJvbjpqAgGYs8nHwU0K9uhZpcKhfE3U';
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || 'fir-ionic-project-1849e.firebaseapp.com';
const FIREBASE_MESSAGING_SENDER_ID = process.env.FIREBASE_MESSAGING_SENDER_ID || '373997035978';

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
  WEATHER_API_KEY,
  
  // Firebase
  FIREBASE_PROJECT_ID,
  FIREBASE_APP_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID
};