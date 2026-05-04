import { Router } from "express";
import { uploadResume } from "../controllers/uploadController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { resumeUpload } from "../middleware/uploadMiddleware";

const uploadRouter = Router();

uploadRouter.post(
  "/resume",
  authenticate,
  authorize("candidate"),
  resumeUpload.single("resume"),
  uploadResume
);

export default uploadRouter;
