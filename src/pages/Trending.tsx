import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SelectableList from '@/components/ui/SelectableList';
import toast from 'react-hot-toast';
import { Save, TrendingUp, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getTrendingThunk, updateTrendingStatusThunk } from '@/store/trending/thunk';

interface TrendingCategory {
  _id: string;
  name: string;
  img_sqr: string | null;
  img_rec: string | null;
  video_sqr: string | null;
  video_rec: string | null;
  status: boolean;
  order: number;
  isTrending: boolean;
  trendingOrder: number;
}

interface SelectableItem {
  id: string;
  name: string;
  image: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
}

const Trending: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataLoading, loading, data: trendingData } = useAppSelector((state) => state.Trending);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<SelectableItem[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [hasOrderChanged, setHasOrderChanged] = useState<boolean>(false);

  // Fetch trending categories on mount
  useEffect(() => {
    dispatch(getTrendingThunk());
  }, [dispatch]);

  // Map API response to SelectableList format
  useEffect(() => {
    if (trendingData && trendingData.length > 0) {
      const mappedCategories: SelectableItem[] = trendingData.map((item: TrendingCategory) => {
        // Priority: img_sqr > img_rec > video_sqr > video_rec > placeholder
        let mediaUrl = '';
        let mediaType: 'image' | 'video' = 'image';
        
        if (item.img_sqr) {
          mediaUrl = item.img_sqr;
          mediaType = 'image';
        } else if (item.img_rec) {
          mediaUrl = item.img_rec;
          mediaType = 'image';
        } else if (item.video_sqr) {
          mediaUrl = item.video_sqr;
          mediaType = 'video';
        } else if (item.video_rec) {
          mediaUrl = item.video_rec;
          mediaType = 'video';
        } else {
          // Use a simple placeholder SVG
          mediaUrl = `data:image/svg+xml,${encodeURIComponent('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">No Media</text></svg>')}`;
          mediaType = 'image';
        }
        
        return {
          id: item._id,
          name: item.name,
          image: mediaUrl, // Keep for backward compatibility
          mediaType: mediaType,
          mediaUrl: mediaUrl,
        };
      });

      // Sort by trendingOrder
      mappedCategories.sort((a, b) => {
        const aItem = trendingData.find((item: TrendingCategory) => item._id === a.id);
        const bItem = trendingData.find((item: TrendingCategory) => item._id === b.id);
        return (aItem?.trendingOrder || 0) - (bItem?.trendingOrder || 0);
      });

      setCategories(mappedCategories);
      
      // Set selected IDs based on isTrending flag
      const selected = mappedCategories
        .filter(cat => {
          const item = trendingData.find((item: TrendingCategory) => item._id === cat.id);
          return item?.isTrending;
        })
        .map(cat => cat.id);
      setSelectedCategories(selected);
      
      // Reset order changed flag when data is refreshed
      setHasOrderChanged(false);
    } else if (trendingData && trendingData.length === 0) {
      setCategories([]);
      setSelectedCategories([]);
      setHasOrderChanged(false);
    }
  }, [trendingData]);

  // Handle reorder - mark that order has changed
  const handleReorder = (reorderedItems: SelectableItem[]) => {
    setCategories(reorderedItems);
    setHasOrderChanged(true);
  };

  // Handle selection change and call API
  const handleSelectionChange = async (ids: (number | string)[]) => {
    const newSelectedIds = ids.map(id => String(id));
    const previousSelected = selectedCategories;
    
    // Find what changed
    const added = newSelectedIds.filter(id => !previousSelected.includes(id));
    const removed = previousSelected.filter(id => !newSelectedIds.includes(id));
    
    // Update local state immediately for better UX
    setSelectedCategories(newSelectedIds);
    
    // Call API for each changed category
    const updatePromises: Promise<any>[] = [];
    
    // Add to updating set
    const newUpdatingIds = new Set(updatingIds);
    [...added, ...removed].forEach(id => newUpdatingIds.add(id));
    setUpdatingIds(newUpdatingIds);
    
    // Call API for added categories (isTrending = true)
    added.forEach(id => {
      updatePromises.push(
        dispatch(updateTrendingStatusThunk({ id, isTrending: true }))
      );
    });
    
    // Call API for removed categories (isTrending = false)
    removed.forEach(id => {
      updatePromises.push(
        dispatch(updateTrendingStatusThunk({ id, isTrending: false }))
      );
    });
    
    // Wait for all API calls to complete
    try {
      await Promise.all(updatePromises);
      // Refresh data after all updates
      dispatch(getTrendingThunk());
    } catch (error) {
      // If any API call fails, revert to previous selection
      setSelectedCategories(previousSelected);
    } finally {
      // Remove from updating set
      const finalUpdatingIds = new Set(updatingIds);
      [...added, ...removed].forEach(id => finalUpdatingIds.delete(id));
      setUpdatingIds(finalUpdatingIds);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="page-header mb-0">Trending</h1>
        </div>
        <Button 
          className="gradient-primary text-primary-foreground"
          disabled={!hasOrderChanged}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="section-card">
        <h2 className="text-lg font-semibold text-foreground mb-2">Select Categories</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the categories to display in the Trending section. You can select multiple items and drag to reorder.
        </p>
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <SelectableList
            items={categories}
            selectedIds={selectedCategories}
            onSelectionChange={handleSelectionChange}
            onReorder={handleReorder}
            multiSelect={true}
            draggable={true}
            updatingIds={updatingIds}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No categories available
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
        </p>
      </div>
    </div>
  );
};

export default Trending;
