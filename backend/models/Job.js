const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true,
  },
  salary: {
    type: String,
    default: 'Negotiable',
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote', 'Contract'],
    default: 'Full-time',
  },
  expertise: {
    type: String,
    enum: ['Entry', 'Intermediate', 'Expert'],
    default: 'Intermediate',
  },
  proposalsRange: {
    type: String,
    default: '0 to 10',
  },
  requirements: [String],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

jobSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Job', jobSchema);
