const express = require('express');
const {
  getQuestions,
  getActiveQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all active questions (for interview use)
router.get('/active', protect, getActiveQuestions);

// Admin: get all questions (including inactive)
router.route('/')
  .get(protect, admin, getQuestions)
  .post(protect, admin, createQuestion);

router.route('/:id')
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

module.exports = router;
