import {
  getCandidateProfileByUserId,
  getRecruiterProfileByUserId,
  upsertCandidateProfile,
  upsertRecruiterProfile,
} from "../models/profileModel";
import { type CandidateProfileInput, type RecruiterProfileInput } from "../validators/profileSchemas";

export const saveRecruiterProfile = async (userId: number, input: RecruiterProfileInput) =>
  upsertRecruiterProfile(userId, input.name, input.contactNumber, input.bio);

export const fetchRecruiterProfile = async (userId: number) => getRecruiterProfileByUserId(userId);

export const saveCandidateProfile = async (userId: number, input: CandidateProfileInput) =>
  upsertCandidateProfile(
    userId,
    input.name,
    input.skills,
    input.education,
    input.resume,
    input.expectedSalary,
    input.yearsOfExperience
  );

export const fetchCandidateProfile = async (userId: number) => getCandidateProfileByUserId(userId);
