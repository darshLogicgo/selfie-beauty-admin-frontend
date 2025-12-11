import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getHome, toggleHomeCategorySection, toggleHomeSubcategorySection } from "../../helpers/backend_helper";

// ============================================
// Home Settings Thunks
// ============================================

export const getHomeDataThunk = createAsyncThunk(
  "getHomeDataThunk",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getHome();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch home data";
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

export const toggleHomeCategorySectionThunk = createAsyncThunk(
  "toggleHomeCategorySectionThunk",
  async (data: { categories: Array<{ _id: string; [key: string]: any }> }, { rejectWithValue }) => {
    try {
      const response = await toggleHomeCategorySection(data);
      toastSuccess(response.data?.message || "Category section updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update category section";
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

export const toggleHomeSubcategorySectionThunk = createAsyncThunk(
  "toggleHomeSubcategorySectionThunk",
  async (data: { subcategories: Array<{ _id: string; [key: string]: any }> }, { rejectWithValue }) => {
    try {
      const response = await toggleHomeSubcategorySection(data);
      toastSuccess(response.data?.message || "Subcategory section updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update subcategory section";
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

