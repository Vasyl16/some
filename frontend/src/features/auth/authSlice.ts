import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../types/api";
import { authStorage } from "../../lib/storage";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: authStorage.getToken(),
  user: authStorage.getUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      authStorage.setToken(action.payload.token);
      authStorage.setUser(action.payload.user);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      authStorage.clearAll();
    },
  },
});

export const { setSession, logout } = authSlice.actions;
export default authSlice.reducer;
