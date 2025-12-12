const API = "/api/v1";

// Auth APIs
export const AUTH_API = {
  LOGIN: API + "/auth/login-by-email",
};

// Category APIs
export const CATEGORY_API = {
  BASE: API + "/categories",
  LIST: API + "/categories/list",
  CREATE: API + "/categories",
  UPDATE: API + "/categories",
  DELETE: API + "/categories",
  REORDER: API + "/categories/reorder",
  TITLES: API + "/categories/titles",
  TOGGLE_PREMIUM: API + "/categories",
};

// SubCategory APIs
export const SUB_CATEGORY_API = {
  BASE: API + "/subcategory",
  LIST: API + "/subcategory/list",
  CREATE: API + "/subcategory",
  UPDATE: API + "/subcategory",
  DELETE: API + "/subcategory",
  ASSETS: API + "/subcategory",
  DELETE_ASSET: API + "/subcategory",
  TOGGLE_PREMIUM: API + "/subcategory",
  GET_ASSETS: API + "/subcategory", // Will append /:id/assets
  UPDATE_ASSET: API + "/subcategory", // Will append /:id/assets/premium
  REORDER: API + "/subcategory/update-order",
};

// Home Settings APIs
export const HOME_SETTINGS_API = {
  BASE: API + "/home-settings",
  GET: API + "/home-settings",
  UPDATE: API + "/home-settings",
};

// AI Photo APIs
export const AI_PHOTO_API = {
  BASE: API + "/aiphoto",
  LIST: API + "/ai-photo/list",
  CREATE: API + "/ai-photo",
  UPDATE: API + "/ai-photo",
  DELETE: API + "/ai-photo",
  TOGGLE: API + "/aiphoto",
  REORDER: API + "/aiphoto/reorder",
};

// Trending APIs
export const TRENDING_API = {
  BASE: API + "/trending",
  LIST: API + "/trending/list",
  UPDATE_STATUS: API + "/trending/toggle-trending",
};

// AI World APIs
export const AI_WORLD_API = {
  BASE: API + "/ai-world",
  LIST: API + "/ai-world/list",
  CREATE: API + "/ai-world",
  UPDATE: API + "/ai-world",
  DELETE: API + "/ai-world",
  TOGGLE_AI_WORLD: API + "/ai-world/toggle-ai-world",
};

// Dashboard APIs
export const DASHBOARD_API = {
  BASE: API + "/dashboard",
  STATS: API + "/dashboard/stats",
  ANALYTICS: API + "/dashboard/analytics",
};

// Home APIs
export const HOME_API = {
  BASE: API + "/home",
  GET: API + "/home/sections/all",
  TOGGLE_CATEGORY: API + "/home/categories/toggle",
  TOGGLE_SUBCATEGORY: API + "/home/subcategories/toggle",
  REORDER_SECTION1: API + "/home/section1/reorder",
  REORDER_SECTION2: API + "/home/section2/reorder",
  REORDER_SECTION3: API + "/home/section3/reorder",
  REORDER_SECTION4: API + "/home/section4/reorder",
  REORDER_SECTION5: API + "/home/section5/reorder",
  REORDER_SECTION6: API + "/home/section6/reorder",
  REORDER_SECTION7: API + "/home/section7/reorder",
};

// Uninstall APIs
export const UNINSTALL_API = {
  BASE: API + "/uninstall",
};

// Feedback/Support APIs
export const FEEDBACK_API = {
  BASE: API + "/feedback",
  STATS: API + "/feedback/stats",
};
