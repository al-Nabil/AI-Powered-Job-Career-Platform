const express = require('express');
const {
    applyForJob,
    getMyApplications,
    getJobApplicants,
    updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('candidate'), applyForJob);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplicants);
router.patch('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;