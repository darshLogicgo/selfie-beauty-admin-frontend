import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import SubCategories from "@/pages/SubCategories";
import HomeSettings from "@/pages/HomeSettings";
import AIPhoto from "@/pages/AIPhoto";
import Trending from "@/pages/Trending";
import AIWorld from "@/pages/AIWorld";
import UserPreference from "@/pages/UserPreference";
import More from "@/pages/More";
import Support from "@/pages/Support";
import Uninstall from "@/pages/Uninstall";
import NotFound from "./pages/NotFound";
import { AUTH_ROUTES, ADMIN_ROUTES } from "@/constants/routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            maxWidth: "800px",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path={AUTH_ROUTES.SIGN_IN} element={<Login />} />
          <Route path="/" element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />} />
          <Route element={<AdminLayout />}>
            <Route path={ADMIN_ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ADMIN_ROUTES.CATEGORIES} element={<Categories />} />
            <Route path={ADMIN_ROUTES.SUB_CATEGORIES} element={<SubCategories />} />
            <Route path={ADMIN_ROUTES.HOME_SETTINGS} element={<HomeSettings />} />
            <Route path={ADMIN_ROUTES.MORE} element={<More />} />
            <Route path={ADMIN_ROUTES.AI_PHOTO} element={<AIPhoto />} />
            <Route path={ADMIN_ROUTES.TRENDING} element={<Trending />} />
            <Route path={ADMIN_ROUTES.AI_WORLD} element={<AIWorld />} />
            <Route path={ADMIN_ROUTES.USER_PREFERENCE} element={<UserPreference />} />
            <Route path={ADMIN_ROUTES.SUPPORT} element={<Support />} />
            <Route path={ADMIN_ROUTES.UNINSTALL} element={<Uninstall />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
