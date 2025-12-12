import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "@/config/toastConfig";
import { deleteUninstall, getUninstall } from "@/helpers/backend_helper";

export const getUninstallThunk = createAsyncThunk(
  "uninstall/get",
  async (queryParams: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const response = await getUninstall(queryParams);
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to fetch uninstall feedback";
      toastError(message);
      return rejectWithValue({
        status: error?.response?.status,
        message,
      });
    }
  }
);

export const deleteUninstallThunk = createAsyncThunk(
  "uninstall/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteUninstall(id);
      toastSuccess(response?.data?.message || "Feedback deleted successfully");
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to delete uninstall feedback";
      toastError(message);
      return rejectWithValue({
        status: error?.response?.status,
        message,
      });
    }
  }
);

