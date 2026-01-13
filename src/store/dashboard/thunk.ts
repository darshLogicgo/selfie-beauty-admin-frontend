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
  getGA4Events,
  getGA4EventsOverTime,
  getGA4EventNames,
  getGA4FunnelData,
  getGA4FunnelAnalysis,
  getGA4UsersFunnel,
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

export const getGA4EventsThunk = createAsyncThunk(
  "getGA4EventsThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4Events(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch GA4 events";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4EventsOverTimeThunk = createAsyncThunk(
  "getGA4EventsOverTimeThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4EventsOverTime(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch events over time";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4FunnelDataThunk = createAsyncThunk(
  "getGA4FunnelDataThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4FunnelData(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch funnel data";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4EventNamesThunk = createAsyncThunk(
  "getGA4EventNamesThunk",
  async (queryString: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await getGA4EventNames(queryString);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch event names";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4FunnelAnalysisThunk = createAsyncThunk(
  "getGA4FunnelAnalysisThunk",
  async (
    data: {
      eventNames: string[];
      startDate: string;
      endDate: string;
      deviceCategory?: string;
      country?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getGA4FunnelAnalysis(data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch funnel analysis";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);

export const getGA4UsersFunnelThunk = createAsyncThunk(
  "getGA4UsersFunnelThunk",
  async (
    {
      body,
      queryParams,
    }: {
      body?: {
        eventNames?: string[];
        dimension?: string;
        elapsedTime?: boolean;
        segments?: Array<{ value: string; type: string }>;
      };
      queryParams?: {
        startDate?: string;
        endDate?: string;
        row?: number;
        savedFunnelId?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getGA4UsersFunnel(body, queryParams);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users funnel";
      return rejectWithValue({
        status: error.response?.status,
        message: errorMessage,
      });
    }
  }
);
