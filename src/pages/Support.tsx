import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Headphones, Search, RefreshCw, Loader2, Eye, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getFeedbackThunk,
  updateFeedbackStatusThunk,
} from "@/store/support/thunk";
import { clearSelectedRequest, setSelectedRequest } from "@/store/support/slice";

const Support: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, dataLoading, selectedRequest, loading, updatingId, pagination } = useAppSelector(
    (state) => state.Support
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (statusFilter && statusFilter !== "all") {
      params.status = statusFilter;
    }

    params.page = page;
    params.limit = limit;

    return params;
  }, [debouncedSearch, statusFilter, page, limit]);

  const fetchData = useCallback(() => {
    dispatch(getFeedbackThunk(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetails = (id: string) => {
    // Find the feedback item from the existing data
    const feedbackItem = data.find((item: any) => item._id === id);
    if (feedbackItem) {
      dispatch(setSelectedRequest(feedbackItem));
      setIsDetailsOpen(true);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    dispatch(clearSelectedRequest());
  };

  const handleStatusChange = async (id: string, status: "resolved" | "pending") => {
    const result = await dispatch(
      updateFeedbackStatusThunk({ id, status })
    );
    if (updateFeedbackStatusThunk.fulfilled.match(result)) {
      // Status updated successfully, state is already updated in the slice
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedRequest) return;
    await handleStatusChange(selectedRequest._id, "resolved");
  };

  const handleMarkAsPending = async () => {
    if (!selectedRequest) return;
    await handleStatusChange(selectedRequest._id, "pending");
  };


  const handleSearchChange = (value: string) => {
    setSearch(value);
  };


  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    
    // Format as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.totalItems || data?.length || 0) / limit));

  // Calculate stats from current data
  // Note: For accurate total stats, we'd need a separate API call without filters
  // For now, we calculate from the current page data
  const stats = useMemo(() => {
    if (dataLoading || !data) {
      return { pending: 0, resolved: 0, total: 0 };
    }
    
    // If we have filtered data, calculate from it
    // Otherwise, use pagination total as approximation
    const pending = data.filter((item: any) => !item.status || item.status === "pending").length;
    const resolved = data.filter((item: any) => item.status === "resolved").length;
    
    // For total, use pagination totalItems if available, otherwise sum of current page
    const total = pagination?.totalItems || (pending + resolved);
    
    return { pending, resolved, total };
  }, [data, dataLoading, pagination?.totalItems]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-header mb-0">Support Requests</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer support tickets
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pending Requests */}
        <div className="section-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {dataLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  stats.pending
                )}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {/* Resolved Requests */}
        <div className="section-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {dataLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  stats.resolved
                )}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>

        {/* Total Requests */}
        <div className="section-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {dataLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                ) : (
                  stats.total
                )}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="section-card mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card overflow-auto">
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading feedback...</p>
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">App Info</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(null, item?.email || item?.userId?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {item?.email || item?.userId?.email || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground line-clamp-1 max-w-xs">
                      {item.title || item.subject || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.appVersion && (
                        <Badge variant="outline" className="text-xs">
                          v{item.appVersion}
                        </Badge>
                      )}
                      {item.platform && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.platform}
                        </Badge>
                      )}
                      {!item.appVersion && !item.platform && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(!item.status || item.status === "pending") ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(item._id, item.status === "resolved" ? "pending" : "resolved")}
                        disabled={loading && updatingId === item._id}
                        className="gap-1"
                        title={item.status === "resolved" ? "Mark as Pending" : "Mark as Resolved"}
                      >
                        {loading && updatingId === item._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : item.status === "resolved" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item._id)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No feedback found</p>
            <p className="text-xs text-muted-foreground">
              {search
                ? "Try adjusting your search to see more results"
                : "No feedback has been submitted yet"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.length > 0 && (
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
      )}

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDetails();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(null, selectedRequest?.email || selectedRequest?.userId?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedRequest?.email || selectedRequest?.userId?.email || "—"}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Title</label>
                <div className="p-3 rounded-md bg-muted border border-border">
                  <p className="text-sm text-foreground">{selectedRequest.title || selectedRequest.subject || "—"}</p>
                </div>
              </div>
              
              {/* App Info */}
              {(selectedRequest.appVersion || selectedRequest.platform) && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">App Information</label>
                  <div className="p-3 rounded-md bg-muted border border-border">
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.appVersion && (
                        <Badge variant="outline">Version: {selectedRequest.appVersion}</Badge>
                      )}
                      {selectedRequest.platform && (
                        <Badge variant="secondary" className="capitalize">Platform: {selectedRequest.platform}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Description</label>
                <div className="p-3 rounded-md bg-muted border border-border min-h-[100px]">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedRequest.description || "—"}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Attachments</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedRequest.attachments.map((attachment: any, index: number) => {
                      // Handle both string URLs and object format
                      const attachmentUrl = typeof attachment === 'string' ? attachment : attachment.url;
                      const attachmentName = typeof attachment === 'string' 
                        ? `Attachment ${index + 1}` 
                        : (attachment.filename || `Attachment ${index + 1}`);
                      
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={attachmentUrl}
                            alt={attachmentName}
                            className="w-full h-32 object-cover rounded-md border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(attachmentUrl, '_blank')}
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Submitted: {formatDate(selectedRequest.createdAt)}
                </p>
                <div className="flex items-center gap-3">
                  {selectedRequest.updatedAt && selectedRequest.updatedAt !== selectedRequest.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Updated: {formatDate(selectedRequest.updatedAt)}
                    </p>
                  )}
                  {(!selectedRequest.status || selectedRequest.status === "pending") ? (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {(!selectedRequest.status || selectedRequest.status === "pending") ? (
                  <Button
                    onClick={handleMarkAsResolved}
                    disabled={loading && updatingId === selectedRequest._id}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading && updatingId === selectedRequest._id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleMarkAsPending}
                    disabled={loading && updatingId === selectedRequest._id}
                    variant="outline"
                    className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    {loading && updatingId === selectedRequest._id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Mark as Pending
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
