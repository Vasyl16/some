import { type Request, type Response } from "express";
import { type AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  applyToJob,
  changeApplicationStatus,
  getJobApplicationsForRecruiter,
  getMyApplications,
  getMyApplicationForJob,
} from "../services/applicationService";
import { type CreateApplicationInput, type UpdateApplicationStatusInput } from "../validators/applicationSchemas";
import { paginateResponse, parsePagination } from "../utils/pagination";

export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const application = await applyToJob(req.user.userId, req.body as CreateApplicationInput);
    res.status(201).json(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply";
    const status =
      message === "Job not found"
        ? 404
        : message === "Already applied to this job"
          ? 409
          : 500;
    res.status(status).json({ message });
  }
};

export const getApplicationsByJob = async (
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

    const { page, limit, offset } = parsePagination(req.query);
    const { items, total } = await getJobApplicationsForRecruiter(req.user.userId, jobId, {
      limit,
      offset,
    });
    res.status(200).json(paginateResponse({ items, page, limit, total }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load applications";
    const status = message === "Job not found" ? 404 : message === "Forbidden" ? 403 : 500;
    res.status(status).json({ message });
  }
};

export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const applicationId = Number(req.params.id);
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      res.status(400).json({ message: "Invalid application id" });
      return;
    }

    const updated = await changeApplicationStatus(
      req.user.userId,
      applicationId,
      req.body as UpdateApplicationStatusInput
    );
    res.status(200).json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    const status =
      message === "Application not found"
        ? 404
        : message === "Forbidden"
          ? 403
          : message === "Application status already updated"
            ? 409
            : 500;
    res.status(status).json({ message });
  }
};

export const getMyApplicationByJob = async (
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

    const application = await getMyApplicationForJob(req.user.userId, jobId);
    res.status(200).json({ application });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load application";
    const status = message === "Job not found" ? 404 : 500;
    res.status(status).json({ message });
  }
};

export const getMyApplicationsList = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { page, limit, offset } = parsePagination(req.query);
    const { items, total } = await getMyApplications(req.user.userId, { limit, offset });
    res.status(200).json(paginateResponse({ items, page, limit, total }));
  } catch {
    res.status(500).json({ message: "Failed to load your applications" });
  }
};
