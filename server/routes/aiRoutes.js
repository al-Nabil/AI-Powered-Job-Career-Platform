const express = require('express');
const {
    analyzeCV,
    matchJob,
    analyzeJD,
    generateCoverLetter,
    analyzeSkillGap,
    generateInterviewQuestions,
} = require('../controllers/aiController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/cv-analyzer', protect, authorize('candidate'), analyzeCV);
router.post('/match-job', protect, matchJob);
router.post('/analyze-jd', protect, authorize('employer', 'admin'), analyzeJD);
router.post('/generate-cover-letter', protect, authorize('candidate'), generateCoverLetter);
router.post('/skill-gap', protect, authorize('candidate'), analyzeSkillGap);
router.post('/interview-questions', protect, generateInterviewQuestions);

module.exports = router;