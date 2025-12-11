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

export const reorderCategory = (data: { categories: Array<{ _id: string; order: number }> }) => {
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
  
export const updateTrendingStatus = (id: string, data: { isTrending: boolean }) => {
  return api.patch(`${url.TRENDING_API.UPDATE_STATUS}/${id}`, data);
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

export const deleteSubCategoryAsset = (id: string, imageUrl: string) => {
  return api.remove(`${url.SUB_CATEGORY_API.DELETE_ASSET}/${id}/assets/delete`, { url: imageUrl });
};

export const toggleSubCategoryPremium = (id: string) => {
  return api.patch(`${url.SUB_CATEGORY_API.TOGGLE_PREMIUM}/${id}/premium`);
};

// ============================================
// Home API Functions
// ============================================
export const getHome = () => {
  return api.get(url.HOME_API.GET);
};

export const toggleHomeCategorySection = (data: { categories: Array<{ _id: string; [key: string]: any }> }) => {
  return api.patch(url.HOME_API.TOGGLE_CATEGORY, data);
};

export const toggleHomeSubcategorySection = (data: { subcategories: Array<{ _id: string; [key: string]: any }> }) => {
  return api.patch(url.HOME_API.TOGGLE_SUBCATEGORY, data);
};

// ============================================
// AI Photo API Functions
// ============================================
export const getAIPhoto = (queryParams?: Record<string, any>) => {
  return api.get(url.AI_PHOTO_API.BASE, queryParams);
};

export const toggleAIPhotoIsAiWorld = (id: string, data: { isAiWorld: boolean }) => {
  return api.patch(`${url.AI_PHOTO_API.TOGGLE}/${id}/toggle`, data);
};