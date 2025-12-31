import React, { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Images, X, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import DraggableTable from "@/components/ui/DraggableTable";
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
} from "@/store/subcategory/thunk";
import { getCategoryTitlesThunk } from "@/store/category/thunk";
import { useFormik } from "formik";
import * as yup from "yup";

// Extended SubCategory with _id for API calls
interface SubCategoryWithId extends SubCategory {
  _id?: string;
  categoryId?: string;
  img_sqr?: string;
  img_rec?: string;
  video_sqr?: string;
  video_rec?: string;
  isPremium?: boolean;
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
});

// Asset type based on API response
interface AssetImage {
  _id: string;
  url: string;
  isPremium: boolean;
  imageCount: number;
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
    country: (item.country ?? "") || "",
    android_appVersion: (item.android_appVersion ?? "") || "",
    ios_appVersion: (item.ios_appVersion ?? "") || "",
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
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    assetId: string;
  } | null>(null);

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
    Array<{ url: string; file?: File; preview?: string }>
  >([]);
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
        country: subCategory.country || "",
        android_appVersion: subCategory.android_appVersion || "",
        ios_appVersion: subCategory.ios_appVersion || "",
        img_sqr: subCategory.img_sqr || "",
        img_rec: subCategory.img_rec || "",
        video_sqr: subCategory.video_sqr || "",
        video_rec: subCategory.video_rec || "",
        status: subCategory.status,
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
          setNewImages((prev) => [...prev, { url: "", file, preview }]);
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
      setNewImages((prev) => [...prev, { url: url.trim() }]);
    }
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
    },
    validationSchema: subCategorySchema,
    onSubmit: async (values) => {
      if (editingSubCategory && editingSubCategory._id) {
        // Update FormData for multipart/form-data request
        const formDataToSend = new FormData();

        // Add text fields
        formDataToSend.append("subcategoryTitle", values.name.trim());
        formDataToSend.append("status", values.status.toString());

        if (values.country && values.country.trim()) {
          formDataToSend.append("country", values.country.trim());
        }
        if (values.android_appVersion && values.android_appVersion.trim()) {
          formDataToSend.append("android_appVersion", values.android_appVersion.trim());
        }
        if (values.ios_appVersion && values.ios_appVersion.trim()) {
          formDataToSend.append("ios_appVersion", values.ios_appVersion.trim());
        }

        // Always send categoryId when updating (required by validation)
        // Use form value or fallback to existing subcategory's categoryId
        const categoryIdToSend = values.categoryId || (editingSubCategory as any).categoryId;
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

        if (values.country && values.country.trim()) {
          formDataToSend.append("country", values.country.trim());
        }
        if (values.android_appVersion && values.android_appVersion.trim()) {
          formDataToSend.append("android_appVersion", values.android_appVersion.trim());
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
      const imageFiles = newImages
        .filter((img) => img.file)
        .map((img) => img.file!);

      if (imageFiles.length === 0) {
        toast.error("Please upload image files. URLs are not supported.");
        return;
      }

      // Create FormData with multiple asset_images fields
      const formDataToSend = new FormData();
      imageFiles.forEach((file) => {
        formDataToSend.append("asset_images", file);
      });

      // Call API
      const result = await dispatch(
        addSubCategoryAssetsThunk({
          id: selectedSubCategory._id,
          formData: formDataToSend,
        })
      );

      if (addSubCategoryAssetsThunk.fulfilled.match(result)) {
        // Clean up preview URLs
        newImages.forEach((img) => {
          if (img.preview) {
            URL.revokeObjectURL(img.preview);
          }
        });
        setNewImages([]);
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
      await dispatch(
        getSubCategoryAssetsThunk({
          id: selectedSubCategory._id,
          queryParams: { page, limit: 10 },
        })
      );
    }
  };

  const handleAssetPremiumToggle = async (asset: AssetImage) => {
    if (selectedSubCategory && selectedSubCategory._id) {
      const result = await dispatch(
        updateSubCategoryAssetThunk({
          id: selectedSubCategory._id,
          data: {
            assetId: asset._id,
            isPremium: !asset.isPremium,
          },
        })
      );

      if (updateSubCategoryAssetThunk.fulfilled.match(result)) {
        // Refresh assets
        await dispatch(
          getSubCategoryAssetsThunk({
            id: selectedSubCategory._id,
            queryParams: { page: currentAssetPage, limit: 10 },
          })
        );
      }
    }
  };

  const handleAssetImageCountChange = async (
    asset: AssetImage,
    newCount: number
  ) => {
    if (selectedSubCategory && selectedSubCategory._id && newCount > 0) {
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
        // Refresh assets
        await dispatch(
          getSubCategoryAssetsThunk({
            id: selectedSubCategory._id,
            queryParams: { page: currentAssetPage, limit: 10 },
          })
        );
        setEditingAsset(null);
      }
    }
  };

  const confirmDeleteImage = async () => {
    if (deleteImage) {
      // Call API to delete the image using assetId
      const result = await dispatch(
        deleteSubCategoryAssetThunk({
          id: deleteImage.subcategoryId,
          imageUrl: deleteImage.assetId, // Backend helper will detect if it's assetId or url
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
        // Close dialog
        setDeleteImage(null);
      }
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
                <Input
                  id="country"
                  name="country"
                  value={formik.values.country || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter country"
                  className="h-11"
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
                <Label htmlFor="ios_appVersion" className="text-sm font-semibold">
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
                          const src = videoPreviews.video_sqr || formik.values.video_sqr;
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
                          const src = videoPreviews.video_rec || formik.values.video_rec;
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
            setEditingAsset(null);
            setCurrentAssetPage(1);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold break-words">
              Manage Images - {selectedSubCategory?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add or remove images for this subcategory. You can upload files or
              add image URLs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Add New Images Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Add New Images</Label>

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
                    className="w-full h-11 border-2 border-dashed hover:border-primary transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Upload Image Files</span>
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
                  <Label className="text-sm font-semibold">
                    New Images ({newImages.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative group">
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
                            className="absolute top-1 right-1 w-6 h-6 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
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
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Assets ({assetsPagination.totalItems || 0})
                </Label>
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
                          (assetsPagination.totalPages || 1) || assetsLoading
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>

              {assetsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>Loading assets...</p>
                </div>
              ) : assets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                  {assets.map((asset: AssetImage) => (
                    <div
                      key={asset._id}
                      className="relative group border rounded-lg p-3 bg-card hover:shadow-md transition-shadow"
                    >
                      {/* Delete Button - Top Right */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
                        onClick={() => handleDeleteImage(asset)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      {/* Image - Clickable to view full size */}
                      <div
                        className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          setViewingImage({
                            url: asset.url,
                            assetId: asset._id,
                          })
                        }
                      >
                        <img
                          src={asset.url}
                          alt="Asset"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".error-placeholder")
                            ) {
                              const errorDiv = document.createElement("div");
                              errorDiv.className =
                                "error-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-destructive/10";
                              errorDiv.textContent = "Failed to load";
                              parent.appendChild(errorDiv);
                            }
                          }}
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
                      <div className="space-y-2">
                        {/* Premium Toggle */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Premium</Label>
                          <Switch
                            checked={asset.isPremium}
                            onCheckedChange={() =>
                              handleAssetPremiumToggle(asset)
                            }
                            disabled={loading}
                          />
                        </div>

                        {/* Image Count */}
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-medium">Count</Label>
                          {editingAsset?.assetId === asset._id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                value={editingAsset.imageCount}
                                onChange={(e) =>
                                  setEditingAsset({
                                    assetId: asset._id,
                                    imageCount: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="h-7 w-14 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAssetImageCountChange(
                                      asset,
                                      editingAsset.imageCount
                                    );
                                  } else if (e.key === "Escape") {
                                    setEditingAsset(null);
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleAssetImageCountChange(
                                    asset,
                                    editingAsset.imageCount
                                  )
                                }
                                disabled={loading}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setEditingAsset(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">
                                {asset.imageCount}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-primary/10"
                                onClick={() =>
                                  setEditingAsset({
                                    assetId: asset._id,
                                    imageCount: asset.imageCount,
                                  })
                                }
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              assets.length === 0 &&
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
              Are you sure you want to delete this asset?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              asset image from the subcategory.
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
