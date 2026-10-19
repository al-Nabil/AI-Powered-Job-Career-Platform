const SavedJob = require('../models/SavedJob');

exports.toggleSaveJob = async (req, res, next) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'Job ID is required.',
            });
        }
        
        const existingSave = await SavedJob.findOne({ user: req.user.id, job: jobId });

        if (existingSave) {
            await existingSave.deleteOne();
            return res.status(200).json({
                success: true,
                saved: false,
                message: 'Job removed from saved items',
            });
        }

        await SavedJob.create({ user: req.user.id, job: jobId });
        res.status(201).json({
            success: true,
            saved: true,
            message: 'Job saved successfully',
        });
    } catch (error) {
        next(error);
    }
};

exports.getSavedJobs = async (req, res, next) => {
    try {
        const savedJobs = await SavedJob.find({ user: req.user.id })
             .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'companyName companyLogo location',
                },
             })
             .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: savedJobs.length,
            data: savedJobs,
        });
    } catch (error) {
        next(error);
    }
};