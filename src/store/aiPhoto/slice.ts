import { createSlice } from "@reduxjs/toolkit";
import { getAIPhotoThunk, toggleAIPhotoIsAiWorldThunk } from "./thunk";

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
  name: "AIPhoto",
  initialState,
  reducers: {
    clearAIPhotoData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Get AI Photo ==================================
    builder.addCase(getAIPhotoThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getAIPhotoThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || [];
      state.paginationData = action.payload.pagination || {};
    });
    builder.addCase(getAIPhotoThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch AI Photo data";
      state.message = "";
    });

    // =================================  Toggle AI Photo isAiWorld ==================================
    builder.addCase(toggleAIPhotoIsAiWorldThunk.pending, (state, action) => {
      state.loading = true;
      const id = action.meta.arg.id;
      if (!state.updatingIds.includes(id)) {
        state.updatingIds.push(id);
      }
    });
    builder.addCase(toggleAIPhotoIsAiWorldThunk.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.message = action.payload?.message || "";
      // Update the item in the data array
      const item = state.data.find((item) => item._id === id);
      if (item) {
        item.isAiWorld = action.meta.arg.isAiWorld;
      }
    });
    builder.addCase(toggleAIPhotoIsAiWorldThunk.rejected, (state, action) => {
      state.loading = false;
      const id = action.meta.arg.id;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.error = (action.payload as { message?: string })?.message || "Failed to update AI Photo status";
      state.message = "";
    });
  },
});

export const { clearAIPhotoData } = slice.actions;
export default slice.reducer;

