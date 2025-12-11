import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getAIPhoto, toggleAIPhotoIsAiWorld } from "../../helpers/backend_helper";

// ============================================
// AI Photo Thunks
// ============================================

export const getAIPhotoThunk = createAsyncThunk(
  "getAIPhotoThunk",
  async (queryParams: Record<string, any> | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getAIPhoto(queryParams || { limit: 100 });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch AI Photo data";
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

export const toggleAIPhotoIsAiWorldThunk = createAsyncThunk(
  "toggleAIPhotoIsAiWorldThunk",
  async ({ id, isAiWorld }: { id: string; isAiWorld: boolean }, { rejectWithValue }) => {
    try {
      const response = await toggleAIPhotoIsAiWorld(id, { isAiWorld });
      toastSuccess(response.data?.message || "AI Photo status updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update AI Photo status";
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

