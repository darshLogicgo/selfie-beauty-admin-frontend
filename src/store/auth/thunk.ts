import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { signIn } from "../../helpers/backend_helper";

export const signInThunk = createAsyncThunk(
  "signInThunk",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await signIn(data);
      toastSuccess(response.data.message || "Login successful");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      if (errorMessage) {
        toastError(errorMessage);
      }
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);
