const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            required: [true, 'Please provide company name'],
            trim: true,
        },
        companyLogo: {
            type: String,
            default: 'https://res.cloudinary.com/v0oak7wd/image/upload/v1790867278/Company_Logo.png',
        },
        industry: {
            type: String,
            required: [true, 'Please specify company industry'],
            trim: true,
        },
        companySize: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
            required: [true, 'Please specify company size'],
        },
        description: {
            type: String,
            required: [true, 'Please provide company description'],
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Please provide company headquarters location'],
            trim: true,
        },
        foundedYear: {
            type: Number,
        },
        socialLinks: {
            linkedin: { type: String },
            twitter: { type: String },
            facebook: { type: String },
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);