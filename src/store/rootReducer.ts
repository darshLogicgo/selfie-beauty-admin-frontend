import { combineReducers } from "@reduxjs/toolkit";
import Auth from "./auth/slice";
import Category from "./category/slice";
import Trending from "./trending/slice";
import AIWorld from "./aiWorld/slice";
import HomeSettings from "./homeSettings/slice";
import SubCategory from "./subcategory/slice";
import AIPhoto from "./aiPhoto/slice";
import Support from "./support/slice";
import Uninstall from "./uninstall/slice";
import Dashboard from "./dashboard/slice";

export const appReducer = combineReducers({
  Auth,
  Category,
  Trending,
  AIWorld,
  HomeSettings,
  SubCategory,
  AIPhoto,
  Support,
  Uninstall,
  Dashboard,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return appReducer(state, action);
};

