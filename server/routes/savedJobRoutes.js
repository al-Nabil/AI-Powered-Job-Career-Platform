const express = require('express');
const { toggleSaveJob, getSavedJobs } = require('../controllers/savedJobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/toggle', protect, authorize('candidate'), toggleSaveJob);
router.get('/', protect, authorize('candidate'), getSavedJobs);

module.exports = router;