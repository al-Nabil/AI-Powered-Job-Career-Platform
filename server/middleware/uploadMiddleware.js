
const multer = require('multer');

const storage = multer.memoryStorage();

const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(
        new Error(
            'Invalid file format. Only JPG, JPEG, PNG, and PDF files are allowed.'
        )
    );
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1, // One file per upload
    },
    fileFilter,
});

module.exports = upload;