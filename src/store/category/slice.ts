import { createSlice } from "@reduxjs/toolkit";
import {
  createCategoryThunk,
  getCategoryThunk,
  deleteCategoryThunk,
  toggleCategoryStatusThunk,
  toggleCategoryAndroidActiveThunk,
  toggleCategoryIOSActiveThunk,
  reorderCategoryThunk,
  updateCategoryThunk,
  getCategoryTitlesThunk,
} from "./thunk";

const initialState = {
  loading: false,
  dataLoading: false,
  data: [] as any[],
  paginationData: {} as any,
  paginationLoading: false,
  singleData: {} as any,
  message: "",
  error: null as string | null,
  titles: [] as Array<{ _id: string; name: string }>,
  titlesLoading: false,
};

const slice = createSlice({
  name: "Category",
  initialState,
  reducers: {
    clearCategorySingleData: (state) => {
      state.singleData = {};
    },
    clearCategoryData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Create Category ==================================
    builder.addCase(createCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data) {
        state.data.push(action.payload.data);
      }
    });
    builder.addCase(createCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to create category";
      state.message = "";
    });

    // =================================  Update Category ==================================
    builder.addCase(updateCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
      }
    });
    builder.addCase(updateCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to update category";
      state.message = "";
    });

    // =================================  Get Category ==================================
    builder.addCase(getCategoryThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getCategoryThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || [];
      state.paginationData = action.payload.pagination || {};
    });
    builder.addCase(getCategoryThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch categories";
      state.message = "";
    });

    // =================================  Delete Category ==================================
    builder.addCase(deleteCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data?._id) {
        state.data = state.data.filter(
          (item) => item._id !== action.payload.data._id
        );
      }
    });
    builder.addCase(deleteCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to delete category";
      state.message = "";
    });

    // =================================  Toggle Category Status ==================================
    builder.addCase(toggleCategoryStatusThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(toggleCategoryStatusThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data?._id) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload.data };
        }
      }
    });
    builder.addCase(toggleCategoryStatusThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to update category status";
      state.message = "";
    });

    // =================================  Toggle Category Android Active ==================================
    builder.addCase(toggleCategoryAndroidActiveThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(toggleCategoryAndroidActiveThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data?._id) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload.data };
        }
      }
    });
    builder.addCase(toggleCategoryAndroidActiveThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to update Android activation";
      state.message = "";
    });

    // =================================  Toggle Category iOS Active ==================================
    builder.addCase(toggleCategoryIOSActiveThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(toggleCategoryIOSActiveThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data?._id) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload.data };
        }
      }
    });
    builder.addCase(toggleCategoryIOSActiveThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to update iOS activation";
      state.message = "";
    });

    // =================================  Reorder Category ==================================
    builder.addCase(reorderCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(reorderCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
    });
    builder.addCase(reorderCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to reorder categories";
      state.message = "";
    });

    // =================================  Get Category Titles ==================================
    builder.addCase(getCategoryTitlesThunk.pending, (state) => {
      state.titlesLoading = true;
      state.error = null;
    });
    builder.addCase(getCategoryTitlesThunk.fulfilled, (state, action) => {
      state.titlesLoading = false;
      state.error = null;
      state.titles = action.payload.data || [];
    });
    builder.addCase(getCategoryTitlesThunk.rejected, (state, action) => {
      state.titlesLoading = false;
      state.error = (action.payload as { message?: string })?.message || "Failed to fetch category titles";
    });
  },
});

export const { clearCategorySingleData, clearCategoryData } = slice.actions;
export default slice.reducer;
