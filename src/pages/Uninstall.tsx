import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Filter, RefreshCw, Loader2, Globe, FileSearch, PackageX, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteUninstallThunk,
  getUninstallThunk,
} from "@/store/uninstall/thunk";
import { getAppVersions } from "@/helpers/backend_helper";

const uninstallReasons = [
  "I don't need the app anymore",
  "I found a better expense tracker",
  "Too many ads or interruptions",
  "Missing features I need (Budget, Reports, Sync, Multi-currency etc.)",
  "The app is difficult or confusing to use",
  "App performance issues (slow, crashes, lag)",
  "Data backup/sync not working properly",
  "Manual expense entry takes too much time",
  "UI & design doesn't feel modern or easy to navigate",
  "Subscription or pricing problem (expensive / unclear)",
  "Other",
];

type FilterState = {
  startDate: string;
  endDate: string;
  uninstall_reason: string;
  platform: string;
  app_version: string;
};

const Uninstall: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, dataLoading, loading, deletingId, pagination } = useAppSelector(
    (state) => state.Uninstall
  );

  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    uninstall_reason: "",
    platform: "",
    app_version: "",
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [appVersions, setAppVersions] = useState<string[]>([]);
  const [loadingAppVersions, setLoadingAppVersions] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};

    if (filters.startDate) {
      // Parse date string (YYYY-MM-DD) and create UTC date at start of day
      // This ensures consistent date filtering regardless of timezone
      const [year, month, day] = filters.startDate.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      params.startDate = startDate.toISOString();
      
      // If only start date is selected (no end date), set end date to same day
      // This ensures we only show data from that specific date
      if (!filters.endDate) {
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        params.endDate = endDate.toISOString();
      }
    }
    if (filters.endDate && filters.startDate) {
      // Only allow end date if start date is also selected
      // Parse date string (YYYY-MM-DD) and create UTC date at end of day
      const [year, month, day] = filters.endDate.split('-').map(Number);
      const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      params.endDate = endDate.toISOString();
    }
    if (filters.uninstall_reason) {
      params.uninstall_reason = filters.uninstall_reason;
    }
    if (filters.platform) {
      params.platform = filters.platform;
    }
    if (filters.app_version && filters.app_version.trim()) {
      const versionValue = filters.app_version.trim();
      // If "none" is selected, send a special value to backend
      if (versionValue === "none") {
        params.app_version = "none";
      } else if (versionValue !== "all") {
        params.app_version = versionValue;
      }
    }

    params.page = page;
    params.limit = limit;

    return params;
  }, [filters, page, limit]);

  const fetchData = useCallback(() => {
    dispatch(getUninstallThunk(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch app versions from database on component mount
  useEffect(() => {
    const fetchAppVersions = async () => {
      try {
        setLoadingAppVersions(true);
        const response = await getAppVersions();
        // Backend returns: { data: { data: [...versions], status: true, message: "..." } }
        const versions = response?.data?.data || [];
        if (Array.isArray(versions) && versions.length > 0) {
          setAppVersions(versions);
        }
      } catch (error: any) {
        console.error("Failed to fetch app versions:", error);
        setAppVersions([]);
      } finally {
        setLoadingAppVersions(false);
      }
    };
    fetchAppVersions();
  }, []);

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    const result = await dispatch(deleteUninstallThunk(pendingDeleteId));
    if (deleteUninstallThunk.fulfilled.match(result)) {
      fetchData();
    }
    setPendingDeleteId(null);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      uninstall_reason: "",
      platform: "",
      app_version: "",
    });
    setPage(1);
  };
  
  // Validate that end date is not before start date
  const isEndDateValid = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return true;
    return new Date(filters.endDate) >= new Date(filters.startDate);
  }, [filters.startDate, filters.endDate]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    
    // Format as DD/MM/YYYY, HH:MM:SS AM/PM (day/month/year format)
    // Convert UTC date to local timezone for display
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // 12-hour format (1-12), no padding
    
    return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Validation: If end date is being set but start date is empty, clear end date
      if (key === 'endDate' && value && !newFilters.startDate) {
        return { ...prev, endDate: '' };
      }
      
      // Validation: If end date is before start date, clear end date
      if (key === 'endDate' && value && newFilters.startDate) {
        const endDate = new Date(value);
        const startDate = new Date(newFilters.startDate);
        if (endDate < startDate) {
          return { ...prev, endDate: '' };
        }
      }
      
      // If start date is cleared, also clear end date
      if (key === 'startDate' && !value) {
        return { ...prev, startDate: '', endDate: '' };
      }
      
      // If start date is changed and end date exists, validate end date is not before start date
      if (key === 'startDate' && value && newFilters.endDate) {
        const endDate = new Date(newFilters.endDate);
        const startDate = new Date(value);
        if (endDate < startDate) {
          return { ...prev, [key]: value, endDate: '' };
        }
      }
      
      return newFilters;
    });
    setPage(1);
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchData();
    }
  };

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.totalItems || data?.length || 0) / limit));

  const activeFilters = useMemo(() => {
    const chips: string[] = [];
    if (filters.startDate) {
      const formattedDate = new Date(filters.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      if (filters.endDate && filters.endDate !== filters.startDate) {
        const formattedEndDate = new Date(filters.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        chips.push(`${formattedDate} to ${formattedEndDate}`);
      } else {
        chips.push(`Date: ${formattedDate}`);
      }
    }
    if (filters.platform) chips.push(`Platform: ${filters.platform === 'ios' ? 'iOS' : filters.platform.charAt(0).toUpperCase() + filters.platform.slice(1)}`);
    if (filters.uninstall_reason) chips.push(`Reason: ${filters.uninstall_reason}`);
    return chips;
  }, [filters]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <PackageX className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-header mb-0">Uninstall Feedback</h1>
            <p className="text-sm text-muted-foreground">
              View and manage uninstall submissions from users.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-medium">
            {pagination?.totalItems ?? data?.length ?? 0} records
          </Badge>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={dataLoading}
            className="gap-2"
          >
            {dataLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="section-card space-y-5 mb-6 border border-border/50 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <p className="text-xs text-muted-foreground">Auto-applied when changed</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <span>Start Date</span>
              {filters.startDate && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">Active</Badge>
              )}
            </label>
            <div className="relative">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                onKeyDown={handleEnterKey}
                className="h-11 border-2 focus:border-primary/50 transition-colors pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <span>End Date</span>
              {filters.endDate && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">Active</Badge>
              )}
            </label>
            <div className="relative">
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                onKeyDown={handleEnterKey}
                className={`h-11 border-2 focus:border-primary/50 transition-colors pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                  !filters.startDate ? 'opacity-50 cursor-not-allowed bg-muted' : ''
                } ${!isEndDateValid && filters.endDate ? 'border-destructive' : ''}`}
                disabled={!filters.startDate}
                min={filters.startDate || undefined}
                title={!filters.startDate ? "Please select a start date first" : isEndDateValid ? "" : "End date cannot be before start date"}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            {!filters.startDate && (
              <p className="text-xs text-muted-foreground">Select start date first</p>
            )}
            {!isEndDateValid && filters.endDate && (
              <p className="text-xs text-destructive">End date cannot be before start date</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <span>Platform</span>
              {filters.platform && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">Active</Badge>
              )}
            </label>
            <Select
              value={filters.platform || "all"}
              onValueChange={(value) =>
                handleFilterChange("platform", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-11 border-2 focus:border-primary/50 transition-colors">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <span>Uninstall Reason</span>
              {filters.uninstall_reason && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">Active</Badge>
              )}
            </label>
            <Select
              value={filters.uninstall_reason || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "uninstall_reason",
                  value === "all" ? "" : value
                )
              }
            >
              <SelectTrigger className="h-11 border-2 focus:border-primary/50 transition-colors">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uninstallReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <span>App Version</span>
              {filters.app_version && filters.app_version !== "all" && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">Active</Badge>
              )}
            </label>
            <Select
              value={filters.app_version || "all"}
              onValueChange={(value) =>
                handleFilterChange("app_version", value === "all" ? "" : value)
              }
              disabled={loadingAppVersions}
            >
              <SelectTrigger className="h-11 border-2 focus:border-primary/50 transition-colors">
                <SelectValue placeholder={loadingAppVersions ? "Loading..." : "All"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none">None</SelectItem>
                {appVersions.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center pt-3 border-t border-border/50">
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            className="gap-2"
            disabled={!filters.startDate && !filters.endDate && !filters.platform && !filters.uninstall_reason && !filters.app_version}
          >
            <RefreshCw className="w-4 h-4" />
            Clear Filters
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Results:</span>
            <Badge variant="secondary" className="font-semibold px-2.5 py-1">
              {pagination?.totalItems ?? data?.length ?? 0}
            </Badge>
          </div>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 ml-auto">
              {activeFilters.map((chip) => (
                <Badge key={chip} variant="outline" className="text-xs px-2.5 py-1 bg-primary/5 border-primary/20">
                  {chip}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="section-card overflow-auto border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/50 flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                Feedback List
              </h2>
              <Badge variant="secondary" className="font-semibold">
                {pagination?.totalItems ?? data?.length ?? 0}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {filters.startDate
                ? filters.endDate && filters.endDate !== filters.startDate
                  ? `Filtered from ${new Date(filters.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} to ${new Date(filters.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                  : `Filtered for ${new Date(filters.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : "Showing all feedback entries sorted by latest first"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
            <Globe className="w-4 h-4" />
            <span className="font-medium">Latest first</span>
          </div>
        </div>
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading feedback...</p>
            <p className="text-xs">Please wait while we fetch the data</p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="min-w-[160px] font-semibold">Email</TableHead>
                  <TableHead className="min-w-[90px] font-semibold">Platform</TableHead>
                  <TableHead className="min-w-[180px] font-semibold">Reason</TableHead>
                  <TableHead className="min-w-[180px] font-semibold">Other Text</TableHead>
                  <TableHead className="min-w-[140px] font-semibold">Device</TableHead>
                  <TableHead className="min-w-[100px] font-semibold">App Version</TableHead>
                  <TableHead className="min-w-[120px] font-semibold">Android Version</TableHead>
                  <TableHead className="min-w-[140px] font-semibold">Package</TableHead>
                  <TableHead className="min-w-[160px] font-semibold">Created</TableHead>
                  <TableHead className="text-right min-w-[80px] font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: any, index: number) => (
                  <TableRow 
                    key={item._id} 
                    className="hover:bg-muted/30 transition-colors border-b border-border/30"
                  >
                    <TableCell className="py-4">
                      <span className="text-sm text-foreground">
                        {item?.userId?.email || item?.email || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      {item.platform ? (
                        <Badge 
                          variant="secondary" 
                          className={`capitalize font-medium ${
                            item.platform === 'ios' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            item.platform === 'android' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          }`}
                        >
                          {item.platform === 'ios' ? 'iOS' : item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs py-4">
                      <p className="text-sm text-foreground break-words line-clamp-2">
                        {item.uninstall_reason || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-xs py-4">
                      <p className="text-sm text-muted-foreground break-words line-clamp-2">
                        {item.other_reason_text || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[160px] py-4">
                      <div className="text-sm text-foreground break-words line-clamp-1">
                        {item.device_model || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-foreground font-mono">
                        {item.app_version || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-foreground font-mono">
                        {item.android_version || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-foreground font-mono break-all line-clamp-1">
                        {item.package_name || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9 w-9"
                        onClick={() => setPendingDeleteId(item._id)}
                        disabled={loading && deletingId === item._id}
                        title="Delete feedback"
                      >
                        {loading && deletingId === item._id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-blue-600" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileSearch className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No feedback found</p>
            <p className="text-xs text-muted-foreground">
              {filters.startDate || filters.endDate || filters.platform || filters.uninstall_reason
                ? "Try adjusting your filters to see more results"
                : "No uninstall feedback has been submitted yet"}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{(currentPage - 1) * limit + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * limit, pagination?.totalItems ?? 0)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{pagination?.totalItems ?? 0}</span> results
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || dataLoading}
              className="gap-1"
            >
              <span>Prev</span>
            </Button>
            <div className="px-3 py-1.5 text-sm font-medium text-foreground bg-muted rounded-md">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={dataLoading || (pagination?.totalPages ? currentPage >= pagination.totalPages : data.length < limit)}
              className="gap-1"
            >
              <span>Next</span>
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The uninstall feedback will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Uninstall;

