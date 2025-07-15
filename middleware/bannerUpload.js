const multer = require("multer");
const path = require("path");
const fs = require("fs");

const bannerDir = path.join(__dirname, "../uploads/banners");
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `banner-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const bannerUpload = multer({ storage });
module.exports = { bannerUpload, bannerDir };
