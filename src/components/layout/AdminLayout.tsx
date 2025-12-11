import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AUTH_ROUTES } from '@/constants/routes';

const AdminLayout: React.FC = () => {
  const token = localStorage.getItem("token");

  // Only check token - if no token, redirect to login
  if (!token) {
    return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
  } 

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
