import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  getAIPhoto,
  toggleAIPhotoIsAiWorld,
  reorderAIPhoto,
} from "../../helpers/backend_helper";

// ============================================
// AI Photo Thunks
// ============================================

export const getAIPhotoThunk = createAsyncThunk(
  "getAIPhotoThunk",
  async (
    queryParams: Record<string, any> | undefined = undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await getAIPhoto(queryParams);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch AI Photo data";
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
  async (
    { id, isAiPhoto }: { id: string; isAiPhoto: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await toggleAIPhotoIsAiWorld(id, { isAiPhoto });
      toastSuccess(
        response.data?.message || "AI Photo status updated successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update AI Photo status";
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

export const reorderAIPhotoThunk = createAsyncThunk(
  "reorderAIPhotoThunk",
  async (
    data: Array<{ id: string; aiPhotoOrder: number }>,
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderAIPhoto(data);
      toastSuccess(
        response.data?.message ||
          "AI Photo subcategories reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reorder AI Photo subcategories";
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
