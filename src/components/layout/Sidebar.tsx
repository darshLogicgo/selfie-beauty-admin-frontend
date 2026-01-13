import React, { useState } from "react";
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
  TestTube,
  BarChart3,
  GitBranch,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth/slice";
import { cn } from "@/lib/utils";
import { AUTH_ROUTES, ADMIN_ROUTES } from "@/constants/routes";

const menuItems = [
  { path: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Dashboard" },
  // { path: ADMIN_ROUTES.DASHBOARD_TEST, icon: TestTube, label: "Dashboard Test" },
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
  { path: ADMIN_ROUTES.EVENTS, icon: BarChart3, label: "Events" },
  {
    path: ADMIN_ROUTES.FUNNEL_ANALYTICS,
    icon: GitBranch,
    label: "Funnel Analytics",
  },
];

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate(AUTH_ROUTES.SIGN_IN);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50",
        isHovered 
          ? "w-64 shadow-2xl border-r border-sidebar-border/50 transition-all duration-300 ease-in-out" 
          : "w-20 border-r border-sidebar-border/30 transition-none"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={cn(
        "border-b border-sidebar-border/50 relative overflow-hidden",
        isHovered ? "p-6 transition-all duration-300" : "p-4 transition-none"
      )}>
        <div className="flex items-center gap-3 relative z-10">
          <div className={cn(
            "rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg",
            isHovered ? "w-10 h-10 transition-all duration-300" : "w-9 h-9 transition-none"
          )}>
            <Sparkles className={cn(
              "text-sidebar-primary-foreground",
              isHovered ? "w-6 h-6 transition-all duration-300" : "w-5 h-5 transition-none"
            )} />
          </div>
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap",
              isHovered 
                ? "opacity-100 max-w-full translate-x-0 transition-all duration-300" 
                : "opacity-0 max-w-0 -translate-x-2 transition-none"
            )}
          >
            <h1 className="text-sidebar-foreground font-bold text-lg leading-tight tracking-tight">
              Selfie Beauty
            </h1>
            <p className="text-sidebar-muted text-xs font-medium mt-0.5">Camera Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-sidebar-accent scrollbar-track-transparent">
        <ul className="space-y-1.5">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "sidebar-item group relative overflow-hidden",
                    isActive && "sidebar-item-active",
                    !isHovered && "justify-center px-0"
                  )
                }
                title={!isHovered ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && isHovered && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full shadow-lg shadow-sidebar-primary/50" />
                    )}
                    {isActive && !isHovered && (
                      <div className="absolute inset-0 bg-sidebar-primary/20 rounded-lg" />
                    )}
                    <item.icon className={cn(
                      "flex-shrink-0 transition-all duration-200 relative z-10",
                      isActive && "text-sidebar-primary",
                      !isHovered && isActive && "scale-110"
                    )} />
                    <span
                      className={cn(
                        "font-medium whitespace-nowrap overflow-hidden relative z-10",
                        isHovered 
                          ? "opacity-100 max-w-full translate-x-0 transition-all duration-300" 
                          : "opacity-0 max-w-0 -translate-x-2 transition-none"
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border/50">
        <button
          onClick={handleLogout}
          className={cn(
            "sidebar-item w-full text-red-400/90 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 relative group",
            !isHovered && "justify-center px-0"
          )}
          title={!isHovered ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span
            className={cn(
              "font-medium whitespace-nowrap overflow-hidden",
              isHovered 
                ? "opacity-100 max-w-full translate-x-0 transition-all duration-300" 
                : "opacity-0 max-w-0 -translate-x-2 transition-none"
            )}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
