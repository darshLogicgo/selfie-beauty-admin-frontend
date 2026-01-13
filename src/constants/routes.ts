// Auth Routes
export const AUTH_ROUTES = {
  SIGN_IN: "/login",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CHANGE_PASSWORD: "/change-password",
};

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  DASHBOARD_TEST: "/dashboard-test",
  CATEGORIES: "/categories",
  SUB_CATEGORIES: "/subcategories",
  HOME_SETTINGS: "/home-settings",
  AI_PHOTO: "/ai-photo",
  TRENDING: "/trending",
  AI_WORLD: "/ai-world",
  USER_PREFERENCE: "/user-preference",
  MORE: "/more",
  SUPPORT: "/support",
  UNINSTALL: "/uninstall",
  EVENTS: "/events",
  FUNNEL_ANALYTICS: "/funnel-analytics",
};

// API Endpoints Constants (for reference, actual endpoints are in url_helper.ts)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
  },
  CATEGORY: {
    BASE: "/api/category",
    LIST: "/api/category/list",
  },
  SUB_CATEGORY: {
    BASE: "/api/subcategory",
    LIST: "/api/subcategory/list",
  },
  HOME_SETTINGS: {
    BASE: "/api/home-settings",
  },
  AI_PHOTO: {
    BASE: "/api/ai-photo",
    LIST: "/api/ai-photo/list",
  },
  TRENDING: {
    BASE: "/api/trending",
    LIST: "/api/trending/list",
  },
  AI_WORLD: {
    BASE: "/api/ai-world",
    LIST: "/api/ai-world/list",
  },
  USER_PREFERENCE: {
    BASE: "/api/user-preference",
    ADMIN: "/api/user-preference/admin",
  },
  MORE: {
    BASE: "/api/more",
    LIST: "/api/more/list",
  },
  DASHBOARD: {
    BASE: "/api/dashboard",
    STATS: "/api/dashboard/stats",
  },
};
