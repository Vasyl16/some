import { api } from "./client";

export interface RankingResult {
  candidateId: number;
  applicationId: number;
  name: string;
  score: number;
  criteria: {
    skills: number;
    experience: number;
    rating: number;
    salary: number;
  };
}

export interface AnalyticsResult {
  job: { _id: number; title: string; skills: string[]; deadline: string };
  totalRankedCandidates: number;
  returnedCandidates: number;
  averageScore: number;
  topCandidates: RankingResult[];
}

export const topsisApi = {
  rank: async (
    jobId: number,
    payload: { skills: number; experience: number; rating: number; salary: number; topN?: number }
  ) => (await api.post<AnalyticsResult>(`/analytics/jobs/${jobId}/best-candidates`, payload)).data,
};
