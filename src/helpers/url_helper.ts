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
  UPDATE_ASSET: API + "/categories", // Will append /:id/assets/premium
};

// SubCategory APIs
export const SUB_CATEGORY_API = {
  BASE: API + "/subcategory",
  LIST: API + "/subcategory/list",
  CREATE: API + "/subcategory",
  UPDATE: API + "/subcategory/update",
  DELETE: API + "/subcategory",
  ASSETS: API + "/subcategory",
  DELETE_ASSET: API + "/subcategory",
  TOGGLE_PREMIUM: API + "/subcategory",
  GET_ASSETS: API + "/subcategory", // Will append /:id/assets/admin
  UPDATE_ASSET: API + "/subcategory", // Will append /:id/assets/premium
  REORDER: API + "/subcategory/update-order",
  REORDER_ASSETS: API + "/subcategory", // Will append /:id/assets/reorder
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
  UPDATE_SUBCATEGORY_STATUS: API + "/trending/toggle-trending-subcategory",
  REORDER: API + "/trending/reorder",
  REORDER_SUBCATEGORIES: API + "/trending/reorder-subcategories",
};

// AI World APIs
export const AI_WORLD_API = {
  BASE: API + "/ai-world",
  LIST: API + "/ai-world/list",
  CREATE: API + "/ai-world",
  UPDATE: API + "/ai-world",
  DELETE: API + "/ai-world",
  TOGGLE_AI_WORLD: API + "/ai-world/toggle-ai-world",
  REORDER: API + "/ai-world/reorder",
};

// More APIs
export const MORE_API = {
  BASE: API + "/categories/more",
  LIST: API + "/categories/more/list",
  UPDATE_STATUS: API + "/categories/more/toggle-more",
  REORDER: API + "/categories/more/reorder",
};

// Dashboard APIs
export const DASHBOARD_API = {
  BASE: API + "/dashboard",
  STATS: API + "/dashboard/stats",
  ANALYTICS: API + "/dashboard/analytics",
  FEATURE_PERFORMANCE: API + "/dashboard/feature-performance",
  DEVICE_DISTRIBUTION: API + "/dashboard/device-distribution",
  LIVE_STATUS: API + "/dashboard/live-status",
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
  REORDER_SECTION8: API + "/home/section8/reorder",
  SETTINGS: API + "/home/settings",
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

// User Preference APIs
export const USER_PREFERENCE_API = {
  BASE: API + "/user-preference",
  ADMIN: API + "/user-preference/admin",
  TOGGLE: API + "/user-preference/toggle",
  REORDER: API + "/user-preference/reorder",
};

// GA4 Analytics APIs
export const GA4_API = {
  BASE: API + "/ga4",
  USER_DEMOGRAPHICS: API + "/ga4/users/demographics",
  USER_APP_VERSIONS: API + "/ga4/users/app-versions",
  REVENUE_TREND: API + "/ga4/revenue/trend",
  ENGAGEMENT_TIME: API + "/ga4/engagement-time",
  USER_ACTIVITY_OVER_TIME: API + "/ga4/users/activity-over-time",
  USER_RETENTION: API + "/ga4/users/retention",
  EVENTS: API + "/ga4/events",
  EVENTS_OVER_TIME: API + "/ga4/events/over-time",
  EVENT_NAMES: API + "/ga4/events/names",
  FUNNEL: API + "/ga4/funnel",
  FUNNEL_ANALYSIS: API + "/ga4/funnel/analysis",
  USERS_FUNNEL: API + "/ga4/users/funnel",
  DIMENSIONS_COUNTRY: API + "/ga4/dimensions/country",
};
