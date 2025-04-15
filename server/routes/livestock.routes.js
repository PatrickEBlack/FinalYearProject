const express = require('express');
const router = express.Router();
const livestock = require('../controllers/livestock.controller');

// Get all livestock
router.get('/', livestock.findAll);

// Create a new livestock
router.post('/', livestock.create);

// Get a single livestock by id
router.get('/:id', livestock.findOne);

// Update a livestock by id
router.put('/:id', livestock.update);

// Delete a livestock by id
router.delete('/:id', livestock.delete);

// Add a vaccination to a livestock
router.post('/:id/vaccinations', livestock.addVaccination);

module.exports = router;