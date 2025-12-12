import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "@/config/toastConfig";
import { getFeedback, updateFeedbackStatus } from "@/helpers/backend_helper";

export const getFeedbackThunk = createAsyncThunk(
  "support/get",
  async (queryParams: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const response = await getFeedback(queryParams);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to fetch feedback";
      toastError(message);
      return rejectWithValue({
        status: error?.response?.status,
        message,
      });
    }
  }
);

export const updateFeedbackStatusThunk = createAsyncThunk(
  "support/updateStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await updateFeedbackStatus(id, status);
      toastSuccess(response?.data?.message || "Status updated successfully");
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update feedback status";
      toastError(message);
      return rejectWithValue({
        status: error?.response?.status,
        message,
      });
    }
  }
);
