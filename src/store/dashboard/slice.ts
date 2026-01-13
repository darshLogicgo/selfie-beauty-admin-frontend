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
  getGA4EventsThunk,
  getGA4EventsOverTimeThunk,
  getGA4FunnelDataThunk,
  getGA4FunnelAnalysisThunk,
  getGA4EventNamesThunk,
  getGA4UsersFunnelThunk,
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

interface GA4EventRow {
  eventName: string;
  eventCount: number;
  totalUsers: number;
  eventCountPerActiveUser: number;
  totalRevenue: number;
}

interface GA4EventsState {
  data: GA4EventRow[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status?: boolean;
  message?: string;
}

interface GA4EventsOverTimeState {
  data: Array<{
    date: string;
    events: Record<string, number>;
    totalEventCount: number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status?: boolean;
  message?: string;
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
  ga4EventsLoading: false,
  ga4EventsError: null as string | null,
  ga4Events: {
    data: [],
    pagination: { page: 1, totalPages: 0, totalItems: 0, limit: 25 },
    dateRange: { startDate: "", endDate: "" },
    status: false,
    message: "",
  } as GA4EventsState,
  ga4EventsOverTimeLoading: false,
  ga4EventsOverTimeError: null as string | null,
  ga4EventsOverTime: {
    data: [],
    dateRange: { startDate: "", endDate: "" },
    status: false,
    message: "",
  } as GA4EventsOverTimeState,
  // Funnel Analytics State
  funnelLoading: false,
  funnelError: null as string | null,
  funnelData: {
    events: [] as Array<{
      eventName: string;
      eventCount: number;
      displayName?: string;
    }>,
  },
  funnelAnalysisLoading: false,
  funnelAnalysisError: null as string | null,
  funnelAnalysis: {
    steps: [] as Array<{
      eventName: string;
      displayName: string;
      users: number;
      conversionRate: number;
      dropoffRate: number;
    }>,
    totalUsers: 0,
    overallConversion: 0,
  },
  // Event Names State
  eventNamesLoading: false,
  eventNamesError: null as string | null,
  eventNames: {
    data: [] as string[],
  },
  // Users Funnel State
  usersFunnelLoading: false,
  usersFunnelError: null as string | null,
  usersFunnel: null as {
    stages: Array<any>;
    summary: {
      totalUsersAtStart: number;
      totalUsersAtEnd: number;
      overallConversionRate: number;
      totalStages: number;
    };
    dateRange: {
      startDate: string;
      endDate: string;
    };
    dimension: string | null;
    segments?: string[];
    segmentDetails?: Array<{
      value: string;
      type: string;
    }>;
  } | null,
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

    // =================================  Get GA4 Events ==================================
    builder.addCase(getGA4EventsThunk.pending, (state) => {
      state.ga4EventsLoading = true;
      state.ga4EventsError = null;
    });
    builder.addCase(getGA4EventsThunk.fulfilled, (state, action) => {
      state.ga4EventsLoading = false;
      state.ga4EventsError = null;
      if (action.payload) {
        state.ga4Events = action.payload as GA4EventsState;
      }
    });
    builder.addCase(getGA4EventsThunk.rejected, (state, action) => {
      state.ga4EventsLoading = false;
      state.ga4EventsError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch GA4 events";
    });

    // =================================  Get GA4 Events Over Time ==================================
    builder.addCase(getGA4EventsOverTimeThunk.pending, (state) => {
      state.ga4EventsOverTimeLoading = true;
      state.ga4EventsOverTimeError = null;
    });
    builder.addCase(getGA4EventsOverTimeThunk.fulfilled, (state, action) => {
      state.ga4EventsOverTimeLoading = false;
      state.ga4EventsOverTimeError = null;
      if (action.payload) {
        state.ga4EventsOverTime = action.payload as GA4EventsOverTimeState;
      }
    });
    builder.addCase(getGA4EventsOverTimeThunk.rejected, (state, action) => {
      state.ga4EventsOverTimeLoading = false;
      state.ga4EventsOverTimeError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch events over time";
    });

    // =================================  Get GA4 Funnel Data ==================================
    builder.addCase(getGA4FunnelDataThunk.pending, (state) => {
      state.funnelLoading = true;
      state.funnelError = null;
    });
    builder.addCase(getGA4FunnelDataThunk.fulfilled, (state, action) => {
      state.funnelLoading = false;
      state.funnelError = null;
      if (action.payload?.data) {
        state.funnelData = {
          events: action.payload.data,
        };
      }
    });
    builder.addCase(getGA4FunnelDataThunk.rejected, (state, action) => {
      state.funnelLoading = false;
      state.funnelError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch funnel data";
    });

    // =================================  Get GA4 Funnel Analysis ==================================
    builder.addCase(getGA4FunnelAnalysisThunk.pending, (state) => {
      state.funnelAnalysisLoading = true;
      state.funnelAnalysisError = null;
    });
    builder.addCase(getGA4FunnelAnalysisThunk.fulfilled, (state, action) => {
      state.funnelAnalysisLoading = false;
      state.funnelAnalysisError = null;
      if (action.payload?.data) {
        state.funnelAnalysis = action.payload.data;
      }
    });
    builder.addCase(getGA4FunnelAnalysisThunk.rejected, (state, action) => {
      state.funnelAnalysisLoading = false;
      state.funnelAnalysisError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch funnel analysis";
    });

    // =================================  Get GA4 Event Names ==================================
    builder.addCase(getGA4EventNamesThunk.pending, (state) => {
      state.eventNamesLoading = true;
      state.eventNamesError = null;
    });
    builder.addCase(getGA4EventNamesThunk.fulfilled, (state, action) => {
      state.eventNamesLoading = false;
      state.eventNamesError = null;
      if (action.payload?.data) {
        state.eventNames = {
          data: action.payload.data,
        };
      }
    });
    builder.addCase(getGA4EventNamesThunk.rejected, (state, action) => {
      state.eventNamesLoading = false;
      state.eventNamesError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch event names";
    });

    // =================================  Get GA4 Users Funnel ==================================
    builder.addCase(getGA4UsersFunnelThunk.pending, (state) => {
      state.usersFunnelLoading = true;
      state.usersFunnelError = null;
    });
    builder.addCase(getGA4UsersFunnelThunk.fulfilled, (state, action) => {
      state.usersFunnelLoading = false;
      state.usersFunnelError = null;
      // Handle the API response structure: { message, data: { stages, summary, dimension }, status, dateRange }
      // The thunk returns response.data, so action.payload is the full response object
      if (action.payload) {
        const responseData = action.payload.data || action.payload;
        state.usersFunnel = {
          stages: responseData.stages || [],
          summary: responseData.summary || {
            totalUsersAtStart: 0,
            totalUsersAtEnd: 0,
            overallConversionRate: 0,
            totalStages: 0,
          },
          dateRange: action.payload.dateRange || {
            startDate: "",
            endDate: "",
          },
          dimension: responseData.dimension || null,
          segments: responseData.segments || [],
          segmentDetails: responseData.segmentDetails || [],
        };
      }
    });
    builder.addCase(getGA4UsersFunnelThunk.rejected, (state, action) => {
      state.usersFunnelLoading = false;
      state.usersFunnelError =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch users funnel";
    });
  },
});

export const { clearDashboardData } = slice.actions;
export default slice.reducer;
