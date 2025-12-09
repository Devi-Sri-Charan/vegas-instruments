/**
 * Use multer memory storage so we can upload to S3.
 * The controllers will call s3.uploadBuffer to persist images.
 */
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = (file.originalname || '').toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

module.exports = upload;
