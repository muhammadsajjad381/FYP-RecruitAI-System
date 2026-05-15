const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't return password by default
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  aiScores: {
    type: Map,
    of: Number, // Stores key-value pairings like { "react": 8.5, "communication": 9.0 }
    default: {},
  },
  status: {
    type: String,
    enum: ['Pending', 'Interviewed', 'Offered', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

// Password hashing middleware
candidateSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
candidateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Candidate', candidateSchema);
