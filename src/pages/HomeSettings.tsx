import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  reorderHomeSection8Thunk,
  reorderHomeCustomSectionThunk,
  updateHomeSettingsThunk,
} from "@/store/homeSettings/thunk";
import { updateSectionItem } from "@/store/homeSettings/slice";

// Scroll position preservation hook
const useScrollPreservation = () => {
  const scrollPosition = useRef<number>(0);

  const saveScrollPosition = useCallback(() => {
    scrollPosition.current = window.pageYOffset || document.documentElement.scrollTop;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    window.scrollTo(0, scrollPosition.current);
  }, []);

  const getScrollPosition = useCallback(() => scrollPosition.current, []);

  return { saveScrollPosition, restoreScrollPosition, getScrollPosition };
};

const HomeSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, data, error, updatingIds } = useAppSelector(
    (state) => state.HomeSettings
  );
  
  // Scroll position preservation
  const { saveScrollPosition, restoreScrollPosition, getScrollPosition } = useScrollPreservation();

  // Local state for title inputs
  const [section6Title, setSection6Title] = useState("");
  const [section7Title, setSection7Title] = useState("");
  const [customSectionTitle, setCustomSectionTitle] = useState("");
  const [savingSection6, setSavingSection6] = useState(false);
  const [savingSection7, setSavingSection7] = useState(false);
  const [savingCustomSection, setSavingCustomSection] = useState(false);

  // Fetch home data on component mount
  useEffect(() => {
    dispatch(getHomeDataThunk());
  }, [dispatch]);

  // Restore scroll position after data updates
  useEffect(() => {
    if (data && !loading) {
      // Multiple attempts to restore scroll position for better reliability
      const restoreScroll = () => {
        try {
          const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
          const savedPosition = getScrollPosition();
          // Only restore if we're at the top (meaning a refresh happened)
          if (currentPosition === 0 && savedPosition > 0) {
            window.scrollTo(0, savedPosition);
          }
        } catch (error) {
          console.warn('Failed to restore scroll position:', error);
        }
      };

      // Try multiple times with delays for better reliability
      restoreScroll();
      setTimeout(restoreScroll, 50);
      setTimeout(restoreScroll, 150);
      setTimeout(restoreScroll, 300);
    }
  }, [data, loading, getScrollPosition]);

  // Update local state when data changes
  useEffect(() => {
    if (data.section6?.title !== undefined) {
      setSection6Title(data.section6.title || "");
    }
    if (data.section7?.title !== undefined) {
      setSection7Title(data.section7.title || "");
    }
    if (data.customSection?.title !== undefined) {
      setCustomSectionTitle(data.customSection.title || "");
    }
  }, [data.section6?.title, data.section7?.title, data.customSection?.title]);

  // Check if section 6 title has changed
  const hasSection6Changes = section6Title !== (data.section6?.title || "");

  // Check if section 7 title has changed
  const hasSection7Changes = section7Title !== (data.section7?.title || "");

  // Check if custom section title has changed
  const hasCustomSectionChanges = customSectionTitle !== (data.customSection?.title || "");

  const handleSaveSection6Title = async () => {
    if (!hasSection6Changes) return;

    saveScrollPosition(); // Save current scroll position
    setSavingSection6(true);
    try {
      await dispatch(updateHomeSettingsThunk({ section6Title })).unwrap();
      // Don't refresh data - the thunk should update the local state
      toast.success("Section 6 title updated successfully");
    } catch (error) {
      // Error is already handled by the thunk
    } finally {
      setSavingSection6(false);
    }
  };

  const handleSaveSection7Title = async () => {
    if (!hasSection7Changes) return;

    saveScrollPosition(); // Save current scroll position
    setSavingSection7(true);
    try {
      await dispatch(updateHomeSettingsThunk({ section7Title })).unwrap();
      // Don't refresh data - the thunk should update the local state
      toast.success("Section 7 title updated successfully");
    } catch (error) {
      // Error is already handled by the thunk
    } finally {
      setSavingSection7(false);
    }
  };

  const handleSaveCustomSectionTitle = async () => {
    if (!hasCustomSectionChanges) return;

    saveScrollPosition(); // Save current scroll position
    setSavingCustomSection(true);
    try {
      await dispatch(updateHomeSettingsThunk({ customSectionTitle })).unwrap();
      // Don't refresh data - the thunk should update the local state
      toast.success("Custom section title updated successfully");
    } catch (error) {
      // Error is already handled by the thunk
    } finally {
      setSavingCustomSection(false);
    }
  };

  const handleSave = () => {
    toast.success("Settings saved! Home page configuration has been updated.");
  };

  // Get all unique categories for section1 and section2 (combine all from section1, section2, custom section, section6, section7)
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

    // Add from custom section
    data.customSection?.categories?.forEach((item: any) => {
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

  // Get all unique subcategories for section3, section4, section5, section8
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

    // Add from section8
    data.section8?.forEach((item: any) => {
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

  // Custom Section - Use allCategories to allow admin to select from ALL available categories
  const customSectionItems = allCategories.map((item: any) => ({
    id: item._id,
    name: item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const customSectionSelection = (data.customSection?.categories || [])
    .filter((item: any) => item.isCustomSection === true)
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

  // Section 8 - Use direct section8 data from API to maintain order (similar to section3)
  const section8Items = (data.section8 || []).map((item: any) => ({
    id: item._id,
    name: item.subcategoryTitle || item.name || "",
    image: item.img_sqr || item.img_rec || item.video_sqr || "",
  }));
  const section8Selection = (data.section8 || [])
    .filter((item: any) => item.isSection8 === true)
    .map((item: any) => item._id);

  // Handle selection changes for each section
  const handleSection1Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 1 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection2Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 2 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleCustomSectionChange = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
    const changedItems: Array<{ _id: string; isCustomSection: boolean }> = [];

    allCategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isCustomSection !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "custom",
            value: isSelected,
          })
        );
        changedItems.push({
          _id: item._id,
          isCustomSection: isSelected,
        });
      }
    });

    // Call API for changed items
    if (changedItems.length > 0) {
      try {
        await dispatch(
          toggleHomeCategorySectionThunk({ categories: changedItems })
        ).unwrap();
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Custom section updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection3Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 3 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection4Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 4 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection5Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 5 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection6Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 6 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection7Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 7 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  const handleSection8Change = async (ids: (number | string)[]) => {
    saveScrollPosition(); // Save current scroll position
    const changedSubcategoriesMap = new Map<
      string,
      {
        _id: string;
        isSection3?: boolean;
        isSection4?: boolean;
        isSection5?: boolean;
        isSection8?: boolean;
      }
    >();

    allSubcategories.forEach((item: any) => {
      const isSelected = ids.includes(item._id);
      if (item.isSection8 !== isSelected) {
        dispatch(
          updateSectionItem({
            id: item._id,
            section: "section8",
            value: isSelected,
          })
        );

        // Add or update in map
        if (!changedSubcategoriesMap.has(item._id)) {
          changedSubcategoriesMap.set(item._id, { _id: item._id });
        }
        changedSubcategoriesMap.get(item._id)!.isSection8 = isSelected;
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
        // Don't refresh data - optimistic updates should handle UI changes
        toast.success("Section 8 updated successfully");
      } catch (error) {
        // Error is already handled by the thunk
      }
    }
  };

  // Reorder handlers for each section
  const handleSection1Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section1Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section1Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection1Thunk({ categories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 1 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection2Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section2Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section2Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection2Thunk({ categories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 2 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleCustomSectionReorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with customSectionOrder
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      customSectionOrder: index + 1,
    }));

    try {
      await dispatch(reorderHomeCustomSectionThunk({ categories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Custom section reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection3Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section3Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section3Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection3Thunk({ subcategories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 3 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection4Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section4Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section4Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection4Thunk({ subcategories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 4 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection5Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section5Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section5Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection5Thunk({ subcategories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 5 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection6Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section6Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section6Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection6Thunk({ categories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 6 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection7Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section7Order
    const categories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section7Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection7Thunk({ categories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 7 reordered successfully");
    } catch (error) {
      // Error is already handled by the thunk
    }
  };

  const handleSection8Reorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    saveScrollPosition(); // Save current scroll position
    // Map reordered items to backend format with section8Order
    const subcategories = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      section8Order: index + 1,
    }));

    try {
      await dispatch(reorderHomeSection8Thunk({ subcategories })).unwrap();
      // Don't refresh data - optimistic updates should handle UI changes
      toast.success("Section 8 reordered successfully");
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

        {/* Custom Section */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Custom Section - Featured Categories
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Add a title and select multiple categories. Drag to reorder.
          </p>
          <div className="mb-4">
            <Label htmlFor="customSectionTitle">Section Title</Label>
            <div className="flex items-end gap-2 mt-1">
              <Input
                id="customSectionTitle"
                value={customSectionTitle}
                onChange={(e) => setCustomSectionTitle(e.target.value)}
                placeholder="Enter custom section title"
                className="max-w-md"
              />
              {hasCustomSectionChanges && (
                <Button
                  onClick={handleSaveCustomSectionTitle}
                  disabled={savingCustomSection}
                  className="gradient-primary text-primary-foreground"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingCustomSection ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>
          <SelectableList
            items={customSectionItems}
            selectedIds={customSectionSelection}
            onSelectionChange={handleCustomSectionChange}
            onReorder={handleCustomSectionReorder}
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
            <div className="flex items-end gap-2 mt-1">
              <Input
                id="section6Title"
                value={section6Title}
                onChange={(e) => setSection6Title(e.target.value)}
                placeholder="Enter section title"
                className="max-w-md"
              />
              {hasSection6Changes && (
                <Button
                  onClick={handleSaveSection6Title}
                  disabled={savingSection6}
                  className="gradient-primary text-primary-foreground"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSection6 ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
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
            <div className="flex items-end gap-2 mt-1">
              <Input
                id="section7Title"
                value={section7Title}
                onChange={(e) => setSection7Title(e.target.value)}
                placeholder="Enter section title"
                className="max-w-md"
              />
              {hasSection7Changes && (
                <Button
                  onClick={handleSaveSection7Title}
                  disabled={savingSection7}
                  className="gradient-primary text-primary-foreground"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSection7 ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
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

        {/* Section 8 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Section 8 - Subcategory Grid
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select multiple subcategories. Drag to reorder.
          </p>
          <SelectableList
            items={section8Items}
            selectedIds={section8Selection}
            onSelectionChange={handleSection8Change}
            onReorder={handleSection8Reorder}
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
