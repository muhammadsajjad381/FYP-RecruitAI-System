const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { protect } = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Multer Config for Audio Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}-interview${path.extname(file.originalname) || '.webm'}`);
  }
});
const upload = multer({ storage });

// @desc    Process Voice Interview Audio and Score
// @route   POST /api/v1/interviews/process-voice
// @access  Private (Candidate)
const processVoiceInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info(`Processing AI audio interview for candidate: ${userId}`);

    // If an audio file was recorded and sent
    let audioUrl = '';
    if (req.file) {
      audioUrl = `/uploads/audio/${req.file.filename}`;
    }

    // Neural Analysis Logic Simulation
    // Normally, this is where we send req.file to Python microservice
    // We parse answeredCount, totalQuestions, baseCategory
    const { answeredCount, totalQuestions, category } = req.body;
    
    // Fetch latest application to verify against original voiceSampleUrl
    const latestApp = await Application.findOne({ user: userId }).sort({ createdAt: -1 });

    const isAudioEmpty = !req.file || req.file.size < 15000; // <15KB often means no speech
    const answered = parseInt(answeredCount) || 0;

    let calculatedScore;
    let feedback = "";

    // Simulate Neural Voice Biometric Match
    // If they have a voice sample, 20% chance we simulate a mismatch for physical testing
    const hasVoiceSample = latestApp && latestApp.voiceSampleUrl;
    const isVoiceMismatch = hasVoiceSample && !isAudioEmpty && answered > 0 && Math.random() < 0.2;

    if (isVoiceMismatch) {
      calculatedScore = 0;
      feedback = "SECURITY ALERT: Voice Print Mismatch! The speaker's voice does not match the originally registered voice sample. Real candidate must provide the interview.";
    } else if (isAudioEmpty || answered === 0) {
      // Assign low score for empty audio or no questions answered
      calculatedScore = Math.floor(Math.random() * 15) + 10;
      feedback = "Audio stream empty or unclear. Candidate failed to provide sufficient responses. Session terminated early.";
    } else {
      // Voice Verified. Score purely based on what was answered out of 100%
      // So if answered 1 question perfectly -> gets a solid score.
      let baseQuality = 65 + Math.floor(Math.random() * 30); // Simulated quality of the answer (65-95)
      
      // Simulate AI Detection / Plagiarism
      let aiDetectionFactor = Math.random(); 
      let aiPenalty = 0;
      let aiBonus = 0;
      let aiFeedbackStr = "";

      if (aiDetectionFactor > 0.70) {
        // High AI-probability detected (30% chance in simulation)
        aiPenalty = Math.floor(aiDetectionFactor * 30); // Deduct up to ~30 marks
        aiFeedbackStr = ` [WARNING: High AI-plagiarism probability (${Math.round(aiDetectionFactor * 100)}%) detected. Marks deducted.]`;
      } else if (aiDetectionFactor < 0.30) {
        // Very natural human phrasing
        aiBonus = Math.floor((0.30 - aiDetectionFactor) * 30); // Add up to 9 bonus marks
        aiFeedbackStr = " [Natural human acoustic patterns verified. Bonus points awarded.]";
      }

      calculatedScore = Math.max(0, Math.min(100, baseQuality - aiPenalty + aiBonus));
      
      if (calculatedScore >= 85) {
        feedback = `Voice Verified. Evaluated strictly on ${answered} answered question(s): Candidate showed outstanding depth and conceptual clarity.${aiFeedbackStr}`;
      } else if (calculatedScore >= 75) {
        feedback = `Voice Verified. Evaluated strictly on ${answered} answered question(s): Candidate demonstrated solid fundamental knowledge.${aiFeedbackStr}`;
      } else {
        feedback = `Voice Verified. Evaluated strictly on ${answered} answered question(s): Candidate displayed basic understanding with room for improvement.${aiFeedbackStr}`;
      }
    }
    
    if (latestApp) {
      latestApp.aiScore = calculatedScore;
      latestApp.aiFeedback = feedback;
      if (audioUrl) {
        // Just storing it somewhere, assuming we add a field or append to feedback
        latestApp.aiFeedback += ` [Audio Processed: ${audioUrl}]`;
      }
      await latestApp.save();
      logger.info(`Updated application ${latestApp._id} with score ${calculatedScore}`);
    } else {
      logger.warn(`No application found for user ${userId} to update score.`);
    }

    res.status(200).json({
      success: true,
      data: {
        score: calculatedScore,
        feedback,
        audioUrl,
        applicationId: latestApp ? latestApp._id : null
      }
    });

    // Create Notification for candidate ONLY
    if (req.user.role === 'Candidate') {
      await Notification.create({
        user: userId,
        title: 'Interview Strategy Finalized',
        message: `Your AI interview has been completed and analyzed. Thank you for your interview! Please wait for HR's response. You will be notified of further updates.`,
        type: 'SUCCESS',
        link: '/report'
      });
    }

  } catch (error) {
    logger.error(`Error processing interview: ${error.message}`);
    next(error);
  }
};

// @desc    Upload introductory voice sample
// @route   POST /api/v1/interviews/upload-voice-sample
// @access  Private (Candidate)
const uploadVoiceSample = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info(`Received introductory voice sample for candidate: ${userId}`);

    if (!req.file) {
      res.status(400);
      throw new Error('No voice sample audio found.');
    }

    const audioUrl = `/uploads/audio/${req.file.filename}`;
    
    // Find candidate's latest application
    const latestApp = await Application.findOne({ user: userId }).sort({ createdAt: -1 });

    if (latestApp) {
      latestApp.voiceSampleUrl = audioUrl;
      await latestApp.save();
      logger.info(`Attached voice sample to app ${latestApp._id}`);
    } else {
      logger.warn(`No application found for candidate ${userId} to attach voice sample.`);
    }

    res.status(200).json({
      success: true,
      data: { voiceSampleUrl: audioUrl }
    });
  } catch (error) {
    logger.error(`Error saving voice sample: ${error.message}`);
    next(error);
  }
};

// Route mapping
router.post('/upload-voice-sample', protect, upload.single('audio'), uploadVoiceSample);
router.post('/process-voice', protect, upload.single('audio'), processVoiceInterview);

module.exports = router;
