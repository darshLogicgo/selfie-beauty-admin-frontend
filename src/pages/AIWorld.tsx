import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SelectableList from '@/components/ui/SelectableList';
import toast from 'react-hot-toast';
import { Save, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAIWorldThunk, toggleAIWorldThunk, reorderAIWorldThunk } from '@/store/aiWorld/thunk';

interface CategoryItem {
  id: string;
  name: string;
  image: string;
}

const AIWorld: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, dataLoading, data: aiWorldData, updatingIds } = useAppSelector((state) => state.AIWorld);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);

  // Fetch AI World data on component mount
  useEffect(() => {
    dispatch(getAIWorldThunk());
  }, [dispatch]);

  // Map API response to CategoryItem format and sort by aiWorldOrder
  useEffect(() => {
    if (aiWorldData && aiWorldData.length > 0) {
      // Sort by aiWorldOrder
      const sortedData = [...aiWorldData].sort((a, b) => {
        const orderA = a.aiWorldOrder || 999;
        const orderB = b.aiWorldOrder || 999;
        return orderA - orderB;
      });

      const mappedCategories: CategoryItem[] = sortedData.map((item: any) => ({
        id: item._id,
        name: item.name || '',
        image: item.img_sqr || item.img_rec || '',
      }));

      setCategories(mappedCategories);

      // Set selected categories based on isAiWorld field
      const selectedIds = sortedData
        .filter((item: any) => item.isAiWorld === true)
        .map((item: any) => item._id);
      
      setSelectedCategories(selectedIds);
      setOriginalOrder(selectedIds);
    } else if (aiWorldData && aiWorldData.length === 0) {
      setCategories([]);
      setSelectedCategories([]);
      setOriginalOrder([]);
    }
  }, [aiWorldData]);

  const handleSelectionChange = async (ids: (number | string)[]) => {
    const newSelectedIds = ids as string[];
    const previousSelectedIds = selectedCategories;
    
    // Find the difference - what was added or removed
    const added = newSelectedIds.filter(id => !previousSelectedIds.includes(id));
    const removed = previousSelectedIds.filter(id => !newSelectedIds.includes(id));
    
    // Update local state immediately for better UX
    setSelectedCategories(newSelectedIds);
    
    // Call toggle API for each changed item
    const togglePromises = [
      ...added.map(id => dispatch(toggleAIWorldThunk(id))),
      ...removed.map(id => dispatch(toggleAIWorldThunk(id))),
    ];
    
    // Wait for all toggles to complete
    try {
      await Promise.all(togglePromises);
      // Refresh data to get updated order and status
      dispatch(getAIWorldThunk());
    } catch (error) {
      // If any toggle fails, revert selection
      setSelectedCategories(previousSelectedIds);
    }
  };

  // Handle reorder - call API directly like Trending/AIPhoto
  const handleReorder = async (reorderedItems: CategoryItem[]) => {
    if (reorderedItems.length === 0) {
      return;
    }

    // Update local state immediately for better UX
    setCategories(reorderedItems);
    // Update selected categories order based on new item order
    const newSelectedOrder = reorderedItems
      .filter(item => selectedCategories.includes(item.id))
      .map(item => item.id);
    setSelectedCategories(newSelectedOrder);

    // Calculate aiWorldOrder based on position in the full reordered list
    // This ensures sequential ordering (1, 2, 3...) for ALL items
    // Backend will update aiWorldOrder for all categories based on their position
    const reorderData = reorderedItems.map((item, index) => ({
      _id: item.id,
      aiWorldOrder: index + 1, // Sequential order starting from 1 for all items
    }));

    // Call API to save the new order
    try {
      const result = await dispatch(reorderAIWorldThunk({ categories: reorderData }));

      if (reorderAIWorldThunk.fulfilled.match(result)) {
        // Refresh data to get updated order from backend
        dispatch(getAIWorldThunk());
      } else {
        // If reorder failed, refresh to revert UI
        dispatch(getAIWorldThunk());
      }
    } catch (error) {
      // If reorder fails, refresh to revert UI
      dispatch(getAIWorldThunk());
    }
  };

  const handleSave = () => {
    // Save button is now just for UI - actual saving happens on selection change
    toast.success('AI World settings are automatically saved when you select or unselect categories.');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="page-header mb-0">AI World</h1>
        </div>
        <Button 
          onClick={handleSave} 
          className="gradient-primary text-primary-foreground"
          disabled={loading || dataLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading AI World categories...</p>
        </div>
      ) : (
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-2">Select Categories</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the categories to display in the AI World section. You can select multiple items and drag to reorder.
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

export default AIWorld;
