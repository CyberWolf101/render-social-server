const multer = require('multer');

// Define storage settings
const storage = multer.memoryStorage(); // For in-memory storage

// Configure multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
});

module.exports = upload;
