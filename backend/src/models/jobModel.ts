import { getDb, getNextSequence } from "../config/db";

interface Job {
  _id: number;
  userId: number;
  title: string;
  skills: string[];
  jobType: string;
  salary: number;
  duration: number;
  maxApplicants: number;
  maxPositions: number;
  dateOfPosting: string;
  deadline: string;
  activeApplications: number;
  acceptedCandidates: number;
  rating: number;
}

export const createJob = async (
  userId: number,
  input: {
    title: string;
    skills: string[];
    jobType: string;
    salary: number;
    duration: number;
    maxApplicants: number;
    maxPositions: number;
    deadline: string;
  }
) => {
  const db = getDb();
  const job: Job = {
    _id: await getNextSequence("jobs"),
    userId,
    title: input.title,
    skills: input.skills,
    jobType: input.jobType,
    salary: input.salary,
    duration: input.duration,
    maxApplicants: input.maxApplicants,
    maxPositions: input.maxPositions,
    deadline: input.deadline,
    dateOfPosting: new Date().toISOString(),
    activeApplications: 0,
    acceptedCandidates: 0,
    rating: 0,
  };
  await db.collection<Job>("jobs").insertOne(job);
  return job;
};

export const getAllJobs = async () =>
  getDb().collection<Job>("jobs").find().sort({ _id: -1 }).toArray();

export const getJobsPaginated = async (args: { limit: number; offset: number }) => {
  const db = getDb();
  const total = await db.collection<Job>("jobs").countDocuments();
  const items = await db
    .collection<Job>("jobs")
    .find()
    .sort({ _id: -1 })
    .skip(args.offset)
    .limit(args.limit)
    .toArray();

  return { total, items };
};

export const getJobById = async (jobId: number) => {
  return getDb().collection<Job>("jobs").findOne({ _id: jobId });
};

export const updateJobById = async (
  jobId: number,
  userId: number,
  payload: Partial<{
    title: string;
    skills: string[];
    jobType: string;
    salary: number;
    duration: number;
    maxApplicants: number;
    maxPositions: number;
    deadline: string;
  }>
) => {
  const db = getDb();
  const existing = await db.collection<Job>("jobs").findOne({ _id: jobId, userId });
  if (!existing) {
    return null;
  }
  await db.collection<Job>("jobs").updateOne({ _id: jobId, userId }, { $set: payload });
  return { ...existing, ...payload };
};
