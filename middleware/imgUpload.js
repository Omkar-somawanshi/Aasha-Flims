const multer = require("multer");

// Configure Multer to store files in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit: 50 MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and MP4 files are allowed"));
    }
    cb(null, true);
  },
});

// Middleware for handling file uploads for profile update
const uploadMiddleware = upload.fields([
  { name: "profile_photo", maxCount: 1 },   // Profile photo
  { name: "headshot_photo", maxCount: 1 }, // Headshot photo
  { name: "full_body_photo", maxCount: 1 },// Full body photo
  { name: "intro_video", maxCount: 1 },    // Introductory video
]);

module.exports = uploadMiddleware;
