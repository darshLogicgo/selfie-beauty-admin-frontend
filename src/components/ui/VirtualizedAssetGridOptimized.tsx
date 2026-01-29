import React, { useMemo, useCallback, memo, useState, useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import CountrySelect from '@/components/ui/CountrySelect';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AssetImage } from '@/data/mockData';

interface VirtualizedAssetGridProps {
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
  loading: boolean;
  containerHeight?: number;
  itemHeight?: number;
  columns?: number;
}

// Optimized Image Component with Intersection Observer
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
          <div className="text-xs text-gray-500">Failed to load</div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Memoized Asset Card Component
const AssetCard = memo<{
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
}>(({
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
  loading
}) => {
  const handleImageCountChange = useCallback((newCount: number) => {
    onImageCountChange(asset, newCount);
  }, [asset, onImageCountChange]);

  const handlePromptChange = useCallback((newPrompt: string) => {
    onPromptChange(asset, newPrompt);
  }, [asset, onPromptChange]);

  const handleCountryChange = useCallback((newCountry: string) => {
    onCountryChange(asset, newCountry);
  }, [asset, onCountryChange]);

  const handlePremiumToggle = useCallback(() => {
    onPremiumToggle(asset);
  }, [asset, onPremiumToggle]);

  const handleDelete = useCallback(() => {
    onDeleteImage(asset);
  }, [asset, onDeleteImage]);

  const handleView = useCallback(() => {
    onViewImage(asset);
  }, [asset, onViewImage]);

  const handleSelect = useCallback(() => {
    onAssetSelect(asset._id);
  }, [asset._id, onAssetSelect]);

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
          onCheckedChange={handleSelect}
          className="bg-background"
        />
      </div>
      
      {/* Delete Button - Top Right */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Image - Clickable to view full size */}
      <div
        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted mb-3 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleView}
      >
        <OptimizedImage
          src={asset.url}
          alt="Asset"
          className="w-full h-full"
        />
        {/* URL Tooltip */}
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
      <div className="space-y-2">
        {/* Premium Toggle */}
        <div className="flex items-center justify-between py-0.5">
          <Label className="text-xs font-medium text-foreground">
            Premium
          </Label>
          <Switch
            checked={asset.isPremium}
            onCheckedChange={handlePremiumToggle}
            disabled={loading}
          />
        </div>

        {/* Image Count */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Count
          </Label>
          {editingAsset?.assetId === asset._id ? (
            <div className="flex items-center border-2 border-primary rounded-md bg-background overflow-hidden shadow-sm ring-1 ring-primary/20 w-24">
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
                className="h-8 w-10 text-center text-sm font-semibold border-0 focus-visible:ring-0 p-0 bg-transparent text-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageCountChange(editingAsset.imageCount);
                  } else if (e.key === "Escape") {
                    setEditingAsset(null);
                  }
                }}
                onBlur={() => {
                  handleImageCountChange(editingAsset.imageCount);
                }}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-6 rounded-none hover:bg-primary/10 active:bg-primary/20 border-r border-primary/30 transition-colors"
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
                <ChevronDown className="w-3 h-3 text-primary" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-6 rounded-none hover:bg-primary/10 active:bg-primary/20 border-l border-primary/30 transition-colors"
                onClick={() => {
                  const newCount = editingAsset.imageCount + 1;
                  setEditingAsset({
                    assetId: asset._id,
                    imageCount: newCount,
                  });
                }}
                disabled={loading}
              >
                <ChevronUp className="w-3 h-3 text-primary" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center border border-border rounded-md bg-background overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all w-24">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-6 rounded-none hover:bg-muted active:bg-muted/80 border-r border-border transition-colors"
                onClick={() => {
                  const newCount = Math.max(1, asset.imageCount - 1);
                  handleImageCountChange(newCount);
                }}
                disabled={loading || asset.imageCount <= 1}
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
              <div
                className="h-8 w-10 flex items-center justify-center text-sm font-semibold text-foreground cursor-text hover:bg-muted/40 active:bg-muted/60 transition-colors select-none rounded-md border border-border hover:border-primary/50"
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
                className="h-8 w-6 rounded-none hover:bg-muted active:bg-muted/80 border-l border-border transition-colors"
                onClick={() => {
                  const newCount = asset.imageCount + 1;
                  handleImageCountChange(newCount);
                }}
                disabled={loading}
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Prompt
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
                className="h-8 text-sm font-semibold border-0 focus-visible:ring-0 p-1 bg-transparent text-foreground resize-none"
                placeholder="Enter prompt..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePromptChange(editingAssetPrompt.prompt);
                  } else if (e.key === "Escape") {
                    setEditingAssetPrompt(null);
                  }
                }}
                onBlur={() => {
                  handlePromptChange(editingAssetPrompt.prompt);
                }}
                autoFocus
              />
            </div>
          ) : (
            <div
              className="h-8 w-full flex items-center justify-center text-sm text-muted-foreground cursor-text hover:bg-muted/40 active:bg-muted/60 transition-colors rounded-md border border-border hover:border-primary/50 px-1 truncate"
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
            Country
          </Label>
          <CountrySelect
            value={asset.country || ""}
            onValueChange={handleCountryChange}
            placeholder="Select..."
            triggerClassName="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
});

AssetCard.displayName = 'AssetCard';

// Virtual scrolling hook
const useVirtualScroll = (items: any[], containerHeight: number, itemHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  const totalHeight = items.length * itemHeight;
  
  return {
    visibleItems,
    visibleStart,
    visibleEnd,
    totalHeight,
    offsetY: visibleStart * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)
  };
};

const VirtualizedAssetGrid: React.FC<VirtualizedAssetGridProps> = ({
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
  loading,
  containerHeight = 400,
  itemHeight = 320,
  columns = 3
}) => {
  // For small datasets, render normally without virtualization
  if (assets.length <= 12) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 border rounded-lg bg-muted/30 max-h-96 overflow-y-auto">
        {assets.map((asset) => (
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
            loading={loading}
          />
        ))}
      </div>
    );
  }

  // For larger datasets, use simple virtualization
  const {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll
  } = useVirtualScroll(assets, containerHeight, itemHeight);

  return (
    <div className="border rounded-lg bg-muted/30">
      <div
        className="overflow-y-auto"
        style={{ height: containerHeight }}
        onScroll={onScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {visibleItems.map((asset) => (
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
                  loading={loading}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(VirtualizedAssetGrid);
