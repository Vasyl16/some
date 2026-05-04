import { getDb } from "../config/db";

interface JobDoc {
  _id: number;
  userId: number;
  title: string;
  skills: string[];
  deadline: string;
}

interface ApplicationDoc {
  _id: number;
  userId: number;
  jobId: number;
  status: "pending" | "accepted" | "rejected";
}

interface CandidateProfileDoc {
  userId: number;
  name: string;
  skills: string[];
  rating: number;
  expectedSalary: number;
  yearsOfExperience: number;
}

export const getJobById = async (jobId: number) => {
  return getDb().collection<JobDoc>("jobs").findOne({ _id: jobId });
};

export const getApplicantsForJob = async (jobId: number) => {
  const db = getDb();
  const apps = await db
    .collection<ApplicationDoc>("applications")
    .find({ jobId, status: "pending" })
    .toArray();
  if (apps.length === 0) {
    return [];
  }
  const userIds = [...new Set(apps.map((a) => a.userId))];
  const profiles = await db
    .collection<CandidateProfileDoc>("jobapplicantinfos")
    .find({ userId: { $in: userIds } })
    .toArray();
  const profileByUser = new Map(profiles.map((p) => [p.userId, p]));
  return apps
    .map((app) => {
      const profile = profileByUser.get(app.userId);
      if (!profile) {
        return null;
      }
      return {
        applicationId: app._id,
        candidateId: profile.userId,
        name: profile.name,
        skills: profile.skills,
        rating: profile.rating,
        expectedSalary: profile.expectedSalary,
        yearsOfExperience: profile.yearsOfExperience,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};
