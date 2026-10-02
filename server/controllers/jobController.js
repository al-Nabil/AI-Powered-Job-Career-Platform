const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');

exports.createJob = async (req, res, next) => {
    try {
        const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
        if (!employerProfile) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your employer profile before posting a job.',
            });
        }

        const jobData = {
            ...req.body,
            company: employerProfile._id,
            createdBy: req.user.id,
        };

        const job = await Job.create(jobData);

        res.status(201).json({
            success: true,
            message: 'Job post created successfully.',
            data: job,
        });
    } catch (error) {
        next(error);
    }
};

exports.getJobs = async (req, res, next) => {
    try {
        const {
            search,
            jobType,
            workMode,
            experienceLevel,
            minSalary,
            maxSalary,
            sort,
            page = 1,
            limit = 10,
        } = req.query;

        let query = { status: 'published' };

        if (search) {
            query.$text = { $search: search };
        }

        if (jobType) {
            query.jobType = jobType;
        }

        if (workMode) {
            query.workMode = workMode;
        }

        if (experienceLevel) {
            query.experienceLevel = experienceLevel;
        }

        const minSal = Number(minSalary);
        const maxSal = Number(maxSalary);

        if (!isNaN(minSal) && minSal > 0) {
            query.salaryMax = { $gte: minSal };
        }
        if (!isNaN(maxSal) && maxSal > 0) {
            query.salaryMin = { $lte: maxSal };
        }

        let sortBy = { createdAt: -1 };

        if (sort === 'oldest') {
            sortBy = { createdAt: 1 };
        } else if (sort === 'salary_high') {
            sortBy = { salaryMax: -1 };
        } else if (sort === 'salary_low') {
            sortBy = { salaryMin: 1 };
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const startIndex = (pageNum - 1) * limitNum;

        const total = await Job.countDocuments(query);
        const jobs = await Job.find(query)
             .populate('company', 'companyName companyLogo location industry')
             .sort(sortBy)
             .skip(startIndex)
             .limit(limitNum);

        res.status(200).json({
            success: true,
            count: jobs.length,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
            data: jobs,
        });
    } catch (error) {
        next(error);
    }
};

exports.getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).populate('company');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found',
            });
        }

        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job.',
            });
        }

        delete req.body.company;
        delete req.body.createdBy;
        delete req.body.createBy;

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: job,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job',
            });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};