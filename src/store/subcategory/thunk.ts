import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getSubCategory, createSubCategory, updateSubCategory, toggleSubCategoryStatus, deleteSubCategory, addSubCategoryAssets, deleteSubCategoryAsset, toggleSubCategoryPremium } from "../../helpers/backend_helper";

// ============================================
// SubCategory Thunks
// ============================================

export const getSubCategoryThunk = createAsyncThunk(
  "getSubCategoryThunk",
  async (queryParams: Record<string, any> | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getSubCategory(queryParams || { limit: 100 });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch subcategories";
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

export const createSubCategoryThunk = createAsyncThunk(
  "createSubCategoryThunk",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await createSubCategory(formData);
      toastSuccess(response.data.message || "Subcategory created successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create subcategory";
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

export const updateSubCategoryThunk = createAsyncThunk(
  "updateSubCategoryThunk",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await updateSubCategory(id, data);
      toastSuccess(response.data.message || "Subcategory updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update subcategory";
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

export const toggleSubCategoryStatusThunk = createAsyncThunk(
  "toggleSubCategoryStatusThunk",
  async ({ id, status }: { id: string; status: boolean }, { rejectWithValue }) => {
    try {
      const response = await toggleSubCategoryStatus(id, status);
      toastSuccess(response.data.message || "Subcategory status updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update subcategory status";
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

export const deleteSubCategoryThunk = createAsyncThunk(
  "deleteSubCategoryThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteSubCategory(id);
      toastSuccess(response.data.message || "Subcategory deleted successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete subcategory";
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

export const addSubCategoryAssetsThunk = createAsyncThunk(
  "addSubCategoryAssetsThunk",
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await addSubCategoryAssets(id, formData);
      toastSuccess(response.data.message || "Images added successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to add images";
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

export const deleteSubCategoryAssetThunk = createAsyncThunk(
  "deleteSubCategoryAssetThunk",
  async ({ id, imageUrl }: { id: string; imageUrl: string }, { rejectWithValue }) => {
    try {
      const response = await deleteSubCategoryAsset(id, imageUrl);
      toastSuccess(response.data.message || "Image deleted successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete image";
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

export const toggleSubCategoryPremiumThunk = createAsyncThunk(
  "toggleSubCategoryPremiumThunk",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await toggleSubCategoryPremium(id);
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

