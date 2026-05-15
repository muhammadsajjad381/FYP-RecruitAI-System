const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['Candidate', 'Admin'].includes(role)) {
    return next(new ErrorResponse('Invalid role provided. Role must be Candidate or Admin.', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check if we are trying to delete ourselves
  if (user._id.toString() === req.user.id.toString()) {
     return next(new ErrorResponse(`You cannot delete your own admin account.`, 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
