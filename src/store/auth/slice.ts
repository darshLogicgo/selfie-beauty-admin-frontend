import { createSlice } from "@reduxjs/toolkit";
import { signInThunk } from "./thunk";

const initialState = {
  loading: false,
  user: null as any,
  isAuthenticated: false,
  message: "",
  error: null as string | null,
};

const slice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.message = "";
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // =================================  Sign In ==================================
    builder.addCase(signInThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(signInThunk.fulfilled, (state, action) => {
      state.loading = false;
      // Handle multiple possible response structures
      // Structure 1: { message, body: { token, user }, status }
      // Structure 2: { message, token, user, status }
      // Structure 3: { message, data: { token, user }, status }
      
      const payload = action.payload;
      let token = null;
      let user = null;
      
      // Try different possible token locations
      if (payload.body?.token) {
        token = payload.body.token;
        user = payload.body.user || payload.body;
      } else if (payload.token) {
        token = payload.token;
        user = payload.user || payload.data;
      } else if (payload.data?.token) {
        token = payload.data.token;
        user = payload.data.user || payload.data;
      }
      
      // Store token in localStorage if found
      if (token) {
        localStorage.setItem("token", token);
      }
      
      state.user = user || payload.body || payload.data || payload;
      state.isAuthenticated = !!token;
      state.message = payload.message || "";
      state.error = null;
    });
    builder.addCase(signInThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Login failed";
      state.message = "";
    });
  },
});

export const { clearAuthError, setUser, logout } = slice.actions;
export default slice.reducer;
