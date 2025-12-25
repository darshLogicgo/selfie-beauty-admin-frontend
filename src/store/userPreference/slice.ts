import { createSlice } from "@reduxjs/toolkit";
import {
  getUserPreferenceThunk,
  toggleUserPreferenceThunk,
  reorderUserPreferenceThunk,
} from "./thunk";

const initialState = {
  loading: false,
  dataLoading: false,
  data: [] as any[],
  paginationData: {} as any,
  message: "",
  error: null as string | null,
  updatingIds: [] as string[],
};

const slice = createSlice({
  name: "UserPreference",
  initialState,
  reducers: {
    clearUserPreferenceData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Get User Preference ==================================
    builder.addCase(getUserPreferenceThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getUserPreferenceThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || [];
      state.paginationData = action.payload.pagination || {};
    });
    builder.addCase(getUserPreferenceThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch User Preference data";
      state.message = "";
    });

    // =================================  Toggle User Preference isUserPreference ==================================
    builder.addCase(toggleUserPreferenceThunk.pending, (state, action) => {
      state.loading = true;
      const id = action.meta.arg.id;
      if (!state.updatingIds.includes(id)) {
        state.updatingIds.push(id);
      }
    });
    builder.addCase(toggleUserPreferenceThunk.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(
        (updatingId) => updatingId !== id
      );
      state.message = action.payload?.message || "";
      // Update the item in the data array
      const item = state.data.find((item) => item._id === id);
      if (item) {
        item.isUserPreference = action.meta.arg.isUserPreference;
      }
    });

    builder.addCase(toggleUserPreferenceThunk.rejected, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(
        (updatingId) => updatingId !== id
      );
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to update User Preference status";
      state.message = "";
    });

    // =================================  Reorder User Preference ==================================
    builder.addCase(reorderUserPreferenceThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(reorderUserPreferenceThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload?.message || "";
      state.error = null;
    });
    builder.addCase(reorderUserPreferenceThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to reorder User Preference categories";
      state.message = "";
    });
  },
});

export const { clearUserPreferenceData } = slice.actions;
export default slice.reducer;

