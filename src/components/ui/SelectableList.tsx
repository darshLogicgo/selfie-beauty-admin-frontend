import React from 'react';
import { GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface SelectableItem {
  id: number;
  name: string;
  image: string;
}

interface SelectableListProps {
  items: SelectableItem[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onReorder?: (items: SelectableItem[]) => void;
  multiSelect?: boolean;
  draggable?: boolean;
  title?: string;
}

const SelectableList: React.FC<SelectableListProps> = ({
  items,
  selectedIds,
  onSelectionChange,
  onReorder,
  multiSelect = true,
  draggable = true,
  title,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [localItems, setLocalItems] = React.useState(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleToggle = (id: number) => {
    if (multiSelect) {
      const newSelection = selectedIds.includes(id)
        ? selectedIds.filter(sid => sid !== id)
        : [...selectedIds, id];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(selectedIds.includes(id) ? [] : [id]);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!draggable) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!draggable) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!draggable || draggedIndex === null || draggedIndex === dropIndex) return;
    e.preventDefault();

    const newItems = [...localItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    setLocalItems(newItems);
    onReorder?.(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="font-medium text-foreground">{title}</h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {localItems.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);
          
          return (
            <div
              key={item.id}
              draggable={draggable}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => handleToggle(item.id)}
              className={cn(
                'checkbox-item',
                isSelected && 'checkbox-item-selected',
                draggedIndex === index && 'opacity-50',
                dragOverIndex === index && 'ring-2 ring-primary'
              )}
            >
              {draggable && (
                <GripVertical className="w-4 h-4 drag-handle flex-shrink-0" />
              )}
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <span className="flex-1 font-medium text-sm truncate">{item.name}</span>
              <div className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                isSelected 
                  ? 'bg-primary border-primary' 
                  : 'border-border'
              )}>
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>
          );
        })}
      </div>
      {localItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items available
        </div>
      )}
    </div>
  );
};

export default SelectableList;
