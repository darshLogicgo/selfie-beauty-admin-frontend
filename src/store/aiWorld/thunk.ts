import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getAIWorld, toggleAIWorld, reorderAIWorld } from "../../helpers/backend_helper";

// ============================================
// AI World Thunks
// ============================================

export const getAIWorldThunk = createAsyncThunk(
  "getAIWorldThunk",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAIWorld();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch AI World categories";
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

export const toggleAIWorldThunk = createAsyncThunk(
  "toggleAIWorldThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await toggleAIWorld(id);
      toastSuccess(response.data?.message || "AI World status updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update AI World status";
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

export const reorderAIWorldThunk = createAsyncThunk(
  "reorderAIWorldThunk",
  async (
    data: { categories: Array<{ _id: string; aiWorldOrder: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderAIWorld(data);
      toastSuccess(
        response.data?.message ||
          "AI World categories reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reorder AI World categories";
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

