import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Images, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DraggableTable from '@/components/ui/DraggableTable';
import { mockSubCategories, SubCategory } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const SubCategories: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>(mockSubCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [deleteSubCategory, setDeleteSubCategory] = useState<SubCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    video: '',
    status: true,
  });

  const [newImages, setNewImages] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({ name: '', image: '', video: '', status: true });
    setEditingSubCategory(null);
  };

  const handleOpenForm = (subCategory?: SubCategory) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setFormData({
        name: subCategory.name,
        image: subCategory.image,
        video: subCategory.video,
        status: subCategory.status,
      });
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleOpenImageForm = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setNewImages([]);
    setIsImageFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubCategory) {
      setSubCategories(prev =>
        prev.map(sub =>
          sub.id === editingSubCategory.id
            ? { ...sub, ...formData }
            : sub
        )
      );
      toast({ title: 'Subcategory updated successfully' });
    } else {
      const newSubCategory: SubCategory = {
        id: Math.max(...subCategories.map(s => s.id), 0) + 1,
        ...formData,
        order: subCategories.length + 1,
        images: [],
      };
      setSubCategories(prev => [...prev, newSubCategory]);
      toast({ title: 'Subcategory created successfully' });
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteSubCategory) {
      setSubCategories(prev => prev.filter(sub => sub.id !== deleteSubCategory.id));
      toast({ title: 'Subcategory deleted successfully' });
      setDeleteSubCategory(null);
    }
  };

  const handleStatusToggle = (id: number) => {
    setSubCategories(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: !sub.status } : sub
      )
    );
  };

  const handleAddImages = () => {
    if (selectedSubCategory && newImages.length > 0) {
      setSubCategories(prev =>
        prev.map(sub =>
          sub.id === selectedSubCategory.id
            ? { ...sub, images: [...sub.images, ...newImages] }
            : sub
        )
      );
      toast({ title: 'Images added successfully' });
      setNewImages([]);
    }
  };

  const handleDeleteImage = (imageIndex: number) => {
    if (selectedSubCategory) {
      setSubCategories(prev =>
        prev.map(sub =>
          sub.id === selectedSubCategory.id
            ? { ...sub, images: sub.images.filter((_, idx) => idx !== imageIndex) }
            : sub
        )
      );
      setSelectedSubCategory(prev => 
        prev ? { ...prev, images: prev.images.filter((_, idx) => idx !== imageIndex) } : null
      );
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Subcategory Name',
      render: (item: SubCategory) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: 'image',
      header: 'Image',
      render: (item: SubCategory) => (
        <img
          src={item.image}
          alt={item.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'video',
      header: 'Video',
      render: (item: SubCategory) => (
        <span className="text-muted-foreground text-sm">{item.video}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: SubCategory) => (
        <Switch
          checked={item.status}
          onCheckedChange={() => handleStatusToggle(item.id)}
        />
      ),
    },
    {
      key: 'images',
      header: 'Images',
      render: (item: SubCategory) => (
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
      key: 'actions',
      header: 'Actions',
      render: (item: SubCategory) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenForm(item)}
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
      const updated = subCategories.find(s => s.id === selectedSubCategory.id);
      if (updated) setSelectedSubCategory(updated);
    }
  }, [subCategories]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">Subcategories</h1>
        <Button onClick={() => handleOpenForm()} className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Subcategory
        </Button>
      </div>

      <DraggableTable
        columns={columns}
        data={subCategories}
        onReorder={setSubCategories}
      />

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubCategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
            <DialogDescription>
              {editingSubCategory ? 'Update the subcategory details below.' : 'Fill in the details to create a new subcategory.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subcategory Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter subcategory name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="Enter image URL"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video">Video Filename</Label>
              <Input
                id="video"
                value={formData.video}
                onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
                placeholder="Enter video filename"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Active Status</Label>
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                {editingSubCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog open={isImageFormOpen} onOpenChange={setIsImageFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Images - {selectedSubCategory?.name}</DialogTitle>
            <DialogDescription>
              Add or remove images for this subcategory.
            </DialogDescription>
          </DialogHeader>
          
          {/* Add Images Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Add New Images</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        setNewImages(prev => [...prev, input.value.trim()]);
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter image URL"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      setNewImages(prev => [...prev, input.value.trim()]);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {newImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-accent px-2 py-1 rounded text-sm">
                      <span className="truncate max-w-[150px]">{img}</span>
                      <button
                        onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {newImages.length > 0 && (
                <Button onClick={handleAddImages} size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Add {newImages.length} Image(s)
                </Button>
              )}
            </div>

            {/* Existing Images */}
            {selectedSubCategory && selectedSubCategory.images.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Images ({selectedSubCategory.images.length})</Label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {selectedSubCategory.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="bg-secondary rounded-lg p-2 flex items-center gap-2">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          IMG
                        </div>
                        <span className="text-sm truncate flex-1">{img}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteImage(idx)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSubCategory?.images.length === 0 && newImages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No images added yet</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageFormOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteSubCategory} onOpenChange={() => setDeleteSubCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subcategory "{deleteSubCategory?.name}".
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

export default SubCategories;
