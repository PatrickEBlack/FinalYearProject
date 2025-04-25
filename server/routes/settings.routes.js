const express = require('express');
const router = express.Router();
const config = require('../config');

// GET /api/settings/env
// This endpoint provides necessary environment variables to the client
router.get('/env', (req, res) => {
  res.json({
    openWeatherApiKey: config.OPEN_WEATHER_API_KEY,
    weatherApiKey: config.WEATHER_API_KEY
  });
});

// GET /api/settings/firebase-config
// This endpoint provides Firebase configuration to the client
router.get('/firebase-config', (req, res) => {
  res.json({
    projectId: config.FIREBASE_PROJECT_ID,
    appId: config.FIREBASE_APP_ID,
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID
  });
});

module.exports = router;