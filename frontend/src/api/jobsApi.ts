import { api } from "./client";
import type { Job } from "../types/api";
import type { PaginatedResponse } from "../types/pagination";

export interface CreateJobInput {
  title: string;
  skills: string[];
  jobType: string;
  salary: number;
  duration: number;
  maxApplicants: number;
  maxPositions: number;
  deadline: string;
}

export const jobsApi = {
  getAll: async (args?: { page?: number; limit?: number }) =>
    (await api.get<PaginatedResponse<Job>>("/jobs", { params: args })).data,
  getById: async (id: number) => (await api.get<Job>(`/jobs/${id}`)).data,
  update: async (id: number, payload: Partial<CreateJobInput>) =>
    (await api.put<Job>(`/jobs/${id}`, payload)).data,
  create: async (payload: CreateJobInput) => (await api.post<Job>("/jobs", payload)).data,
};
