const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  getNotifications, 
         markAsRead, 
  clearNotifications 
} = require('../controllers/notificationController');

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .delete(protect, clearNotifications);

router.put('/:id/read', protect, markAsRead);

module.exports = router;
