import { createSlice } from "@reduxjs/toolkit";
import { getDashboardStatsThunk, getLiveStatusThunk } from "./thunk";

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

const initialState = {
  loading: false,
  liveStatusLoading: false,
  stats: {
    totalCategories: 0,
    activeCategories: 0,
    totalUsers: 0,
    subscribedUsers: 0,
    mostUsedCategories: [] as MostUsedCategory[],
  } as DashboardStats,
  liveStatus: {} as LiveStatus,
  message: "",
  error: null as string | null,
  liveStatusError: null as string | null,
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
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch dashboard stats";
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
      state.liveStatusError = (action.payload as { message?: string })?.message || "Failed to fetch live status";
    });
  },
});

export const { clearDashboardData } = slice.actions;
export default slice.reducer;

