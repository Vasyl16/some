import { createJob, getJobById, getJobsPaginated, updateJobById } from "../models/jobModel";
import { type CreateJobInput, type UpdateJobInput } from "../validators/jobSchemas";

export const createRecruiterJob = async (userId: number, input: CreateJobInput) =>
  createJob(userId, input);

export const fetchJobs = async (args: { limit: number; offset: number }) =>
  getJobsPaginated(args);

export const fetchJobById = async (jobId: number) => getJobById(jobId);

export const editRecruiterJob = async (userId: number, jobId: number, input: UpdateJobInput) => {
  const updated = await updateJobById(jobId, userId, input);
  if (!updated) {
    throw new Error("Job not found or forbidden");
  }
  return updated;
};
