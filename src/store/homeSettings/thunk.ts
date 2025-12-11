import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  getHome,
  toggleHomeCategorySection,
  toggleHomeSubcategorySection,
  reorderHomeSection1,
  reorderHomeSection2,
  reorderHomeSection3,
  reorderHomeSection4,
  reorderHomeSection5,
  reorderHomeSection6,
  reorderHomeSection7,
} from "../../helpers/backend_helper";

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
      const errorMessage =
        error.response?.data?.message || "Failed to fetch home data";
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
  async (
    data: { categories: Array<{ _id: string; [key: string]: any }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await toggleHomeCategorySection(data);
      toastSuccess(
        response.data?.message || "Category section updated successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update category section";
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
  async (
    data: { subcategories: Array<{ _id: string; [key: string]: any }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await toggleHomeSubcategorySection(data);
      toastSuccess(
        response.data?.message || "Subcategory section updated successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update subcategory section";
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

export const reorderHomeSection1Thunk = createAsyncThunk(
  "reorderHomeSection1Thunk",
  async (
    data: { categories: Array<{ _id: string; section1Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection1(data);
      toastSuccess(
        response.data?.message || "Section 1 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 1";
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

export const reorderHomeSection2Thunk = createAsyncThunk(
  "reorderHomeSection2Thunk",
  async (
    data: { categories: Array<{ _id: string; section2Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection2(data);
      toastSuccess(
        response.data?.message || "Section 2 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 2";
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

export const reorderHomeSection3Thunk = createAsyncThunk(
  "reorderHomeSection3Thunk",
  async (
    data: { subcategories: Array<{ _id: string; section3Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection3(data);
      toastSuccess(
        response.data?.message || "Section 3 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 3";
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

export const reorderHomeSection4Thunk = createAsyncThunk(
  "reorderHomeSection4Thunk",
  async (
    data: { subcategories: Array<{ _id: string; section4Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection4(data);
      toastSuccess(
        response.data?.message || "Section 4 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 4";
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

export const reorderHomeSection5Thunk = createAsyncThunk(
  "reorderHomeSection5Thunk",
  async (
    data: { subcategories: Array<{ _id: string; section5Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection5(data);
      toastSuccess(
        response.data?.message || "Section 5 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 5";
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

export const reorderHomeSection6Thunk = createAsyncThunk(
  "reorderHomeSection6Thunk",
  async (
    data: { categories: Array<{ _id: string; section6Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection6(data);
      toastSuccess(
        response.data?.message || "Section 6 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 6";
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

export const reorderHomeSection7Thunk = createAsyncThunk(
  "reorderHomeSection7Thunk",
  async (
    data: { categories: Array<{ _id: string; section7Order: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderHomeSection7(data);
      toastSuccess(
        response.data?.message || "Section 7 reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reorder section 7";
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
