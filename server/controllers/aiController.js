const CandidateProfile = require('../models/CandidateProfile.js');
const Job = require('../models/Job.js');
const aiService = require('../services/aiService.js');

const isValidId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

exports.analyzeCV = async (req, res, next) => {
    try {
        const profile = await CandidateProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Candidate profile not found.',
            });
        }

        const result = await aiService.analyzeCVService(profile);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.matchJob = async (req, res, next) => {
    try {
        const { jobId } = req.body;

        if (!isValidId(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid Job ID.',
            });
        }

        const profile = await CandidateProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Candidate profile not found.',
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found.',
            });
        }

        const result = await aiService.matchJobService(
            profile.skills || [],
            job.skills || [] 
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.analyzeJD = async (req, res, next) => {
    try {
        const { description } = req.body;

        if (!description || typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job description',
            });
        }

        const result = await aiService.analyzeJDService(description.trim());

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.generateCoverLetter = async (req, res, next) => {
    try {
        const { jobId, tone } = req.body;

        if (!isValidId(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job ID.',
            });
        }

        const profile = await CandidateProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Candidate profile not found.',
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found.',
            });
        }

        const letter = await aiService.generateCoverLetterService(profile, job, tone || 'Professional');

        res.status(200).json({
            success: true,
            coverLetter: letter,
        });
    } catch (error) {
        next(error);
    }
};

exports.analyzeSkillGap = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        
        if (!isValidId(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job ID.',
            });
        }

        const profile = await CandidateProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Candidate profile not found.',
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found.',
            });
        }

        const result = await aiService.analyzeSkillGapService(
            profile.skills || [],
            job.skills || []
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.generateInterviewQuestions = async (req, res, next) => {
    try {
        const { jobId, difficulty } = req.body;

        if (!isValidId(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job ID.',
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found.',
            });
        }

        const questions = await aiService.generateInterviewQuestionsService(
            job.title,
            job.skills || [],
            difficulty || 'Medium'
        );

        res.status(200).json({
            success: true,
            data: questions,
        });
    } catch (error) {
        next(error);
    }
};