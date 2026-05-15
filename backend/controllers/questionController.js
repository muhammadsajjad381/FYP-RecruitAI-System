const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res, next) => {
  try {
    let query = {};
    
    // 1. If requester is regular Admin, only see own questions + SuperAdmin (Global) questions
    if (req.user.role === 'Admin') {
      const superAdmins = await User.find({ role: 'SuperAdmin' }).select('_id');
      const superAdminIds = superAdmins.map(sa => sa._id);
      
      query = {
        $or: [
          { createdBy: req.user.id },
          { createdBy: { $in: superAdminIds } }
        ]
      };
    }
    // 2. If requester is SuperAdmin, query is empty (see all)

    // Sort: Personal questions first (desc), then Global ones
    const questions = await Question.find(query).sort({ createdBy: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get only Active questions (for interview)
// @route   GET /api/questions/active
// @access  Private
const getActiveQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const { text, category, difficulty, status } = req.body;
    
    const question = await Question.create({
      text,
      category,
      difficulty,
      status,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res, next) => {
  try {
    const { text, category, difficulty, status } = req.body;
    let question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // Permission Check: Admin can only update their own data
    if (req.user.role !== 'SuperAdmin' && question.createdBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Neural Security: You cannot modify Global/Root questions.');
    }

    question = await Question.findByIdAndUpdate(
      req.params.id, 
      { text, category, difficulty, status },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // Permission Check: Admin can only delete their own data
    if (req.user.role !== 'SuperAdmin' && question.createdBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Neural Security: You cannot purge Global/Root data.');
    }

    await question.deleteOne();
    res.status(200).json({ success: true, message: 'Question removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getActiveQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
