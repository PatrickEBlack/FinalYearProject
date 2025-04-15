const express = require('express');
const router = express.Router();
const settings = require('../controllers/settings.controller');

// Get settings for a user
router.get('/:userId', settings.findByUserId);

// Update settings for a user
router.put('/:userId', settings.update);

module.exports = router;