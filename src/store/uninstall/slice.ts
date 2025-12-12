import { createSlice } from "@reduxjs/toolkit";
import { deleteUninstallThunk, getUninstallThunk } from "./thunk";

type Pagination = {
  page: number;
  totalItems: number;
  totalPages: number;
  limit: number;
};

type UninstallState = {
  loading: boolean;
  dataLoading: boolean;
  data: any[];
  pagination: Pagination;
  message: string;
  error: string | null;
  deletingId: string | null;
};

const initialState: UninstallState = {
  loading: false,
  dataLoading: false,
  data: [],
  pagination: {
    page: 1,
    totalItems: 0,
    totalPages: 0,
    limit: 10,
  },
  message: "",
  error: null,
  deletingId: null,
};

const uninstallSlice = createSlice({
  name: "Uninstall",
  initialState,
  reducers: {
    clearUninstallData: (state) => {
      state.data = [];
      state.pagination = initialState.pagination;
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUninstallThunk.pending, (state) => {
      state.dataLoading = true;
      state.error = null;
      state.message = "";
      state.data = [];
    });

    builder.addCase(getUninstallThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.error = null;
      state.message = action.payload?.message || "";
      state.data = action.payload?.data || [];
      state.pagination = action.payload?.pagination || initialState.pagination;
    });

    builder.addCase(getUninstallThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch uninstall feedback";
      state.message = "";
    });

    builder.addCase(deleteUninstallThunk.pending, (state, action) => {
      state.loading = true;
      state.deletingId = action.meta.arg;
    });

    builder.addCase(deleteUninstallThunk.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.meta.arg;
      state.deletingId = null;
      state.message = action.payload?.message || "";
      state.data = state.data.filter((item) => item._id !== id);
    });

    builder.addCase(deleteUninstallThunk.rejected, (state, action) => {
      state.loading = false;
      state.deletingId = null;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to delete uninstall feedback";
    });
  },
});

export const { clearUninstallData } = uninstallSlice.actions;
export default uninstallSlice.reducer;

