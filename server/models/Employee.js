const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true  // Ensure no duplicates
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    default: 'Employee'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
