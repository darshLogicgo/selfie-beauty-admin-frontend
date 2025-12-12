import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectableList from "@/components/ui/SelectableList";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getHomeDataThunk,
  toggleHomeCategorySectionThunk,
  toggleHomeSubcategorySectionThunk,
  reorderHomeSection1Thunk,
  reorderHomeSection2Thunk,
  reorderHomeSection3Thunk,
  reorderHomeSection4Thunk,
  reorderHomeSection5Thunk,
  reorderHomeSection6Thunk,
  reorderHomeSection7Thunk,
} from "@/store/homeSettings/thunk";
import { updateSectionItem } from "@/store/homeSettings/slice";

const HomeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, data, error, updatingIds } = useAppSelector(
    (state) => state.HomeSettings
  );

  // Fetch home data on component mount
  useEffect(() => {
    dispatch(getHomeDataThunk());
  }, [dispatch]);

  const handleSave = () => {
    toast.success("Settings saved! Home page configuration has been updated.");
  };

  // Get all unique categories for section1 and section2 (combine all from section1, section2, section6, section7)
  const allCategories = useMemo(() => {
    const categoryMap = new Map();

    // Add from section1
    data.section1?.forEach((item: any) => {
      if (!categoryMap.has(item._id)) {
        categoryMap.set(item._id, item);
      }
    });

    // Add from section2
    data.section2?.forEach((item: any) => {
      if (!categoryMap.has(item._id)) {
        categoryMap.set(item._id, item);
      }
    });

    // Add from section6
    data.section6?.categories?.forEach((item: any) => {
      if (!categoryMap.has(item._id)) {
        categoryMap.set(item._id, item);
      }
    });

    // Add from section7
    data.section7?.categories?.forEach((item: any) => {
      if (!categoryMap.has(item._id)) {
        categoryMap.set(item._id, item);
      }
    });

    return Array.from(categoryMap.values());
  }, [data]);

  // Get all unique subcategories for section3, section4, section5
  const allSubcategories = useMemo(() => {
    const subcategoryMap = new Map();

    // Add from section3
    data.section3?.forEach((item: any) => {
      if (!subcategoryMap.has(item._id)) {
        subcategoryMap.set(item._id, item);
      }
    });

    // Add from section4
    data.section4?.forEach((item: any) => {
      if (!subcategoryMap.has(item._id)) {
        subcategoryMap.set(item._id, item);
      }
    });

    // Add from section5
    data.section5?.forEach((item: any) => {
      if (!subcategoryMap.has(item._id)) {
        subcategoryMap.set(item._id, item);
      }
    });

    return Array.from(subcategoryMap.values());
  }, [data]);

  // Section 1 - Use direct section1 data from API to maintain order
  const section1Items = (data.section1 || []).map((item: any) => ({
    id: item._id,
    name: item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section1Selection = (data.section1 || [])
    .filter((item: any) => item.isSection1 === true)
    .map((item: any) => item._id);

  // Section 2 - Use direct section2 data from API to maintain order
  const section2Items = (data.section2 || []).map((item: any) => ({
    id: item._id,
    name: item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section2Selection = (data.section2 || [])
    .filter((item: any) => item.isSection2 === true)
    .map((item: any) => item._id);

  // Section 3 - Use direct section3 data from API to maintain order
  const section3Items = (data.section3 || []).map((item: any) => ({
    id: item._id,
    name: item.subcategoryTitle || item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section3Selection = (data.section3 || [])
    .filter((item: any) => item.isSection3 === true)
    .map((item: any) => item._id);

  // Section 4 - Use direct section4 data from API to maintain order (single selection)
  const section4Items = (data.section4 || []).map((item: any) => ({
    id: item._id,
    name: item.subcategoryTitle || item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section4Selection = (data.section4 || [])
    .filter((item: any) => item.isSection4 === true)
    .map((item: any) => item._id)
    .slice(0, 1); // Only first one for single selection

  // Section 5 - Use direct section5 data from API to maintain order (single selection)
  const section5Items = (data.section5 || []).map((item: any) => ({
    id: item._id,
    name: item.subcategoryTitle || item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section5Selection = (data.section5 || [])
    .filter((item: any) => item.isSection5 === true)
    .map((item: any) => item._id)
    .slice(0, 1); // Only first one for single selection

  // Section 6 - Use direct section6.categories data from API to maintain order
  const section6Items = (data.section6?.categories || []).map((item: any) => ({
    id: item._id,
    name: item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section6Selection = (data.section6?.categories || [])
    .filter((item: any) => item.isSection6 === true)
    .map((item: any) => item._id);

  // Section 7 - Use direct section7.categories data from API to maintain order
  const section7Items = (data.section7?.categories || []).map((item: any) => ({
    id: item._id,
    name: item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section7Selection = (data.section7?.categories || [])
    .filter((item: any) => item.isSection7 === true)
    .map((item: any) => item._id);

  // Handle selection changes for each section
  const handleSection1Change = async (ids: (number | string)[]) => {
    const changedItems: Array<{ _id: string; isSection1: boolean }> = [];

    allCategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection1 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section1",
            value: isSelected,
          })
        );
        changedItems.push({
          _id: item._id,
          isSection1: isSelected,
        });
      }
    });

    // Call API for changed items
    if (changedItems.length > 0) {
      try {
        await dispatch(
          toggleHomeCategorySectionThunk({ categories: changedItems })
        ).unwrap();
        // Refresh data after successful update
        dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection2Change = async (ids: (number | string)[]) => {
    const changedItems: Array<{ _id: string; isSection2: boolean }> = [];

    allCategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection2 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section2",
            value: isSelected,
          })
        );
        changedItems.push({
          _id: item._id,
          isSection2: isSelected,
        });
      }
    });

    // Call API for changed items
    if (changedItems.length > 0) {
      try {
        await dispatch(
          toggleHomeCategorySectionThunk({ categories: changedItems })
        ).unwrap();
        // Refresh data after successful update
        // dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection3Change = async (ids: (number | string)[]) => {
    const changedSubcategoriesMap = new Map<
      string,
      {
        _id: string;
        isSection3?: boolean;
        isSection4?: boolean;
        isSection5?: boolean;
      }
    >();

    allSubcategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection3 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section3",
            value: isSelected,
          })
        );

        // Add or update in map
        if (!changedSubcategoriesMap.has(item._id)) {
          changedSubcategoriesMap.set(item._id, { _id: item._id });
        }
        changedSubcategoriesMap.get(item._id)!.isSection3 = isSelected;
      }
    });

    // Call API for changed items
    if (changedSubcategoriesMap.size > 0) {
      try {
        await dispatch(
          toggleHomeSubcategorySectionThunk({
            subcategories: Array.from(changedSubcategoriesMap.values()),
          })
        ).unwrap();
        // Refresh data after successful update
        // dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection4Change = async (ids: (number | string)[]) => {
    const changedSubcategoriesMap = new Map<
      string,
      {
        _id: string;
        isSection3?: boolean;
        isSection4?: boolean;
        isSection5?: boolean;
      }
    >();

    // For single selection, unselect all first, then select the new one
    allSubcategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection4 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section4",
            value: isSelected,
          })
        );

        // Add or update in map
        if (!changedSubcategoriesMap.has(item._id)) {
          changedSubcategoriesMap.set(item._id, { _id: item._id });
        }
        changedSubcategoriesMap.get(item._id)!.isSection4 = isSelected;
      }
    });

    // Call API for changed items
    if (changedSubcategoriesMap.size > 0) {
      try {
        await dispatch(
          toggleHomeSubcategorySectionThunk({
            subcategories: Array.from(changedSubcategoriesMap.values()),
          })
        ).unwrap();
        // Refresh data after successful update
        // dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection5Change = async (ids: (number | string)[]) => {
    const changedSubcategoriesMap = new Map<
      string,
      {
        _id: string;
        isSection3?: boolean;
        isSection4?: boolean;
        isSection5?: boolean;
      }
    >();

    // For single selection, unselect all first, then select the new one
    allSubcategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection5 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section5",
            value: isSelected,
          })
        );

        // Add or update in map
        if (!changedSubcategoriesMap.has(item._id)) {
          changedSubcategoriesMap.set(item._id, { _id: item._id });
        }
        changedSubcategoriesMap.get(item._id)!.isSection5 = isSelected;
      }
    });

    // Call API for changed items
    if (changedSubcategoriesMap.size > 0) {
      try {
        await dispatch(
          toggleHomeSubcategorySectionThunk({
            subcategories: Array.from(changedSubcategoriesMap.values()),
          })
        ).unwrap();
        // Refresh data after successful update
        // dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection6Change = async (ids: (number | string)[]) => {
    const changedItems: Array<{ _id: string; isSection6: boolean }> = [];

    allCategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection6 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section6",
            value: isSelected,
          })
        );
        changedItems.push({
          _id: item._id,
          isSection6: isSelected,
        });
      }
    });

    // Call API for changed items
    if (changedItems.length > 0) {
      try {
        await dispatch(
          toggleHomeCategorySectionThunk({ categories: changedItems })
        ).unwrap();
        // Refresh data after successful update
        dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection7Change = async (ids: (number | string)[]) => {
    const changedItems: Array<{ _id: string; isSection7: boolean }> = [];

    allCategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection7 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section7",
            value: isSelected,
          })
        );
        changedItems.push({
          _id: item._id,
          isSection7: isSelected,
        });
      }
    });

    // Call API for changed items
    if (changedItems.length > 0) {
      try {
        await dispatch(
          toggleHomeCategorySectionThunk({ categories: changedItems })
        ).unwrap();
        // Refresh data after successful update
        dispatch(getHomeDataThunk());
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  // Reorder handlers for each section
  const handleSection1Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section1Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section1Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection1Thunk({ categories })).unwrap();
      // Refresh data after successful reorder
      dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection2Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section2Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section2Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection2Thunk({ categories })).unwrap();
      // Refresh data after successful reorder
      // dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection3Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section3Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section3Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection3Thunk({ subcategories })).unwrap();
      // Refresh data after successful reorder
      dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection4Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section4Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section4Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection4Thunk({ subcategories })).unwrap();
      // Refresh data after successful reorder
      dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection5Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section5Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section5Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection5Thunk({ subcategories })).unwrap();
      // Refresh data after successful reorder
      dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection6Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section6Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section6Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection6Thunk({ categories })).unwrap();
      // Refresh data after successful reorder
      dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection7Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    // Map reordered items to backend format with section7Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section7Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection7Thunk({ categories })).unwrap();
      // Refresh data after successful reorder
      dispatch(getHomeDataThunk());
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading home data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Home Page Settings</h1>
        {/* <Button
          onClick={handleSave}
          className="gradient-primary text-primary-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button> */}
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 1 - Featured Categories
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select multiple categories. Drag to reorder.
          </p>
          <SelectableList
            items={section1Items}
            selectedIds={section1Selection}
            onSelectionChange={handleSection1Change}
            onReorder={handleSection1Reorder}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>

        {/* Section 2 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 2 - Category Showcase
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select multiple categories. Drag to reorder.
          </p>
          <SelectableList
            items={section2Items}
            selectedIds={section2Selection}
            onSelectionChange={handleSection2Change}
            onReorder={handleSection2Reorder}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>

        {/* Section 3 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 3 - Subcategory Grid
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select multiple subcategories. Drag to reorder.
          </p>
          <SelectableList
            items={section3Items}
            selectedIds={section3Selection}
            onSelectionChange={handleSection3Change}
            onReorder={handleSection3Reorder}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>

        {/* Section 4 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 4 - Featured Subcategory
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select a single subcategory.
          </p>
          <SelectableList
            items={section4Items}
            selectedIds={section4Selection}
            onSelectionChange={handleSection4Change}
            multiSelect={false}
            draggable={false}
            updatingIds={new Set(updatingIds)}
          />
        </div>

        {/* Section 5 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 5 - Highlighted Subcategory
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select a single subcategory.
          </p>
          <SelectableList
            items={section5Items}
            selectedIds={section5Selection}
            onSelectionChange={handleSection5Change}
            multiSelect={false}
            draggable={false}
            updatingIds={new Set(updatingIds)}
          />
        </div>

        {/* Section 6 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 6 - Custom Category Section
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Add a title and select multiple categories. Drag to reorder.
          </p>
          <div className="mb-4">
            <Label htmlFor="section6Title">Section Title</Label>
            <Input
              id="section6Title"
              value={data.section6.title || ""}
              readOnly
              placeholder="Enter section title"
              className="max-w-md mt-1"
            />
          </div>
          <SelectableList
            items={section6Items}
            selectedIds={section6Selection}
            onSelectionChange={handleSection6Change}
            onReorder={handleSection6Reorder}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>

        {/* Section 7 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 7 - Custom Category Section
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Add a title and select multiple categories. Drag to reorder.
          </p>
          <div className="mb-4">
            <Label htmlFor="section7Title">Section Title</Label>
            <Input
              id="section7Title"
              value={data.section7.title || ""}
              readOnly
              placeholder="Enter section title"
              className="max-w-md mt-1"
            />
          </div>
          <SelectableList
            items={section7Items}
            selectedIds={section7Selection}
            onSelectionChange={handleSection7Change}
            onReorder={handleSection7Reorder}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeSettings;
