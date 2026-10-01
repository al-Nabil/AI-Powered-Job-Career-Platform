const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide job title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide job description'],
            trim: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmployerProfile',
            required: true,
        },
        location: {
            type: String,
            required: [true, 'Please specify location'],
            trim: true,
        },
        jobType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
            required: true,
        },
        workMode: {
            type: String,
            enum: ['Remote', 'On-site', 'Hybrid'],
            required: true,
        },
        salaryMin: {
            type: Number,
            min: 0,
        },
        salaryMax: {
            type: Number,
            min: 0,
        },
        experienceLevel: {
            type: String,
            enum: ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead'],
            required: true,
        },
        skills: [
            {
                type: String,
                required: true,
                trim: true,
            },
        ],
        responsibilities: [{ type: String, trim: true }],
        requirements: [{ type: String, trim: true }],
        benefits: [{ type: String, trim: true }],
        applicationDeadline: {
            type: Date,
            required: [true, 'Please set application deadline'],
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'closed', 'rejected'],
            default: 'draft',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

jobSchema.pre('save', function (next) {
    if (
        this.salaryMin !== undefined &&
        this.salaryMax !== undefined &&
        this.salaryMax < this.salaryMin
    ) {
        return next(new Error('Maximum salary cannot be less than minimum salary'));
    }

    next();
});

jobSchema.index({ title: 'text', description: 'text', skills: 'text', location: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);