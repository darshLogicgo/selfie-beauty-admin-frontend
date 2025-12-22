import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SelectableList from "@/components/ui/SelectableList";
import toast from "react-hot-toast";
import { Save, Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserPreferenceThunk,
  toggleUserPreferenceThunk,
  reorderUserPreferenceThunk,
} from "@/store/userPreference/thunk";

const UserPreference: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataLoading, data, updatingIds } = useAppSelector(
    (state) => state.UserPreference
  );
  const [selectedCategories, setSelectedCategories] = useState<
    (number | string)[]
  >([]);

  // Fetch User Preference data on component mount
  useEffect(() => {
    dispatch(getUserPreferenceThunk(undefined));
  }, [dispatch]);

  // Map API data to SelectableList format and set selected items based on isUserPreference
  useEffect(() => {
    if (data && data.length > 0) {
      const selectedIds = data
        .filter((item: any) => item.isUserPreference === true)
        .map((item: any) => item._id);
      setSelectedCategories(selectedIds);
    }
  }, [data]);

  // Handle selection change and call toggle API
  const handleSelectionChange = async (ids: (number | string)[]) => {
    const newSelectedIds = ids as string[];
    const previousSelectedIds = selectedCategories as string[];

    // Find the difference - what was added or removed
    const added = newSelectedIds.filter(
      (id) => !previousSelectedIds.includes(id)
    );
    const removed = previousSelectedIds.filter(
      (id) => !newSelectedIds.includes(id)
    );

    // Update local state immediately for better UX
    setSelectedCategories(newSelectedIds);

    // Call toggle API for each changed item
    const togglePromises = [
      ...added.map((id) =>
        dispatch(toggleUserPreferenceThunk({ id, isUserPreference: true }))
      ),
      ...removed.map((id) =>
        dispatch(toggleUserPreferenceThunk({ id, isUserPreference: false }))
      ),
    ];

    // Wait for all toggles to complete
    try {
      await Promise.all(togglePromises);
      // Refresh data to get updated status
      dispatch(getUserPreferenceThunk(undefined));
    } catch (error) {
      // If any toggle fails, revert selection
      setSelectedCategories(previousSelectedIds);
    }
  };

  // Map API response to SelectableList format and sort by userPreferenceOrder
  // Items with userPreferenceOrder come first, then items without
  const categories = (data || [])
    .map((item: any) => ({
      id: item._id,
      name: item.name,
      image: item.img_sqr || item.img_rec || "",
      userPreferenceCount: item.userPreferenceCount || 0,
      userPreferenceOrder: item.userPreferenceOrder || 999999, // Use large number for items without order
    }))
    .sort((a, b) => {
      // Sort by userPreferenceOrder (ascending), items without order go to end
      return a.userPreferenceOrder - b.userPreferenceOrder;
    })
    .map(({ userPreferenceOrder, ...item }) => item); // Remove userPreferenceOrder from final output

  // Handle reorder when items are dragged and dropped
  // Allows reordering ANY category regardless of isUserPreference status
  const handleReorder = async (
    reorderedItems: Array<{ id: number | string; name: string; image: string }>
  ) => {
    if (reorderedItems.length === 0) {
      return;
    }

    // Calculate userPreferenceOrder based on position in the full reordered list
    // This ensures sequential ordering (1, 2, 3...) for ALL items
    // Backend will update userPreferenceOrder for all categories, regardless of isUserPreference status
    const reorderData = reorderedItems.map((item, index) => ({
      _id: String(item.id),
      userPreferenceOrder: index + 1, // Sequential order starting from 1 for all items
    }));

    // Call API to save the new order
    try {
      const result = await dispatch(
        reorderUserPreferenceThunk({ categories: reorderData })
      );

      if (reorderUserPreferenceThunk.fulfilled.match(result)) {
        // Refresh data to get updated order from backend
        dispatch(getUserPreferenceThunk(undefined));
      } else {
        // If reorder failed, refresh to revert UI
        dispatch(getUserPreferenceThunk(undefined));
      }
    } catch (error) {
      // If reorder fails, refresh to revert UI
      dispatch(getUserPreferenceThunk(undefined));
    }
  };

  const handleSave = () => {
    toast.success(
      "User Preference settings are automatically saved when you select or unselect categories."
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-info flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="page-header mb-0">User Preference</h1>
        </div>
        {/* <Button
          onClick={handleSave}
          className="gradient-primary text-primary-foreground"
          disabled={dataLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button> */}
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading User Preference data...</p>
        </div>
      ) : (
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Select Categories
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the categories to display in the User Preference section. You
            can select multiple items and drag to reorder.
          </p>
          <SelectableList
            items={categories}
            selectedIds={selectedCategories}
            onSelectionChange={handleSelectionChange}
            onReorder={handleReorder}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>
      )}

      <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedCategories.length} categories
        </p>
      </div>
    </div>
  );
};

export default UserPreference;

