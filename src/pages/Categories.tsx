import React, { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Video, Images, ChevronUp, ChevronDown, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CountrySelect from '@/components/ui/CountrySelect';
import DraggableTable from '@/components/ui/DraggableTable';
import VirtualizedAssetGrid from '@/components/ui/VirtualizedAssetGridOptimized';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mockCategories, Category } from '@/data/mockData';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCategoryThunk, updateCategoryThunk, getCategoryThunk, deleteCategoryThunk, toggleCategoryStatusThunk, toggleCategoryAndroidActiveThunk, toggleCategoryIOSActiveThunk, reorderCategoryThunk, toggleCategoryPremiumThunk, updateCategoryAssetThunk, uploadCategoryAssetsThunk, reorderCategoryAssetsThunk, deleteCategoryAssetThunk } from '@/store/category/thunk';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  getCountryShortName,
} from '@/constants/countries';

// Enhanced debounce with leading edge execution for better UX
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = { leading: false, trailing: true }
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  let lastCallTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const shouldCallLeading = options.leading && now - lastCallTime >= delay;
    
    clearTimeout(timeoutId);
    
    if (shouldCallLeading) {
      func(...args);
      lastCallTime = now;
    } else if (options.trailing) {
      timeoutId = setTimeout(() => {
        func(...args);
        lastCallTime = Date.now();
      }, delay);
    }
  };
};

// Performance monitoring hook
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
};

// Optimized image loading component with intersection observer
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className, 
  onLoad, 
  onError 
}: {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
      {hasError && (
        <div className={`absolute inset-0 bg-gray-300 flex items-center justify-center ${className}`}>
          <ImageIcon className="w-6 h-6 text-gray-500" />
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Draggable Asset Grid Component
const DraggableAssetGrid = memo(({
  assets,
  selectedAssets,
  onAssetSelect,
  onDeleteImage,
  onViewImage,
  onPremiumToggle,
  onImageCountChange,
  onPromptChange,
  onCountryChange,
  editingAsset,
  editingAssetPrompt,
  setEditingAsset,
  setEditingAssetPrompt,
  assetLoadingStates,
  onReorder,
  containerHeight = 384, // 24rem = max-h-96
  itemHeight = 320, // Approximate height of each asset card
  columns = 3
}: {
  assets: AssetImage[];
  selectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onDeleteImage: (asset: AssetImage) => void;
  onViewImage: (asset: AssetImage) => void;
  onPremiumToggle: (asset: AssetImage) => void;
  onImageCountChange: (asset: AssetImage, newCount: number) => void;
  onPromptChange: (asset: AssetImage, newPrompt: string) => void;
  onCountryChange: (asset: AssetImage, newCountry: string) => void;
  editingAsset: { assetId: string; imageCount: number } | null;
  editingAssetPrompt: { assetId: string; prompt: string } | null;
  setEditingAsset: (asset: { assetId: string; imageCount: number } | null) => void;
  setEditingAssetPrompt: (asset: { assetId: string; prompt: string } | null) => void;
  assetLoadingStates: Set<string>;
  onReorder: (oldIndex: number, newIndex: number) => void;
  containerHeight?: number;
  itemHeight?: number;
  columns?: number;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = assets.findIndex((asset) => asset._id === active.id);
      const newIndex = assets.findIndex((asset) => asset._id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  // For small datasets, render normally without virtualization
  if (assets.length <= 30) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={assets.map(asset => asset._id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg bg-muted/30 max-h-96 overflow-y-auto">
            {assets.map((asset: AssetImage) => (
              <SortableAssetCard
                key={asset._id}
                asset={asset}
                selectedAssets={selectedAssets}
                onAssetSelect={onAssetSelect}
                onDeleteImage={onDeleteImage}
                onViewImage={onViewImage}
                onPremiumToggle={onPremiumToggle}
                onImageCountChange={onImageCountChange}
                onPromptChange={onPromptChange}
                onCountryChange={onCountryChange}
                editingAsset={editingAsset}
                editingAssetPrompt={editingAssetPrompt}
                setEditingAsset={setEditingAsset}
                setEditingAssetPrompt={setEditingAssetPrompt}
                loading={assetLoadingStates.has(asset._id)}
                assets={assets}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  // For larger datasets, you could implement virtualized drag and drop
  // For now, we'll use the non-virtualized version for simplicity
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={assets.map(asset => asset._id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg bg-muted/30 max-h-96 overflow-y-auto">
          {assets.map((asset: AssetImage) => (
            <SortableAssetCard
              key={asset._id}
              asset={asset}
              selectedAssets={selectedAssets}
              onAssetSelect={onAssetSelect}
              onDeleteImage={onDeleteImage}
              onViewImage={onViewImage}
              onPremiumToggle={onPremiumToggle}
              onImageCountChange={onImageCountChange}
              onPromptChange={onPromptChange}
              onCountryChange={onCountryChange}
              editingAsset={editingAsset}
              editingAssetPrompt={editingAssetPrompt}
              setEditingAsset={setEditingAsset}
              setEditingAssetPrompt={setEditingAssetPrompt}
              loading={assetLoadingStates.has(asset._id)}
              assets={assets}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});

DraggableAssetGrid.displayName = 'DraggableAssetGrid';

// Sortable Asset Card Component
const SortableAssetCard = memo(({
  asset,
  selectedAssets,
  onAssetSelect,
  onDeleteImage,
  onViewImage,
  onPremiumToggle,
  onImageCountChange,
  onPromptChange,
  onCountryChange,
  editingAsset,
  editingAssetPrompt,
  setEditingAsset,
  setEditingAssetPrompt,
  loading,
  assets
}: {
  asset: AssetImage;
  selectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onDeleteImage: (asset: AssetImage) => void;
  onViewImage: (asset: AssetImage) => void;
  onPremiumToggle: (asset: AssetImage) => void;
  onImageCountChange: (asset: AssetImage, newCount: number) => void;
  onPromptChange: (asset: AssetImage, newPrompt: string) => void;
  onCountryChange: (asset: AssetImage, newCountry: string) => void;
  editingAsset: { assetId: string; imageCount: number } | null;
  editingAssetPrompt: { assetId: string; prompt: string } | null;
  setEditingAsset: (asset: { assetId: string; imageCount: number } | null) => void;
  setEditingAssetPrompt: (asset: { assetId: string; prompt: string } | null) => void;
  loading: boolean;
  assets: AssetImage[];
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border rounded-lg p-3 bg-card hover:shadow-md transition-shadow ${
        selectedAssets.includes(asset._id)
          ? "ring-2 ring-primary"
          : ""
      }`}
    >
      {/* Drag Handle - Top Left */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/80 transition-colors"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      {/* Checkbox - Top Left (next to drag handle) */}
      <div className="absolute top-2 left-10 z-20">
        <Checkbox
          checked={selectedAssets.includes(asset._id)}
          onCheckedChange={() => onAssetSelect(asset._id)}
          className="bg-background"
        />
      </div>
      
      {/* Delete Button - Top Right */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
        onClick={() => onDeleteImage(asset)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Image - Clickable to view full size */}
      <div
        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted mb-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onViewImage(asset)}
      >
        <LazyImage
          src={asset.url}
          alt="Asset"
          className="w-full h-full"
        />
        {/* URL Tooltip - Only on hover, not displayed */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-all text-xs">
                {asset.url}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Asset Details */}
      <div className="space-y-2.5">
        {/* Premium Toggle */}
        <div className="flex items-center justify-between py-0.5">
          <Label className="text-xs font-medium text-foreground">
            Premium
          </Label>
          <Switch
            checked={asset.isPremium}
            onCheckedChange={() => onPremiumToggle(asset)}
            disabled={loading}
          />
        </div>

        {/* Image Count */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Count
          </Label>
          {editingAsset?.assetId === asset._id ? (
            <div className="flex items-center border-2 border-primary rounded-md bg-background overflow-hidden shadow-sm ring-1 ring-primary/20 w-28">
              <Input
                type="number"
                min="1"
                value={editingAsset.imageCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: Math.max(1, value),
                  });
                }}
                className="h-9 w-12 text-center text-sm font-semibold border-0 focus-visible:ring-0 p-0 bg-transparent text-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onImageCountChange(asset, editingAsset.imageCount);
                  } else if (e.key === "Escape") {
                    setEditingAsset(null);
                  }
                }}
                onBlur={() => {
                  onImageCountChange(asset, editingAsset.imageCount);
                }}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-primary/10 active:bg-primary/20 border-r border-primary/30 transition-colors"
                onClick={() => {
                  const newCount = Math.max(
                    1,
                    editingAsset.imageCount - 1
                  );
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: newCount,
                  });
                }}
                disabled={loading || editingAsset.imageCount <= 1}
              >
                <ChevronDown className="w-3.5 h-3.5 text-primary" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-primary/10 active:bg-primary/20 border-l border-primary/30 transition-colors"
                onClick={() => {
                  const newCount = editingAsset.imageCount + 1;
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: newCount,
                  });
                }}
                disabled={loading}
              >
                <ChevronUp className="w-3.5 h-3.5 text-primary" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center border border-border rounded-md bg-background overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all w-28">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-muted active:bg-muted/80 border-r border-border transition-colors"
                onClick={() => {
                  const newCount = Math.max(1, asset.imageCount - 1);
                  onImageCountChange(asset, newCount);
                }}
                disabled={loading || asset.imageCount <= 1}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              <div
                className="h-9 w-12 flex items-center justify-center text-sm font-semibold text-foreground cursor-text hover:bg-muted/40 active:bg-muted/60 transition-colors select-none rounded-md border border-border hover:border-primary/50"
                onClick={() =>
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: asset.imageCount,
                  })
                }
              >
                {asset.imageCount}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-muted active:bg-muted/80 border-l border-border transition-colors"
                onClick={() => {
                  const newCount = asset.imageCount + 1;
                  onImageCountChange(asset, newCount);
                }}
                disabled={loading}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Prompt (Optional)
          </Label>
          {editingAssetPrompt?.assetId === asset._id ? (
            <div className="flex items-center border-2 border-primary rounded-md bg-background overflow-hidden shadow-sm ring-1 ring-primary/20">
              <Textarea
                value={editingAssetPrompt.prompt}
                onChange={(e) => {
                  setEditingAssetPrompt({
                    assetId: asset._id,
                    prompt: e.target.value,
                  });
                }}
                className="h-9 text-sm font-semibold border-0 focus-visible:ring-0 p-2 bg-transparent text-foreground resize-none"
                placeholder="Enter prompt..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onPromptChange(asset, editingAssetPrompt.prompt);
                  } else if (e.key === "Escape") {
                    setEditingAssetPrompt(null);
                  }
                }}
                onBlur={() => {
                  onPromptChange(asset, editingAssetPrompt.prompt);
                }}
                autoFocus
              />
            </div>
          ) : (
            <div
              className="h-9 w-full flex items-center justify-center text-sm text-muted-foreground cursor-text hover:bg-muted/40 active:bg-muted/60 transition-colors rounded-md border border-border hover:border-primary/50 px-2 truncate"
              onClick={() =>
                setEditingAssetPrompt({
                  assetId: asset._id,
                  prompt: asset.prompt || "",
                })
              }
              title={asset.prompt || "Click to add prompt"}
            >
              {asset.prompt || "N/A"}
            </div>
          )}
        </div>

        {/* Country Dropdown */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Country (Optional)
          </Label>
          <CountrySelect
            value={asset.country || ""}
            onValueChange={(value) => {
              onCountryChange(asset, value);
            }}
            placeholder="Select country..."
            triggerClassName="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
});

SortableAssetCard.displayName = 'SortableAssetCard';

// Lazy Image Component with Intersection Observer
const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  onError 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-destructive/10 rounded-lg">
          Failed to load
        </div>
      ) : (
        isInView && (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';
// Memoized Asset Card Component
const AssetCard = memo(({
  asset,
  selectedAssets,
  onAssetSelect,
  onDeleteImage,
  onViewImage,
  onPremiumToggle,
  onImageCountChange,
  onPromptChange,
  onCountryChange,
  editingAsset,
  editingAssetPrompt,
  setEditingAsset,
  setEditingAssetPrompt,
  loading,
  assets
}: {
  asset: AssetImage;
  selectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onDeleteImage: (asset: AssetImage) => void;
  onViewImage: (asset: AssetImage) => void;
  onPremiumToggle: (asset: AssetImage) => void;
  onImageCountChange: (asset: AssetImage, newCount: number) => void;
  onPromptChange: (asset: AssetImage, newPrompt: string) => void;
  onCountryChange: (asset: AssetImage, newCountry: string) => void;
  editingAsset: { assetId: string; imageCount: number } | null;
  editingAssetPrompt: { assetId: string; prompt: string } | null;
  setEditingAsset: (asset: { assetId: string; imageCount: number } | null) => void;
  setEditingAssetPrompt: (asset: { assetId: string; prompt: string } | null) => void;
  loading: boolean;
  assets: AssetImage[];
}) => {
  return (
    <div
      className={`relative group border rounded-lg p-3 bg-card hover:shadow-md transition-shadow ${
        selectedAssets.includes(asset._id)
          ? "ring-2 ring-primary"
          : ""
      }`}
    >
      {/* Checkbox - Top Left */}
      <div className="absolute top-2 left-2 z-20">
        <Checkbox
          checked={selectedAssets.includes(asset._id)}
          onCheckedChange={() => onAssetSelect(asset._id)}
          className="bg-background"
        />
      </div>
      {/* Delete Button - Top Right */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
        onClick={() => onDeleteImage(asset)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Image - Clickable to view full size */}
      <div
        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted mb-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onViewImage(asset)}
      >
        <LazyImage
          src={asset.url}
          alt="Asset"
          className="w-full h-full"
        />
        {/* URL Tooltip - Only on hover, not displayed */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-all text-xs">
                {asset.url}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Asset Details */}
      <div className="space-y-2.5">
        {/* Premium Toggle */}
        <div className="flex items-center justify-between py-0.5">
          <Label className="text-xs font-medium text-foreground">
            Premium
          </Label>
          <Switch
            checked={asset.isPremium}
            onCheckedChange={() => onPremiumToggle(asset)}
            disabled={loading}
          />
        </div>

        {/* Image Count */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Count
          </Label>
          {editingAsset?.assetId === asset._id ? (
            <div className="flex items-center border-2 border-primary rounded-md bg-background overflow-hidden shadow-sm ring-1 ring-primary/20 w-28">
              <Input
                type="number"
                min="1"
                value={editingAsset.imageCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: Math.max(1, value),
                  });
                }}
                className="h-9 w-12 text-center text-sm font-semibold border-0 focus-visible:ring-0 p-0 bg-transparent text-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onImageCountChange(asset, editingAsset.imageCount);
                  } else if (e.key === "Escape") {
                    setEditingAsset(null);
                  }
                }}
                onBlur={() => {
                  onImageCountChange(asset, editingAsset.imageCount);
                }}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-primary/10 active:bg-primary/20 border-r border-primary/30 transition-colors"
                onClick={() => {
                  const newCount = Math.max(
                    1,
                    editingAsset.imageCount - 1
                  );
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: newCount,
                  });
                }}
                disabled={loading || editingAsset.imageCount <= 1}
              >
                <ChevronDown className="w-3.5 h-3.5 text-primary" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-primary/10 active:bg-primary/20 border-l border-primary/30 transition-colors"
                onClick={() => {
                  const newCount = editingAsset.imageCount + 1;
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: newCount,
                  });
                }}
                disabled={loading}
              >
                <ChevronUp className="w-3.5 h-3.5 text-primary" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center border border-border rounded-md bg-background overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all w-28">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-muted active:bg-muted/80 border-r border-border transition-colors"
                onClick={() => {
                  const newCount = Math.max(1, asset.imageCount - 1);
                  onImageCountChange(asset, newCount);
                }}
                disabled={loading || asset.imageCount <= 1}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              <div
                className="h-9 w-12 flex items-center justify-center text-sm font-semibold text-foreground cursor-text hover:bg-muted/40 active:bg-muted/60 transition-colors select-none rounded-md border border-border hover:border-primary/50"
                onClick={() =>
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: asset.imageCount,
                  })
                }
              >
                {asset.imageCount}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-7 rounded-none hover:bg-muted active:bg-muted/80 border-l border-border transition-colors"
                onClick={() => {
                  const newCount = asset.imageCount + 1;
                  onImageCountChange(asset, newCount);
                }}
                disabled={loading}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Prompt (Optional)
          </Label>
          {editingAssetPrompt?.assetId === asset._id ? (
            <div className="flex items-center border-2 border-primary rounded-md bg-background overflow-hidden shadow-sm ring-1 ring-primary/20">
              <Textarea
                value={editingAssetPrompt.prompt}
                onChange={(e) => {
                  setEditingAssetPrompt({
                    assetId: asset._id,
                    prompt: e.target.value,
                  });
                }}
                className="h-9 text-sm font-semibold border-0 focus-visible:ring-0 p-2 bg-transparent text-foreground resize-none"
                placeholder="Enter prompt..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onPromptChange(asset, editingAssetPrompt.prompt);
                  } else if (e.key === "Escape") {
                    setEditingAssetPrompt(null);
                  }
                }}
                onBlur={() => {
                  onPromptChange(asset, editingAssetPrompt.prompt);
                }}
                autoFocus
              />
            </div>
          ) : (
            <div
              className="h-9 w-full flex items-center justify-center text-sm text-muted-foreground cursor-text hover:bg-muted/40 active:bg-muted/60 transition-colors rounded-md border border-border hover:border-primary/50 px-2 truncate"
              onClick={() =>
                setEditingAssetPrompt({
                  assetId: asset._id,
                  prompt: asset.prompt || "",
                })
              }
              title={asset.prompt || "Click to add prompt"}
            >
              {asset.prompt || "N/A"}
            </div>
          )}
        </div>

        {/* Country Dropdown */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Country (Optional)
          </Label>
          <CountrySelect
            value={asset.country || ""}
            onValueChange={(value) => {
              onCountryChange(asset, value);
            }}
            placeholder="Select country..."
            triggerClassName="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
});

AssetCard.displayName = 'AssetCard';

// Asset type based on API response
interface AssetImage {
  _id: string;
  url: string;
  isPremium: boolean;
  imageCount: number;
  prompt?: string;
  country?: string;
}

const COUNTRY_LIST = {
  "India": "IN",
  "USA": "US",
  "United Kingdom": "UK",
  "Canada": "CA",
  "Australia": "AU",
  "Germany": "DE",
  "France": "FR",
  "Japan": "JP",
  "South Korea": "KR",
  "Brazil": "BR",
  "Other": "OTHER"
};

// Yup validation schema
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Category name is required')
    // .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be at most 100 characters'),
  prompt: yup.string().trim().optional(),
  imageSquare: yup.mixed<File | string>().optional(),
  imageRectangle: yup.mixed<File | string>().optional(),
  videoSquare: yup.mixed<File | string>().optional(),
  videoRectangle: yup.mixed<File | string>().optional(),
  status: yup.boolean().required('Status is required'),
  isAndroid: yup.boolean().optional(),
  isIos: yup.boolean().optional(),
});

const Categories: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, dataLoading, data: categoriesData, paginationData } = useAppSelector((state) => state.Category);
  const [categories, setCategories] = useState<(Category & { _id?: string; isPremium?: boolean; images?: AssetImage[] })[]>([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]); // Store original _id order
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<(Category & { _id?: string; isPremium?: boolean; images?: AssetImage[] }) | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<(Category & { _id?: string; isPremium?: boolean; images?: AssetImage[] }) | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<(Category & { _id?: string; isPremium?: boolean; images?: AssetImage[] }) | null>(null);
  const [newImages, setNewImages] = useState<Array<{ url: string; file?: File; preview?: string; prompt?: string; country?: string }>>([]);
  const [commonCountryForNewImages, setCommonCountryForNewImages] = useState<string>("");
  const [editingAsset, setEditingAsset] = useState<{
    assetId: string;
    imageCount: number;
  } | null>(null);
  const [editingAssetPrompt, setEditingAssetPrompt] = useState<{
    assetId: string;
    prompt: string;
  } | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    assetId: string;
  } | null>(null);
  const [deleteImage, setDeleteImage] = useState<{
    categoryId: string;
    assetId: string;
    imageUrl: string;
  } | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetLoadingStates, setAssetLoadingStates] = useState<Set<string>>(new Set());
  const [optimisticAssets, setOptimisticAssets] = useState<Map<string, Partial<AssetImage>>>(new Map());
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on component mount with performance optimization
  useEffect(() => {
    const startTime = performance.now();
    dispatch(getCategoryThunk(undefined)).finally(() => {
      console.log(`Categories API call took: ${performance.now() - startTime}ms`);
    });
  }, [dispatch]);

  // Cleanup optimistic updates on unmount
  useEffect(() => {
    return () => {
      setOptimisticAssets(new Map());
      setAssetLoadingStates(new Set());
    };
  }, []);

  const isUsableMediaSrc = useCallback((src: unknown) => {
    if (typeof src !== 'string') return false;
    const s = src.trim();
    if (!s || s === 'null' || s === 'undefined') return false;
    return (
      s.startsWith('http://') ||
      s.startsWith('https://') ||
      s.startsWith('blob:') ||
      s.startsWith('data:') ||
      s.startsWith('/')
    );
  }, []);

  // Optimized mapping function with memoization
  const mapApiToCategory = useCallback((item: any, index: number): Category & { _id?: string; isPremium?: boolean; prompt?: string; isAndroid?: boolean; isIos?: boolean; images?: AssetImage[] } => {
    const images = (item.asset_images && Array.isArray(item.asset_images)) 
      ? item.asset_images.map((asset: any) => ({
          _id: asset._id || '',
          url: asset.url || '',
          isPremium: asset.isPremium ?? false,
          imageCount: asset.imageCount ?? 1,
          prompt: asset.prompt || '',
          country: asset.country || '',
        }))
      : [];

    return {
      id: parseInt(item._id?.slice(-8) || String(index + 1), 16) || index + 1,
      name: item.name || '',
      prompt: item.prompt || '',
      country: (item.country ?? '') || '',
      android_appVersion: (item.android_appVersion ?? '') || '',
      ios_appVersion: (item.ios_appVersion ?? '') || '',
      imageSquare: (item.img_sqr && item.img_sqr !== null) ? item.img_sqr : '',
      imageRectangle: (item.img_rec && item.img_rec !== null) ? item.img_rec : '',
      videoSquare: (item.video_sqr && item.video_sqr !== null) ? item.video_sqr : '',
      videoRectangle: (item.video_rec && item.video_rec !== null) ? item.video_rec : '',
      status: item.status ?? true,
      isPremium: item.isPremium ?? false,
      isAndroid: item.isAndroid !== undefined ? item.isAndroid : false,
      isIos: item.isIos !== undefined ? item.isIos : false,
      order: item.order || index + 1,
      images,
      _id: item._id,
    };
  }, []);

  // Memoized categories mapping to prevent unnecessary recalculations
  const memoizedCategories = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) {
      setCategories([]);
      setOriginalOrder([]);
      setHasOrderChanged(false);
      return [];
    }
    
    const startTime = performance.now();
    const mappedCategories = categoriesData.map(mapApiToCategory);
    
    // Store original order of _ids
    const originalIds = mappedCategories.map(cat => cat._id || '').filter(id => id !== '');
    setOriginalOrder(originalIds);
    setHasOrderChanged(false);
    
    console.log(`Categories mapping took: ${performance.now() - startTime}ms for ${categoriesData.length} items`);
    return mappedCategories;
  }, [categoriesData, mapApiToCategory]);

  // Map API response to Category type with performance optimization
  useEffect(() => {
    setCategories(memoizedCategories);
  }, [memoizedCategories]);

  const [selectedFiles, setSelectedFiles] = useState({
    imageSquare: null as File | null,
    imageRectangle: null as File | null,
    videoSquare: null as File | null,
    videoRectangle: null as File | null,
  });

  const [removedFields, setRemovedFields] = useState<Set<string>>(new Set());

  const [videoPreviews, setVideoPreviews] = useState({
    videoSquare: '',
    videoRectangle: '',
  });

  // Cleanup video preview URLs on unmount
  useEffect(() => {
    return () => {
      if (videoPreviews.videoSquare) {
        URL.revokeObjectURL(videoPreviews.videoSquare);
      }
      if (videoPreviews.videoRectangle) {
        URL.revokeObjectURL(videoPreviews.videoRectangle);
      }
    };
  }, [videoPreviews.videoSquare, videoPreviews.videoRectangle]);

  const fileInputRefs = {
    imageSquare: useRef<HTMLInputElement>(null),
    imageRectangle: useRef<HTMLInputElement>(null),
    videoSquare: useRef<HTMLInputElement>(null),
    videoRectangle: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = async (
    field: 'imageSquare' | 'imageRectangle' | 'videoSquare' | 'videoRectangle',
    file: File | null,
    formik: any
  ) => {
    if (!file) return;

    if (field.startsWith('image')) {
      // Convert file to base64 for preview and storage (works for any file type)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue(field, base64String);
      };
      reader.readAsDataURL(file);
    } else {
      // Store blob URL and create preview URL
      const fileUrl = URL.createObjectURL(file);
      formik.setFieldValue(field, fileUrl);
      setVideoPreviews(prev => ({ ...prev, [field]: fileUrl }));
    }

    setSelectedFiles(prev => ({ ...prev, [field]: file }));
    // Remove from removedFields if a new file is selected
    setRemovedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  const resetForm = (formik: any) => {
    // Clean up video preview URLs
    if (videoPreviews.videoSquare) {
      URL.revokeObjectURL(videoPreviews.videoSquare);
    }
    if (videoPreviews.videoRectangle) {
      URL.revokeObjectURL(videoPreviews.videoRectangle);
    }
    
    formik.resetForm({
      values: {
        name: '',
        prompt: '',
        country: '',
        android_appVersion: '',
        ios_appVersion: '',
        imageSquare: '',
        imageRectangle: '',
        videoSquare: '',
        videoRectangle: '',
        status: true,
        isAndroid: false,
        isIos: false,
      },
    });
    setSelectedFiles({
      imageSquare: null,
      imageRectangle: null,
      videoSquare: null,
      videoRectangle: null,
    });
    setVideoPreviews({
      videoSquare: '',
      videoRectangle: '',
    });
    setRemovedFields(new Set());
    // Reset file inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
    setEditingCategory(null);
  };

  const handleOpenForm = (category: Category | undefined, formik: any) => {
    if (category) {
      setEditingCategory(category);

      const freshFormik = formik;
      freshFormik.setValues({
        name: category.name || '',
        prompt: category.prompt || '',
        country: category.country || '',
        android_appVersion: category.android_appVersion || '',
        ios_appVersion: category.ios_appVersion || '',
        imageSquare: category.imageSquare || '',
        imageRectangle: category.imageRectangle || '',
        videoSquare: category.videoSquare || '',
        videoRectangle: category.videoRectangle || '',
        status: category.status !== undefined ? category.status : true,
        isAndroid: (category as any).isAndroid !== undefined ? (category as any).isAndroid : false,
        isIos: (category as any).isIos !== undefined ? (category as any).isIos : false,
      });

      setSelectedFiles({
        imageSquare: null,
        imageRectangle: null,
        videoSquare: null,
        videoRectangle: null,
      });
      if (videoPreviews.videoSquare) {
        URL.revokeObjectURL(videoPreviews.videoSquare);
      }
      if (videoPreviews.videoRectangle) {
        URL.revokeObjectURL(videoPreviews.videoRectangle);
      }
      setVideoPreviews({
        videoSquare: '',
        videoRectangle: '',
      });
    } else {
      resetForm(formik);
    }

    setIsFormOpen(true);
  };

  // Formik form setup
  const formik = useFormik({
    initialValues: {
      name: '',
      prompt: '',
      imageSquare: '',
      imageRectangle: '',
      videoSquare: '',
      videoRectangle: '',
      status: true,
      country: '',
      android_appVersion: '',
      ios_appVersion: '',
      isAndroid: false,
      isIos: false,
    },
    validationSchema: categorySchema,
    onSubmit: async (values) => {
      if (editingCategory && editingCategory._id) {
        // Update FormData for multipart/form-data request
        const formDataToSend = new FormData();
        
        // Add text fields
        formDataToSend.append('name', values.name.trim());
        if (values.prompt && values.prompt.trim()) {
          formDataToSend.append('prompt', values.prompt.trim());
        }
        formDataToSend.append('status', values.status.toString());
        formDataToSend.append('isAndroid', values.isAndroid.toString());
        formDataToSend.append('isIos', values.isIos.toString());
        
        // Add new country and app version fields
        if (values.country && values.country.trim()) {
          formDataToSend.append('country', values.country.trim());
        }
        if (values.android_appVersion && values.android_appVersion.trim()) {
          formDataToSend.append('android_appVersion', values.android_appVersion.trim());
        }
        if (values.ios_appVersion && values.ios_appVersion.trim()) {
          formDataToSend.append('ios_appVersion', values.ios_appVersion.trim());
        }
        
        // Handle imageSquare: new file, removed, or keep existing
        if (selectedFiles.imageSquare) {
          // New file selected
          formDataToSend.append('img_sqr', selectedFiles.imageSquare);
        } else if (removedFields.has('imageSquare')) {
          // Image was explicitly removed
          formDataToSend.append('img_sqr', 'null');
        }
        // If neither, don't send (keep existing)
        
        // Handle imageRectangle: new file, removed, or keep existing
        if (selectedFiles.imageRectangle) {
          // New file selected
          formDataToSend.append('img_rec', selectedFiles.imageRectangle);
        } else if (removedFields.has('imageRectangle')) {
          // Image was explicitly removed
          formDataToSend.append('img_rec', 'null');
        }
        // If neither, don't send (keep existing)
        
        // Handle videoSquare: new file, removed, or keep existing
        if (selectedFiles.videoSquare) {
          // New file selected
          formDataToSend.append('video_sqr', selectedFiles.videoSquare);
        } else if (removedFields.has('videoSquare')) {
          // Video was explicitly removed
          formDataToSend.append('video_sqr', 'null');
        }
        // If neither, don't send (keep existing)
        
        // Handle videoRectangle: new file, removed, or keep existing
        if (selectedFiles.videoRectangle) {
          // New file selected
          formDataToSend.append('video_rec', selectedFiles.videoRectangle);
        } else if (removedFields.has('videoRectangle')) {
          // Video was explicitly removed
          formDataToSend.append('video_rec', 'null');
        }
        // If neither, don't send (keep existing)

        // Call API
        const result = await dispatch(updateCategoryThunk({ id: editingCategory._id, data: formDataToSend }));
        
        if (updateCategoryThunk.fulfilled.match(result)) {
          // Refresh categories list after successful update
          dispatch(getCategoryThunk(undefined));
          setIsFormOpen(false);
          resetForm(formik);
        }
      } else {
        // Create FormData for multipart/form-data request
        const formDataToSend = new FormData();
        
        // Add text fields
        formDataToSend.append('name', values.name.trim());
        if (values.prompt && values.prompt.trim()) {
          formDataToSend.append('prompt', values.prompt.trim());
        }
        formDataToSend.append('status', values.status.toString());
        formDataToSend.append('isAndroid', values.isAndroid.toString());
        formDataToSend.append('isIos', values.isIos.toString());
        
        // Add new country and app version fields
        if (values.country && values.country.trim()) {
          formDataToSend.append('country', values.country.trim());
        }
        if (values.android_appVersion && values.android_appVersion.trim()) {
          formDataToSend.append('android_appVersion', values.android_appVersion.trim());
        }
        if (values.ios_appVersion && values.ios_appVersion.trim()) {
          formDataToSend.append('ios_appVersion', values.ios_appVersion.trim());
        }
        
        // Add image files
        if (selectedFiles.imageSquare) {
          formDataToSend.append('img_sqr', selectedFiles.imageSquare);
        }
        
        if (selectedFiles.imageRectangle) {
          formDataToSend.append('img_rec', selectedFiles.imageRectangle);
        }
        
        // Add video files
        if (selectedFiles.videoSquare) {
          formDataToSend.append('video_sqr', selectedFiles.videoSquare);
        }
        
        if (selectedFiles.videoRectangle) {
          formDataToSend.append('video_rec', selectedFiles.videoRectangle);
        }

        // Call API
        const result = await dispatch(createCategoryThunk(formDataToSend));
        
        if (createCategoryThunk.fulfilled.match(result)) {
          // Refresh categories list after successful creation
          dispatch(getCategoryThunk(undefined));
          setIsFormOpen(false);
          resetForm(formik);
        }
      }
    },
    enableReinitialize: true,
  });

  const handleDelete = async () => {
    if (deleteCategory && deleteCategory._id) {
      const result = await dispatch(deleteCategoryThunk(deleteCategory._id));
      
      if (deleteCategoryThunk.fulfilled.match(result)) {
        // Refresh categories list after successful deletion
        dispatch(getCategoryThunk(undefined));
        setDeleteCategory(null);
      }
    }
  };

  const handleStatusToggle = async (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => {
    if (!item._id) {
      toast.error('Category ID is missing');
      return;
    }

    // Toggle the status (opposite of current status)
    const newStatus = !item.status;

    const result = await dispatch(toggleCategoryStatusThunk({ id: item._id, status: newStatus }));
    
    if (toggleCategoryStatusThunk.fulfilled.match(result)) {
      // Refresh categories list after successful status toggle
      // Note: Backend automatically sets Android/iOS to false when status is false
      dispatch(getCategoryThunk(undefined));
    }
  };

  const handleAndroidActiveToggle = async (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => {
    if (!item._id) {
      toast.error('Category ID is missing');
      return;
    }

    // Can only toggle if status is true
    if (!item.status) {
      toast.error('Cannot enable Android activation. Category must be active first.');
      return;
    }

    const newAndroidActive = !(item.isAndroid ?? false);

    const result = await dispatch(toggleCategoryAndroidActiveThunk({ id: item._id, isAndroid: newAndroidActive }));
    
    if (toggleCategoryAndroidActiveThunk.fulfilled.match(result)) {
      // Update local state directly instead of refreshing entire list
      const index = categories.findIndex(cat => cat._id === item._id);
      if (index !== -1) {
        const updatedCategories = [...categories];
        updatedCategories[index] = { ...updatedCategories[index], isAndroid: newAndroidActive, isIos: updatedCategories[index].isIos };
        setCategories(updatedCategories);
      }
    }
  };

  const handleIOSActiveToggle = async (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => {
    if (!item._id) {
      toast.error('Category ID is missing');
      return;
    }

    // Can only toggle if status is true
    if (!item.status) {
      toast.error('Cannot enable iOS activation. Category must be active first.');
      return;
    }

    const newIOSActive = !(item.isIos ?? false);

    const result = await dispatch(toggleCategoryIOSActiveThunk({ id: item._id, isIos: newIOSActive }));
    
    if (toggleCategoryIOSActiveThunk.fulfilled.match(result)) {
      // Update local state directly instead of refreshing entire list
      const index = categories.findIndex(cat => cat._id === item._id);
      if (index !== -1) {
        const updatedCategories = [...categories];
        updatedCategories[index] = { ...updatedCategories[index], isAndroid: updatedCategories[index].isAndroid, isIos: newIOSActive };
        setCategories(updatedCategories);
      }
    }
  };

  const handlePremiumToggle = async (item: Category & { _id?: string; isPremium?: boolean }) => {
    if (!item._id) {
      toast.error('Category ID is missing');
      return;
    }

    const result = await dispatch(toggleCategoryPremiumThunk(item._id));
    
    if (toggleCategoryPremiumThunk.fulfilled.match(result)) {
      // Refresh categories list after successful premium toggle
      dispatch(getCategoryThunk(undefined));
    }
  };

  const handleOpenImageForm = (category: Category & { _id?: string; isPremium?: boolean; images?: AssetImage[] }) => {
    // Find the latest category data from state
    const latestCategory = categories.find(cat => cat._id === category._id);
    setSelectedCategory(latestCategory || category);
    setNewImages([]);
    setEditingAsset(null);
    setEditingAssetPrompt(null);
    setSelectedAssets([]); // Clear selection when opening form
    setIsImageFormOpen(true);
  };

  // Handle asset selection
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Handle select all assets
  const handleSelectAllAssets = () => {
    if (selectedCategory?.images) {
      if (selectedAssets.length === selectedCategory.images.length) {
        setSelectedAssets([]);
      } else {
        setSelectedAssets(selectedCategory.images.map((asset: AssetImage) => asset._id));
      }
    }
  };

  // Handle bulk delete
  const handleBulkDeleteAssets = () => {
    if (selectedAssets.length === 0) {
      toast.error("Please select at least one asset to delete");
      return;
    }
    if (selectedCategory && selectedCategory._id) {
      setDeleteImage({
        categoryId: selectedCategory._id,
        assetId: selectedAssets.join(","), // Pass comma-separated IDs
        imageUrl: "", // Not used for bulk delete
      });
    }
  };

  // Debounced handlers for asset operations
  const debouncedAssetPremiumToggle = useCallback(
    debounce(async (asset: AssetImage, newPremiumValue: boolean) => {
      if (selectedCategory && selectedCategory._id) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), isPremium: newPremiumValue });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateCategoryAssetThunk({
              id: selectedCategory._id,
              data: {
                assetId: asset._id,
                isPremium: newPremiumValue,
              },
            })
          );

          if (updateCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh categories to get updated asset data
            dispatch(getCategoryThunk(undefined));
          } else {
            // Revert optimistic update on failure
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
          }
        } finally {
          setAssetLoadingStates(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset._id);
            return newSet;
          });
        }
      }
    }, 300),
    [selectedCategory, dispatch]
  );

  const debouncedAssetImageCountChange = useCallback(
    debounce(async (asset: AssetImage, newCount: number) => {
      if (selectedCategory && selectedCategory._id && newCount > 0) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), imageCount: newCount });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateCategoryAssetThunk({
              id: selectedCategory._id,
              data: {
                assetId: asset._id,
                imageCount: newCount,
              },
            })
          );

          if (updateCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh categories to get updated asset data
            dispatch(getCategoryThunk(undefined));
            setEditingAsset(null);
          } else {
            // Revert optimistic update on failure
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
          }
        } finally {
          setAssetLoadingStates(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset._id);
            return newSet;
          });
        }
      }
    }, 300),
    [selectedCategory, dispatch]
  );

  const debouncedAssetPromptChange = useCallback(
    debounce(async (asset: AssetImage, newPrompt: string) => {
      if (selectedCategory && selectedCategory._id) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), prompt: newPrompt });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateCategoryAssetThunk({
              id: selectedCategory._id,
              data: {
                assetId: asset._id,
                prompt: newPrompt.trim(),
              },
            })
          );

          if (updateCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh categories to get updated asset data
            dispatch(getCategoryThunk(undefined));
            setEditingAssetPrompt(null);
          } else {
            // Revert optimistic update on failure
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
          }
        } finally {
          setAssetLoadingStates(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset._id);
            return newSet;
          });
        }
      }
    }, 500), // Longer debounce for text input
    [selectedCategory, dispatch]
  );

  const debouncedAssetCountryChange = useCallback(
    debounce(async (asset: AssetImage, newCountry: string) => {
      if (selectedCategory && selectedCategory._id) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), country: newCountry });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateCategoryAssetThunk({
              id: selectedCategory._id,
              data: {
                assetId: asset._id,
                country: newCountry.trim(),
              },
            })
          );

          if (updateCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh categories to get updated asset data
            dispatch(getCategoryThunk(undefined));
          } else {
            // Revert optimistic update on failure
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
          }
        } finally {
          setAssetLoadingStates(prev => {
            const newSet = new Set(prev);
            newSet.delete(asset._id);
            return newSet;
          });
        }
      }
    }, 300),
    [selectedCategory, dispatch]
  );

  const handleBulkCountryChange = async (newCountry: string) => {
    if (selectedCategory && selectedCategory._id && selectedAssets.length > 0) {
      // Update each selected asset sequentially
      let successCount = 0;
      let failCount = 0;

      for (const assetId of selectedAssets) {
        try {
          const result = await dispatch(
            updateCategoryAssetThunk({
              id: selectedCategory._id,
              data: {
                assetId: assetId,
                country: newCountry.trim(),
              },
            })
          );

          if (updateCategoryAssetThunk.fulfilled.match(result)) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error("Error updating asset country:", error);
          failCount++;
        }
      }

      // Show success/error messages
      if (successCount > 0) {
        toast.success(
          `Successfully updated country for ${successCount} asset(s)${
            failCount > 0 ? `. ${failCount} failed.` : ""
          }`
        );
        // Refresh categories after bulk update
        dispatch(getCategoryThunk(undefined));
      } else if (failCount > 0) {
        toast.error(`Failed to update country for ${failCount} asset(s)`);
      }
    }
  };

  // Memoized assets with optimistic updates
  const enhancedAssets = useMemo(() => {
    if (!selectedCategory?.images) return [];
    return selectedCategory.images.map(asset => {
      const optimisticUpdate = optimisticAssets.get(asset._id);
      return optimisticUpdate ? { ...asset, ...optimisticUpdate } : asset;
    });
  }, [selectedCategory?.images, optimisticAssets]);

  const handleAssetPremiumToggle = async (asset: AssetImage) => {
    debouncedAssetPremiumToggle(asset, !asset.isPremium);
  };

  const handleAssetImageCountChange = async (
    asset: AssetImage,
    newCount: number
  ) => {
    debouncedAssetImageCountChange(asset, newCount);
  };

  const handleAssetPromptChange = async (
    asset: AssetImage,
    newPrompt: string
  ) => {
    debouncedAssetPromptChange(asset, newPrompt);
  };

  const handleAssetCountryChange = async (
    asset: AssetImage,
    newCountry: string
  ) => {
    debouncedAssetCountryChange(asset, newCountry);
  };

  const handleAssetReorder = async (oldIndex: number, newIndex: number) => {
    if (!selectedCategory || !selectedCategory._id) return;

    // Create a copy of assets and reorder them
    const reorderedAssets = [...enhancedAssets];
    const [movedAsset] = reorderedAssets.splice(oldIndex, 1);
    reorderedAssets.splice(newIndex, 0, movedAsset);

    // Create the API payload with updated order values
    const assetsPayload = reorderedAssets.map((asset, index) => ({
      assetId: asset._id,
      order: index + 1, // API order starts from 1
    }));

    try {
      await dispatch(
        reorderCategoryAssetsThunk({
          id: selectedCategory._id,
          assets: assetsPayload,
        })
      );
      
      // Refresh categories to get the updated order from server
      dispatch(getCategoryThunk(undefined));
    } catch (error) {
      console.error("Error reordering assets:", error);
    }
  };

  // Update selectedCategory when categories changes
  useEffect(() => {
    if (selectedCategory && isImageFormOpen) {
      const updated = categories.find(cat => cat._id === selectedCategory._id);
      if (updated) {
        setSelectedCategory(updated);
      }
    }
  }, [categories, isImageFormOpen]);

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        // Convert any file to base64 for preview (works for any file type)
        const reader = new FileReader();
        reader.onloadend = () => {
          const preview = reader.result as string;
          setNewImages((prev) => [
            ...prev,
            { url: '', file, preview, prompt: '', country: '' },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = '';
    }
  };

  const handleUpdateImagePrompt = (index: number, prompt: string) => {
    setNewImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], prompt };
      return updated;
    });
  };

  const handleUpdateImageCountry = (index: number, country: string) => {
    setNewImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], country };
      return updated;
    });
  };

  const handleRemoveNewImage = (index: number) => {
    const image = newImages[index];
    // Clean up preview URL if exists
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = async () => {
    if (selectedCategory && selectedCategory._id && newImages.length > 0) {
      // Filter only files (not URLs) as API expects files
      const imagesWithFiles = newImages.filter((img) => img.file);

      if (imagesWithFiles.length === 0) {
        toast.error('Please upload image files. URLs are not supported.');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const img of imagesWithFiles) {
        try {
          // Create FormData for each image with its prompt and country
          const formDataToSend = new FormData();
          formDataToSend.append("asset_images", img.file!);
          if (img.prompt && img.prompt.trim()) {
            formDataToSend.append("prompt", img.prompt.trim());
          }
          // Use image's country (which may have been set by common country dropdown)
          if (img.country && img.country.trim()) {
            formDataToSend.append("country", img.country.trim());
          }

          // Call API for each image sequentially
          const result = await dispatch(
            uploadCategoryAssetsThunk({
              id: selectedCategory._id,
              data: formDataToSend,
            })
          );

          if (uploadCategoryAssetsThunk.fulfilled.match(result)) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          failCount++;
        }
      }

      // Show success/error messages
      if (successCount > 0) {
        toast.success(
          `Successfully uploaded ${successCount} image(s)${
            failCount > 0 ? `. ${failCount} failed.` : ""
          }`
        );
      } else if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} image(s)`);
      }

      // Refresh categories to get updated assets
      if (successCount > 0) {
        dispatch(getCategoryThunk(undefined));
      }
      
      // Clean up preview URLs
      newImages.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setNewImages([]);
    }
  };

  const handleDeleteImage = (asset: AssetImage) => {
    if (selectedCategory && selectedCategory._id) {
      setDeleteImage({
        categoryId: selectedCategory._id,
        assetId: asset._id,
        imageUrl: asset.url,
      });
    }
  };

  const confirmDeleteImage = async () => {
    if (deleteImage) {
      const assetIds = deleteImage.assetId.split(",");
      const isBulkDelete = assetIds.length > 1;

      if (isBulkDelete) {
        // For bulk delete, delete multiple assets
        const deletePromises = assetIds.map((assetId) =>
          dispatch(
            deleteCategoryAssetThunk({
              id: deleteImage.categoryId,
              imageUrl: assetId.trim(),
            })
          )
        );

        const results = await Promise.all(deletePromises);
        const successCount = results.filter(
          (result) => deleteCategoryAssetThunk.fulfilled.match(result)
        ).length;

        if (successCount > 0) {
          toast.success(
            `Successfully deleted ${successCount} of ${assetIds.length} asset(s)`
          );
          // Refresh categories to get updated data
          await dispatch(getCategoryThunk(undefined));
          // Clear selected assets
          setSelectedAssets([]);
        }
      } else {
        // Single asset delete
        const result = await dispatch(
          deleteCategoryAssetThunk({
            id: deleteImage.categoryId,
            imageUrl: deleteImage.assetId,
          })
        );

        if (deleteCategoryAssetThunk.fulfilled.match(result)) {
          // Refresh categories to get updated data
          await dispatch(getCategoryThunk(undefined));
          // Clear selected assets if this was a selected asset
          setSelectedAssets(prev => prev.filter(id => id !== deleteImage.assetId));
        }
      }
      // Close dialog
      setDeleteImage(null);
    }
  };

  const handleReorder = (newCategories: (Category & { _id?: string; isPremium?: boolean })[]) => {
    setCategories(newCategories);
    
    // Check if order has changed by comparing _id order
    const newOrder = newCategories.map(cat => cat._id || '').filter(id => id !== '');
    const orderChanged = JSON.stringify(newOrder) !== JSON.stringify(originalOrder);
    setHasOrderChanged(orderChanged);
  };

  const handleSaveOrderChanges = async () => {
    // Prepare data for API call
    const categoriesData = categories
      .filter(cat => cat._id) // Only include categories with _id
      .map((cat, index) => ({
        _id: cat._id!,
        order: cat.order || index + 1,
      }));

    if (categoriesData.length === 0) {
      toast.error('No categories to reorder');
      return;
    }

    const result = await dispatch(reorderCategoryThunk({ categories: categoriesData }));
    
    if (reorderCategoryThunk.fulfilled.match(result)) {
      // Update originalOrder to current order after successful save
      const newOrder = categories.map(cat => cat._id || '').filter(id => id !== '');
      setOriginalOrder(newOrder);
      setHasOrderChanged(false);
      // Refresh categories list to get updated order from server
      dispatch(getCategoryThunk(undefined));
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Category Name',
      render: (item: Category & { _id?: string }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium block truncate max-w-[200px] mx-auto" title={item.name}>
                {item.name}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'imageSquare',
      header: 'Image Square',
      render: (item: Category & { _id?: string }) => (
        item.imageSquare ? (
          <div className="flex justify-center">
            <img
              src={item.imageSquare}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover border border-border mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.na-placeholder')) {
                  const naSpan = document.createElement('span');
                  naSpan.className = 'text-muted-foreground text-sm na-placeholder';
                  naSpan.textContent = 'N/A';
                  parent.appendChild(naSpan);
                }
              }}
            />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )
      ),
    },
    {
      key: 'imageRectangle',
      header: 'Image Rectangle',
      render: (item: Category & { _id?: string }) => (
        item.imageRectangle ? (
          <div className="flex justify-center">
            <img
              src={item.imageRectangle}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover border border-border mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.na-placeholder')) {
                  const naSpan = document.createElement('span');
                  naSpan.className = 'text-muted-foreground text-sm na-placeholder';
                  naSpan.textContent = 'N/A';
                  parent.appendChild(naSpan);
                }
              }}
            />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )
      ),
    },
    {
      key: 'videoSquare',
      header: 'Video Square',
      render: (item: Category & { _id?: string }) => (
        isUsableMediaSrc(item.videoSquare) ? (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <video
                      src={item.videoSquare}
                      className="w-16 h-16 rounded-lg object-cover border border-border bg-black cursor-pointer"
                      controls={false}
                      muted
                      onMouseEnter={(e) => {
                        void e.currentTarget.play().catch(() => undefined);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                      onClick={(e) => {
                        if (e.currentTarget.paused) {
                          void e.currentTarget.play().catch(() => undefined);
                        } else {
                          e.currentTarget.pause();
                        }
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-all">{item.videoSquare}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )
      ),
    },
    {
      key: 'videoRectangle',
      header: 'Video Rectangle',
      render: (item: Category & { _id?: string }) => (
        isUsableMediaSrc(item.videoRectangle) ? (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <video
                      src={item.videoRectangle}
                      className="w-24 h-16 rounded-lg object-cover border border-border bg-black cursor-pointer"
                      controls={false}
                      muted
                      onMouseEnter={(e) => {
                        void e.currentTarget.play().catch(() => undefined);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                      onClick={(e) => {
                        if (e.currentTarget.paused) {
                          void e.currentTarget.play().catch(() => undefined);
                        } else {
                          e.currentTarget.pause();
                        }
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs break-all">{item.videoRectangle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )
      ),
    },
    {
      key: 'android_appVersion',
      header: 'Android App Version',
      render: (item: Category & { _id?: string }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium block truncate max-w-[150px] mx-auto text-center" title={item.android_appVersion || 'N/A'}>
                {item.android_appVersion || <span className="text-muted-foreground">N/A</span>}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.android_appVersion || 'N/A'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'ios_appVersion',
      header: 'iOS App Version',
      render: (item: Category & { _id?: string }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium block truncate max-w-[150px] mx-auto text-center" title={item.ios_appVersion || 'N/A'}>
                {item.ios_appVersion || <span className="text-muted-foreground">N/A</span>}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.ios_appVersion || 'N/A'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (item: Category & { _id?: string }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-medium block truncate max-w-[150px] mx-auto text-center" title={item.country || 'N/A'}>
                {item.country || <span className="text-muted-foreground">N/A</span>}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.country || 'N/A'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => (
        <div className="flex justify-center">
          <Switch
            checked={item.status}
            onCheckedChange={() => handleStatusToggle(item)}
          />
        </div>
      ),
    },
    {
      key: 'isAndroid',
      header: 'Android',
      render: (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => (
        <div className="flex justify-center">
          <Switch
            checked={item.isAndroid ?? false}
            disabled={!item.status}
            onCheckedChange={() => handleAndroidActiveToggle(item)}
          />
        </div>
      ),
    },
    {
      key: 'isIos',
      header: 'iOS',
      render: (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => (
        <div className="flex justify-center">
          <Switch
            checked={item.isIos ?? false}
            disabled={!item.status}
            onCheckedChange={() => handleIOSActiveToggle(item)}
          />
        </div>
      ),
    },
    {
      key: 'isPremium',
      header: 'Premium',
      render: (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => (
        <div className="flex justify-center">
          <Switch
            checked={item.isPremium ?? false}
            onCheckedChange={() => handlePremiumToggle(item)}
          />
        </div>
      ),
    },
    {
      key: 'images',
      header: 'Images',
      render: (item: Category & { _id?: string; isPremium?: boolean; images?: AssetImage[] }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenImageForm(item)}
          className="gap-2"
        >
          <Images className="w-4 h-4" />
          {(item.images && item.images.length > 0) ? item.images.length : 0}
        </Button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Category & { _id?: string; isPremium?: boolean; isAndroid?: boolean; isIos?: boolean }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
            handleOpenForm(item, formik);
          }}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteCategory(item)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Categories</h1>
        <Button onClick={() => handleOpenForm(undefined, formik)} className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      ) : (
        <>
          {hasOrderChanged && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  You have unsaved changes to the category order.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to original order
                    const originalCategories = [...categories].sort((a, b) => {
                      const aIndex = originalOrder.indexOf(a._id || '');
                      const bIndex = originalOrder.indexOf(b._id || '');
                      return aIndex - bIndex;
                    });
                    setCategories(originalCategories);
                    setHasOrderChanged(false);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveOrderChanges}
                  className="gradient-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
          <DraggableTable
            columns={columns}
            data={categories}
            onReorder={handleReorder}
          />
        </>
      )}

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          resetForm(formik);
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingCategory ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} className="space-y-6 mt-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter category name"
                className={`h-11 ${formik.touched.name && formik.errors.name ? 'border-destructive' : ''}`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-destructive mt-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Prompt Field */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-semibold">
                Prompt
              </Label>
              <Textarea
                id="prompt"
                name="prompt"
                value={formik.values.prompt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter prompt"
                className={`min-h-[100px] ${formik.touched.prompt && formik.errors.prompt ? 'border-destructive' : ''}`}
              />
              {formik.touched.prompt && formik.errors.prompt && (
                <p className="text-xs text-destructive mt-1">{formik.errors.prompt}</p>
              )}
            </div>

            {/* Country and App Version Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold">
                  Country
                </Label>
                <CountrySelect
                  value={formik.values.country || ''}
                  onValueChange={(value) => formik.setFieldValue('country', value)}
                  placeholder="Select country"
                  triggerClassName="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="android_appVersion" className="text-sm font-semibold">
                  Android App Version
                </Label>
                <Input
                  id="android_appVersion"
                  name="android_appVersion"
                  value={formik.values.android_appVersion || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Android version"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ios_appVersion" className="text-sm font-semibold">
                  iOS App Version
                </Label>
                <Input
                  id="ios_appVersion"
                  name="ios_appVersion"
                  value={formik.values.ios_appVersion || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter iOS version "
                  className="h-11"
                />
              </div>
            </div>

            {/* Image Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageSquare" className="text-sm font-semibold">
                  Image Square
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.imageSquare}
                    type="file"
                    id="imageSquare"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('imageSquare', file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.imageSquare.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.imageSquare ? selectedFiles.imageSquare.name : 'Select Square Image'}
                    </span>
                  </Button>
                  {formik.values.imageSquare && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        <img
                          src={formik.values.imageSquare}
                          alt="Square preview"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform"
                          onClick={() => {
                            formik.setFieldValue('imageSquare', '');
                            setSelectedFiles(prev => ({ ...prev, imageSquare: null }));
                            setRemovedFields(prev => new Set(prev).add('imageSquare'));
                            if (fileInputRefs.imageSquare.current) {
                              fileInputRefs.imageSquare.current.value = '';
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageRectangle" className="text-sm font-semibold">
                  Image Rectangle
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.imageRectangle}
                    type="file"
                    id="imageRectangle"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('imageRectangle', file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.imageRectangle.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.imageRectangle ? selectedFiles.imageRectangle.name : 'Select Rectangle Image'}
                    </span>
                  </Button>
                  {formik.values.imageRectangle && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        <img
                          src={formik.values.imageRectangle}
                          alt="Rectangle preview"
                          className="w-36 h-24 rounded-lg object-cover border-2 border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform"
                          onClick={() => {
                            formik.setFieldValue('imageRectangle', '');
                            setSelectedFiles(prev => ({ ...prev, imageRectangle: null }));
                            setRemovedFields(prev => new Set(prev).add('imageRectangle'));
                            if (fileInputRefs.imageRectangle.current) {
                              fileInputRefs.imageRectangle.current.value = '';
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoSquare" className="text-sm font-semibold">
                  Video Square
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.videoSquare}
                    type="file"
                    id="videoSquare"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('videoSquare', file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.videoSquare.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.videoSquare ? selectedFiles.videoSquare.name : 'Select Square Video'}
                    </span>
                  </Button>
                  {formik.values.videoSquare && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        {(() => {
                          const src = videoPreviews.videoSquare || formik.values.videoSquare;
                          if (!isUsableMediaSrc(src)) return null;
                          return (
                        <video
                          src={src}
                          className="w-48 h-48 rounded-lg object-cover border-2 border-border bg-black"
                          controls 
                        />
                          );
                        })()}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                          onClick={() => {
                            if (videoPreviews.videoSquare) {
                              URL.revokeObjectURL(videoPreviews.videoSquare);
                            }
                            formik.setFieldValue('videoSquare', '');
                            setSelectedFiles(prev => ({ ...prev, videoSquare: null }));
                            setVideoPreviews(prev => ({ ...prev, videoSquare: '' }));
                            setRemovedFields(prev => new Set(prev).add('videoSquare'));
                            if (fileInputRefs.videoSquare.current) {
                              fileInputRefs.videoSquare.current.value = '';
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground truncate max-w-[192px]" title={formik.values.videoSquare}>
                        {formik.values.videoSquare}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoRectangle" className="text-sm font-semibold">
                  Video Rectangle
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.videoRectangle}
                    type="file"
                    id="videoRectangle"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange('videoRectangle', file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.videoRectangle.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.videoRectangle ? selectedFiles.videoRectangle.name : 'Select Rectangle Video'}
                    </span>
                  </Button>
                  {formik.values.videoRectangle && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        {(() => {
                          const src = videoPreviews.videoRectangle || formik.values.videoRectangle;
                          if (!isUsableMediaSrc(src)) return null;
                          return (
                        <video
                          src={src}
                          className="w-64 h-36 rounded-lg object-cover border-2 border-border bg-black"
                          controls
                        />
                          );
                        })()}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                          onClick={() => {
                            if (videoPreviews.videoRectangle) {
                              URL.revokeObjectURL(videoPreviews.videoRectangle);
                            }
                            formik.setFieldValue('videoRectangle', '');
                            setSelectedFiles(prev => ({ ...prev, videoRectangle: null }));
                            setVideoPreviews(prev => ({ ...prev, videoRectangle: '' }));
                            setRemovedFields(prev => new Set(prev).add('videoRectangle'));
                            if (fileInputRefs.videoRectangle.current) {
                              fileInputRefs.videoRectangle.current.value = '';
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground truncate max-w-[256px]" title={formik.values.videoRectangle}>
                        {formik.values.videoRectangle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="status" className="text-sm font-semibold cursor-pointer">
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable this category
                </p>
              </div>
              <Switch
                id="status"
                name="status"
                checked={formik.values.status}
                onCheckedChange={(checked) => {
                  formik.setFieldValue('status', checked);
                  // CRITICAL: If status is set to false, automatically disable Android and iOS
                  if (!checked) {
                    formik.setFieldValue('isAndroid', false);
                    formik.setFieldValue('isIos', false);
                  }
                }}
              />
            </div>

            {/* Android Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="isAndroid" className={`text-sm font-semibold ${!formik.values.status ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  Active This Category For Android
                </Label>
                <p className="text-xs text-muted-foreground">
                  {!formik.values.status 
                    ? "Enable Active Status to manage platform availability"
                    : "Enable or disable this category for Android"}
                </p>
              </div>
              <Switch
                id="isAndroid"
                name="isAndroid"
                checked={formik.values.isAndroid}
                disabled={!formik.values.status}
                onCheckedChange={(checked) => formik.setFieldValue('isAndroid', checked)}
              />
            </div>

            {/* iOS Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="isIos" className={`text-sm font-semibold ${!formik.values.status ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  Active This Category For iOS
                </Label>
                <p className="text-xs text-muted-foreground">
                  {!formik.values.status 
                    ? "Enable Active Status to manage platform availability"
                    : "Enable or disable this category for iOS"}
                </p>
              </div>
              <Switch
                id="isIos"
                name="isIos"
                checked={formik.values.isIos}
                disabled={!formik.values.status}
                onCheckedChange={(checked) => formik.setFieldValue('isIos', checked)}
              />
            </div>

            <DialogFooter className="gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm(formik);
                }}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-primary text-primary-foreground min-w-[100px]"
                disabled={loading}
              >
                {loading ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog
        open={isImageFormOpen}
        onOpenChange={(open) => {
          setIsImageFormOpen(open);
          if (!open) {
            // Clean up preview URLs when closing
            newImages.forEach((img) => {
              if (img.preview) {
                URL.revokeObjectURL(img.preview);
              }
            });
            setNewImages([]);
            setEditingAsset(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">
              Manage Images - {selectedCategory?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add or remove images for this category. You can upload image files.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 mt-6">
            {/* Add New Images Section */}
            <div className="space-y-6 p-6 border-2 border-dashed border-border rounded-xl bg-muted/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  <Label className="text-lg font-semibold text-foreground">Add New Images</Label>
                </div>

                {/* File Upload Option */}
                <div className="space-y-2">
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="w-full h-14 border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <Upload className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-base font-medium">Upload Image Files</span>
                  </Button>
                </div>
              </div>

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-sm font-semibold">
                      New Images ({newImages.length})
                    </Label>
                    {/* Common Country Dropdown for All Images */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">
                        Country for All:
                      </Label>
                      <CountrySelect
                        value={commonCountryForNewImages}
                        onValueChange={(value) => {
                          setCommonCountryForNewImages(value);
                          // Apply common country to all images
                          setNewImages((prev) =>
                            prev.map((img) => ({
                              ...img,
                              country: value, // Apply to all images
                            }))
                          );
                        }}
                        placeholder="Select country for all..."
                        triggerClassName="h-9 w-[200px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative group space-y-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted">
                          {img.preview ? (
                            <img
                              src={img.preview}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : img.url ? (
                            <img
                              src={img.url}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.error-placeholder')) {
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'error-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-destructive/10';
                                  errorDiv.textContent = 'Invalid URL';
                                  parent.appendChild(errorDiv);
                                }
                              }}
                            />
                          ) : null}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
                            onClick={() => handleRemoveNewImage(idx)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          {img.file && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                              {img.file.name}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Prompt (Optional)
                          </Label>
                          <Input
                            type="text"
                            placeholder="Enter prompt for this image..."
                            value={img.prompt || ''}
                            onChange={(e) => handleUpdateImagePrompt(idx, e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>

                        {/* Country Dropdown */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Country (Optional)
                          </Label>
                          <CountrySelect
                            value={img.country || ''}
                            onValueChange={(value) => handleUpdateImageCountry(idx, value)}
                            placeholder="Select country..."
                            triggerClassName="h-9 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleAddImages}
                    className="w-full gradient-primary text-primary-foreground"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Adding Images...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Add {newImages.length} Image(s)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Existing Assets Section */}
            <div className="space-y-6 border-t pt-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Images className="w-4 h-4 text-primary" />
                    </div>
                    <Label className="text-lg font-semibold text-foreground">
                      Assets ({enhancedAssets.length})
                    </Label>
                  </div>
                  {enhancedAssets.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-assets"
                        checked={
                          enhancedAssets.length > 0 &&
                          selectedAssets.length === enhancedAssets.length
                        }
                        onCheckedChange={handleSelectAllAssets}
                      />
                      <Label
                        htmlFor="select-all-assets"
                        className="text-sm cursor-pointer"
                      >
                        Select All ({selectedAssets.length} selected)
                      </Label>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedAssets.length > 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">
                          Update Country:
                        </Label>
                        <CountrySelect
                          value=""
                          onValueChange={handleBulkCountryChange}
                          placeholder="Select country..."
                          triggerClassName="h-9 w-[200px]"
                          showClearButton={false}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDeleteAssets}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected ({selectedAssets.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {enhancedAssets.length > 0 ? (
                <VirtualizedAssetGrid
                  assets={enhancedAssets}
                  selectedAssets={selectedAssets}
                  onAssetSelect={handleAssetSelect}
                  onDeleteImage={handleDeleteImage}
                  onViewImage={(asset) =>
                    setViewingImage({
                      url: asset.url,
                      assetId: asset._id,
                    })
                  }
                  onPremiumToggle={handleAssetPremiumToggle}
                  onImageCountChange={handleAssetImageCountChange}
                  onPromptChange={handleAssetPromptChange}
                  onCountryChange={handleAssetCountryChange}
                  editingAsset={editingAsset}
                  editingAssetPrompt={editingAssetPrompt}
                  setEditingAsset={setEditingAsset}
                  setEditingAssetPrompt={setEditingAssetPrompt}
                  loading={assetLoadingStates.has(editingAsset?.assetId || '')}
                  containerHeight={384}
                  itemHeight={320}
                  columns={3}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No assets found</p>
                  <p className="text-xs mt-1">Upload files to add assets</p>
                </div>
              )}
            </div>

            {/* Empty State - Only show if no new images and no existing images */}
            {newImages.length === 0 &&
              enhancedAssets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Images className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No images added yet</p>
                  <p className="text-sm mt-1">Upload files to get started</p>
                </div>
              )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsImageFormOpen(false);
                // Clean up preview URLs
                newImages.forEach((img) => {
                  if (img.preview) {
                    URL.revokeObjectURL(img.preview);
                  }
                });
                setNewImages([]);
              }}
              className="min-w-[100px]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog
        open={!!deleteImage}
        onOpenChange={() => setDeleteImage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this asset?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset image from the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full Size Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">
              Manage Images - {selectedCategory?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add or remove images for this category. You can upload files or
              add image URLs.
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
            {/* Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20"
              onClick={() => setViewingImage(null)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Full Size Image */}
            {viewingImage && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={viewingImage.url}
                  alt="Full size asset"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.error-placeholder')) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'error-placeholder w-full h-full flex flex-col items-center justify-center text-white bg-destructive/20 rounded-lg p-4';
                      errorDiv.innerHTML = `
                        <p class="text-lg font-medium mb-2">Failed to load image</p>
                        <p class="text-sm text-white/60 break-all max-w-md text-center">${viewingImage.url}</p>
                      `;
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
              </div>
            )}

            {/* Image URL Info - Bottom */}
            {viewingImage && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-white/80 truncate text-center cursor-help">
                        {viewingImage.url}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-md break-all text-xs">
                        {viewingImage.url}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "{deleteCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
