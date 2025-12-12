import * as APIHandler from "./api_helper";
import * as url from "./url_helper";

const api = APIHandler;

// ============================================
// Auth API Functions
// ============================================
export const signIn = (data: { email: string; password: string }) => {
  return api.post(url.AUTH_API.LOGIN, data);
};

// ============================================
// Category API Functions
// ============================================
export const getCategory = (queryParams?: Record<string, any>) => {
  return api.get(url.CATEGORY_API.BASE, queryParams);
};

export const createCategory = (data: FormData) => {
  return api.post(url.CATEGORY_API.CREATE, data);
};

export const updateCategory = (id: string, data: FormData) => {
  return api.patch(`${url.CATEGORY_API.UPDATE}/${id}`, data);
};

export const deleteCategory = (id: string) => {
  return api.remove(`${url.CATEGORY_API.DELETE}/${id}`);
};

export const toggleCategoryStatus = (id: string, status: boolean) => {
  return api.patch(`${url.CATEGORY_API.BASE}/${id}/status`, { status });
};

export const reorderCategory = (data: {
  categories: Array<{ _id: string; order: number }>;
}) => {
  return api.patch(url.CATEGORY_API.REORDER, data);
};

export const getCategoryTitles = () => {
  return api.get(url.CATEGORY_API.TITLES);
};

export const toggleCategoryPremium = (id: string) => {
  return api.patch(`${url.CATEGORY_API.TOGGLE_PREMIUM}/${id}/premium`);
};

// ============================================
// Trending API Functions
// ============================================
export const getTrending = () => {
  return api.get(url.TRENDING_API.BASE);
};

export const updateTrendingStatus = (
  id: string,
  data: { isTrending: boolean }
) => {
  return api.patch(`${url.TRENDING_API.UPDATE_STATUS}/${id}`, data);
};

export const reorderTrending = (data: {
  categories: Array<{ _id: string; trendingOrder: number }>;
}) => {
  return api.patch(url.TRENDING_API.REORDER, data);
};

// ============================================
// AI World API Functions
// ============================================
export const getAIWorld = () => {
  return api.get(url.AI_WORLD_API.BASE);
};

export const toggleAIWorld = (id: string) => {
  return api.patch(`${url.AI_WORLD_API.TOGGLE_AI_WORLD}/${id}`);
};

export const reorderAIWorld = (data: {
  categories: Array<{ _id: string; aiWorldOrder: number }>;
}) => {
  return api.patch(url.AI_WORLD_API.REORDER, data);
};

// ============================================
// SubCategory API Functions
// ============================================
export const getSubCategory = (queryParams?: Record<string, any>) => {
  return api.get(url.SUB_CATEGORY_API.BASE, queryParams);
};

export const createSubCategory = (data: FormData) => {
  return api.post(url.SUB_CATEGORY_API.CREATE, data);
};

export const updateSubCategory = (id: string, data: FormData) => {
  return api.patch(`${url.SUB_CATEGORY_API.UPDATE}/${id}`, data);
};

export const toggleSubCategoryStatus = (id: string, status: boolean) => {
  return api.patch(`${url.SUB_CATEGORY_API.BASE}/${id}/status`, { status });
};

export const deleteSubCategory = (id: string) => {
  return api.remove(`${url.SUB_CATEGORY_API.DELETE}/${id}`);
};

export const addSubCategoryAssets = (id: string, data: FormData) => {
  return api.post(`${url.SUB_CATEGORY_API.ASSETS}/${id}/assets`, data);
};

export const deleteSubCategoryAsset = (id: string, assetIdOrUrl: string) => {
  // Backend accepts either assetId or url in body
  // If it's a valid ObjectId format, send as assetId, otherwise as url
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(assetIdOrUrl);
  return api.remove(
    `${url.SUB_CATEGORY_API.DELETE_ASSET}/${id}/assets/delete`,
    isObjectId ? { assetId: assetIdOrUrl } : { url: assetIdOrUrl }
  );
};

export const toggleSubCategoryPremium = (id: string) => {
  return api.patch(`${url.SUB_CATEGORY_API.TOGGLE_PREMIUM}/${id}/premium`);
};

export const reorderSubCategory = (
  data: Array<{ id: string; order: number }>
) => {
  return api.patch(url.SUB_CATEGORY_API.REORDER, data);
};

export const getSubCategoryAssets = (
  id: string,
  queryParams?: Record<string, any>
) => {
  return api.get(
    `${url.SUB_CATEGORY_API.GET_ASSETS}/${id}/assets`,
    queryParams
  );
};

export const updateSubCategoryAsset = (
  id: string,
  data: {
    assetId?: string;
    url?: string;
    isPremium?: boolean;
    imageCount?: number;
  }
) => {
  return api.patch(
    `${url.SUB_CATEGORY_API.UPDATE_ASSET}/${id}/assets/premium`,
    data
  );
};

// ============================================
// Home API Functions
// ============================================
export const getHome = () => {
  return api.get(url.HOME_API.GET);
};

export const toggleHomeCategorySection = (data: {
  categories: Array<{ _id: string; [key: string]: any }>;
}) => {
  return api.patch(url.HOME_API.TOGGLE_CATEGORY, data);
};

export const toggleHomeSubcategorySection = (data: {
  subcategories: Array<{ _id: string; [key: string]: any }>;
}) => {
  return api.patch(url.HOME_API.TOGGLE_SUBCATEGORY, data);
};

export const reorderHomeSection1 = (data: {
  categories: Array<{ _id: string; section1Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION1, data);
};

export const reorderHomeSection2 = (data: {
  categories: Array<{ _id: string; section2Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION2, data);
};

export const reorderHomeSection3 = (data: {
  subcategories: Array<{ _id: string; section3Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION3, data);
};

export const reorderHomeSection4 = (data: {
  subcategories: Array<{ _id: string; section4Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION4, data);
};

export const reorderHomeSection5 = (data: {
  subcategories: Array<{ _id: string; section5Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION5, data);
};

export const reorderHomeSection6 = (data: {
  categories: Array<{ _id: string; section6Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION6, data);
};

export const reorderHomeSection7 = (data: {
  categories: Array<{ _id: string; section7Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION7, data);
};

export const updateHomeSettings = (data: {
  section6Title?: string;
  section7Title?: string;
}) => {
  return api.patch(url.HOME_API.SETTINGS, data);
};

// ============================================
// AI Photo API Functions
// ============================================
export const getAIPhoto = (queryParams?: Record<string, any>) => {
  return api.get(url.AI_PHOTO_API.BASE, queryParams);
};

export const toggleAIPhotoIsAiWorld = (
  id: string,
  data: { isAiPhoto: boolean }
) => {
  return api.patch(`${url.AI_PHOTO_API.TOGGLE}/${id}/toggle`, data);
};

export const reorderAIPhoto = (
  data: Array<{ id: string; aiPhotoOrder: number }>
) => {
  return api.patch(url.AI_PHOTO_API.REORDER, data);
};
