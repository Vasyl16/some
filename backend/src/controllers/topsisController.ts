import { type Response } from "express";
import { type AuthenticatedRequest } from "../middleware/authMiddleware";
import { rankCandidatesWithTopsis } from "../services/topsisService";
import { type TopsisWeightsInput } from "../validators/topsisSchemas";

export const rankCandidates = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const jobId = Number(req.params.jobId);
    if (!Number.isInteger(jobId) || jobId <= 0) {
      res.status(400).json({ message: "Invalid job id" });
      return;
    }

    const ranked = await rankCandidatesWithTopsis(
      req.user.userId,
      jobId,
      req.body as TopsisWeightsInput
    );

    res.status(200).json(ranked);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rank candidates";
    const status = message === "Job not found" ? 404 : message === "Forbidden" ? 403 : 500;
    res.status(status).json({ message });
  }
};
