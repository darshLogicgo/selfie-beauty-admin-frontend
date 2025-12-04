import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SelectableList from '@/components/ui/SelectableList';
import { mockCategories } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Save, TrendingUp } from 'lucide-react';

const Trending: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([1, 2, 5]);

  const categories = mockCategories.map(c => ({ id: c.id, name: c.name, image: c.image }));

  const handleSave = () => {
    toast({
      title: 'Trending settings saved',
      description: 'Your category selection has been updated.',
    });
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
        <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="section-card">
        <h2 className="text-lg font-semibold text-foreground mb-2">Select Categories</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the categories to display in the Trending section. You can select multiple items and drag to reorder.
        </p>
        <SelectableList
          items={categories}
          selectedIds={selectedCategories}
          onSelectionChange={setSelectedCategories}
          multiSelect={true}
          draggable={true}
        />
      </div>

      <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedCategories.length} categories
        </p>
      </div>
    </div>
  );
};

export default Trending;
