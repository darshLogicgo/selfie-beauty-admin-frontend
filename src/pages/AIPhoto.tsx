import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SelectableList from '@/components/ui/SelectableList';
import toast from 'react-hot-toast';
import { Save, Camera } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getAIPhotoThunk, toggleAIPhotoIsAiWorldThunk } from '@/store/aiPhoto/thunk';

const AIPhoto: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataLoading, data, updatingIds } = useAppSelector((state) => state.AIPhoto);
  const [selectedSubCategories, setSelectedSubCategories] = useState<(number | string)[]>([]);

  // Fetch AI Photo data on component mount
  useEffect(() => {
    dispatch(getAIPhotoThunk(undefined));
  }, [dispatch]);

  // Map API data to SelectableList format and set selected items based on isAiWorld
  useEffect(() => {
    if (data && data.length > 0) {
      const selectedIds = data
        .filter((item: any) => item.isAiWorld === true)
        .map((item: any) => item._id);
      setSelectedSubCategories(selectedIds);
    }
  }, [data]);

  // Handle selection change and call toggle API
  const handleSelectionChange = async (ids: (number | string)[]) => {
    const newSelectedIds = ids as string[];
    const previousSelectedIds = selectedSubCategories as string[];
    
    // Find the difference - what was added or removed
    const added = newSelectedIds.filter(id => !previousSelectedIds.includes(id));
    const removed = previousSelectedIds.filter(id => !newSelectedIds.includes(id));
    
    // Update local state immediately for better UX
    setSelectedSubCategories(newSelectedIds);
    
    // Call toggle API for each changed item
    const togglePromises = [
      ...added.map(id => dispatch(toggleAIPhotoIsAiWorldThunk({ id, isAiWorld: true }))),
      ...removed.map(id => dispatch(toggleAIPhotoIsAiWorldThunk({ id, isAiWorld: false }))),
    ];
    
    // Wait for all toggles to complete
    try {
      await Promise.all(togglePromises);
      // Refresh data to get updated status
      dispatch(getAIPhotoThunk(undefined));
    } catch (error) {
      // If any toggle fails, revert selection
      setSelectedSubCategories(previousSelectedIds);
    }
  };

  // Map API response to SelectableList format
  const subCategories = data.map((item: any) => ({
    id: item._id,
    name: item.subcategoryTitle,
    image: item.img_sqr || item.img_rec || '',
  }));

  const handleSave = () => {
    toast.success('AI Photo settings are automatically saved when you select or unselect categories.');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-info flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="page-header mb-0">AI Photo</h1>
        </div>
        <Button 
          onClick={handleSave} 
          className="gradient-primary text-primary-foreground"
          disabled={dataLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading AI Photo data...</p>
        </div>
      ) : (
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-2">Select Subcategories</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the subcategories to display in the AI Photo section. You can select multiple items and drag to reorder.
          </p>
          <SelectableList
            items={subCategories}
            selectedIds={selectedSubCategories}
            onSelectionChange={handleSelectionChange}
            multiSelect={true}
            draggable={true}
            updatingIds={new Set(updatingIds)}
          />
        </div>
      )}

      <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedSubCategories.length} subcategories
        </p>
      </div>
    </div>
  );
};

export default AIPhoto;
