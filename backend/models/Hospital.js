
const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true,
    unique: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  specialties: {
    type: [String],
    default: []
  },
  services: {
    type: [String],
    default: []
  },
  hospitalType: {
    type: String,
    enum: ['government', 'private', 'nonprofit'],
    default: 'private'
  },
  bedCount: {
    type: Number,
    default: 0
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  accreditations: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive'],
    default: 'pending'
  },
  logo: {
    type: String
  },
  website: {
    type: String
  },
  description: {
    type: String
  },
  establishedYear: {
    type: Number
  },
  facilities: {
    type: [String],
    default: []
  },
  emergencyServices: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // Analytics fields
  totalPatients: {
    type: Number,
    default: 0
  },
  totalLoans: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
HospitalSchema.index({ name: 'text', city: 'text', state: 'text' });

module.exports = mongoose.model('hospital', HospitalSchema);
