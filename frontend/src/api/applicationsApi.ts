import { api } from "./client";
import type { Application } from "../types/api";
import type { PaginatedResponse } from "../types/pagination";

export const applicationsApi = {
  apply: async (payload: { jobId: number; sop: string }) =>
    (await api.post<Application>("/applications", payload)).data,
  getMyByJob: async (jobId: number) =>
    (await api.get<{ application: Application | null }>(`/applications/me/job/${jobId}`)).data,
  getMine: async (args?: { page?: number; limit?: number }) =>
    (await api.get<PaginatedResponse<Application>>("/applications/me", { params: args })).data,
  getByJob: async (jobId: number, args?: { page?: number; limit?: number }) =>
    (await api.get<PaginatedResponse<Application>>(`/applications/job/${jobId}`, { params: args })).data,
  updateStatus: async (applicationId: number, payload: { status: "accepted" | "rejected"; dateOfJoining?: string }) =>
    (await api.patch<Application>(`/applications/${applicationId}/status`, payload)).data,
};
