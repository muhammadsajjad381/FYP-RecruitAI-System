const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Interviewed', 'Selected', 'Rejected'],
    default: 'Pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  aiScore: {
    type: Number,
    default: 0
  },
  aiFeedback: {
    type: String,
    default: ''
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  voiceSampleUrl: {
    type: String,
    default: ''
  },
  interviewDeadline: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Prevent user from applying to the same job twice
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
