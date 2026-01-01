import { createSlice } from "@reduxjs/toolkit";
import {
  getDashboardStatsThunk,
  getLiveStatusThunk,
  getGA4UserDemographicsThunk,
  getGA4AppVersionsThunk,
  getGA4RevenueTrendThunk,
  getGA4EngagementTimeThunk,
  getGA4UserActivityOverTimeThunk,
  getGA4UserRetentionThunk,
} from "./thunk";

interface MostUsedCategory {
  _id: string;
  name: string;
  mediaclicks: number;
  status: boolean;
  image: string | null;
}

interface DashboardStats {
  totalCategories: number;
  activeCategories: number;
  totalUsers: number;
  subscribedUsers: number;
  mostUsedCategories: MostUsedCategory[];
  paywallHits?: number;
  paywall_hits?: number;
}

interface LiveStatusCategory {
  success_calls: number;
  failed_calls: number;
  success_rate: string;
  fail_rate: string;
  avg_response_time_ms: number;
  filter_used: string;
  total_records: number;
}

interface LiveStatus {
  [key: string]: LiveStatusCategory;
}

interface CountryDemographic {
  country: string;
  countryCode: string;
  users: number;
  percentage: number;
}

interface UserDemographics {
  totalUsers: number;
  countries: CountryDemographic[];
}

const initialState = {
  loading: false,
  liveStatusLoading: false,
  demographicsLoading: false,
  stats: {
    totalCategories: 0,
    activeCategories: 0,
    totalUsers: 0,
    subscribedUsers: 0,
    mostUsedCategories: [] as MostUsedCategory[],
  } as DashboardStats,
  liveStatus: {} as LiveStatus,
  userDemographics: {
    totalUsers: 0,
    countries: [],
  } as UserDemographics,
  message: "",
  error: null as string | null,
  liveStatusError: null as string | null,
  demographicsError: null as string | null,
  appVersionsLoading: false,
  appVersionsError: null as string | null,
  appVersions: { totalUsers: 0, versions: [] as any[] },
  revenueTrendLoading: false,
  revenueTrendError: null as string | null,
  revenueTrend: {
    totalRevenue: 0,
    points: [] as Array<{ date: string; revenue: number; period?: string }>,
    period: "",
    dateRange: { startDate: "", endDate: "" },
  },
  engagementLoading: false,
  engagementError: null as string | null,
  engagement: {
    averageEngagementTime: "0m 0s",
    points: [] as Array<{
      date: string;
      engagementTime: string;
      period?: string;
    }>,
    period: "",
    dateRange: { startDate: "", endDate: "" },
  },
  userActivityLoading: false,
  userActivityError: null as string | null,
  userActivity: {
    summary: {
      last30Days: 0,
      last7Days: 0,
      last1Day: 0,
    },
    trend: [] as Array<{
      date: string;
      activeUsers: number;
    }>,
    period: "",
    dateRange: { startDate: "", endDate: "" },
  },
  userRetentionLoading: false,
  userRetentionError: null as string | null,
  userRetention: {
    baseUsers: 0,
    data: [] as Array<{
      date: string;
      day: number;
      activeUsers: number;
      retentionRate: number;
    }>,
  },
};

const slice = createSlice({
  name: "Dashboard",
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.stats = {
        totalCategories: 0,
        activeCategories: 0,
        totalUsers: 0,
        subscribedUsers: 0,
        mostUsedCategories: [],
      };
    },
  },
  extraReducers: (builder) => {
    // =================================  Get Dashboard Stats ==================================
    builder.addCase(getDashboardStatsThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getDashboardStatsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      if (action.payload.data) {
        state.stats = action.payload.data;
      }
    });
    builder.addCase(getDashboardStatsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch dashboard stats";
      state.message = "";
    });

    // =================================  Get Live Status ==================================
    builder.addCase(getLiveStatusThunk.pending, (state) => {
      state.liveStatusLoading = true;
      state.liveStatusError = null;
    });
    builder.addCase(getLiveStatusThunk.fulfilled, (state, action) => {
      state.liveStatusLoading = false;
      state.liveStatusError = null;
      // The API returns the data directly, not wrapped in a data property
      if (action.payload) {
        state.liveStatus = action.payload;
      }
    });
    builder.addCase(getLiveStatusThunk.rejected, (state, action) => {
      state.liveStatusLoading = false;
      state.liveStatusError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch live status";
    });

    // =================================  Get GA4 User Demographics ==================================
    builder.addCase(getGA4UserDemographicsThunk.pending, (state) => {
      state.demographicsLoading = true;
      state.demographicsError = null;
    });
    builder.addCase(getGA4UserDemographicsThunk.fulfilled, (state, action) => {
      state.demographicsLoading = false;
      state.demographicsError = null;
      if (action.payload.data) {
        state.userDemographics = action.payload.data;
      }
    });
    builder.addCase(getGA4UserDemographicsThunk.rejected, (state, action) => {
      state.demographicsLoading = false;
      state.demographicsError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch user demographics";
    });

    // =================================  Get GA4 App Versions ==================================
    builder.addCase(getGA4AppVersionsThunk.pending, (state) => {
      state.appVersionsLoading = true;
      state.appVersionsError = null;
    });
    builder.addCase(getGA4AppVersionsThunk.fulfilled, (state, action) => {
      state.appVersionsLoading = false;
      state.appVersionsError = null;
      if (action.payload.data) {
        state.appVersions = action.payload.data;
      }
    });
    builder.addCase(getGA4AppVersionsThunk.rejected, (state, action) => {
      state.appVersionsLoading = false;
      state.appVersionsError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch app versions";
    });

    // =================================  Get GA4 Revenue Trend ==================================
    builder.addCase(getGA4RevenueTrendThunk.pending, (state) => {
      state.revenueTrendLoading = true;
      state.revenueTrendError = null;
    });
    builder.addCase(getGA4RevenueTrendThunk.fulfilled, (state, action) => {
      state.revenueTrendLoading = false;
      state.revenueTrendError = null;
      if (action.payload.data) {
        state.revenueTrend = action.payload.data;
      }
    });
    builder.addCase(getGA4RevenueTrendThunk.rejected, (state, action) => {
      state.revenueTrendLoading = false;
      state.revenueTrendError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch revenue trend";
    });

    // =================================  Get GA4 Engagement Time ==================================
    builder.addCase(getGA4EngagementTimeThunk.pending, (state) => {
      state.engagementLoading = true;
      state.engagementError = null;
    });
    builder.addCase(getGA4EngagementTimeThunk.fulfilled, (state, action) => {
      state.engagementLoading = false;
      state.engagementError = null;
      if (action.payload.data) {
        state.engagement = action.payload.data;
      }
    });
    builder.addCase(getGA4EngagementTimeThunk.rejected, (state, action) => {
      state.engagementLoading = false;
      state.engagementError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch engagement time";
    });

    // =================================  Get GA4 User Activity Over Time ==================================
    builder.addCase(getGA4UserActivityOverTimeThunk.pending, (state) => {
      state.userActivityLoading = true;
      state.userActivityError = null;
    });
    builder.addCase(
      getGA4UserActivityOverTimeThunk.fulfilled,
      (state, action) => {
        state.userActivityLoading = false;
        state.userActivityError = null;
        if (action.payload.data) {
          state.userActivity = action.payload.data;
        }
      }
    );
    builder.addCase(
      getGA4UserActivityOverTimeThunk.rejected,
      (state, action) => {
        state.userActivityLoading = false;
        state.userActivityError =
          (action.payload as { message?: string })?.message ||
          "Failed to fetch user activity over time";
      }
    );

    // =================================  Get GA4 User Retention ==================================
    builder.addCase(getGA4UserRetentionThunk.pending, (state) => {
      state.userRetentionLoading = true;
      state.userRetentionError = null;
    });
    builder.addCase(getGA4UserRetentionThunk.fulfilled, (state, action) => {
      state.userRetentionLoading = false;
      state.userRetentionError = null;
      if (action.payload.data) {
        state.userRetention = {
          baseUsers: action.payload.baseUsers || 0,
          data: action.payload.data,
        };
      }
    });
    builder.addCase(getGA4UserRetentionThunk.rejected, (state, action) => {
      state.userRetentionLoading = false;
      state.userRetentionError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch user retention";
    });
  },
});

export const { clearDashboardData } = slice.actions;
export default slice.reducer;
