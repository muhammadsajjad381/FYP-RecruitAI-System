const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token
      token = req.headers.authorization.split(' ')[1];

  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      const err = new Error('Not authorized, token failed');
      next(err);
    }
  }

  if (!token) {
    res.status(401);
    const err = new Error('Not authorized, no token');
    next(err);
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'SuperAdmin')) {
    next();
  } else {
    res.status(403);
    const err = new Error('Not authorized as an admin');
    next(err);
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403);
    const err = new Error('Not authorized: SuperAdmin access level required.');
    next(err);
  }
};

module.exports = { protect, admin, superAdmin };
