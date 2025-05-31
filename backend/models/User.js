
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'hospital', 'admin', 'sales', 'crm', 'agent', 'support'],
    default: 'patient'
  },
  uhid: {
    type: String,
    unique: true,
    sparse: true
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  },
  kycData: {
    panNumber: String,
    aadhaarNumber: String,
    dateOfBirth: Date,
    gender: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    maritalStatus: String,
    dependents: String
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', UserSchema);
