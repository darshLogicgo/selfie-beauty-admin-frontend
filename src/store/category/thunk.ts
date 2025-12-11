import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getCategory, createCategory, updateCategory, deleteCategory, toggleCategoryStatus, reorderCategory, getCategoryTitles, toggleCategoryPremium } from "../../helpers/backend_helper";

// ============================================
// Category Thunks
// ============================================

export const createCategoryThunk = createAsyncThunk(
  "createCategoryThunk",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await createCategory(formData);
      toastSuccess(response.data.message || "Category created successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create category";
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

export const getCategoryThunk = createAsyncThunk(
  "getCategoryThunk",
  async (queryParams: Record<string, any> | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getCategory(queryParams);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch categories";
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

export const updateCategoryThunk = createAsyncThunk(
  "updateCategoryThunk",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await updateCategory(id, data);
      toastSuccess(response.data.message || "Category updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update category";
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

export const deleteCategoryThunk = createAsyncThunk(
  "deleteCategoryThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteCategory(id);
      toastSuccess(response.data.message || "Category deleted successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete category";
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

export const toggleCategoryStatusThunk = createAsyncThunk(
  "toggleCategoryStatusThunk",
  async ({ id, status }: { id: string; status: boolean }, { rejectWithValue }) => {
    try {
      const response = await toggleCategoryStatus(id, status);
      toastSuccess(response.data.message || "Category status updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update category status";
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

export const reorderCategoryThunk = createAsyncThunk(
  "reorderCategoryThunk",
  async (data: { categories: Array<{ _id: string; order: number }> }, { rejectWithValue }) => {
    try {
      const response = await reorderCategory(data);
      toastSuccess(response.data.message || "Category order updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to reorder categories";
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

export const getCategoryTitlesThunk = createAsyncThunk(
  "getCategoryTitlesThunk",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCategoryTitles();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch category titles";
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

export const toggleCategoryPremiumThunk = createAsyncThunk(
  "toggleCategoryPremiumThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await toggleCategoryPremium(id);
      toastSuccess(response.data.message || "Premium status updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update premium status";
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
