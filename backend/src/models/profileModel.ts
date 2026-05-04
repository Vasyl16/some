import { getDb, getNextSequence } from "../config/db";

export interface RecruiterProfile {
  _id: number;
  userId: number;
  name: string;
  contactNumber: string;
  bio: string;
}

export interface CandidateProfile {
  _id: number;
  userId: number;
  name: string;
  skills: string[];
  rating: number;
  education: string;
  resume: string;
  expectedSalary: number;
  yearsOfExperience: number;
}

export const upsertRecruiterProfile = async (
  userId: number,
  name: string,
  contactNumber: string,
  bio: string,
): Promise<RecruiterProfile> => {
  const db = getDb();
  const existing = await db.collection<RecruiterProfile>("recruiterinfos").findOne({ userId });
  if (existing) {
    await db.collection<RecruiterProfile>("recruiterinfos").updateOne(
      { userId },
      { $set: { name, contactNumber, bio } }
    );
    return { ...existing, name, contactNumber, bio };
  }

  const profile: RecruiterProfile = {
    _id: await getNextSequence("recruiterinfos"),
    userId,
    name,
    contactNumber,
    bio,
  };
  await db.collection<RecruiterProfile>("recruiterinfos").insertOne(profile);
  return profile;
};

export const getRecruiterProfileByUserId = async (
  userId: number,
): Promise<RecruiterProfile | null> => {
  return getDb().collection<RecruiterProfile>("recruiterinfos").findOne({ userId });
};

export const upsertCandidateProfile = async (
  userId: number,
  name: string,
  skills: string[],
  education: string,
  resume: string,
  expectedSalary: number,
  yearsOfExperience: number,
): Promise<CandidateProfile> => {
  const db = getDb();
  const existing = await db.collection<CandidateProfile>("jobapplicantinfos").findOne({ userId });
  if (existing) {
    await db.collection<CandidateProfile>("jobapplicantinfos").updateOne(
      { userId },
      {
        $set: {
          name,
          skills,
          education,
          resume,
          expectedSalary,
          yearsOfExperience,
        },
      }
    );
    return {
      ...existing,
      name,
      skills,
      education,
      resume,
      expectedSalary,
      yearsOfExperience,
    };
  }

  const profile: CandidateProfile = {
    _id: await getNextSequence("jobapplicantinfos"),
    userId,
    name,
    skills,
    rating: 0,
    education,
    resume,
    expectedSalary,
    yearsOfExperience,
  };
  await db.collection<CandidateProfile>("jobapplicantinfos").insertOne(profile);
  return profile;
};

export const getCandidateProfileByUserId = async (
  userId: number,
): Promise<CandidateProfile | null> => {
  return getDb().collection<CandidateProfile>("jobapplicantinfos").findOne({ userId });
};
