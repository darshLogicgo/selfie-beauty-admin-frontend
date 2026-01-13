import { createSlice } from "@reduxjs/toolkit";
import {
  getSubCategoryThunk,
  createSubCategoryThunk,
  updateSubCategoryThunk,
  toggleSubCategoryStatusThunk,
  deleteSubCategoryThunk,
  addSubCategoryAssetsThunk,
  deleteSubCategoryAssetThunk,
  toggleSubCategoryPremiumThunk,
  getSubCategoryAssetsThunk,
  updateSubCategoryAssetThunk,
  reorderSubCategoryThunk,
 
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
  assets: [] as any[],
  assetsPagination: {} as any,
  assetsLoading: false,
};

const slice = createSlice({
  name: "SubCategory",
  initialState,
  reducers: {
    clearSubCategorySingleData: (state) => {
      state.singleData = {};
    },
    clearSubCategoryData: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // =================================  Get SubCategory ==================================
    builder.addCase(getSubCategoryThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getSubCategoryThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data || [];
      state.paginationData = action.payload.pagination || {};
    });
    builder.addCase(getSubCategoryThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch subcategories";
      state.message = "";
    });

    // =================================  Create SubCategory ==================================
    builder.addCase(createSubCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createSubCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data) {
        state.data.push(action.payload.data);
      }
    });
    builder.addCase(createSubCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to create subcategory";
      state.message = "";
    });

    // =================================  Update SubCategory ==================================
    builder.addCase(updateSubCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateSubCategoryThunk.fulfilled, (state, action) => {
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
    builder.addCase(updateSubCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to update subcategory";
      state.message = "";
    });

    // =================================  Toggle SubCategory Status ==================================
    builder.addCase(toggleSubCategoryStatusThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(toggleSubCategoryStatusThunk.fulfilled, (state, action) => {
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
    builder.addCase(toggleSubCategoryStatusThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to update subcategory status";
      state.message = "";
    });

    // =================================  Delete SubCategory ==================================
    builder.addCase(deleteSubCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteSubCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      if (action.payload.data?._id) {
        state.data = state.data.filter(
          (item) => item._id !== action.payload.data._id
        );
      }
    });
    builder.addCase(deleteSubCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to delete subcategory";
      state.message = "";
    });

    // =================================  Add SubCategory Assets ==================================
    builder.addCase(addSubCategoryAssetsThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(addSubCategoryAssetsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      // Update the subcategory with new assets if data is returned
      if (action.payload.data?._id) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload.data };
        }
      }
    });
    builder.addCase(addSubCategoryAssetsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to add images";
      state.message = "";
    });

    // =================================  Delete SubCategory Asset ==================================
    builder.addCase(deleteSubCategoryAssetThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteSubCategoryAssetThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      // Update the subcategory with updated assets if data is returned
      if (action.payload.data?._id) {
        const index = state.data.findIndex(
          (item) => item._id === action.payload.data._id
        );
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload.data };
        }
      }
    });
    builder.addCase(deleteSubCategoryAssetThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to delete image";
      state.message = "";
    });

    // =================================  Get SubCategory Assets ==================================
    builder.addCase(getSubCategoryAssetsThunk.pending, (state) => {
      state.assetsLoading = true;
      state.error = null;
    });
    builder.addCase(getSubCategoryAssetsThunk.fulfilled, (state, action) => {
      state.assetsLoading = false;
      state.error = null;
      // API response structure: { data: { asset_images: [...], _id, subcategoryTitle }, pagination: {...} }
      state.assets =
        action.payload.data?.asset_images || action.payload.asset_images || [];
      state.assetsPagination = action.payload.pagination || {};
    });
    builder.addCase(getSubCategoryAssetsThunk.rejected, (state, action) => {
      state.assetsLoading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch assets";
    });

    // =================================  Update SubCategory Asset ==================================
    builder.addCase(updateSubCategoryAssetThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateSubCategoryAssetThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      // Update the asset in the assets array - refresh from updated data
      if (action.payload.data?.asset_images) {
        state.assets = action.payload.data.asset_images;
      }
    });
    builder.addCase(updateSubCategoryAssetThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to update asset";
      state.message = "";
    });

    // =================================  Reorder SubCategory ==================================
    builder.addCase(reorderSubCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(reorderSubCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message || "";
      state.error = null;
      // Refresh data after reorder
    });
    builder.addCase(reorderSubCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to reorder subcategories";
      state.message = "";
    });

    
      },
});

export const { clearSubCategorySingleData, clearSubCategoryData } =
  slice.actions;
export default slice.reducer;
