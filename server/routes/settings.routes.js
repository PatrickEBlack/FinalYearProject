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

module.exports = router;