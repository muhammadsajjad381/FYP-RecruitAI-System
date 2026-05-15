const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res, next) => {
  try {
    let query = {};

    // Isolation: Admin only sees their own jobs (if logged in and on admin route)
    if (req.user && req.user.role === 'Admin') {
      query.postedBy = req.user.id;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res, next) => {
  try {
    const { 
      title, company, location, salary, description, 
      type, expertise, proposalsRange, requirements, status
    } = req.body;

    const job = await Job.create({
      title,
      company: company || 'RecruitAI',
      location: location || 'Remote',
      salary,
      description,
      type,
      expertise,
      proposalsRange,
      requirements,
      status: status || 'Active',
      postedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Permission Check
    if (req.user.role !== 'SuperAdmin' && job.postedBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Neural Security: Access denied to this protocol.');
    }

    // Only allow updating specific fields
    const updateData = {};
    const fields = [
      'title', 'company', 'location', 'salary', 'description', 
      'type', 'expertise', 'proposalsRange', 'requirements', 'status'
    ];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Like a job
// @route   PUT /api/jobs/:id/save
// @access  Private/Candidate
const saveJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const jobId = req.params.id;

    if (!user.savedJobs) user.savedJobs = [];
    const isAlreadySaved = user.savedJobs.some(id => id.toString() === jobId);

    let updatedSavedJobs;
    if (isAlreadySaved) {
      updatedSavedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      updatedSavedJobs = [...user.savedJobs, jobId];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { savedJobs: updatedSavedJobs },
      { new: true, runValidators: false }
    );

    res.status(200).json({ success: true, data: updatedUser.savedJobs });
  } catch (error) {
    console.error('Error in saveJob:', error.message);
    next(error);
  }
};

// @desc    Hide/Dislike a job
// @route   PUT /api/jobs/:id/hide
// @access  Private/Candidate
const hideJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const jobId = req.params.id;

    if (!user.hiddenJobs) user.hiddenJobs = [];
    if (!user.hiddenJobs.some(id => id.toString() === jobId)) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { hiddenJobs: jobId } },
        { new: true, runValidators: false }
      );
      return res.status(200).json({ success: true, data: updatedUser.hiddenJobs });
    }

    res.status(200).json({ success: true, data: user.hiddenJobs });
  } catch (error) {
    console.error('Error in hideJob:', error.message);
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    // Permission Check
    if (req.user.role !== 'SuperAdmin' && job.postedBy.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('Neural Security: Identification mismatch. Purge aborted.');
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private/Candidate
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const { aiScore, aiFeedback, resumeUrl } = req.body;

    const application = await Application.create({
      job: req.params.id,
      user: req.user.id,
      aiScore: aiScore || 0,
      aiFeedback: aiFeedback || '',
      resumeUrl: resumeUrl || '',
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      next(new Error('You have already applied for this job'));
    } else {
      next(error);
    }
  }
};

// @desc    Get my applications
// @route   GET /api/jobs/my/applications
// @access  Private/Candidate
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id }).populate('job');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/jobs/admin/applications
// @access  Private/Admin
const getAllApplications = async (req, res, next) => {
  try {
    let query = {};

    // Isolation: Admin only sees applications for their own jobs
    if (req.user.role === 'Admin') {
      const myJobs = await Job.find({ postedBy: req.user.id }).select('_id');
      const myJobIds = myJobs.map(j => j._id);
      query = { job: { $in: myJobIds } };
    }
    // SuperAdmin sees all

    const applications = await Application.find(query)
      .populate('job')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an application (Admin)
// @route   DELETE /api/jobs/applications/:id
// @access  Private/Admin
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }
    await application.deleteOne();
    res.status(200).json({ success: true, message: 'Application removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Admin)
// @route   PATCH /api/jobs/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Interviewed', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }
    const updateData = { status };
    
    if (status === 'Interviewed') {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 3);
      updateData.interviewDeadline = deadlineDate;
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email').populate('job', 'title');
    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // CREATE NOTIFICATION
    let notifTitle = `Application Status: ${status}`;
    let notifMsg = `Your application for ${application.job?.title} has been marked as ${status}.`;
    let notifType = 'INFO';
    let notifLink = '/home?tab=applications'; // Open applications tab directly

    if (status === 'Interviewed') {
      notifTitle = 'Action Required: Interview Shortlisted';
      notifMsg = `Congratulations! You have been shortlisted for ${application.job?.title}. You MUST complete your AI Voice Sample & Interview evaluation within 3 days. Navigate to the "My Applications" tab to begin.`;
      notifType = 'URGENT';
    } else if (status === 'Selected') {
      notifTitle = 'Application Successful';
      notifMsg = `You have been selected for ${application.job?.title}. HR will contact you soon.`;
      notifType = 'SUCCESS';
    } else if (status === 'Rejected') {
      notifType = 'WARNING';
    }

    await Notification.create({
      user: application.user._id,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      link: notifLink
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  createJob,
  getJob,
  deleteJob,
  updateJob,
  saveJob,
  hideJob,
  applyToJob,
  getMyApplications,
  getAllApplications,
  deleteApplication,
  updateApplicationStatus,
};
