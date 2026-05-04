import { api } from "./client";

export interface CandidateProfileInput {
  name: string;
  skills: string[];
  education: string;
  resume: string;
  expectedSalary: number;
  yearsOfExperience: number;
}

export interface RecruiterProfileInput {
  name: string;
  contactNumber: string;
  bio: string;
}

export const profileApi = {
  getCandidateProfile: async () => (await api.get("/profile/candidate/me")).data,
  upsertCandidateProfile: async (payload: CandidateProfileInput) =>
    (await api.put("/profile/candidate/me", payload)).data,
  getRecruiterProfile: async () => (await api.get("/profile/recruiter/me")).data,
  upsertRecruiterProfile: async (payload: RecruiterProfileInput) =>
    (await api.put("/profile/recruiter/me", payload)).data,
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return (
      await api.post<{ message: string; filePath: string; fileName: string }>(
        "/uploads/resume",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
    ).data;
  },
};
