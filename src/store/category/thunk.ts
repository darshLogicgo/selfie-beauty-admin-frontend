import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getCategory, createCategory, updateCategory, deleteCategory, toggleCategoryStatus, toggleCategoryAndroidActive, toggleCategoryIOSActive, reorderCategory, getCategoryTitles, toggleCategoryPremium, updateCategoryAsset, uploadCategoryAssets, reorderCategoryAssets, deleteCategoryAsset } from "../../helpers/backend_helper";
import { updateCacheTimestamp } from "./slice";

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
  async (queryParams: Record<string, any> | undefined = undefined, { rejectWithValue, getState, dispatch }) => {
    try {
      // Check if we have fresh data in cache
      const state = getState() as any;
      const categoryState = state.Category;
      const now = Date.now();
      
      // If we have data and it's not stale, return cached data
      if (
        categoryState.data &&
        categoryState.data.length > 0 &&
        !categoryState.isDataStale &&
        categoryState.lastFetchTime &&
        (now - categoryState.lastFetchTime) < categoryState.cacheExpiry
      ) {
        console.log('Using cached categories data');
        return {
          data: categoryState.data,
          pagination: categoryState.paginationData,
          fromCache: true
        };
      }
      
      // Otherwise, fetch fresh data
      console.log('Fetching fresh categories data');
      const response = await getCategory(queryParams);
      
      // Update cache timestamp
      dispatch(updateCacheTimestamp());
      
      return {
        ...response.data,
        fromCache: false
      };
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

export const toggleCategoryAndroidActiveThunk = createAsyncThunk(
  "toggleCategoryAndroidActiveThunk",
  async ({ id, isAndroid }: { id: string; isAndroid: boolean }, { rejectWithValue }) => {
    try {
      const response = await toggleCategoryAndroidActive(id, isAndroid);
      toastSuccess(response.data.message || "Android activation updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update Android activation";
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

export const toggleCategoryIOSActiveThunk = createAsyncThunk(
  "toggleCategoryIOSActiveThunk",
  async ({ id, isIos }: { id: string; isIos: boolean }, { rejectWithValue }) => {
    try {
      const response = await toggleCategoryIOSActive(id, isIos);
      toastSuccess(response.data.message || "iOS activation updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update iOS activation";
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

export const updateCategoryAssetThunk = createAsyncThunk(
  "updateCategoryAssetThunk",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        assetId: string;
        isPremium?: boolean;
        imageCount?: number;
        prompt?: string;
        country?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateCategoryAsset(id, data);
      toastSuccess(response.data.message || "Asset updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update asset";
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



// Asset Upload Thunk
export const uploadCategoryAssetsThunk = createAsyncThunk(
  "uploadCategoryAssetsThunk",
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await uploadCategoryAssets(id, data);
      toastSuccess(response.data.message || "Assets uploaded successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to upload assets";
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

// Asset Reorder Thunk
export const reorderCategoryAssetsThunk = createAsyncThunk(
  "reorderCategoryAssetsThunk",
  async ({ id, assets }: { id: string; assets: Array<{ assetId: string; order: number }> }, { rejectWithValue }) => {
    try {
      const response = await reorderCategoryAssets(id, { assets });
      toastSuccess(response.data.message || "Assets reordered successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to reorder assets";
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

// Asset Delete Thunk
export const deleteCategoryAssetThunk = createAsyncThunk(
  "deleteCategoryAssetThunk",
  async ({ id, imageUrl }: { id: string; imageUrl: string }, { rejectWithValue }) => {
    try {
      const response = await deleteCategoryAsset(id, imageUrl);
      toastSuccess(response.data.message || "Asset deleted successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete asset";
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
