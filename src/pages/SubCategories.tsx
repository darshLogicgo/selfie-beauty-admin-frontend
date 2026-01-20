import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Plus, Pencil, Trash2, Images, X, Upload, Video, ChevronUp, ChevronDown, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountrySelect from "@/components/ui/CountrySelect";
import DraggableTable from "@/components/ui/DraggableTable";
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
import { SubCategory } from "@/data/mockData";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
  reorderSubCategoryAssetsThunk,
} from "@/store/subcategory/thunk";
import { getCategoryTitlesThunk } from "@/store/category/thunk";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  getCountryShortName,
} from "@/constants/countries";

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Virtual Scrolling Component for Asset Grid
const VirtualAssetGrid = memo(({
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
  containerHeight?: number;
  itemHeight?: number;
  columns?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const itemsPerRow = columns;
  const rowHeight = itemHeight;
  const totalRows = Math.ceil(assets.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;
  
  const visibleStart = Math.floor(scrollTop / rowHeight);
  const visibleEnd = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight) + 1
  );
  
  const visibleItems = useMemo(() => {
    const items: AssetImage[] = [];
    for (let row = visibleStart; row <= visibleEnd; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < assets.length) {
          items.push(assets[index]);
        }
      }
    }
    return items;
  }, [assets, visibleStart, visibleEnd, itemsPerRow]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  // For small datasets, render normally without virtualization
  if (assets.length <= 30) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg bg-muted/30 max-h-96 overflow-y-auto">
        {assets.map((asset: AssetImage) => (
          <AssetCard
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
    );
  }
  
  return (
    <div className="border rounded-lg bg-muted/30">
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: visibleStart * rowHeight,
              left: 0,
              right: 0,
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
              {visibleItems.map((asset: AssetImage) => (
                <AssetCard
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
          </div>
        </div>
      </div>
    </div>
  );
});

VirtualAssetGrid.displayName = 'VirtualAssetGrid';

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

// Extended SubCategory with _id for API calls
interface SubCategoryWithId extends SubCategory {
  _id?: string;
  categoryId?: string;
  img_sqr?: string;
  img_rec?: string;
  video_sqr?: string;
  video_rec?: string;
  isPremium?: boolean;
  country?: string;
  android_appVersion?: string;
  ios_appVersion?: string;
  isAndroid?: boolean;
  isIos?: boolean;
}

// API Response Type
interface ApiSubCategory {
  _id: string;
  categoryId: string;
  subcategoryTitle: string;
  img_sqr: string;
  img_rec: string;
  video_sqr: string;
  video_rec: string;
  status: boolean;
  asset_images: string[];
  isAiWorld: boolean;
  aiWorldOrder: number;
  isPremium?: boolean;
  order: number;
  country?: string;
  android_appVersion?: string;
  ios_appVersion?: string;
  isAndroid?: boolean;
  isIos?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Yup validation schema
const subCategorySchema = yup.object().shape({
  categoryId: yup.string().required("Category is required"),
  name: yup
    .string()
    .trim()
    .required("Subcategory name is required")
    .max(100, "Subcategory name must be at most 100 characters"),
  country: yup.string().trim().optional(),
  android_appVersion: yup.string().trim().optional(),
  ios_appVersion: yup.string().trim().optional(),
  img_sqr: yup.mixed<File | string>().optional(),
  img_rec: yup.mixed<File | string>().optional(),
  video_sqr: yup.mixed<File | string>().optional(),
  video_rec: yup.mixed<File | string>().optional(),
  status: yup.boolean().required("Status is required"),
  isAndroid: yup.boolean().optional(),
  isIos: yup.boolean().optional(),
});

// Asset type based on API response
interface AssetImage {
  _id: string;
  url: string;
  isPremium: boolean;
  imageCount: number;
  prompt?: string;
  country?: string;
}


// Map API response to component format
const mapApiToComponent = (apiData: ApiSubCategory[]): SubCategoryWithId[] => {
  return apiData.map((item) => ({
    id: parseInt(item._id.slice(-8), 16) || 0, // Convert _id to number for compatibility
    _id: item._id, // Keep original _id for API calls
    name: item.subcategoryTitle,
    image: item.img_sqr,
    video: item.video_sqr || "",
    status: item.status,
    order: item.order,
    images: item.asset_images || [],
    img_sqr: item.img_sqr,
    img_rec: item.img_rec || "",
    video_sqr: item.video_sqr || "",
    video_rec: item.video_rec || "",
    categoryId: item.categoryId, // Store categoryId
    isPremium: item.isPremium ?? false,
    country: getCountryShortName(item.country), // Convert to shortName if needed
    android_appVersion: (item.android_appVersion ?? "") || "",
    ios_appVersion: (item.ios_appVersion ?? "") || "",
    isAndroid: item.isAndroid ?? false,
    isIos: item.isIos ?? false,
  }));
};

const SubCategories: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    data: apiSubCategories,
    dataLoading,
    loading,
    assets,
    assetsPagination,
    assetsLoading,
  } = useAppSelector((state) => state.SubCategory);
  const { titles: categories, titlesLoading: categoriesLoading } =
    useAppSelector((state) => state.Category);

  const [localSubCategories, setLocalSubCategories] = useState<
    SubCategoryWithId[]
  >([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);

  // Map API response to component format and update local state
  useEffect(() => {
    if (apiSubCategories && apiSubCategories.length > 0) {
      const mapped = mapApiToComponent(apiSubCategories);
      setLocalSubCategories(mapped);
      // Store original order of _ids
      const originalIds = mapped
        .map((cat) => cat._id || "")
        .filter((id) => id !== "");
      setOriginalOrder(originalIds);
    } else if (apiSubCategories && apiSubCategories.length === 0) {
      setLocalSubCategories([]);
      setOriginalOrder([]);
    }
  }, [apiSubCategories]);

  const subCategories = localSubCategories;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategoryWithId | null>(null);
  const [deleteSubCategory, setDeleteSubCategory] =
    useState<SubCategoryWithId | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryWithId | null>(null);
  const [deleteImage, setDeleteImage] = useState<{
    subcategoryId: string;
    assetId: string;
    imageUrl: string;
  } | null>(null);
  const [currentAssetPage, setCurrentAssetPage] = useState(1);
  const [editingAsset, setEditingAsset] = useState<{
    assetId: string;
    imageCount: number;
  } | null>(null);
  const [editingAssetPrompt, setEditingAssetPrompt] = useState<{
    assetId: string;
    prompt: string;
  } | null>(null);
  const [editingAssetCountry, setEditingAssetCountry] = useState<{
    assetId: string;
    country: string;
  } | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    assetId: string;
  } | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetLoadingStates, setAssetLoadingStates] = useState<Set<string>>(new Set());
  const [optimisticAssets, setOptimisticAssets] = useState<Map<string, Partial<AssetImage>>>(new Map());

  // Cleanup optimistic updates on unmount
  useEffect(() => {
    return () => {
      setOptimisticAssets(new Map());
      setAssetLoadingStates(new Set());
    };
  }, []);

  // Fetch subcategories and category titles on component mount
  useEffect(() => {
    dispatch(getSubCategoryThunk(undefined));
    dispatch(getCategoryTitlesThunk());
  }, [dispatch]);

  const isUsableMediaSrc = (src: unknown) => {
    if (typeof src !== "string") return false;
    const s = src.trim();
    if (!s || s === "null" || s === "undefined") return false;
    return (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("blob:") ||
      s.startsWith("data:") ||
      s.startsWith("/")
    );
  };

  const [selectedFiles, setSelectedFiles] = useState({
    img_sqr: null as File | null,
    img_rec: null as File | null,
    video_sqr: null as File | null,
    video_rec: null as File | null,
  });

  const [removedFields, setRemovedFields] = useState<Set<string>>(new Set());

  const [videoPreviews, setVideoPreviews] = useState({
    video_sqr: "",
    video_rec: "",
  });

  // Cleanup video preview URLs on unmount
  useEffect(() => {
    return () => {
      if (videoPreviews.video_sqr) {
        URL.revokeObjectURL(videoPreviews.video_sqr);
      }
      if (videoPreviews.video_rec) {
        URL.revokeObjectURL(videoPreviews.video_rec);
      }
    };
  }, [videoPreviews.video_sqr, videoPreviews.video_rec]);

  const fileInputRefs = {
    img_sqr: useRef<HTMLInputElement>(null),
    img_rec: useRef<HTMLInputElement>(null),
    video_sqr: useRef<HTMLInputElement>(null),
    video_rec: useRef<HTMLInputElement>(null),
  };

  const [newImages, setNewImages] = useState<
    Array<{ url: string; file?: File; preview?: string; prompt?: string; country?: string }>
  >([]);
  const [commonCountryForNewImages, setCommonCountryForNewImages] = useState<string>("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    field: "img_sqr" | "img_rec" | "video_sqr" | "video_rec",
    file: File | null,
    formik: any
  ) => {
    if (!file) return;

    if (field.startsWith("img")) {
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
      setVideoPreviews((prev) => ({ ...prev, [field]: fileUrl }));
    }

    setSelectedFiles((prev) => ({ ...prev, [field]: file }));
    // Remove from removedFields if a new file is selected
    setRemovedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  const resetForm = (formik: any) => {
    // Clean up video preview URLs
    if (videoPreviews.video_sqr) {
      URL.revokeObjectURL(videoPreviews.video_sqr);
    }
    if (videoPreviews.video_rec) {
      URL.revokeObjectURL(videoPreviews.video_rec);
    }

    formik.resetForm({
      values: {
        categoryId: "",
        name: "",
        country: "",
        android_appVersion: "",
        ios_appVersion: "",
        img_sqr: "",
        img_rec: "",
        video_sqr: "",
        video_rec: "",
        status: true,
        isAndroid: false,
        isIos: false,
      },
    });
    setSelectedFiles({
      img_sqr: null,
      img_rec: null,
      video_sqr: null,
      video_rec: null,
    });
    setVideoPreviews({
      video_sqr: "",
      video_rec: "",
    });
    setRemovedFields(new Set());
    // Reset file inputs
    Object.values(fileInputRefs).forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
    setEditingSubCategory(null);
  };

  const handleOpenForm = (
    subCategory: SubCategoryWithId | undefined,
    formik: any
  ) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      formik.setValues({
        categoryId: (subCategory as any).categoryId || "",
        name: subCategory.name,
        country: getCountryShortName(subCategory.country), // Ensure shortName is used
        android_appVersion: subCategory.android_appVersion || "",
        ios_appVersion: subCategory.ios_appVersion || "",
        img_sqr: subCategory.img_sqr || "",
        img_rec: subCategory.img_rec || "",
        video_sqr: subCategory.video_sqr || "",
        video_rec: subCategory.video_rec || "",
        status: subCategory.status,
        isAndroid: subCategory.isAndroid ?? false,
        isIos: subCategory.isIos ?? false,
      });
      // Reset file selections when editing (existing data is URL/base64)
      setSelectedFiles({
        img_sqr: null,
        img_rec: null,
        video_sqr: null,
        video_rec: null,
      });
      // Clean up any existing video preview URLs
      if (videoPreviews.video_sqr) {
        URL.revokeObjectURL(videoPreviews.video_sqr);
      }
      if (videoPreviews.video_rec) {
        URL.revokeObjectURL(videoPreviews.video_rec);
      }
      setVideoPreviews({
        video_sqr: "",
        video_rec: "",
      });
    } else {
      resetForm(formik);
    }
    setIsFormOpen(true);
  };

  const handleOpenImageForm = async (subCategory: SubCategoryWithId) => {
    setSelectedSubCategory(subCategory);
    setNewImages([]);
    setCurrentAssetPage(1);
    setSelectedAssets([]); // Clear selection when opening form
    setIsImageFormOpen(true);
    // Fetch assets for this subcategory
    if (subCategory._id) {
      await dispatch(
        getSubCategoryAssetsThunk({
          id: subCategory._id,
          queryParams: { page: 1, limit: 10 },
        })
      );
    }
  };

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
            { url: "", file, preview, prompt: "", country: "" },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = (url: string) => {
    if (url.trim()) {
      setNewImages((prev) => [...prev, { url: url.trim(), prompt: "", country: "" }]);
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

  // Formik form setup
  const formik = useFormik({
    initialValues: {
      categoryId: "",
      name: "",
      country: "",
      android_appVersion: "",
      ios_appVersion: "",
      img_sqr: "",
      img_rec: "",
      video_sqr: "",
      video_rec: "",
      status: true,
      isAndroid: false,
      isIos: false,
    },
    validationSchema: subCategorySchema,
    onSubmit: async (values) => {
      if (editingSubCategory && editingSubCategory._id) {
        // Update FormData for multipart/form-data request
        const formDataToSend = new FormData();

        // Add text fields
        formDataToSend.append("subcategoryTitle", values.name.trim());
        formDataToSend.append("status", values.status.toString());
        
        // Always send isAndroid and isIos (boolean values)
        formDataToSend.append("isAndroid", values.isAndroid.toString());
        formDataToSend.append("isIos", values.isIos.toString());

        // Send country (shortName) if provided
        // The country value is already in shortName format from the dropdown
        if (values.country && values.country.trim()) {
          // Ensure we send the shortName (it should already be shortName from Select)
          const countryShortName = getCountryShortName(values.country);
          formDataToSend.append("country", countryShortName);
        }
        if (values.android_appVersion && values.android_appVersion.trim()) {
          formDataToSend.append(
            "android_appVersion",
            values.android_appVersion.trim()
          );
        }
        if (values.ios_appVersion && values.ios_appVersion.trim()) {
          formDataToSend.append("ios_appVersion", values.ios_appVersion.trim());
        }

        // Always send categoryId when updating (required by validation)
        // Use form value or fallback to existing subcategory's categoryId
        const categoryIdToSend =
          values.categoryId || (editingSubCategory as any).categoryId;
        if (categoryIdToSend) {
          formDataToSend.append("categoryId", categoryIdToSend);
        }

        // Handle img_sqr: new file, removed, or keep existing
        if (selectedFiles.img_sqr) {
          // New file selected
          formDataToSend.append("img_sqr", selectedFiles.img_sqr);
        } else if (removedFields.has("img_sqr")) {
          // Image was explicitly removed
          formDataToSend.append("img_sqr", "null");
        }
        // If neither, don't send (keep existing)

        // Handle img_rec: new file, removed, or keep existing
        if (selectedFiles.img_rec) {
          // New file selected
          formDataToSend.append("img_rec", selectedFiles.img_rec);
        } else if (removedFields.has("img_rec")) {
          // Image was explicitly removed
          formDataToSend.append("img_rec", "null");
        }
        // If neither, don't send (keep existing)

        // Handle video_sqr: new file, removed, or keep existing
        if (selectedFiles.video_sqr) {
          // New file selected
          formDataToSend.append("video_sqr", selectedFiles.video_sqr);
        } else if (removedFields.has("video_sqr")) {
          // Video was explicitly removed
          formDataToSend.append("video_sqr", "null");
        }
        // If neither, don't send (keep existing)

        // Handle video_rec: new file, removed, or keep existing
        if (selectedFiles.video_rec) {
          // New file selected
          formDataToSend.append("video_rec", selectedFiles.video_rec);
        } else if (removedFields.has("video_rec")) {
          // Video was explicitly removed
          formDataToSend.append("video_rec", "null");
        }
        // If neither, don't send (keep existing)

        // Call API
        const result = await dispatch(
          updateSubCategoryThunk({
            id: editingSubCategory._id,
            data: formDataToSend,
          })
        );

        if (updateSubCategoryThunk.fulfilled.match(result)) {
          // Refresh subcategories list after successful update
          dispatch(getSubCategoryThunk(undefined));
          setIsFormOpen(false);
          resetForm(formik);
        }
      } else {
        // Create FormData for multipart/form-data request
        const formDataToSend = new FormData();

        // Add required fields
        formDataToSend.append("categoryId", values.categoryId);
        formDataToSend.append("subcategoryTitle", values.name.trim());
        
        // Always send isAndroid and isIos (boolean values)
        formDataToSend.append("isAndroid", values.isAndroid.toString());
        formDataToSend.append("isIos", values.isIos.toString());

        // Send country (shortName) if provided
        // The country value is already in shortName format from the dropdown
        if (values.country && values.country.trim()) {
          // Ensure we send the shortName (it should already be shortName from Select)
          const countryShortName = getCountryShortName(values.country);
          formDataToSend.append("country", countryShortName);
        }
        if (values.android_appVersion && values.android_appVersion.trim()) {
          formDataToSend.append(
            "android_appVersion",
            values.android_appVersion.trim()
          );
        }
        if (values.ios_appVersion && values.ios_appVersion.trim()) {
          formDataToSend.append("ios_appVersion", values.ios_appVersion.trim());
        }

        // Add image files
        if (selectedFiles.img_sqr) {
          formDataToSend.append("img_sqr", selectedFiles.img_sqr);
        }

        if (selectedFiles.img_rec) {
          formDataToSend.append("img_rec", selectedFiles.img_rec);
        }

        // Add video files
        if (selectedFiles.video_sqr) {
          formDataToSend.append("video_sqr", selectedFiles.video_sqr);
        }

        if (selectedFiles.video_rec) {
          formDataToSend.append("video_rec", selectedFiles.video_rec);
        }

        // Call API
        const result = await dispatch(createSubCategoryThunk(formDataToSend));

        if (createSubCategoryThunk.fulfilled.match(result)) {
          // Refresh subcategories list after successful creation
          dispatch(getSubCategoryThunk(undefined));
          setIsFormOpen(false);
          resetForm(formik);
        }
      }
    },
    enableReinitialize: true,
  });

  const handleDelete = async () => {
    if (deleteSubCategory && deleteSubCategory._id) {
      const result = await dispatch(
        deleteSubCategoryThunk(deleteSubCategory._id)
      );

      if (deleteSubCategoryThunk.fulfilled.match(result)) {
        // Refresh categories list after successful deletion
        dispatch(getSubCategoryThunk(undefined));
        setDeleteSubCategory(null);
      }
    }
  };

  const handleStatusToggle = async (item: SubCategoryWithId) => {
    if (!item._id) {
      toast.error("Subcategory ID is missing");
      return;
    }

    // Toggle the status (opposite of current status)
    const newStatus = !item.status;

    const result = await dispatch(
      toggleSubCategoryStatusThunk({ id: item._id, status: newStatus })
    );

    if (toggleSubCategoryStatusThunk.fulfilled.match(result)) {
      // Refresh categories list after successful status toggle
      dispatch(getSubCategoryThunk(undefined));
    }
  };

  const handlePremiumToggle = async (item: SubCategoryWithId) => {
    if (!item._id) {
      toast.error("Subcategory ID is missing");
      return;
    }

    const result = await dispatch(toggleSubCategoryPremiumThunk(item._id));

    if (toggleSubCategoryPremiumThunk.fulfilled.match(result)) {
      // Refresh subcategories list after successful premium toggle
      dispatch(getSubCategoryThunk(undefined));
    }
  };

  const handleAndroidActiveToggle = async (item: SubCategoryWithId) => {
    if (!item._id) {
      toast.error("Subcategory ID is missing");
      return;
    }

    if (!item.categoryId) {
      toast.error("Category ID is missing for this subcategory");
      return;
    }

    // Can only toggle if status is true
    if (!item.status) {
      toast.error(
        "Cannot enable Android activation. Subcategory must be active first."
      );
      return;
    }

    const newAndroidActive = !(item.isAndroid ?? false);

    const formDataToSend = new FormData();
    formDataToSend.append("isAndroid", newAndroidActive.toString());
    formDataToSend.append("categoryId", item.categoryId);
    if (item.name) {
      formDataToSend.append("subcategoryTitle", item.name.trim());
    }
    // Preserve current iOS value so backend keeps both flags in sync if needed
    formDataToSend.append(
      "isIos",
      (item.isIos ?? false).toString()
    );

    const result = await dispatch(
      updateSubCategoryThunk({
        id: item._id,
        data: formDataToSend,
      })
    );

    if (updateSubCategoryThunk.fulfilled.match(result)) {
      setLocalSubCategories((prev) =>
        prev.map((sub) =>
          sub._id === item._id ? { ...sub, isAndroid: newAndroidActive } : sub
        )
      );
    }
  };

  const handleIOSActiveToggle = async (item: SubCategoryWithId) => {
    if (!item._id) {
      toast.error("Subcategory ID is missing");
      return;
    }

    if (!item.categoryId) {
      toast.error("Category ID is missing for this subcategory");
      return;
    }

    // Can only toggle if status is true
    if (!item.status) {
      toast.error(
        "Cannot enable iOS activation. Subcategory must be active first."
      );
      return;
    }

    const newIOSActive = !(item.isIos ?? false);

    const formDataToSend = new FormData();
    // Preserve current Android value so backend keeps both flags in sync if needed
    formDataToSend.append(
      "isAndroid",
      (item.isAndroid ?? false).toString()
    );
    formDataToSend.append("isIos", newIOSActive.toString());
    formDataToSend.append("categoryId", item.categoryId);
    if (item.name) {
      formDataToSend.append("subcategoryTitle", item.name.trim());
    }

    const result = await dispatch(
      updateSubCategoryThunk({
        id: item._id,
        data: formDataToSend,
      })
    );

    if (updateSubCategoryThunk.fulfilled.match(result)) {
      setLocalSubCategories((prev) =>
        prev.map((sub) =>
          sub._id === item._id ? { ...sub, isIos: newIOSActive } : sub
        )
      );
    }
  };



  const handleReorder = async (reorderedData: SubCategoryWithId[]) => {
    // Update local state immediately for UI feedback
    setLocalSubCategories(reorderedData);

    // Prepare data for API call - backend expects [{ id: string, order: number }]
    const reorderData = reorderedData
      .filter((sub) => sub._id) // Only include subcategories with _id
      .map((sub, index) => ({
        id: sub._id!,
        order: sub.order || index + 1,
      }));

    if (reorderData.length === 0) {
      toast.error("No subcategories to reorder");
      return;
    }

    // Call API to save the new order
    const result = await dispatch(reorderSubCategoryThunk(reorderData));

    if (reorderSubCategoryThunk.fulfilled.match(result)) {
      // Update originalOrder to current order after successful save
      const newOrder = reorderedData
        .map((sub) => sub._id || "")
        .filter((id) => id !== "");
      setOriginalOrder(newOrder);
      // Refresh data to get updated order from backend
      dispatch(getSubCategoryThunk(undefined));
    } else {
      // If reorder failed, revert to original order
      dispatch(getSubCategoryThunk(undefined));
    }
  };

  const handleAddImages = async () => {
    if (
      selectedSubCategory &&
      selectedSubCategory._id &&
      newImages.length > 0
    ) {
      // Filter only files (not URLs) as API expects files
      const imagesWithFiles = newImages.filter((img) => img.file);

      if (imagesWithFiles.length === 0) {
        toast.error("Please upload image files. URLs are not supported.");
        return;
      }

      // Upload each image sequentially to ensure unique order numbers
      // The backend calculates order as max(order) + 1, so sequential uploads
      // ensure each image gets a unique order number
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
            addSubCategoryAssetsThunk({
              id: selectedSubCategory._id,
              formData: formDataToSend,
            })
          );

          if (addSubCategoryAssetsThunk.fulfilled.match(result)) {
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

      // Clean up preview URLs
      newImages.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setNewImages([]);
      setCommonCountryForNewImages(""); // Reset common country after upload

      // Refresh assets after adding images
      if (selectedSubCategory && selectedSubCategory._id) {
        await dispatch(
          getSubCategoryAssetsThunk({
            id: selectedSubCategory._id,
            queryParams: { page: currentAssetPage, limit: 10 },
          })
        );
      }
      // Refresh subcategories list
      dispatch(getSubCategoryThunk(undefined));
    }
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
    if (selectedAssets.length === enhancedAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(enhancedAssets.map((asset: AssetImage) => asset._id));
    }
  };

  // Handle bulk delete
  const handleBulkDeleteAssets = () => {
    if (selectedAssets.length === 0) {
      toast.error("Please select at least one asset to delete");
      return;
    }
    if (selectedSubCategory && selectedSubCategory._id) {
      setDeleteImage({
        subcategoryId: selectedSubCategory._id,
        assetId: selectedAssets.join(","), // Pass comma-separated IDs
        imageUrl: "", // Not used for bulk delete
      });
    }
  };

  const handleDeleteImage = (asset: AssetImage) => {
    if (selectedSubCategory && selectedSubCategory._id) {
      // Set delete image state to show confirmation dialog
      setDeleteImage({
        subcategoryId: selectedSubCategory._id,
        assetId: asset._id,
        imageUrl: asset.url,
      });
    }
  };

  const handleAssetPageChange = async (page: number) => {
    if (selectedSubCategory && selectedSubCategory._id) {
      setCurrentAssetPage(page);
      setSelectedAssets([]); // Clear selection when changing pages
      await dispatch(
        getSubCategoryAssetsThunk({
          id: selectedSubCategory._id,
          queryParams: { page, limit: 10 },
        })
      );
    }
  };

  // Debounced handlers for asset operations
  const debouncedAssetPremiumToggle = useCallback(
    debounce(async (asset: AssetImage, newPremiumValue: boolean) => {
      if (selectedSubCategory && selectedSubCategory._id) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), isPremium: newPremiumValue });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateSubCategoryAssetThunk({
              id: selectedSubCategory._id,
              data: {
                assetId: asset._id,
                isPremium: newPremiumValue,
              },
            })
          );

          if (updateSubCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh assets
            await dispatch(
              getSubCategoryAssetsThunk({
                id: selectedSubCategory._id,
                queryParams: { page: currentAssetPage, limit: 10 },
              })
            );
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
    [selectedSubCategory, currentAssetPage, dispatch]
  );

  const debouncedAssetImageCountChange = useCallback(
    debounce(async (asset: AssetImage, newCount: number) => {
      if (selectedSubCategory && selectedSubCategory._id && newCount > 0) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), imageCount: newCount });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateSubCategoryAssetThunk({
              id: selectedSubCategory._id,
              data: {
                assetId: asset._id,
                imageCount: newCount,
              },
            })
          );

          if (updateSubCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh assets
            await dispatch(
              getSubCategoryAssetsThunk({
                id: selectedSubCategory._id,
                queryParams: { page: currentAssetPage, limit: 10 },
              })
            );
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
    [selectedSubCategory, currentAssetPage, dispatch]
  );

  const debouncedAssetPromptChange = useCallback(
    debounce(async (asset: AssetImage, newPrompt: string) => {
      if (selectedSubCategory && selectedSubCategory._id) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), prompt: newPrompt });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateSubCategoryAssetThunk({
              id: selectedSubCategory._id,
              data: {
                assetId: asset._id,
                prompt: newPrompt.trim(),
              },
            })
          );

          if (updateSubCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh assets
            await dispatch(
              getSubCategoryAssetsThunk({
                id: selectedSubCategory._id,
                queryParams: { page: currentAssetPage, limit: 10 },
              })
            );
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
    [selectedSubCategory, currentAssetPage, dispatch]
  );

  const debouncedAssetCountryChange = useCallback(
    debounce(async (asset: AssetImage, newCountry: string) => {
      if (selectedSubCategory && selectedSubCategory._id) {
        setAssetLoadingStates(prev => new Set(prev).add(asset._id));
        
        // Optimistic update
        setOptimisticAssets(prev => {
          const newMap = new Map(prev);
          newMap.set(asset._id, { ...newMap.get(asset._id), country: newCountry });
          return newMap;
        });

        try {
          const result = await dispatch(
            updateSubCategoryAssetThunk({
              id: selectedSubCategory._id,
              data: {
                assetId: asset._id,
                country: newCountry.trim(),
              },
            })
          );

          if (updateSubCategoryAssetThunk.fulfilled.match(result)) {
            // Clear optimistic update on success
            setOptimisticAssets(prev => {
              const newMap = new Map(prev);
              newMap.delete(asset._id);
              return newMap;
            });
            
            // Refresh assets
            await dispatch(
              getSubCategoryAssetsThunk({
                id: selectedSubCategory._id,
                queryParams: { page: currentAssetPage, limit: 10 },
              })
            );
            setEditingAssetCountry(null);
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
    [selectedSubCategory, currentAssetPage, dispatch]
  );

  // Memoized assets with optimistic updates
  const enhancedAssets = useMemo(() => {
    return assets.map(asset => {
      const optimisticUpdate = optimisticAssets.get(asset._id);
      return optimisticUpdate ? { ...asset, ...optimisticUpdate } : asset;
    });
  }, [assets, optimisticAssets]);

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

  const handleBulkCountryChange = async (newCountry: string) => {
    if (selectedSubCategory && selectedSubCategory._id && selectedAssets.length > 0) {
      // Update each selected asset sequentially
      let successCount = 0;
      let failCount = 0;

      for (const assetId of selectedAssets) {
        try {
          const result = await dispatch(
            updateSubCategoryAssetThunk({
              id: selectedSubCategory._id,
              data: {
                assetId: assetId,
                country: newCountry.trim(),
              },
            })
          );

          if (updateSubCategoryAssetThunk.fulfilled.match(result)) {
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
        // Refresh assets after bulk update
        await dispatch(
          getSubCategoryAssetsThunk({
            id: selectedSubCategory._id,
            queryParams: { page: currentAssetPage, limit: 10 },
          })
        );
      } else if (failCount > 0) {
        toast.error(`Failed to update country for ${failCount} asset(s)`);
      }
    }
  };

  const handleAssetReorder = async (oldIndex: number, newIndex: number) => {
    if (!selectedSubCategory || !selectedSubCategory._id) return;

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
        reorderSubCategoryAssetsThunk({
          id: selectedSubCategory._id,
          assets: assetsPayload,
        })
      );
      
      // Refresh assets to get the updated order from server
      await dispatch(
        getSubCategoryAssetsThunk({
          id: selectedSubCategory._id,
          queryParams: { page: currentAssetPage, limit: 10 },
        })
      );
    } catch (error) {
      console.error("Error reordering assets:", error);
    }
  };

  const confirmDeleteImage = async () => {
    if (deleteImage) {
      const assetIds = deleteImage.assetId.split(",");
      const isBulkDelete = assetIds.length > 1;

      // Delete multiple assets
      if (isBulkDelete) {
        const deletePromises = assetIds.map((assetId) =>
          dispatch(
            deleteSubCategoryAssetThunk({
              id: deleteImage.subcategoryId,
              imageUrl: assetId.trim(),
            })
          )
        );

        const results = await Promise.all(deletePromises);
        const successCount = results.filter(
          (result) => deleteSubCategoryAssetThunk.fulfilled.match(result)
        ).length;

        if (successCount > 0) {
          toast.success(
            `Successfully deleted ${successCount} of ${assetIds.length} asset(s)`
          );
          // Refresh assets
          await dispatch(
            getSubCategoryAssetsThunk({
              id: deleteImage.subcategoryId,
              queryParams: { page: currentAssetPage, limit: 10 },
            })
          );
          // Refresh subcategories list
          dispatch(getSubCategoryThunk(undefined));
          // Clear selected assets
          setSelectedAssets([]);
        }
      } else {
        // Single asset delete
        const result = await dispatch(
          deleteSubCategoryAssetThunk({
            id: deleteImage.subcategoryId,
            imageUrl: deleteImage.assetId,
          })
        );

        if (deleteSubCategoryAssetThunk.fulfilled.match(result)) {
          // Refresh assets
          await dispatch(
            getSubCategoryAssetsThunk({
              id: deleteImage.subcategoryId,
              queryParams: { page: currentAssetPage, limit: 10 },
            })
          );
          // Refresh subcategories list
          dispatch(getSubCategoryThunk(undefined));
        }
      }
      // Close dialog
      setDeleteImage(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Subcategory Name",
      render: (item: SubCategoryWithId) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: "img_sqr",
      header: "Image Square",
      render: (item: SubCategoryWithId) =>
        item.img_sqr ? (
          <div className="flex justify-center">
            <img
              src={item.img_sqr}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover border border-border mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector(".na-placeholder")) {
                  const naSpan = document.createElement("span");
                  naSpan.className =
                    "text-muted-foreground text-sm na-placeholder";
                  naSpan.textContent = "N/A";
                  parent.appendChild(naSpan);
                }
              }}
            />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
    {
      key: "img_rec",
      header: "Image Rectangle",
      render: (item: SubCategoryWithId) =>
        item.img_rec ? (
          <div className="flex justify-center">
            <img
              src={item.img_rec}
              alt={item.name}
              className="w-16 h-16 rounded-lg object-cover border border-border mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector(".na-placeholder")) {
                  const naSpan = document.createElement("span");
                  naSpan.className =
                    "text-muted-foreground text-sm na-placeholder";
                  naSpan.textContent = "N/A";
                  parent.appendChild(naSpan);
                }
              }}
            />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
    {
      key: "video_sqr",
      header: "Video Square",
      render: (item: SubCategoryWithId) =>
        isUsableMediaSrc(item.video_sqr) ? (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <video
                      src={item.video_sqr}
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
                  <p className="max-w-xs break-all">{item.video_sqr}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
    {
      key: "video_rec",
      header: "Video Rectangle",
      render: (item: SubCategoryWithId) =>
        isUsableMediaSrc(item.video_rec) ? (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <video
                      src={item.video_rec}
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
                  <p className="max-w-xs break-all">{item.video_rec}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: SubCategoryWithId) => (
        <div className="flex justify-center">
          <Switch
            checked={item.status}
            onCheckedChange={() => handleStatusToggle(item)}
          />
        </div>
      ),
    },
    {
      key: "isAndroid",
      header: "Android",
      render: (item: SubCategoryWithId) => (
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
      key: "isIos",
      header: "iOS",
      render: (item: SubCategoryWithId) => (
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
      key: "isPremium",
      header: "Premium",
      render: (item: SubCategoryWithId) => (
        <div className="flex justify-center">
          <Switch
            checked={item.isPremium ?? false}
            onCheckedChange={() => handlePremiumToggle(item)}
          />
        </div>
      ),
    },
   
    {
      key: "images",
      header: "Images",
      render: (item: SubCategoryWithId) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenImageForm(item)}
          className="gap-2"
        >
          <Images className="w-4 h-4" />
          {item.images.length}
        </Button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: SubCategoryWithId) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenForm(item, formik)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteSubCategory(item)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Update selectedSubCategory when subCategories changes
  React.useEffect(() => {
    if (selectedSubCategory) {
      const updated = subCategories.find(
        (s) => s.id === selectedSubCategory.id
      );
      if (updated) setSelectedSubCategory(updated);
    }
  }, [subCategories]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Subcategories</h1>
        <Button
          onClick={() => handleOpenForm(undefined, formik)}
          className="gradient-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading subcategories...</p>
        </div>
      ) : (
        <DraggableTable
          columns={columns}
          data={subCategories}
          onReorder={handleReorder}
        />
      )}

      {/* Add/Edit Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            resetForm(formik);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">
              {editingSubCategory ? "Edit Subcategory" : "Add New Subcategory"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingSubCategory
                ? "Update the subcategory details below."
                : "Fill in the details to create a new subcategory."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} className="space-y-6 mt-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-sm font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formik.values.categoryId}
                onValueChange={(value) =>
                  formik.setFieldValue("categoryId", value)
                }
                disabled={categoriesLoading}
              >
                <SelectTrigger
                  id="categoryId"
                  className={`h-11 ${
                    formik.touched.categoryId && formik.errors.categoryId
                      ? "border-destructive"
                      : ""
                  }`}
                >
                  <SelectValue
                    placeholder={
                      categoriesLoading
                        ? "Loading categories..."
                        : "Select a category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No categories available
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formik.touched.categoryId && formik.errors.categoryId && (
                <p className="text-xs text-destructive mt-1">
                  {formik.errors.categoryId}
                </p>
              )}
            </div>

            {/* Subcategory Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Subcategory Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter subcategory name"
                className={`h-11 ${
                  formik.touched.name && formik.errors.name
                    ? "border-destructive"
                    : ""
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold">
                  Country
                </Label>
                <CountrySelect
                  value={formik.values.country || ""}
                  onValueChange={(value) => {
                    formik.setFieldValue("country", value);
                  }}
                  placeholder="Select a country"
                  triggerClassName="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="android_appVersion"
                  className="text-sm font-semibold"
                >
                  Android App Version
                </Label>
                <Input
                  id="android_appVersion"
                  name="android_appVersion"
                  value={formik.values.android_appVersion || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter Android version"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="ios_appVersion"
                  className="text-sm font-semibold"
                >
                  iOS App Version
                </Label>
                <Input
                  id="ios_appVersion"
                  name="ios_appVersion"
                  value={formik.values.ios_appVersion || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter iOS version"
                  className="h-11"
                />
              </div>
            </div>

            {/* Image Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="img_sqr" className="text-sm font-semibold">
                  Image Square
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.img_sqr}
                    type="file"
                    id="img_sqr"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange("img_sqr", file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.img_sqr.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.img_sqr
                        ? selectedFiles.img_sqr.name
                        : "Select Square Image"}
                    </span>
                  </Button>
                  {formik.values.img_sqr && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        <img
                          src={formik.values.img_sqr}
                          alt="Square preview"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform"
                          onClick={() => {
                            formik.setFieldValue("img_sqr", "");
                            setSelectedFiles((prev) => ({
                              ...prev,
                              img_sqr: null,
                            }));
                            setRemovedFields((prev) =>
                              new Set(prev).add("img_sqr")
                            );
                            if (fileInputRefs.img_sqr.current) {
                              fileInputRefs.img_sqr.current.value = "";
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
                <Label htmlFor="img_rec" className="text-sm font-semibold">
                  Image Rectangle
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.img_rec}
                    type="file"
                    id="img_rec"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange("img_rec", file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.img_rec.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.img_rec
                        ? selectedFiles.img_rec.name
                        : "Select Rectangle Image"}
                    </span>
                  </Button>
                  {formik.values.img_rec && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        <img
                          src={formik.values.img_rec}
                          alt="Rectangle preview"
                          className="w-36 h-24 rounded-lg object-cover border-2 border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform"
                          onClick={() => {
                            formik.setFieldValue("img_rec", "");
                            setSelectedFiles((prev) => ({
                              ...prev,
                              img_rec: null,
                            }));
                            setRemovedFields((prev) =>
                              new Set(prev).add("img_rec")
                            );
                            if (fileInputRefs.img_rec.current) {
                              fileInputRefs.img_rec.current.value = "";
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
                <Label htmlFor="video_sqr" className="text-sm font-semibold">
                  Video Square
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.video_sqr}
                    type="file"
                    id="video_sqr"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange("video_sqr", file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.video_sqr.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.video_sqr
                        ? selectedFiles.video_sqr.name
                        : "Select Square Video"}
                    </span>
                  </Button>
                  {formik.values.video_sqr && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        {(() => {
                          const src =
                            videoPreviews.video_sqr || formik.values.video_sqr;
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
                            if (videoPreviews.video_sqr) {
                              URL.revokeObjectURL(videoPreviews.video_sqr);
                            }
                            formik.setFieldValue("video_sqr", "");
                            setSelectedFiles((prev) => ({
                              ...prev,
                              video_sqr: null,
                            }));
                            setVideoPreviews((prev) => ({
                              ...prev,
                              video_sqr: "",
                            }));
                            setRemovedFields((prev) =>
                              new Set(prev).add("video_sqr")
                            );
                            if (fileInputRefs.video_sqr.current) {
                              fileInputRefs.video_sqr.current.value = "";
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p
                        className="mt-1 text-xs text-muted-foreground truncate max-w-[192px]"
                        title={formik.values.video_sqr}
                      >
                        {formik.values.video_sqr}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_rec" className="text-sm font-semibold">
                  Video Rectangle
                </Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRefs.video_rec}
                    type="file"
                    id="video_rec"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange("video_rec", file, formik);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.video_rec.current?.click()}
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-left flex-1">
                      {selectedFiles.video_rec
                        ? selectedFiles.video_rec.name
                        : "Select Rectangle Video"}
                    </span>
                  </Button>
                  {formik.values.video_rec && (
                    <div className="mt-2 relative inline-block">
                      <div className="relative">
                        {(() => {
                          const src =
                            videoPreviews.video_rec || formik.values.video_rec;
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
                            if (videoPreviews.video_rec) {
                              URL.revokeObjectURL(videoPreviews.video_rec);
                            }
                            formik.setFieldValue("video_rec", "");
                            setSelectedFiles((prev) => ({
                              ...prev,
                              video_rec: null,
                            }));
                            setVideoPreviews((prev) => ({
                              ...prev,
                              video_rec: "",
                            }));
                            setRemovedFields((prev) =>
                              new Set(prev).add("video_rec")
                            );
                            if (fileInputRefs.video_rec.current) {
                              fileInputRefs.video_rec.current.value = "";
                            }
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p
                        className="mt-1 text-xs text-muted-foreground truncate max-w-[256px]"
                        title={formik.values.video_rec}
                      >
                        {formik.values.video_rec}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-0.5">
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable this subcategory
                </p>
              </div>
              <Switch
                id="status"
                name="status"
                checked={formik.values.status}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("status", checked)
                }
              />
            </div>

            {/* Platform Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Android Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="isAndroid"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Active for Android
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this subcategory for Android
                  </p>
                </div>
                <Switch
                  id="isAndroid"
                  name="isAndroid"
                  checked={formik.values.isAndroid}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("isAndroid", checked)
                  }
                />
              </div>

              {/* iOS Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="isIos"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Active for iOS
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this subcategory for iOS
                  </p>
                </div>
                <Switch
                  id="isIos"
                  name="isIos"
                  checked={formik.values.isIos}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("isIos", checked)
                  }
                />
              </div>
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
                {loading
                  ? editingSubCategory
                    ? "Updating..."
                    : "Creating..."
                  : editingSubCategory
                  ? "Update"
                  : "Create"}
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
            setCommonCountryForNewImages(""); // Reset common country when closing
            setEditingAsset(null);
            setCurrentAssetPage(1);
            setSelectedAssets([]); // Clear selection when closing
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">
              Manage Images - {selectedSubCategory?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add or remove images for this subcategory. You can upload files or
              add image URLs.
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

                {/* URL Input Option */}
                {/* <div className="flex gap-2">
                  <Input
                    placeholder="Or enter image URL"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        handleAddImageUrl(input.value);
                        input.value = '';
                      }
                    }}
                    className="h-11"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Or enter image URL"]') as HTMLInputElement;
                      if (input?.value.trim()) {
                        handleAddImageUrl(input.value);
                        input.value = '';
                      }
                    }}
                    className="h-11"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div> */}
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
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (
                                  parent &&
                                  !parent.querySelector(".error-placeholder")
                                ) {
                                  const errorDiv =
                                    document.createElement("div");
                                  errorDiv.className =
                                    "error-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-destructive/10";
                                  errorDiv.textContent = "Invalid URL";
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
                        {/* Prompt Input */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Prompt (Optional)
                          </Label>
                          <Textarea
                            placeholder="Enter prompt for this image..."
                            value={img.prompt || ""}
                            onChange={(e) =>
                              handleUpdateImagePrompt(idx, e.target.value)
                            }
                            className="h-9 text-sm resize-none"
                          />
                        </div>
                        {/* Country Dropdown */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Country (Optional)
                          </Label>
                          <CountrySelect
                            value={img.country || ""}
                            onValueChange={(value) =>
                              handleUpdateImageCountry(idx, value)
                            }
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
                      Assets ({assetsPagination.totalItems || 0})
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
                  {assetsPagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAssetPageChange(currentAssetPage - 1)
                        }
                        disabled={currentAssetPage === 1 || assetsLoading}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentAssetPage} of {assetsPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAssetPageChange(currentAssetPage + 1)
                        }
                        disabled={
                          currentAssetPage >=
                            (assetsPagination.totalPages || 1) ||
                          assetsLoading
                        }
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {assetsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>Loading assets...</p>
                </div>
              ) : enhancedAssets.length > 0 ? (
                <DraggableAssetGrid
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
                  assetLoadingStates={assetLoadingStates}
                  onReorder={handleAssetReorder}
                  containerHeight={600}
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

            {/* Empty State - Only show if no new images and no assets */}
            {newImages.length === 0 &&
              enhancedAssets.length === 0 &&
              !assetsLoading && (
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
                setSelectedAssets([]); // Clear selection when closing
                setEditingAsset(null);
                setEditingAssetPrompt(null);
                setEditingAssetCountry(null);
              }}
              className="min-w-[100px]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Confirmation Dialog */}
      <AlertDialog
        open={!!deleteSubCategory}
        onOpenChange={() => setDeleteSubCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              subcategory "{deleteSubCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Image Confirmation Dialog */}
      <AlertDialog
        open={!!deleteImage}
        onOpenChange={() => setDeleteImage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteImage && deleteImage.assetId.split(",").length > 1
                ? `Are you sure you want to delete ${deleteImage.assetId.split(",").length} assets?`
                : "Are you sure you want to delete this asset?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              {deleteImage && deleteImage.assetId.split(",").length > 1
                ? " selected assets"
                : " asset image"}{" "}
              from the subcategory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full Size Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
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
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".error-placeholder")) {
                      const errorDiv = document.createElement("div");
                      errorDiv.className =
                        "error-placeholder w-full h-full flex flex-col items-center justify-center text-white bg-destructive/20 rounded-lg p-4";
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
    </div>
  );
};

export default SubCategories;
