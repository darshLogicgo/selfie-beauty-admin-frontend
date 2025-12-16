import { createSlice } from "@reduxjs/toolkit";
import { getMoreThunk, updateMoreStatusThunk, reorderMoreThunk } from "./thunk";

const initialState = {
  loading: false,
  dataLoading: false,
  data: [] as any[],
  message: "",
  error: null as string | null,
  updatingIds: [] as string[],
};

const slice = createSlice({
  name: "More",
  initialState,
  reducers: {
    clearMoreData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Get More ==================================
    builder.addCase(getMoreThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getMoreThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || action.payload.body || [];
    });
    builder.addCase(getMoreThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch More categories";
      state.message = "";
    });

    // =================================  Update More Status ==================================
    builder.addCase(updateMoreStatusThunk.pending, (state, action) => {
      state.loading = true;
      const id = action.meta.arg.id;
      if (!state.updatingIds.includes(id)) {
        state.updatingIds.push(id);
      }
    });
    builder.addCase(updateMoreStatusThunk.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.message = action.payload?.message || "";
    });
    builder.addCase(updateMoreStatusThunk.rejected, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.error = (action.payload as { message?: string })?.message || "Failed to update More status";
    });

    // =================================  Reorder More ==================================
    builder.addCase(reorderMoreThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(reorderMoreThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload?.message || "";
      state.error = null;
    });
    builder.addCase(reorderMoreThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to reorder More categories";
      state.message = "";
    });
  },
});

export const { clearMoreData } = slice.actions;
export default slice.reducer;

