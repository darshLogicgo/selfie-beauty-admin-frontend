import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import SelectableList from '@/components/ui/SelectableList';
import { mockSubCategories } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Save, Camera } from 'lucide-react';

const AIPhoto: React.FC = () => {
  const { toast } = useToast();
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([1, 2, 3]);

  const subCategories = mockSubCategories.map(s => ({ id: s.id, name: s.name, image: s.image }));

  const handleSave = () => {
    toast({
      title: 'AI Photo settings saved',
      description: 'Your subcategory selection has been updated.',
    });
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
        <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="section-card">
        <h2 className="text-lg font-semibold text-foreground mb-2">Select Subcategories</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the subcategories to display in the AI Photo section. You can select multiple items and drag to reorder.
        </p>
        <SelectableList
          items={subCategories}
          selectedIds={selectedSubCategories}
          onSelectionChange={setSelectedSubCategories}
          multiSelect={true}
          draggable={true}
        />
      </div>

      <div className="mt-6 p-4 bg-accent/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Selected:</strong> {selectedSubCategories.length} subcategories
        </p>
      </div>
    </div>
  );
};

export default AIPhoto;
