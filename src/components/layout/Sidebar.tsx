import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  Home,
  Camera,
  TrendingUp,
  Globe,
  LogOut,
  Sparkles,
  Headphones,
  PackageX,
  MoreHorizontal,
  Heart,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth/slice";
import { cn } from "@/lib/utils";
import { AUTH_ROUTES, ADMIN_ROUTES } from "@/constants/routes";

const menuItems = [
  { path: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Dashboard" },
  { path: ADMIN_ROUTES.CATEGORIES, icon: FolderOpen, label: "Categories" },
  { path: ADMIN_ROUTES.SUB_CATEGORIES, icon: Layers, label: "Subcategories" },
  { path: ADMIN_ROUTES.HOME_SETTINGS, icon: Home, label: "Home" },
  { path: ADMIN_ROUTES.MORE, icon: MoreHorizontal, label: "More" },
  { path: ADMIN_ROUTES.AI_PHOTO, icon: Camera, label: "AI Photo" },
  { path: ADMIN_ROUTES.TRENDING, icon: TrendingUp, label: "Trending" },
  { path: ADMIN_ROUTES.AI_WORLD, icon: Globe, label: "AI World" },
  { path: ADMIN_ROUTES.USER_PREFERENCE, icon: Heart, label: "User Preference" },
  { path: ADMIN_ROUTES.SUPPORT, icon: Headphones, label: "Support" },
  { path: ADMIN_ROUTES.UNINSTALL, icon: PackageX, label: "Uninstall" },
];

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate(AUTH_ROUTES.SIGN_IN);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-semibold text-lg leading-tight">
              Selfie Beauty
            </h1>
            <p className="text-sidebar-muted text-xs">Camera Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn("sidebar-item", isActive && "sidebar-item-active")
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
