import * as APIHandler from "./api_helper";
import * as url from "./url_helper";
import axios from "axios";

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

export const toggleCategoryAndroidActive = (id: string, isAndroid: boolean) => {
  const formData = new FormData();
  formData.append('isAndroid', isAndroid.toString());
  return api.patch(`${url.CATEGORY_API.UPDATE}/${id}`, formData);
};

export const toggleCategoryIOSActive = (id: string, isIos: boolean) => {
  const formData = new FormData();
  formData.append('isIos', isIos.toString());
  return api.patch(`${url.CATEGORY_API.UPDATE}/${id}`, formData);
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

export const updateSubcategoryTrendingStatus = (
  id: string,
  data: { isTrending: boolean }
) => {
  return api.patch(`${url.TRENDING_API.UPDATE_SUBCATEGORY_STATUS}/${id}`, data);
};

export const reorderTrending = (data: {
  categories: Array<{ _id: string; trendingOrder: number }>;
}) => {
  return api.patch(url.TRENDING_API.REORDER, data);
};

export const reorderTrendingSubcategories = (data: {
  subcategories: Array<{ _id: string; trendingOrder: number }>;
}) => {
  return api.patch(url.TRENDING_API.REORDER_SUBCATEGORIES, data);
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
// More API Functions
// ============================================
export const getMore = () => {
  return api.get(url.MORE_API.BASE);
};

export const updateMoreStatus = (id: string, data: { isMore: boolean }) => {
  return api.patch(`${url.MORE_API.UPDATE_STATUS}/${id}`, data);
};

export const reorderMore = (data: {
  categories: Array<{ _id: string; moreOrder: number }>;
}) => {
  return api.patch(url.MORE_API.REORDER, data);
};

// ============================================
// Uninstall API Functions
// ============================================
export const getUninstall = (queryParams?: Record<string, any>) => {
  return api.get(url.UNINSTALL_API.BASE, queryParams);
};

export const getAppVersions = () => {
  return api.get(`${url.UNINSTALL_API.BASE}/app-versions`);
};

export const deleteUninstall = (id: string) => {
  return api.remove(`${url.UNINSTALL_API.BASE}/${id}`);
};

// ============================================
// Feedback/Support API Functions
// ============================================
export const getFeedback = (queryParams?: Record<string, any>) => {
  return api.get(url.FEEDBACK_API.BASE, queryParams);
};

export const getFeedbackStats = () => {
  return api.get(url.FEEDBACK_API.STATS);
};

export const getFeedbackById = (id: string) => {
  return api.get(`${url.FEEDBACK_API.BASE}/${id}`);
};

export const updateFeedbackStatus = (id: string, status: string) => {
  return api.patch(`${url.FEEDBACK_API.BASE}/${id}/status`, { status });
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

export const reorderHomeSection8 = (data: {
  subcategories: Array<{ _id: string; section8Order: number }>;
}) => {
  return api.patch(url.HOME_API.REORDER_SECTION8, data);
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

// ============================================
// User Preference API Functions
// ============================================
export const getUserPreference = (queryParams?: Record<string, any>) => {
  return api.get(url.USER_PREFERENCE_API.ADMIN, queryParams);
};

export const toggleUserPreference = (
  id: string,
  data: { isUserPreference: boolean }
) => {
  return api.patch(`${url.USER_PREFERENCE_API.TOGGLE}/${id}`, data);
};

export const reorderUserPreference = (data: {
  categories: Array<{ _id: string; userPreferenceOrder: number }>;
}) => {
  return api.patch(url.USER_PREFERENCE_API.REORDER, data);
};

// ============================================
// Dashboard API Functions
// ============================================
export const getDashboardStats = () => {
  return api.get(url.DASHBOARD_API.STATS);
};

// ============================================
// GA4 Analytics API Functions
// ============================================
export const getGA4UserDemographics = (queryString?: string) => {
  let urlWithParams = url.GA4_API.USER_DEMOGRAPHICS;
  if (queryString) {
    urlWithParams += `?${queryString}`;
  }
  return api.get(urlWithParams);
};

export const getGA4AppVersions = (queryString?: string) => {
  let urlWithParams = url.GA4_API.USER_APP_VERSIONS;
  if (queryString) {
    urlWithParams += `?${queryString}`;
  }
  return api.get(urlWithParams);
};

export const getGA4RevenueTrend = (queryString?: string) => {
  let urlWithParams = url.GA4_API.REVENUE_TREND;
  if (queryString) {
    urlWithParams += `?${queryString}`;
  }
  return api.get(urlWithParams);
};

export const getGA4EngagementTime = (queryString?: string) => {
  let urlWithParams = url.GA4_API.ENGAGEMENT_TIME;
  if (queryString) {
    urlWithParams += `?${queryString}`;
  }
  return api.get(urlWithParams);
};

export const getGA4UserActivityOverTime = (queryString?: string) => {
  let urlWithParams = url.GA4_API.USER_ACTIVITY_OVER_TIME;
  if (queryString) {
    urlWithParams += `?${queryString}`;
  }
  return api.get(urlWithParams);
};

export const getGA4UserRetention = (queryString?: string) => {
  let urlWithParams = url.GA4_API.USER_RETENTION;
  if (queryString) {
    urlWithParams += `?${queryString}`;
  }
  return api.get(urlWithParams);
};

// ============================================
// Live Status API Functions
// ============================================
const LIVE_STATUS_BASE_URL =
  import.meta.env.VITE_LIVE_STATUS_BASE_URL 
  
const STATIC_TOKEN =
  import.meta.env.VITE_STATIC_TOKEN 
  

// Category endpoints mapping
const LIVE_STATUS_ENDPOINTS = {
  faceswap: "/api-status-faceswap",
  background_remover: "/api-status-background-remover",
  halloween_image: "/api-status-halloween-image",
  nanobanana: "/api-status-nanobanana",
  descratch: "/api-status-descratch",
  object_remover: "/api-status-object-remover",
  colorization: "/api-status-colorization",
  face_enhancer: "/api-status-face-enhancer",
  polaroid: "/api-status-polaroid",
  bikini_swap: "/api-status-bikini-swap",
};
// ============================================
// Dashboard – Feature Performance API
// ============================================

export const getFeaturePerformance = async () => {
  try {
    const response = await api.get(url.DASHBOARD_API.FEATURE_PERFORMANCE);

    const json = response?.data || {};

    // Use the new API response structure
    if (json.data?.feature_performance) {
      const features = json.data.feature_performance.map((f: any) => ({
        feature: f.feature,
        uses: f.uses,
        color: f.color,
      }));

      // Sort by uses descending and filter out zero usage
      const sortedFeatures = features
        .filter((f) => f.uses > 0)
        .sort((a, b) => b.uses - a.uses);

      // Return features with additional metrics
      const result = {
        features: sortedFeatures,
        totalUses: json.data.totalUses || sortedFeatures.reduce((sum, f) => sum + f.uses, 0),
        paywallHits: json.data.paywallHits || 0,
        usageRate: json.data.usageRate || 0,
        conversionRate: json.data.conversionRate || 0,
      };
      
      return result;
    }

    // Fallback to empty structure if new API structure not found
    return {
      features: [],
      totalUses: 0,
      paywallHits: 0,
      usageRate: 0,
      conversionRate: 0,
    };
  } catch (error) {
    throw error;
  }
};

export const getDeviceDistribution = async () => {
  try {
    const response = await api.get(url.DASHBOARD_API.DEVICE_DISTRIBUTION);

    const json = response?.data || {};

    // Use the API response structure
    if (json.data) {
      const result = {
        ios: {
          count: json.data.ios?.count || 0,
          percentage: json.data.ios?.percentage || 0,
        },
        android: {
          count: json.data.android?.count || 0,
          percentage: json.data.android?.percentage || 0,
        },
        other: {
          count: json.data.other?.count || 0,
          percentage: json.data.other?.percentage || 0,
        },
        total: json.data.total || 0,
      };
      
      return result;
    } else {
      return {
        ios: { count: 0, percentage: 0 },
        android: { count: 0, percentage: 0 },
        other: { count: 0, percentage: 0 },
        total: 0,
      };
    }
  } catch (error) {
    throw error;
  }
};

export const getLiveStatus = async (
  filter: string = "all",
  startDate?: string,
  endDate?: string
) => {
  const queryParams: Record<string, string> = {
    filter,
  };
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = `${LIVE_STATUS_BASE_URL}/live-status${
    queryString ? `?${queryString}` : ""
  }`;

  return axios.get(fullUrl, {
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};

// ============================================
// Live Status API Functions (External)
// ============================================

export const getExternalLiveStatus = async (
  filter: string = "all",
  startDate?: string,
  endDate?: string
) => {
  const queryParams: Record<string, string> = {
    filter,
  };
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  const promises = Object.entries(LIVE_STATUS_ENDPOINTS).map(async ([categoryKey, endpoint]) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const fullUrl = `${LIVE_STATUS_BASE_URL}${endpoint}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(fullUrl, {
        headers: {
          Authorization: `Bearer ${STATIC_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      return { categoryKey, data: response.data };
    } catch (error: any) {
      return {
        categoryKey,
        data: null,
        error: error.response?.data?.message || "Failed to fetch",
      };
    }
  });

  const results = await Promise.all(promises);

  const liveStatusData: Record<string, any> = {};
  results.forEach(({ categoryKey, data, error }) => {
    if (data) {
      liveStatusData[categoryKey] = data;
    }
  });

  return { data: liveStatusData };
};
