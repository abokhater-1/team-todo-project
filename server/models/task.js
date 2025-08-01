const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    required: true
  },
  assignedBy: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['To do', 'In progress', 'Completed'],
    default: 'To do'
  },
  comments: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
