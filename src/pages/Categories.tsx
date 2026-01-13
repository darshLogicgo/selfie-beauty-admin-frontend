import React, { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DraggableTable from '@/components/ui/DraggableTable';
import { mockCategories, Category } from '@/data/mockData';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCategoryThunk, updateCategoryThunk, getCategoryThunk, deleteCategoryThunk, toggleCategoryStatusThunk, toggleCategoryAndroidActiveThunk, toggleCategoryIOSActiveThunk, reorderCategoryThunk, toggleCategoryPremiumThunk } from '@/store/category/thunk';
import { useFormik } from 'formik';
import * as yup from 'yup';

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
  const [categories, setCategories] = useState<(Category & { _id?: string; isPremium?: boolean })[]>([]);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]); // Store original _id order
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<(Category & { _id?: string; isPremium?: boolean }) | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<(Category & { _id?: string; isPremium?: boolean }) | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getCategoryThunk(undefined));
  }, [dispatch]);

  const isUsableMediaSrc = (src: unknown) => {
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
  };

  // Map API response to Category type
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      const mappedCategories: (Category & { _id?: string; isPremium?: boolean; prompt?: string; isAndroid?: boolean; isIos?: boolean })[] = categoriesData.map((item: any, index: number) => ({
        id: parseInt(item._id?.slice(-8) || String(index + 1), 16) || index + 1, // Convert _id to number or use index
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
        _id: item._id, // Store original _id for API calls
      }));
      setCategories(mappedCategories);
      // Store original order of _ids
      const originalIds = mappedCategories.map(cat => cat._id || '').filter(id => id !== '');
      setOriginalOrder(originalIds);
      setHasOrderChanged(false);
    } else if (categoriesData && categoriesData.length === 0) {
      setCategories([]);
      setOriginalOrder([]);
      setHasOrderChanged(false);
    }
  }, [categoriesData]);

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
                <Input
                  id="country"
                  name="country"
                  value={formik.values.country || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter country "
                  className="h-11"
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
