import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Trash2, Image as ImageIcon, Video, Loader2, Star, Edit3, Globe, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { AssetImage } from '@/data/mockData';

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
  assets,
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
  };

  const isVideo = asset.url?.includes('.mp4') || asset.url?.includes('.mov') || asset.url?.includes('.webm');
  const isSelected = selectedAssets.includes(asset._id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border rounded-lg overflow-hidden bg-card transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'
      } ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''}`}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onAssetSelect(asset._id)}
          className="bg-background border-2 border-primary"
        />
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="bg-background/80 backdrop-blur-sm rounded p-1">
          <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
        </div>
      </div>

      {/* Media Preview */}
      <div className="aspect-square relative">
        {isVideo ? (
          <video
            src={asset.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <OptimizedImage
            src={asset.url}
            alt={`Asset ${asset._id}`}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Premium Badge */}
        {asset.isPremium && (
          <div className="absolute top-2 left-2">
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Premium
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Asset Actions */}
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground truncate">
            {asset.imageCount || 1} images
          </span>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewImage(asset)}
                    className="h-6 w-6 p-0"
                  >
                    <ImageIcon className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPremiumToggle(asset)}
                    className="h-6 w-6 p-0"
                  >
                    <Star className={`w-3 h-3 ${asset.isPremium ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Premium</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteImage(asset)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-1">
          {/* Image Count */}
          <div className="flex items-center gap-2">
            <Hash className="w-3 h-3 text-muted-foreground" />
            {editingAsset?.assetId === asset._id ? (
              <Input
                type="number"
                min="1"
                value={editingAsset.imageCount}
                onChange={(e) => onImageCountChange(asset, parseInt(e.target.value) || 1)}
                onBlur={() => setEditingAsset(null)}
                className="h-6 text-xs"
                autoFocus
              />
            ) : (
              <div
                className="text-xs cursor-pointer hover:text-primary"
                onClick={() => setEditingAsset({ assetId: asset._id, imageCount: asset.imageCount || 1 })}
              >
                Count: {asset.imageCount || 1}
              </div>
            )}
          </div>

          {/* Prompt */}
          <div className="flex items-center gap-2">
            <Edit3 className="w-3 h-3 text-muted-foreground" />
            {editingAssetPrompt?.assetId === asset._id ? (
              <Input
                value={editingAssetPrompt.prompt}
                onChange={(e) => onPromptChange(asset, e.target.value)}
                onBlur={() => setEditingAssetPrompt(null)}
                className="h-6 text-xs"
                placeholder="Add prompt..."
                autoFocus
              />
            ) : (
              <div
                className="text-xs cursor-pointer hover:text-primary truncate flex-1"
                onClick={() => setEditingAssetPrompt({ assetId: asset._id, prompt: asset.prompt || '' })}
              >
                {asset.prompt || 'Add prompt...'}
              </div>
            )}
          </div>

          {/* Country */}
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs truncate">
              {asset.country || 'Global'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

SortableAssetCard.displayName = 'SortableAssetCard';

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
          </div>
        </div>
      </div>
    </div>
  );
});

VirtualAssetGrid.displayName = 'VirtualAssetGrid';

export default VirtualAssetGrid;
