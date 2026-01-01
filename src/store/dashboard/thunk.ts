import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "../../config/toastConfig";
import {
  getDashboardStats,
  getLiveStatus,
  getGA4UserDemographics,
  getGA4AppVersions,
  getGA4RevenueTrend,
  getGA4EngagementTime,
  getGA4UserActivityOverTime,
  getGA4UserRetention,
} from "../../helpers/backend_helper";

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
      const errorMessage =
        error.response?.data?.message || "Failed to fetch dashboard stats";
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
  async (
    params: { filter?: string; startDate?: string; endDate?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const { filter = "all", startDate, endDate } = params;

      // Log parameters for debugging
      if (filter === "custom") {
        console.log("Fetching live status with custom filter:", {
          filter,
          startDate,
          endDate,
        });
      }

      const response = await getLiveStatus(filter, startDate, endDate);

      // Log response for debugging
      if (filter === "custom") {
        console.log("Live status response received:", response.data);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch live status";

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

export const getGA4UserDemographicsThunk = createAsyncThunk(
  "getGA4UserDemographicsThunk",
  async (queryString: string | undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4UserDemographics(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user demographics";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4AppVersionsThunk = createAsyncThunk(
  "getGA4AppVersionsThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4AppVersions(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch app versions";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4RevenueTrendThunk = createAsyncThunk(
  "getGA4RevenueTrendThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4RevenueTrend(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch revenue trend";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4EngagementTimeThunk = createAsyncThunk(
  "getGA4EngagementTimeThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4EngagementTime(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch engagement time";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4UserActivityOverTimeThunk = createAsyncThunk(
  "getGA4UserActivityOverTimeThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4UserActivityOverTime(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch user activity over time";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4UserRetentionThunk = createAsyncThunk(
  "getGA4UserRetentionThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4UserRetention(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user retention";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);
