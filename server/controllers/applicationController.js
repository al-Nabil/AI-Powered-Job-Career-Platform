const Application = require('../models/Application');
const Job = require('../models/Job');

const applicationStatuses = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected',
    'Withdrawn',
];

const employerStatuses = [
    'Under Review',
    'Shortlisted',
    'Interview',
    'Selected',
    'Rejected',
];

exports.applyForJob = async (req, res, next) => {
    try {
        const { jobId, coverLetter, resumeUrl } = req.body;

        if (!jobId || !resumeUrl?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Job ID and resume URL are required.'
            });
        }

        const job = await Job.findById(jobId).populate({
            path: 'company',
            select: 'user',
        });

        if (!job || job.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Job not available for application.'
            });
        }

        if (job.applicationDeadline && job.applicationDeadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'The application deadline has passed.',
            });
        }

        const employerId = job.company?.user;

        if (!employerId) {
            return res.status(400).json({
                success: false,
                message: 'Job employer information is unavailable.',
            });
        }

        const alreadyApplied = await Application.findOne({
            job: jobId,
            candidate: req.user.id,
        });
        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job.'
            });
        }

        const application = await Application.create({
            job: job._id,
            candidate: req.user.id,
            employer: employerId,
            resume: { url: resumeUrl.trim() },
            coverLetter,
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully.',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ candidate: req.user.id })
            .populate({
                path: 'job',
                select: 'title location jobType workMode salaryMin salaryMax company',
                populate: { path: 'company', select:'companyName companyLogo' },
            })
            .sort({ createdAt: -1 });

        const pipelineStats = {
            Applied: 0,
            UnderReview: 0,
            Shortlisted: 0,
            Interview: 0,
            Selected: 0,
            Rejected: 0,
            Withdrawn: 0,
        };

        applications.forEach((app) => {
            const key = app.status.replace(/\s+/g, '');
            if (pipelineStats[key] !== undefined) {
                pipelineStats[key]++;
            }
        });

        res.status(200).json({
            success: true,
            count: applications.length,
            pipelineStats,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

exports.getJobApplicants = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.jobId).populate({
            path: 'company',
            select: 'user',
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found.',
            });
        }

        const employerId = job.company?.user?.toString();

        if (employerId !== req.user.id  && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applicants.',
            });
        }

        const applications = await Application.find({ job: job._id })
            .populate('candidate', 'name email avatar phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const application = await Application.findById(req.params.id).populate({
            path: 'job',
            populate: {
                path: 'company',
                select: 'user',
            },
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found.',
            });
        }

        const employerId = application.job?.company?.user?.toString();

        if (employerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to change this application.',
            });
        }

        if (status !== undefined) {
            const allowedStatuses =
                req.user.role === 'admin'
                    ? applicationStatuses
                    : employerStatuses;

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid application status.',
                });
            }

            application.status = status;
        }

        if (notes !== undefined) {
            application.notes = notes;
        }

        await application.save();

        res.status(200).json({
            success: true,
            message: 'Application updated successfully.',
            data: application,
        });
    } catch (error) {
        next(error);
    }
};