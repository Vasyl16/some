import { api } from "./client";
import type { AuthResponse, UserType } from "../types/api";

export const authApi = {
  register: async (payload: { email: string; password: string; type: UserType }) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
};
