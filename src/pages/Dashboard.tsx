import React, { useEffect, useState } from "react";
import {
  FolderOpen,
  Users,
  UserCheck,
  BarChart3,
  Loader2,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Calendar,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getDashboardStatsThunk,
  getLiveStatusThunk,
} from "@/store/dashboard/thunk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, liveStatus, liveStatusLoading } = useAppSelector(
    (state) => state.Dashboard
  );

  const [filter, setFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Get today's date in YYYY-MM-DD format (max date for both inputs)
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    dispatch(getDashboardStatsThunk());
    // Only auto-fetch if filter is not 'custom' (custom requires manual Apply)
    if (filter !== "custom") {
      dispatch(getLiveStatusThunk({ filter }));
    }
  }, [dispatch, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (newFilter !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleApplyCustomFilter = () => {
    if (filter !== "custom") {
      console.warn("Custom filter not selected");
      return;
    }

    // Validate dates are not empty
    if (!startDate || !endDate) {
      console.warn("Start date or end date is missing", { startDate, endDate });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      console.warn("Invalid date format", { startDate, endDate });
      return;
    }

    // Validate dates are not in the future
    if (startDate > today || endDate > today) {
      console.warn("Cannot select future dates", { startDate, endDate, today });
      return;
    }

    // Validate end date is not before start date
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn("Invalid date values", { startDate, endDate });
      return;
    }

    if (end < start) {
      console.warn("End date is before start date, swapping dates", {
        startDate,
        endDate,
      });
      // Swap dates if end is before start
      const temp = startDate;
      setStartDate(endDate);
      setEndDate(temp);
      dispatch(
        getLiveStatusThunk({ filter, startDate: endDate, endDate: startDate })
      );
      return;
    }

    // All validations passed, dispatch the action
    console.log("Applying custom filter with dates", {
      filter,
      startDate,
      endDate,
    });
    dispatch(getLiveStatusThunk({ filter, startDate, endDate }));
  };

  const getFilterLabel = (value: string) => {
    const labels: Record<string, string> = {
      all: "All",
      today: "Today",
      yesterday: "Yesterday",
      week: "Week",
      month: "Month",
      custom: "Custom",
    };
    return labels[value] || value;
  };

  const statsCards = [
    {
      title: "Total Categories",
      value: stats.totalCategories || 0,
      icon: FolderOpen,
      gradient: "gradient-primary",
    },
    {
      title: "Active Categories",
      value: stats.activeCategories || 0,
      icon: FolderOpen,
      gradient: "gradient-success",
    },
    {
      title: "Total Users",
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: Users,
      gradient: "gradient-info",
    },
    {
      title: "Total Subscribe User",
      value: (stats.subscribedUsers || 0).toLocaleString(),
      icon: UserCheck,
      gradient: "gradient-warning",
    },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h1 className="page-header">Dashboard</h1>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
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

      {/* Live Status Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Live Status
            </h2>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[140px] h-9 border-gray-300 bg-white hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <SelectValue>
                    <span className="font-medium">
                      {getFilterLabel(filter)}
                    </span>
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Custom</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {filter === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    // Prevent selecting future dates
                    if (newStartDate > today) {
                      return;
                    }
                    setStartDate(newStartDate);
                    // If end date exists and is before new start date, clear it
                    if (
                      endDate &&
                      newStartDate &&
                      new Date(endDate) < new Date(newStartDate)
                    ) {
                      setEndDate("");
                    }
                  }}
                  max={today}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Start Date"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    // Prevent selecting future dates
                    if (newEndDate > today) {
                      return;
                    }
                    // Validate end date is not before start date
                    if (
                      startDate &&
                      newEndDate &&
                      new Date(newEndDate) < new Date(startDate)
                    ) {
                      // Don't update if invalid
                      return;
                    }
                    setEndDate(newEndDate);
                  }}
                  min={startDate || undefined}
                  max={today}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="End Date"
                />
                <button
                  onClick={handleApplyCustomFilter}
                  disabled={
                    !startDate ||
                    !endDate ||
                    (startDate &&
                      endDate &&
                      new Date(endDate) < new Date(startDate)) ||
                    startDate > today ||
                    endDate > today
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={
                    !startDate || !endDate
                      ? "Please select both dates"
                      : startDate > today || endDate > today
                      ? "Cannot select future dates"
                      : startDate &&
                        endDate &&
                        new Date(endDate) < new Date(startDate)
                      ? "End date must be after start date"
                      : "Apply filter"
                  }
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {liveStatusLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(liveStatus).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(liveStatus).map(
              ([categoryName, categoryData], index) => {
                const categoryDisplayName = categoryName
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                return (
                  <div
                    key={categoryName}
                    className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-4 text-base">
                      {categoryDisplayName}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Success
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {categoryData.success_calls.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Failed
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {categoryData.failed_calls.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Success Rate
                        </span>
                        <span className="font-bold text-green-600 text-sm">
                          {categoryData.success_rate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-500" />
                          Avg Response
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {(categoryData.avg_response_time_ms / 1000).toFixed(
                            2
                          )}
                          s
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-gray-600 text-sm">
                          Total Records
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {categoryData.total_records.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No live status data available
          </div>
        )}
      </div>

      {/* Most Used Categories */}
      <div className="stat-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Most Used Categories
          </h2>
        </div>

        <div className="space-y-4">
          {stats.mostUsedCategories && stats.mostUsedCategories.length > 0 ? (
            stats.mostUsedCategories.map((category, index) => {
              const maxUsers = stats.mostUsedCategories[0]?.mediaclicks || 1;
              const percentage =
                maxUsers > 0 ? (category.mediaclicks / maxUsers) * 100 : 0;

              return (
                <div
                  key={category._id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {category.mediaclicks.toLocaleString()} users
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No category data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
