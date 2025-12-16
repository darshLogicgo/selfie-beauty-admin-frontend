import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import { getMore, updateMoreStatus, reorderMore } from "../../helpers/backend_helper";

// ============================================
// More Thunks
// ============================================

export const getMoreThunk = createAsyncThunk(
  "getMoreThunk",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMore();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch More categories";
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

export const updateMoreStatusThunk = createAsyncThunk(
  "updateMoreStatusThunk",
  async ({ id, isMore }: { id: string; isMore: boolean }, { rejectWithValue }) => {
    try {
      const response = await updateMoreStatus(id, { isMore });
      toastSuccess(response.data?.message || `Category ${isMore ? 'activated' : 'deactivated'} successfully`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update More status";
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

export const reorderMoreThunk = createAsyncThunk(
  "reorderMoreThunk",
  async (
    data: { categories: Array<{ _id: string; moreOrder: number }> },
    { rejectWithValue }
  ) => {
    try {
      const response = await reorderMore(data);
      toastSuccess(
        response.data?.message ||
          "More categories reordered successfully"
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reorder More categories";
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

