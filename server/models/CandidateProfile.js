const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        headline: {
            type: String,
            trim: true,
            maxlength: [100, 'Headline cannot exceed 100 characters'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, 'Bio cannot exceed 1000 characters'],
        },
        location: {
            type: String,
            trim: true,
        },
        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        education: [
            {
                institution: { type: String, required: true },
                degree: { type: String, required: true },
                fieldOfStudy: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
                isCurrent: { type: Boolean, default: false },
            },
        ],
        experience: [
            {
                company: { type: String, required: true },
                title: { type: String, required: true },
                location: { type: String },
                startDate: { type: Date, required: true },
                endDate: { type: Date },
                isCurrent: { type: Boolean, default: false },
                description: { type: String },
            },
        ],
        certifications: [
            {
                name: { type: String },
                issuer: { type: String },
                issueDate: { type: Date },
            },
        ],
        languages: [{ type: String }],
        portfolio: { type: String, trim: true },
        github: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        resume: {
            url: { type: String },
            publicId: { type: String },
        },
        profileCompletion: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

candidateProfileSchema.pre('save', function (next) {
    let score = 0;

    if (this.headline) score += 10;
    if (this.bio) score += 10;
    if (this.location) score += 10;
    if (this.skills && this.skills.length > 0) score += 20;
    if (this.education && this.education.length > 0) score += 15;
    if (this.experience && this.experience.length > 0) score += 15;
    if (this.resume && this.resume.url) score += 10;
    if (this.github || this.linkedin || this.portfolio) score += 10;

    this.profileCompletion = score;
    next();
});

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);