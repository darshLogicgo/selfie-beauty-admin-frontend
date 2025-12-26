import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getTrending, updateTrendingStatus, updateSubcategoryTrendingStatus, reorderTrending, reorderTrendingSubcategories } from "../../helpers/backend_helper";

// ============================================
// Trending Thunks
// ============================================

export const getTrendingThunk = createAsyncThunk(
  "getTrendingThunk",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTrending();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch trending categories";
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

export const updateTrendingStatusThunk = createAsyncThunk(
  "updateTrendingStatusThunk",
  async ({ id, isTrending }: { id: string; isTrending: boolean }, { rejectWithValue }) => {
    try {
      const response = await updateTrendingStatus(id, { isTrending });
      toastSuccess(response.data?.message || `Category ${isTrending ? 'activated' : 'deactivated'} successfully`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update trending status";
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

export const updateSubcategoryTrendingStatusThunk = createAsyncThunk(
  "updateSubcategoryTrendingStatusThunk",
  async ({ id, isTrending }: { id: string; isTrending: boolean }, { rejectWithValue }) => {
    try {
      const response = await updateSubcategoryTrendingStatus(id, { isTrending });
      toastSuccess(response.data?.message || `Subcategory ${isTrending ? 'activated' : 'deactivated'} successfully`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update subcategory trending status";
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

export const reorderTrendingThunk = createAsyncThunk(
  "reorderTrendingThunk",
  async (
    data: { categories: Array<{ _id: string; trendingOrder: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderTrending(data);
      toastSuccess(
        response.data?.message ||
          "Trending categories reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reorder trending categories";
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

export const reorderTrendingSubcategoriesThunk = createAsyncThunk(
  "reorderTrendingSubcategoriesThunk",
  async (
    data: { subcategories: Array<{ _id: string; trendingOrder: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderTrendingSubcategories(data);
      toastSuccess(
        response.data?.message ||
          "Trending subcategories reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reorder trending subcategories";
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

