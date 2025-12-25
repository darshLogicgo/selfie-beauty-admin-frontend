import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  getUserPreference,
  toggleUserPreference,
  reorderUserPreference,
} from "../../helpers/backend_helper";

// ============================================
// User Preference Thunks
// ============================================

export const getUserPreferenceThunk = createAsyncThunk(
  "getUserPreferenceThunk",
  async (
    queryParams: Record<string, any> | undefined = undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await getUserPreference(queryParams);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch User Preference data";
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

export const toggleUserPreferenceThunk = createAsyncThunk(
  "toggleUserPreferenceThunk",
  async (
    { id, isUserPreference }: { id: string; isUserPreference: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await toggleUserPreference(id, { isUserPreference });
      toastSuccess(
        response.data?.message || "User Preference status updated successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update User Preference status";
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

export const reorderUserPreferenceThunk = createAsyncThunk(
  "reorderUserPreferenceThunk",
  async (
    data: { categories: Array<{ _id: string; userPreferenceOrder: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderUserPreference(data);
      toastSuccess(
        response.data?.message ||
          "User Preference categories reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reorder User Preference categories";
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

