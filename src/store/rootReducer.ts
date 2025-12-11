import { combineReducers } from "@reduxjs/toolkit";
import Auth from "./auth/slice";
import Category from "./category/slice";
import Trending from "./trending/slice";
import AIWorld from "./aiWorld/slice";
import HomeSettings from "./homeSettings/slice";
import SubCategory from "./subcategory/slice";
import AIPhoto from "./aiPhoto/slice";
// Import other slices here as you create them
// import Dashboard from "./dashboard/slice";

export const appReducer = combineReducers({
  Auth,
  Category,
  Trending,
  AIWorld,
  HomeSettings,
  SubCategory,
  AIPhoto,
  // Add other reducers here as you create them
  // Dashboard,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return appReducer(state, action);
};

