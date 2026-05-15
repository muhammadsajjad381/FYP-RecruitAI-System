const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadResume, getCandidateStats, getAdminStats } = require('../controllers/candidateController');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter to only allow PDFs and Docs
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Some browsers send different mimetypes for Word docs, so we focus on extname predominantly
  const mimetype = filetypes.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc and .docx files are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Routes
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.get('/stats', protect, getCandidateStats);
router.get('/admin-stats', protect, admin, getAdminStats);

module.exports = router;
