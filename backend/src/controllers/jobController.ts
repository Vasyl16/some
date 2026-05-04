import { type Request, type Response } from "express";
import { type AuthenticatedRequest } from "../middleware/authMiddleware";
import { createRecruiterJob, editRecruiterJob, fetchJobById, fetchJobs } from "../services/jobService";
import { type CreateJobInput, type UpdateJobInput } from "../validators/jobSchemas";
import { paginateResponse, parsePagination } from "../utils/pagination";

export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const job = await createRecruiterJob(req.user.userId, req.body as CreateJobInput);
    res.status(201).json(job);
  } catch {
    res.status(500).json({ message: "Failed to create job" });
  }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { items, total } = await fetchJobs({ limit, offset });
    res.status(200).json(paginateResponse({ items, page, limit, total }));
  } catch {
    res.status(500).json({ message: "Failed to load jobs" });
  }
};

export const getSingleJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid job id" });
      return;
    }

    const job = await fetchJobById(id);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.status(200).json(job);
  } catch {
    res.status(500).json({ message: "Failed to load job" });
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: "Invalid job id" });
      return;
    }
    const updated = await editRecruiterJob(req.user.userId, id, req.body as UpdateJobInput);
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update job";
    const status = message === "Job not found or forbidden" ? 404 : 500;
    res.status(status).json({ message });
  }
};
