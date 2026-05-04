import { z } from "zod";

export const recruiterProfileSchema = z
  .object({
    name: z.string().max(100),
    contactNumber: z.string().max(30),
    bio: z.string().max(1000),
  })
  .strict();

export const candidateProfileSchema = z
  .object({
    name: z.string().max(100),
    skills: z.array(z.string().min(1)).max(50),
    education: z.string().max(1000),
    resume: z.string().max(2000),
    expectedSalary: z.number().int().nonnegative(),
    yearsOfExperience: z.number().int().nonnegative().max(80),
  })
  .strict();

export type RecruiterProfileInput = z.infer<typeof recruiterProfileSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
