const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingsSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    theme: { 
      type: String, 
      default: 'light' 
    },
    notifications: { 
      type: Boolean, 
      default: true 
    },
    language: { 
      type: String, 
      default: 'en' 
    },
    units: { 
      type: String, 
      default: 'metric' 
    }
  },
  farmInfo: {
    name: { 
      type: String 
    },
    location: { 
      type: String 
    },
    size: { 
      type: Number 
    },
    sizeUnit: { 
      type: String, 
      default: 'acres' 
    }
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Settings', settingsSchema);