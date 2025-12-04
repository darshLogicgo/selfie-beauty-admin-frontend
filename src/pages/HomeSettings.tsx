import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SelectableList from '@/components/ui/SelectableList';
import { mockCategories, mockSubCategories } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const HomeSettings: React.FC = () => {
  const { toast } = useToast();
  
  // Section 1 - Categories with multi-select and drag
  const [section1Selection, setSection1Selection] = useState<number[]>([1, 2]);
  
  // Section 2 - Categories with multi-select and drag
  const [section2Selection, setSection2Selection] = useState<number[]>([3, 4]);
  
  // Section 3 - Subcategories with multi-select and drag
  const [section3Selection, setSection3Selection] = useState<number[]>([1, 2]);
  
  // Section 4 - Subcategories with single select, no drag
  const [section4Selection, setSection4Selection] = useState<number[]>([1]);
  
  // Section 5 - Subcategories with single select, no drag
  const [section5Selection, setSection5Selection] = useState<number[]>([2]);
  
  // Section 6 - Categories with title, multi-select and drag
  const [section6Title, setSection6Title] = useState('Featured Filters');
  const [section6Selection, setSection6Selection] = useState<number[]>([1, 5]);
  
  // Section 7 - Categories with title, multi-select and drag
  const [section7Title, setSection7Title] = useState('Popular Effects');
  const [section7Selection, setSection7Selection] = useState<number[]>([2, 6]);

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Home page configuration has been updated.',
    });
  };

  const categories = mockCategories.map(c => ({ id: c.id, name: c.name, image: c.image }));
  const subCategories = mockSubCategories.map(s => ({ id: s.id, name: s.name, image: s.image }));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Home Page Settings</h1>
        <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 1 - Featured Categories</h2>
          <p className="text-sm text-muted-foreground mb-4">Select multiple categories. Drag to reorder.</p>
          <SelectableList
            items={categories}
            selectedIds={section1Selection}
            onSelectionChange={setSection1Selection}
            multiSelect={true}
            draggable={true}
          />
        </div>

        {/* Section 2 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 2 - Category Showcase</h2>
          <p className="text-sm text-muted-foreground mb-4">Select multiple categories. Drag to reorder.</p>
          <SelectableList
            items={categories}
            selectedIds={section2Selection}
            onSelectionChange={setSection2Selection}
            multiSelect={true}
            draggable={true}
          />
        </div>

        {/* Section 3 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 3 - Subcategory Grid</h2>
          <p className="text-sm text-muted-foreground mb-4">Select multiple subcategories. Drag to reorder.</p>
          <SelectableList
            items={subCategories}
            selectedIds={section3Selection}
            onSelectionChange={setSection3Selection}
            multiSelect={true}
            draggable={true}
          />
        </div>

        {/* Section 4 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 4 - Featured Subcategory</h2>
          <p className="text-sm text-muted-foreground mb-4">Select a single subcategory.</p>
          <SelectableList
            items={subCategories}
            selectedIds={section4Selection}
            onSelectionChange={setSection4Selection}
            multiSelect={false}
            draggable={false}
          />
        </div>

        {/* Section 5 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 5 - Highlighted Subcategory</h2>
          <p className="text-sm text-muted-foreground mb-4">Select a single subcategory.</p>
          <SelectableList
            items={subCategories}
            selectedIds={section5Selection}
            onSelectionChange={setSection5Selection}
            multiSelect={false}
            draggable={false}
          />
        </div>

        {/* Section 6 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 6 - Custom Category Section</h2>
          <p className="text-sm text-muted-foreground mb-4">Add a title and select multiple categories. Drag to reorder.</p>
          <div className="mb-4">
            <Label htmlFor="section6Title">Section Title</Label>
            <Input
              id="section6Title"
              value={section6Title}
              onChange={(e) => setSection6Title(e.target.value)}
              placeholder="Enter section title"
              className="max-w-md mt-1"
            />
          </div>
          <SelectableList
            items={categories}
            selectedIds={section6Selection}
            onSelectionChange={setSection6Selection}
            multiSelect={true}
            draggable={true}
          />
        </div>

        {/* Section 7 */}
        <div className="section-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Section 7 - Custom Category Section</h2>
          <p className="text-sm text-muted-foreground mb-4">Add a title and select multiple categories. Drag to reorder.</p>
          <div className="mb-4">
            <Label htmlFor="section7Title">Section Title</Label>
            <Input
              id="section7Title"
              value={section7Title}
              onChange={(e) => setSection7Title(e.target.value)}
              placeholder="Enter section title"
              className="max-w-md mt-1"
            />
          </div>
          <SelectableList
            items={categories}
            selectedIds={section7Selection}
            onSelectionChange={setSection7Selection}
            multiSelect={true}
            draggable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeSettings;
