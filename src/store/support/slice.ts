import { createSlice } from "@reduxjs/toolkit";
import { getFeedbackThunk, updateFeedbackStatusThunk } from "./thunk";

type Pagination = {
  page: number;
  totalItems: number;
  totalPages: number;
  limit: number;
};

type SupportState = {
  dataLoading: boolean;
  loading: boolean;
  data: any[];
  selectedRequest: any | null;
  pagination: Pagination;
  message: string;
  error: string | null;
  updatingId: string | null;
};

const initialState: SupportState = {
  dataLoading: false,
  loading: false,
  data: [],
  selectedRequest: null,
  pagination: {
    page: 1,
    totalItems: 0,
    totalPages: 0,
    limit: 10,
  },
  message: "",
  error: null,
  updatingId: null,
};

const supportSlice = createSlice({
  name: "Support",
  initialState,
  reducers: {
    clearSupportData: (state) => {
      state.data = [];
      state.selectedRequest = null;
      state.pagination = initialState.pagination;
      state.message = "";
      state.error = null;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFeedbackThunk.pending, (state) => {
      state.dataLoading = true;
      state.error = null;
      state.message = "";
    });

    builder.addCase(getFeedbackThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.error = null;
      state.message = action.payload?.message || "";
      state.data = action.payload?.data || [];
      state.pagination = action.payload?.pagination || initialState.pagination;
    });

    builder.addCase(getFeedbackThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch support requests";
      state.message = "";
    });

    builder.addCase(updateFeedbackStatusThunk.pending, (state, action) => {
      state.loading = true;
      state.updatingId = action.meta.arg.id;
    });

    builder.addCase(updateFeedbackStatusThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.updatingId = null;
      state.message = action.payload?.message || "";
      const id = action.meta.arg.id;
      const status = action.meta.arg.status;
      
      // Update the item in the data array
      state.data = state.data.map((item) =>
        item._id === id ? { ...item, status } : item
      );
      
      // Update selectedRequest if it's the same item
      if (state.selectedRequest && state.selectedRequest._id === id) {
        state.selectedRequest = { ...state.selectedRequest, status };
      }
    });

    builder.addCase(updateFeedbackStatusThunk.rejected, (state, action) => {
      state.loading = false;
      state.updatingId = null;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to update feedback status";
    });

  },
});

export const { clearSupportData, setSelectedRequest, clearSelectedRequest } = supportSlice.actions;
export default supportSlice.reducer;
