import fs from "fs/promises";
import path from "path";
import { type Response } from "express";
import { type AuthenticatedRequest } from "../middleware/authMiddleware";
import { fetchCandidateProfile } from "../services/profileService";

const uploadsResumeDir = path.join(process.cwd(), "uploads", "resumes");

export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Resume file is required" });
      return;
    }

    const existingProfile = await fetchCandidateProfile(req.user.userId);
    const oldResumePath = existingProfile?.resume ?? "";
    if (oldResumePath.startsWith("/uploads/resumes/")) {
      const oldFileName = path.basename(oldResumePath);
      const oldAbsolutePath = path.join(uploadsResumeDir, oldFileName);
      await fs.unlink(oldAbsolutePath).catch(() => {
        // Old file may already be absent; ignore silently.
      });
    }

    const relativePath = `/uploads/resumes/${req.file.filename}`;
    res.status(201).json({
      message: "Resume uploaded",
      filePath: relativePath,
      fileName: req.file.originalname,
    });
  } catch {
    res.status(500).json({ message: "Failed to upload resume" });
  }
};
