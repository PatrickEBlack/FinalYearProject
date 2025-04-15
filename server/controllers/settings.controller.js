const Settings = require('../models/settings.model');

// Get settings for a user
exports.findByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }
    
    let settings = await Settings.findOne({ userId });
    
    // If settings don't exist, create default settings
    if (!settings) {
      settings = new Settings({ userId });
      await settings.save();
    }
    
    res.status(200).send(settings);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error occurred while retrieving settings.'
    });
  }
};

// Update settings
exports.update = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }
    
    const updatedSettings = await Settings.findOneAndUpdate(
      { userId }, 
      req.body, 
      { new: true, upsert: true, useFindAndModify: false }
    );
    
    res.status(200).send(updatedSettings);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error occurred while updating settings.'
    });
  }
};