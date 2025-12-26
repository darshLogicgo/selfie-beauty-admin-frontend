import React, { useState, useEffect } from 'react';
import SelectableList from '@/components/ui/SelectableList';
import toast from 'react-hot-toast';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getTrendingThunk, updateTrendingStatusThunk, updateSubcategoryTrendingStatusThunk, reorderTrendingThunk, reorderTrendingSubcategoriesThunk } from '@/store/trending/thunk';

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

interface TrendingSubcategory {
  _id: string;
  categoryId: string;
  subcategoryTitle: string;
  img_sqr: string | null;
  img_rec: string | null;
  video_sqr: string | null;
  video_rec: string | null;
  status: boolean;
  order: number;
  asset_images: Array<{ _id: string; url: string; isPremium: boolean; imageCount: number }>;
  isTrending: boolean;
  trendingOrder: number;
  imageCount: number;
  isPremium: boolean;
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
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<SelectableItem[]>([]);
  const [subcategories, setSubcategories] = useState<SelectableItem[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Fetch trending categories and subcategories on mount
  useEffect(() => {
    dispatch(getTrendingThunk());
  }, [dispatch]);

  // Helper function to get media URL and type
  const getMediaInfo = (item: TrendingCategory | TrendingSubcategory) => {
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
    } else if ('asset_images' in item && item.asset_images && item.asset_images.length > 0) {
      // For subcategories, use first asset image if available
      mediaUrl = item.asset_images[0].url;
      mediaType = 'image';
    } else {
      // Use a simple placeholder SVG
      mediaUrl = `data:image/svg+xml,${encodeURIComponent('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">No Media</text></svg>')}`;
      mediaType = 'image';
    }
    
    return { mediaUrl, mediaType };
  };

  // Map API response to SelectableList format
  useEffect(() => {
    // Handle new structure: { categories: [], subcategories: [] }
    if (trendingData && typeof trendingData === 'object' && 'categories' in trendingData) {
      const categoriesData = trendingData.categories || [];
      const subcategoriesData = trendingData.subcategories || [];

      // Map categories
      const mappedCategories: SelectableItem[] = categoriesData.map((item: TrendingCategory) => {
        const { mediaUrl, mediaType } = getMediaInfo(item);
        return {
          id: item._id,
          name: item.name,
          image: mediaUrl,
          mediaType: mediaType,
          mediaUrl: mediaUrl,
        };
      });

      // Sort categories by trendingOrder
      mappedCategories.sort((a, b) => {
        const aItem = categoriesData.find((item: TrendingCategory) => item._id === a.id);
        const bItem = categoriesData.find((item: TrendingCategory) => item._id === b.id);
        return (aItem?.trendingOrder || 0) - (bItem?.trendingOrder || 0);
      });

      setCategories(mappedCategories);
      
      // Set selected category IDs based on isTrending flag
      const selectedCats = mappedCategories
        .filter(cat => {
          const item = categoriesData.find((item: TrendingCategory) => item._id === cat.id);
          return item?.isTrending;
        })
        .map(cat => cat.id);
      setSelectedCategories(selectedCats);

      // Map subcategories
      const mappedSubcategories: SelectableItem[] = subcategoriesData.map((item: TrendingSubcategory) => {
        const { mediaUrl, mediaType } = getMediaInfo(item);
        return {
          id: item._id,
          name: item.subcategoryTitle,
          image: mediaUrl,
          mediaType: mediaType,
          mediaUrl: mediaUrl,
        };
      });

      // Sort subcategories by trendingOrder
      mappedSubcategories.sort((a, b) => {
        const aItem = subcategoriesData.find((item: TrendingSubcategory) => item._id === a.id);
        const bItem = subcategoriesData.find((item: TrendingSubcategory) => item._id === b.id);
        return (aItem?.trendingOrder || 0) - (bItem?.trendingOrder || 0);
      });

      setSubcategories(mappedSubcategories);
      
      // Set selected subcategory IDs based on isTrending flag
      const selectedSubs = mappedSubcategories
        .filter(sub => {
          const item = subcategoriesData.find((item: TrendingSubcategory) => item._id === sub.id);
          return item?.isTrending;
        })
        .map(sub => sub.id);
      setSelectedSubcategories(selectedSubs);
    } else if (Array.isArray(trendingData) && trendingData.length > 0) {
      // Backward compatibility: handle old array format
      const mappedCategories: SelectableItem[] = trendingData.map((item: TrendingCategory) => {
        const { mediaUrl, mediaType } = getMediaInfo(item);
        return {
          id: item._id,
          name: item.name,
          image: mediaUrl,
          mediaType: mediaType,
          mediaUrl: mediaUrl,
        };
      });

      mappedCategories.sort((a, b) => {
        const aItem = trendingData.find((item: TrendingCategory) => item._id === a.id);
        const bItem = trendingData.find((item: TrendingCategory) => item._id === b.id);
        return (aItem?.trendingOrder || 0) - (bItem?.trendingOrder || 0);
      });

      setCategories(mappedCategories);
      
      const selected = mappedCategories
        .filter(cat => {
          const item = trendingData.find((item: TrendingCategory) => item._id === cat.id);
          return item?.isTrending;
        })
        .map(cat => cat.id);
      setSelectedCategories(selected);
      setSubcategories([]);
      setSelectedSubcategories([]);
    } else {
      setCategories([]);
      setSelectedCategories([]);
      setSubcategories([]);
      setSelectedSubcategories([]);
    }
  }, [trendingData]);

  // Handle category reorder - call API directly like AIPhoto
  const handleCategoryReorder = async (reorderedItems: SelectableItem[]) => {
    if (reorderedItems.length === 0) {
      return;
    }

    // Update local state immediately for better UX
    setCategories(reorderedItems);

    // Calculate trendingOrder based on position in the full reordered list
    // This ensures sequential ordering (1, 2, 3...) for ALL items
    // Backend will update trendingOrder for all categories based on their position
    const reorderData = reorderedItems.map((item, index) => ({
      _id: item.id,
      trendingOrder: index + 1, // Sequential order starting from 1 for all items
    }));

    // Call API to save the new order
    try {
      const result = await dispatch(reorderTrendingThunk({ categories: reorderData }));

      if (reorderTrendingThunk.fulfilled.match(result)) {
        // Refresh data to get updated order from backend
        dispatch(getTrendingThunk());
      } else {
        // If reorder failed, refresh to revert UI
        dispatch(getTrendingThunk());
      }
    } catch (error) {
      // If reorder fails, refresh to revert UI
      dispatch(getTrendingThunk());
    }
  };

  // Handle subcategory reorder - call API directly like AIPhoto
  const handleSubcategoryReorder = async (reorderedItems: SelectableItem[]) => {
    if (reorderedItems.length === 0) {
      return;
    }

    // Update local state immediately for better UX
    setSubcategories(reorderedItems);

    // Calculate trendingOrder based on position in the full reordered list
    // This ensures sequential ordering (1, 2, 3...) for ALL items
    // Backend will update trendingOrder for all subcategories based on their position
    const reorderData = reorderedItems.map((item, index) => ({
      _id: item.id,
      trendingOrder: index + 1, // Sequential order starting from 1 for all items
    }));

    // Call API to save the new order
    try {
      const result = await dispatch(reorderTrendingSubcategoriesThunk({ subcategories: reorderData }));

      if (reorderTrendingSubcategoriesThunk.fulfilled.match(result)) {
        // Refresh data to get updated order from backend
        dispatch(getTrendingThunk());
      } else {
        // If reorder failed, refresh to revert UI
        dispatch(getTrendingThunk());
      }
    } catch (error) {
      // If reorder fails, refresh to revert UI
      dispatch(getTrendingThunk());
    }
  };

  // Handle category selection change and call API
  const handleCategorySelectionChange = async (ids: (number | string)[]) => {
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

  // Handle subcategory selection change and call API
  const handleSubcategorySelectionChange = async (ids: (number | string)[]) => {
    const newSelectedIds = ids.map(id => String(id));
    const previousSelected = selectedSubcategories;
    
    // Find what changed
    const added = newSelectedIds.filter(id => !previousSelected.includes(id));
    const removed = previousSelected.filter(id => !newSelectedIds.includes(id));
    
    // Update local state immediately for better UX
    setSelectedSubcategories(newSelectedIds);
    
    // Call API for each changed subcategory
    const updatePromises: Promise<any>[] = [];
    
    // Add to updating set
    const newUpdatingIds = new Set(updatingIds);
    [...added, ...removed].forEach(id => newUpdatingIds.add(id));
    setUpdatingIds(newUpdatingIds);
    
    // Call API for added subcategories (isTrending = true)
    added.forEach(id => {
      updatePromises.push(
        dispatch(updateSubcategoryTrendingStatusThunk({ id, isTrending: true }))
      );
    });
    
    // Call API for removed subcategories (isTrending = false)
    removed.forEach(id => {
      updatePromises.push(
        dispatch(updateSubcategoryTrendingStatusThunk({ id, isTrending: false }))
      );
    });
    
    // Wait for all API calls to complete
    try {
      await Promise.all(updatePromises);
      // Refresh data after all updates
      dispatch(getTrendingThunk());
    } catch (error) {
      // If any API call fails, revert to previous selection
      setSelectedSubcategories(previousSelected);
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
      </div>

      {/* Categories Section */}
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
            onSelectionChange={handleCategorySelectionChange}
            onReorder={handleCategoryReorder}
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

      {/* Subcategories Section */}
      <div className="section-card mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Select Subcategories</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the subcategories to display in the Trending section. You can select multiple items and drag to reorder.
        </p>
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Loading subcategories...</p>
          </div>
        ) : subcategories.length > 0 ? (
          <SelectableList
            items={subcategories}
            selectedIds={selectedSubcategories}
            onSelectionChange={handleSubcategorySelectionChange}
            onReorder={handleSubcategoryReorder}
            multiSelect={true}
            draggable={true}
            updatingIds={updatingIds}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No subcategories available
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} and {selectedSubcategories.length} {selectedSubcategories.length === 1 ? 'subcategory' : 'subcategories'}
        </p>
      </div>
    </div>
  );
};

export default Trending;
