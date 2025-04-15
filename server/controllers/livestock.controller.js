const Livestock = require('../models/livestock.model');

// Get all livestock
exports.findAll = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }
    
    console.log(`Fetching livestock for user: ${userId}`);
    const livestock = await Livestock.find({ userId });
    console.log(`Found ${livestock.length} livestock records`);
    res.status(200).send(livestock);
  } catch (error) {
    console.error('Error in findAll livestock:', error);
    res.status(500).send({
      message: error.message || 'Error occurred while retrieving livestock.'
    });
  }
};

// Get a single livestock by id
exports.findOne = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }
    
    const livestock = await Livestock.findOne({
      _id: req.params.id,
      userId: userId  // Add userId filter to ensure users can only see their own livestock
    });
    
    if (!livestock) {
      return res.status(404).send({
        message: `Livestock with id ${req.params.id} not found or not authorized.`
      });
    }
    
    res.status(200).send(livestock);
  } catch (error) {
    res.status(500).send({
      message: `Error retrieving livestock with id ${req.params.id}`
    });
  }
};

// Create a new livestock
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.type || !req.body.quantity || !req.body.userId) {
      return res.status(400).send({
        message: 'Type, quantity, and userId are required fields'
      });
    }

    // Create a new livestock
    const livestock = new Livestock({
      type: req.body.type,
      quantity: req.body.quantity,
      breed: req.body.breed,
      birthDate: req.body.birthDate,
      pasture: req.body.pasture,
      dateAdded: req.body.dateAdded || new Date(),
      herdNumber: req.body.herdNumber,
      tagNumber: req.body.tagNumber,
      vaccinations: req.body.vaccinations || [],
      userId: req.body.userId
    });

    // Save to database
    const savedLivestock = await livestock.save();
    res.status(201).send(savedLivestock);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error occurred while creating livestock record.'
    });
  }
};

// Update a livestock
exports.update = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: 'Data to update cannot be empty!'
      });
    }
    
    // Get userId from query or body
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }

    const id = req.params.id;
    
    // First check if the livestock belongs to this user
    const existingLivestock = await Livestock.findOne({ 
      _id: id, 
      userId: userId 
    });
    
    if (!existingLivestock) {
      return res.status(404).send({
        message: `Cannot update livestock with id=${id}. Not found or not authorized!`
      });
    }
    
    // Now update it, ensuring userId cannot be changed
    const dataToUpdate = { ...req.body };
    dataToUpdate.userId = userId; // Ensure userId is not changed
    
    const updatedLivestock = await Livestock.findByIdAndUpdate(
      id, 
      dataToUpdate, 
      { new: true, useFindAndModify: false }
    );

    res.send(updatedLivestock);
  } catch (error) {
    res.status(500).send({
      message: `Error updating livestock with id=${req.params.id}: ${error.message}`
    });
  }
};

// Delete a livestock
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }
    
    // Delete only if it belongs to the user
    const deletedLivestock = await Livestock.findOneAndRemove({
      _id: id,
      userId: userId
    });
    
    if (!deletedLivestock) {
      return res.status(404).send({
        message: `Cannot delete livestock with id=${id}. Not found or not authorized!`
      });
    }

    res.send({ message: 'Livestock was deleted successfully!' });
  } catch (error) {
    res.status(500).send({
      message: `Could not delete livestock with id=${req.params.id}: ${error.message}`
    });
  }
};

// Add a vaccination to livestock
exports.addVaccination = async (req, res) => {
  try {
    const id = req.params.id;
    const vaccination = req.body;
    const userId = req.query.userId || req.body.userId;
    
    if (!vaccination.name || !vaccination.date) {
      return res.status(400).send({
        message: 'Vaccination name and date are required'
      });
    }
    
    if (!userId) {
      return res.status(400).send({ message: 'User ID is required' });
    }

    // Find the livestock only if it belongs to this user
    const livestock = await Livestock.findOne({
      _id: id,
      userId: userId
    });
    
    if (!livestock) {
      return res.status(404).send({
        message: `Livestock with id=${id} not found or not authorized`
      });
    }

    livestock.vaccinations.push(vaccination);
    const updatedLivestock = await livestock.save();
    
    res.send(updatedLivestock);
  } catch (error) {
    res.status(500).send({
      message: `Error adding vaccination to livestock with id=${req.params.id}: ${error.message}`
    });
  }
};