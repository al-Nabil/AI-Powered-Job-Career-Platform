const express = require('express');
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(getJobs)
    .post(protect, authorize('employer', 'admin'), createJob);

router
    .route('/:id')
    .get(getJobById)
    .patch(protect, authorize('employer', 'admin'), updateJob)
    .delete(protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;