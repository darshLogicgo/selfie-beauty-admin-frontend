import { createSlice } from "@reduxjs/toolkit";
import { getAIWorldThunk, toggleAIWorldThunk, reorderAIWorldThunk } from "./thunk";

const initialState = {
  loading: false,
  dataLoading: false,
  data: [] as any[],
  message: "",
  error: null as string | null,
  updatingIds: [] as string[],
};

const slice = createSlice({
  name: "AIWorld",
  initialState,
  reducers: {
    clearAIWorldData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Get AI World ==================================
    builder.addCase(getAIWorldThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getAIWorldThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || [];
    });
    builder.addCase(getAIWorldThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch AI World categories";
      state.message = "";
    });

    // =================================  Toggle AI World ==================================
    builder.addCase(toggleAIWorldThunk.pending, (state, action) => {
      state.loading = true;
      const id = action.meta.arg;
      if (!state.updatingIds.includes(id)) {
        state.updatingIds.push(id);
      }
    });
    builder.addCase(toggleAIWorldThunk.fulfilled, (state, action) => {
      state.loading = false;
      const id = action.meta.arg;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.message = action.payload?.message || "";
      
      // Update the data item with new isAiWorld status
      if (action.payload?.data?._id) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload.data };
        }
      }
    });
    builder.addCase(toggleAIWorldThunk.rejected, (state, action) => {
      state.loading = false;
      const id = action.meta.arg;
      state.updatingIds = state.updatingIds.filter(updatingId => updatingId !== id);
      state.error = (action.payload as { message?: string })?.message || "Failed to update AI World status";
    });

    // =================================  Reorder AI World ==================================
    builder.addCase(reorderAIWorldThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(reorderAIWorldThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload?.message || "";
      state.error = null;
    });
    builder.addCase(reorderAIWorldThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to reorder AI World categories";
      state.message = "";
    });
  },
});

export const { clearAIWorldData } = slice.actions;
export default slice.reducer;

