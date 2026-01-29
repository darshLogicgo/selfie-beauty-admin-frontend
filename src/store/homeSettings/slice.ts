import { createSlice } from "@reduxjs/toolkit";
import {
  getHomeDataThunk,
  toggleHomeCategorySectionThunk,
  toggleHomeSubcategorySectionThunk,
} from "./thunk";

interface HomeData {
  section1: any[];
  section2: any[];
  customSection?: {
    title: string;
    categories: any[];
  };
  section3: any[];
  section4: any[];
  section5: any[];
  section6: {
    title: string;
    categories: any[];
  };
  section7: {
    title: string;
    categories: any[];
  };
  section8: any[];
}

const initialState = {
  loading: false,
  data: {
    section1: [] as any[],
    section2: [] as any[],
    customSection: {
      title: "",
      categories: [] as any[],
    },
    section3: [] as any[],
    section4: [] as any[],
    section5: [] as any[],
    section6: {
      title: "",
      categories: [] as any[],
    },
    section7: {
      title: "",
      categories: [] as any[],
    },
    section8: [] as any[],
  } as HomeData,
  message: "",
  error: null as string | null,
  updatingIds: [] as string[],
};

const slice = createSlice({
  name: "HomeSettings",
  initialState,
  reducers: {
    clearHomeData: (state) => {
      state.data = {
        section1: [],
        section2: [],
        customSection: {
          title: "",
          categories: [],
        },
        section3: [],
        section4: [],
        section5: [],
        section6: {
          title: "",
          categories: [],
        },
        section7: {
          title: "",
          categories: [],
        },
        section8: [],
      };
    },
    updateSectionItem: (state, action) => {
      const { id, section, value } = action.payload;

      // Helper function to update item in an array
      const updateItemInArray = (arr: any[], flagName: string) => {
        const item = arr.find((item: any) => item._id === id);
        if (item) {
          item[flagName] = value;
        }
      };

      // Update in section1 (categories)
      if (section === "section1") {
        updateItemInArray(state.data.section1, "isSection1");
        // Also update in section2, section6, section7 if same item exists
        updateItemInArray(state.data.section2, "isSection1");
        updateItemInArray(state.data.section6.categories, "isSection1");
        updateItemInArray(state.data.section7.categories, "isSection1");
      }

      // Update in section2 (categories)
      if (section === "section2") {
        updateItemInArray(state.data.section1, "isSection2");
        updateItemInArray(state.data.section2, "isSection2");
        updateItemInArray(state.data.section6.categories, "isSection2");
        updateItemInArray(state.data.section7.categories, "isSection2");
      }

      // Update in section3 (subcategories)
      if (section === "section3") {
        updateItemInArray(state.data.section3, "isSection3");
        updateItemInArray(state.data.section4, "isSection3");
        updateItemInArray(state.data.section5, "isSection3");
      }

      // Update in section4 (subcategories - single selection)
      if (section === "section4") {
        updateItemInArray(state.data.section3, "isSection4");
        updateItemInArray(state.data.section4, "isSection4");
        updateItemInArray(state.data.section5, "isSection4");
        // For single selection, unselect others
        if (value) {
          state.data.section3.forEach((item: any) => {
            if (item._id !== id) {
              item.isSection4 = false;
            }
          });
          state.data.section4.forEach((item: any) => {
            if (item._id !== id) {
              item.isSection4 = false;
            }
          });
          state.data.section5.forEach((item: any) => {
            if (item._id !== id) {
              item.isSection4 = false;
            }
          });
        }
      }

      // Update in section5 (subcategories - single selection)
      if (section === "section5") {
        updateItemInArray(state.data.section3, "isSection5");
        updateItemInArray(state.data.section4, "isSection5");
        updateItemInArray(state.data.section5, "isSection5");
        // For single selection, unselect others
        if (value) {
          state.data.section3.forEach((item: any) => {
            if (item._id !== id) {
              item.isSection5 = false;
            }
          });
          state.data.section4.forEach((item: any) => {
            if (item._id !== id) {
              item.isSection5 = false;
            }
          });
          state.data.section5.forEach((item: any) => {
            if (item._id !== id) {
              item.isSection5 = false;
            }
          });
        }
      }

      // Update in section8 (subcategories - similar to section3)
      if (section === "section8") {
        updateItemInArray(state.data.section3, "isSection8");
        updateItemInArray(state.data.section4, "isSection8");
        updateItemInArray(state.data.section5, "isSection8");
        updateItemInArray(state.data.section8, "isSection8");
      }

      // Update in section6 (categories)
      if (section === "section6") {
        updateItemInArray(state.data.section1, "isSection6");
        updateItemInArray(state.data.section2, "isSection6");
        updateItemInArray(state.data.section6.categories, "isSection6");
        updateItemInArray(state.data.section7.categories, "isSection6");
      }

      // Update in section7 (categories)
      if (section === "section7") {
        updateItemInArray(state.data.section1, "isSection7");
        updateItemInArray(state.data.section2, "isSection7");
        updateItemInArray(state.data.section6.categories, "isSection7");
        updateItemInArray(state.data.section7.categories, "isSection7");
      }

      // Update in custom section (categories)
      if (section === "custom") {
        updateItemInArray(state.data.section1, "isCustomSection");
        updateItemInArray(state.data.section2, "isCustomSection");
        updateItemInArray(state.data.customSection.categories, "isCustomSection");
        updateItemInArray(state.data.section6.categories, "isCustomSection");
        updateItemInArray(state.data.section7.categories, "isCustomSection");
      }
    },
  },
  extraReducers: (builder) => {
    // =================================  Get Home Data ==================================
    builder.addCase(getHomeDataThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getHomeDataThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload?.message || "";
      state.error = null;
      if (action.payload?.data) {
        state.data = {
          section1: action.payload.data.section1 || [],
          section2: action.payload.data.section2 || [],
          customSection: action.payload.data.customSection || {
            title: "",
            categories: [],
          },
          section3: action.payload.data.section3 || [],
          section4: action.payload.data.section4 || [],
          section5: action.payload.data.section5 || [],
          section6: action.payload.data.section6 || {
            title: "",
            categories: [],
          },
          section7: action.payload.data.section7 || {
            title: "",
            categories: [],
          },
          section8: action.payload.data.section8 || [],
        };
      }
    });
    builder.addCase(getHomeDataThunk.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as { message?: string })?.message ||
        "Failed to fetch home data";
      state.message = "";
    });

    // =================================  Toggle Home Category Section ==================================
    builder.addCase(toggleHomeCategorySectionThunk.pending, (state, action) => {
      state.loading = true;
      const categoryIds = action.meta.arg.categories.map((cat) => cat._id);
      categoryIds.forEach((id) => {
        if (!state.updatingIds.includes(id)) {
          state.updatingIds.push(id);
        }
      });
    });
    builder.addCase(
      toggleHomeCategorySectionThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        const categoryIds = action.meta.arg.categories.map((cat) => cat._id);
        state.updatingIds = state.updatingIds.filter(
          (id) => !categoryIds.includes(id)
        );
        state.message = action.payload?.message || "";
        // Refresh data after successful toggle
        // The data will be updated via the updateSectionItem reducer calls
      }
    );
    builder.addCase(
      toggleHomeCategorySectionThunk.rejected,
      (state, action) => {
        state.loading = false;
        const categoryIds = action.meta.arg.categories.map((cat) => cat._id);
        state.updatingIds = state.updatingIds.filter(
          (id) => !categoryIds.includes(id)
        );
        state.error =
          (action.payload as { message?: string })?.message ||
          "Failed to update category section";
        state.message = "";
      }
    );

    // =================================  Toggle Home Subcategory Section ==================================
    builder.addCase(
      toggleHomeSubcategorySectionThunk.pending,
      (state, action) => {
        state.loading = true;
        const subcategoryIds = action.meta.arg.subcategories.map(
          (subcat) => subcat._id
        );
        subcategoryIds.forEach((id) => {
          if (!state.updatingIds.includes(id)) {
            state.updatingIds.push(id);
          }
        });
      }
    );
    builder.addCase(
      toggleHomeSubcategorySectionThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        const subcategoryIds = action.meta.arg.subcategories.map(
          (subcat) => subcat._id
        );
        state.updatingIds = state.updatingIds.filter(
          (id) => !subcategoryIds.includes(id)
        );
        state.message = action.payload?.message || "";
        // Refresh data after successful toggle
        // The data will be updated via the updateSectionItem reducer calls
      }
    );
    builder.addCase(
      toggleHomeSubcategorySectionThunk.rejected,
      (state, action) => {
        state.loading = false;
        const subcategoryIds = action.meta.arg.subcategories.map(
          (subcat) => subcat._id
        );
        state.updatingIds = state.updatingIds.filter(
          (id) => !subcategoryIds.includes(id)
        );
        state.error =
          (action.payload as { message?: string })?.message ||
          "Failed to update subcategory section";
        state.message = "";
      }
    );
  },
});

export const { clearHomeData, updateSectionItem } = slice.actions;
export default slice.reducer;
