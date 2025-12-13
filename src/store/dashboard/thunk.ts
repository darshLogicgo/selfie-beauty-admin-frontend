import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "../../config/toastConfig";
import { getDashboardStats, getLiveStatus } from "../../helpers/backend_helper";

// ============================================
// Dashboard Thunks
// ============================================

export const getDashboardStatsThunk = createAsyncThunk(
  "getDashboardStatsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardStats();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch dashboard stats";
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

export const getLiveStatusThunk = createAsyncThunk(
  "getLiveStatusThunk",
  async (params: { filter?: string; startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const { filter = "all", startDate, endDate } = params;
      
      // Log parameters for debugging
      if (filter === "custom") {
        console.log("Fetching live status with custom filter:", { filter, startDate, endDate });
      }
      
      const response = await getLiveStatus(filter, startDate, endDate);
      
      // Log response for debugging
      if (filter === "custom") {
        console.log("Live status response received:", response.data);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch live status";
      
      // Log error for debugging
      console.error("Error fetching live status:", {
        error: errorMessage,
        params,
        response: error.response?.data,
      });
      
      // Don't show toast for live status errors to avoid spam
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

