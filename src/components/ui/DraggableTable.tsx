import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
}

interface DraggableTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onReorder: (newData: T[]) => void;
  showDragHandle?: boolean;
}

function DraggableTable<T extends { id: number }>({
  columns,
  data,
  onReorder,
  showDragHandle = true,
}: DraggableTableProps<T>) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newData = [...data];
    const [draggedItem] = newData.splice(draggedIndex, 1);
    newData.splice(dropIndex, 0, draggedItem);
    
    onReorder(newData.map((item, idx) => ({ ...item, order: idx + 1 })));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="table-container overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary/50">
            {showDragHandle && (
              <th className="w-12 px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider" />
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item, index) => (
            <tr
              key={item.id}
              draggable={showDragHandle}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'bg-card hover:bg-accent/50 transition-colors',
                draggedIndex === index && 'opacity-50',
                dragOverIndex === index && 'bg-accent'
              )}
            >
              {showDragHandle && (
                <td className="px-4 py-3">
                  <GripVertical className="w-5 h-5 drag-handle" />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-foreground text-center">
                  <div className="flex items-center justify-center">
                    {column.render ? column.render(item, index) : (item as any)[column.key]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}

export default DraggableTable;
