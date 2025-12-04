import React from 'react';
import { FolderOpen, Layers, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { dashboardStats } from '@/data/mockData';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Categories',
      value: dashboardStats.totalCategories,
      icon: FolderOpen,
      gradient: 'gradient-primary',
    },
    {
      title: 'FaceSwap Subcategories',
      value: dashboardStats.totalFaceSwapSubcategories,
      icon: Layers,
      gradient: 'gradient-success',
    },
    {
      title: 'Total Users',
      value: dashboardStats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: 'gradient-info',
    },
    {
      title: 'Active Features',
      value: dashboardStats.mostUsedFeatures.length,
      icon: TrendingUp,
      gradient: 'gradient-warning',
    },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className={`stat-card-gradient ${stat.gradient}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Most Used Features */}
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Most Used Features</h2>
        </div>

        <div className="space-y-4">
          {dashboardStats.mostUsedFeatures.map((feature, index) => {
            const maxCount = dashboardStats.mostUsedFeatures[0].count;
            const percentage = (feature.count / maxCount) * 100;

            return (
              <div key={feature.name} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{feature.name}</span>
                  <span className="text-muted-foreground text-sm">{feature.count.toLocaleString()} uses</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
