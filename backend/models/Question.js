const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
    uppercase: true,
  },
  difficulty: {
    type: String,
    enum: ['Entry', 'Intermediate', 'Expert'],
    default: 'Intermediate',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

questionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', questionSchema);
