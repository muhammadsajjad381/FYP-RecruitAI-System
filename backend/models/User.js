const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Prevents password from being returned in queries by default
  },
  role: {
    type: String,
    enum: ['Candidate', 'Admin', 'SuperAdmin'],
    default: 'Candidate',
  },
  bio: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  portfolio: {
    type: String,
    default: ''
  },
  savedJobs: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  }],
  hiddenJobs: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Job'
  }],
  profilePic: {
    type: String,
    default: ''
  },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
