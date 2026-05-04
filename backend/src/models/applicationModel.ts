import { getDb, getNextSequence } from "../config/db";

interface JobDoc {
  _id: number;
  userId: number;
  activeApplications: number;
  acceptedCandidates: number;
}

interface ApplicationDoc {
  _id: number;
  userId: number;
  recruiterId: number;
  jobId: number;
  sop: string;
  status: "pending" | "accepted" | "rejected";
  dateOfApplication: string;
  dateOfJoining: string | null;
}

export const getJobForApplication = async (jobId: number) => {
  return getDb().collection<JobDoc>("jobs").findOne({ _id: jobId });
};

export const getApplicationByUserAndJob = async (userId: number, jobId: number) => {
  return getDb().collection<ApplicationDoc>("applications").findOne({ userId, jobId });
};

export const getApplicationsByUserPaginated = async (args: { userId: number; limit: number; offset: number }) => {
  const db = getDb();
  const total = await db.collection<ApplicationDoc>("applications").countDocuments({ userId: args.userId });
  const items = await db
    .collection<ApplicationDoc>("applications")
    .find({ userId: args.userId })
    .sort({ _id: -1 })
    .skip(args.offset)
    .limit(args.limit)
    .toArray();

  return { total, items };
};

export const createApplication = async (input: {
  userId: number;
  recruiterId: number;
  jobId: number;
  sop: string;
}) => {
  const db = getDb();
  const application: ApplicationDoc = {
    _id: await getNextSequence("applications"),
    userId: input.userId,
    recruiterId: input.recruiterId,
    jobId: input.jobId,
    sop: input.sop,
    status: "pending",
    dateOfApplication: new Date().toISOString(),
    dateOfJoining: null,
  };
  await db.collection<ApplicationDoc>("applications").insertOne(application);
  await db.collection<JobDoc>("jobs").updateOne({ _id: input.jobId }, { $inc: { activeApplications: 1 } });
  return application;
};

export const getApplicationsByJob = async (jobId: number) =>
  getDb().collection<ApplicationDoc>("applications").find({ jobId }).toArray();

export const getApplicationsByJobPaginated = async (args: { jobId: number; limit: number; offset: number }) => {
  const db = getDb();
  const total = await db.collection<ApplicationDoc>("applications").countDocuments({ jobId: args.jobId });
  const items = await db
    .collection<ApplicationDoc>("applications")
    .find({ jobId: args.jobId })
    .sort({ _id: -1 })
    .skip(args.offset)
    .limit(args.limit)
    .toArray();
  const userIds = [...new Set(items.map((item) => item.userId))];
  const profiles = await db
    .collection<{ userId: number; name: string }>("jobapplicantinfos")
    .find({ userId: { $in: userIds } })
    .toArray();
  const nameByUserId = new Map(profiles.map((p) => [p.userId, p.name]));

  return {
    total,
    items: items.map((item) => ({
      ...item,
      candidateName: nameByUserId.get(item.userId) ?? null,
    })),
  };
};

export const getApplicationById = async (applicationId: number) => {
  return getDb().collection<ApplicationDoc>("applications").findOne({ _id: applicationId });
};

export const updateApplicationStatus = async (
  applicationId: number,
  status: "accepted" | "rejected",
  dateOfJoining?: string
) => {
  const db = getDb();
  const existing = await db.collection<ApplicationDoc>("applications").findOne({ _id: applicationId });
  if (!existing) {
    return null;
  }
  const patch = {
    status,
    dateOfJoining: status === "accepted" ? (dateOfJoining ?? null) : null,
  };
  await db.collection<ApplicationDoc>("applications").updateOne({ _id: applicationId }, { $set: patch });
  return { ...existing, ...patch };
};

export const incrementAcceptedCandidates = async (jobId: number) => {
  await getDb().collection<JobDoc>("jobs").updateOne({ _id: jobId }, { $inc: { acceptedCandidates: 1 } });
};
