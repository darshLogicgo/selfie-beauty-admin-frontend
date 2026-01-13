export interface Category {
  id: number;
  name: string;
  imageSquare: string;
  imageRectangle: string;
  videoSquare: string;
  videoRectangle: string;
  status: boolean;
  order: number;
  prompt?: string;
  country?: string;
  android_appVersion?: string;
  ios_appVersion?: string;
  _id?: string; // For MongoDB _id
  isPremium?: boolean;
  imageCount?: number;
  isAndroid?: boolean;
  isIos?: boolean;
}

export interface SubCategory {
  id: number;
  name: string;
  image: string;
  video: string;
  status: boolean;
  order: number;
  images: string[];
  country?: string;
  android_appVersion?: string;
  ios_appVersion?: string;
  isAndroid?: boolean;
  isIos?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  lastLogin: string;
  features: string[];
}

export const mockCategories: Category[] = [
  { id: 1, name: "Face Filters", imageSquare: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop", imageRectangle: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=100&fit=crop", videoSquare: "filter_video_square.mp4", videoRectangle: "filter_video_rect.mp4", status: true, order: 1 },
  { id: 2, name: "Makeup Effects", imageSquare: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop", imageRectangle: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=100&fit=crop", videoSquare: "makeup_video_square.mp4", videoRectangle: "makeup_video_rect.mp4", status: true, order: 2 },
  { id: 3, name: "Background Effects", imageSquare: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop", imageRectangle: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=100&fit=crop", videoSquare: "bg_video_square.mp4", videoRectangle: "bg_video_rect.mp4", status: true, order: 3 },
  { id: 4, name: "Hair Styles", imageSquare: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop", imageRectangle: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=100&fit=crop", videoSquare: "hair_video_square.mp4", videoRectangle: "hair_video_rect.mp4", status: false, order: 4 },
  { id: 5, name: "Eye Effects", imageSquare: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", imageRectangle: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=100&fit=crop", videoSquare: "eye_video_square.mp4", videoRectangle: "eye_video_rect.mp4", status: true, order: 5 },
  { id: 6, name: "Skin Smoothing", imageSquare: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=100&h=100&fit=crop", imageRectangle: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=200&h=100&fit=crop", videoSquare: "skin_video_square.mp4", videoRectangle: "skin_video_rect.mp4", status: true, order: 6 },
];

export const mockSubCategories: SubCategory[] = [
  { id: 1, name: "Natural Glow", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop", video: "glow_video.mp4", status: true, order: 1, images: ["img1.jpg", "img2.jpg"] },
  { id: 2, name: "Glamour Look", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&h=100&fit=crop", video: "glamour_video.mp4", status: true, order: 2, images: ["img3.jpg"] },
  { id: 3, name: "Vintage Filter", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop", video: "vintage_video.mp4", status: true, order: 3, images: [] },
  { id: 4, name: "Soft Focus", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop", video: "soft_video.mp4", status: true, order: 4, images: ["img4.jpg", "img5.jpg", "img6.jpg"] },
  { id: 5, name: "Bold Colors", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", video: "bold_video.mp4", status: false, order: 5, images: [] },
];

export const mockUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", lastLogin: "2024-01-15 10:30", features: ["Face Filters", "Makeup Effects"] },
  { id: 2, name: "Jane Smith", email: "jane@example.com", lastLogin: "2024-01-14 14:20", features: ["Hair Styles", "Eye Effects"] },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", lastLogin: "2024-01-15 09:15", features: ["Face Filters", "Background Effects", "Skin Smoothing"] },
];

export const dashboardStats = {
  totalCategories: 6,
  totalFaceSwapSubcategories: 5,
  totalUsers: 1250,
  mostUsedFeatures: [
    { name: "Face Filters", count: 8540 },
    { name: "Makeup Effects", count: 6320 },
    { name: "Background Effects", count: 4890 },
    { name: "Skin Smoothing", count: 3210 },
  ],
};
