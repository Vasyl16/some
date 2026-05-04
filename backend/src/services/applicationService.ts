import {
  createApplication,
  getApplicationById,
  getApplicationByUserAndJob,
  getApplicationsByUserPaginated,
  getJobForApplication,
  getApplicationsByJobPaginated,
  incrementAcceptedCandidates,
  updateApplicationStatus,
} from "../models/applicationModel";
import { type CreateApplicationInput, type UpdateApplicationStatusInput } from "../validators/applicationSchemas";

export const applyToJob = async (userId: number, input: CreateApplicationInput) => {
  const job = await getJobForApplication(input.jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const existing = await getApplicationByUserAndJob(userId, input.jobId);
  if (existing) {
    throw new Error("Already applied to this job");
  }

  return createApplication({
    userId,
    recruiterId: job.userId,
    jobId: input.jobId,
    sop: input.sop ?? "",
  });
};

export const getMyApplicationForJob = async (userId: number, jobId: number) => {
  const job = await getJobForApplication(jobId);
  if (!job) {
    throw new Error("Job not found");
  }
  return getApplicationByUserAndJob(userId, jobId);
};

export const getJobApplicationsForRecruiter = async (
  recruiterId: number,
  jobId: number,
  pagination: { limit: number; offset: number }
) => {
  const job = await getJobForApplication(jobId);
  if (!job) {
    throw new Error("Job not found");
  }
  if (job.userId !== recruiterId) {
    throw new Error("Forbidden");
  }

  return getApplicationsByJobPaginated({ jobId, ...pagination });
};

export const getMyApplications = async (userId: number, pagination: { limit: number; offset: number }) =>
  getApplicationsByUserPaginated({ userId, ...pagination });

export const changeApplicationStatus = async (
  recruiterId: number,
  applicationId: number,
  input: UpdateApplicationStatusInput
) => {
  const application = await getApplicationById(applicationId);
  if (!application) {
    throw new Error("Application not found");
  }
  if (application.recruiterId !== recruiterId) {
    throw new Error("Forbidden");
  }
  if (application.status !== "pending") {
    throw new Error("Application status already updated");
  }

  const updated = await updateApplicationStatus(applicationId, input.status, input.dateOfJoining);
  if (!updated) {
    throw new Error("Application not found");
  }

  if (input.status === "accepted") {
    await incrementAcceptedCandidates(application.jobId);
  }

  return updated;
};
