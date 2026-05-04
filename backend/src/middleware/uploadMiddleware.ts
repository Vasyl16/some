import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const pdfOnlyFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    cb(new Error("Only PDF files are allowed"));
    return;
  }
  cb(null, true);
};

export const resumeUpload = multer({
  storage,
  fileFilter: pdfOnlyFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
