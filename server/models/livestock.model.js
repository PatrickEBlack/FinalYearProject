const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vaccinationSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  nextDue: { 
    type: Date 
  },
  notes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

const livestockSchema = new Schema({
  type: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  breed: { 
    type: String 
  },
  birthDate: { 
    type: Date 
  },
  gender: {
    type: String
  },
  // pasture field removed
  dateAdded: { 
    type: Date, 
    default: Date.now 
  },
  herdNumber: { 
    type: String 
  },
  tagNumber: { 
    type: String 
  },
  vaccinations: [vaccinationSchema],
  userId: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

// Export the model with explicit collection name
module.exports = mongoose.model('Livestock', livestockSchema, 'livestock');