import { createSlice } from "@reduxjs/toolkit";
import { getTrendingThunk, updateTrendingStatusThunk, reorderTrendingThunk } from "./thunk";

const initialState = {
  loading: false,
  dataLoading: false,
  data: [] as any[],
  message: "",
  error: null as string | null,
  updatingIds: [] as string[],
};

const slice = createSlice({
  name: "Trending",
  initialState,
  reducers: {
    clearTrendingData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Get Trending ==================================
    builder.addCase(getTrendingThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getTrendingThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || action.payload.body || [];
    });
    builder.addCase(getTrendingThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch trending categories";
      state.message = "";
    });

    // =================================  Update Trending Status ==================================
    builder.addCase(updateTrendingStatusThunk.pending, (state, action) => {
      state.loading = true;
      const id = action.meta.arg.id;
      if (!state.updatingIds.includes(id)) {
        state.updatingIds.push(id);
      }
    });
    builder.addCase(updateTrendingStatusThunk.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.message = action.payload?.message || "";
    });
    builder.addCase(updateTrendingStatusThunk.rejected, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.error = (action.payload as { message?: string })?.message || "Failed to update trending status";
    });

    // =================================  Reorder Trending ==================================
    builder.addCase(reorderTrendingThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(reorderTrendingThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload?.message || "";
      state.error = null;
    });
    builder.addCase(reorderTrendingThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to reorder trending categories";
      state.message = "";
    });
  },
});

export const { clearTrendingData } = slice.actions;
export default slice.reducer;

