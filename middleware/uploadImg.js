/******************************************************************
 * /src/middleware/upload/imageUpload1to3.js
 ******************************************************************/
import multer from "multer";
import fs from "fs";
import path from "path";

/* 1️⃣  Allowed image MIME types → extension */
const IMAGE_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

/* 2️⃣  mkdir ‑p helper */
const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

/* 3️⃣  Multer storage */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ensureDir("uploads/images")),

  filename: (_req, file, cb) => {
    const ext = IMAGE_MIME[file.mimetype] || path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  },
});

/* 4️⃣  File‑type gatekeeper (images only) */
function fileFilter(_req, file, cb) {
  if (IMAGE_MIME[file.mimetype]) cb(null, true);
  else cb(new Error("⛔ Only image files are allowed"), false);
}

/* 5️⃣  Base Multer instance (max 3 files) */
const _uploadArray = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per image
}).array("images", 3);

/* 6️⃣  Wrapper to enforce **min 1** image */
export function uploadImages1to3(req, res, next) {
  _uploadArray(req, res, (err) => {
    if (err) return next(err); // Multer errors (too many files, bad mime, etc.)

    if (!req.files || req.files.length === 0) {
      return next(new Error("⛔ At least 1 image is required"));
    }

    // req.files.length is already ≤ 3 because of the array limit
    next();
  });
}
