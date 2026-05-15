const express = require('express');
const { getAllJobs, createJob, getJob, deleteJob, updateJob, saveJob, hideJob, applyToJob, getMyApplications, getAllApplications, deleteApplication, updateApplicationStatus } = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getAllJobs)
  .post(protect, admin, createJob);

router.get('/admin/all', protect, admin, getAllJobs);

router.get('/my/applications', protect, getMyApplications);
router.get('/admin/applications', protect, admin, getAllApplications);
router.delete('/applications/:id', protect, admin, deleteApplication);
router.patch('/applications/:id/status', protect, admin, updateApplicationStatus);

router.route('/:id')
  .get(getJob)
  .delete(protect, admin, deleteJob)
  .put(protect, admin, updateJob);

router.put('/:id/save', protect, saveJob);
router.put('/:id/hide', protect, hideJob);
router.post('/:id/apply', protect, applyToJob);

module.exports = router;
