import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {
  Search,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  TrendingDown,
  Users,
  Percent,
  ArrowRight,
  Settings2,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Save,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDateRangeForPreset } from "@/helpers/dateRange.helper";
import { DateRangePicker } from "@/components/DateRangePicker";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGA4EventNamesThunk,
  getGA4UsersFunnelThunk,
} from "@/store/dashboard/thunk";
import {
  getGA4CountryDimensions,
  getGA4AppVersionDimensions,
  saveGA4UsersFunnel,
  updateFunnelName,
  getSavedFunnels,
  getSavedFunnelGroups,
  createFunnelGroup,
  getGroupFunnels,
  deleteFunnelGroup,
} from "@/helpers/backend_helper";
import { toastSuccess, toastError } from "@/config/toastConfig";

// ============================================
// Types & Interfaces
// ============================================

interface FunnelEvent {
  eventName: string;
  eventCount: number;
  displayName?: string;
}

interface FunnelStep {
  id: string;
  eventName: string;
  displayName: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  abandonments?: number;
  completionRate?: number;
  abandonmentRate?: number;
}

interface FunnelData {
  steps: FunnelStep[];
  totalUsers: number;
  overallConversion: number;
}

interface SavedFunnel {
  id: string;
  name: string;
  steps: string[];
  createdAt: string;
  groupId?: string; // Add groupId to identify groups
  configuration?: {
    eventNames?: string[];
    startDate?: string;
    endDate?: string;
    dimension?: string;
    row?: number;
    segments?: Array<{ value: string | string[]; type: string }>;
  };
}

interface SegmentComparisonItem {
  id: string; // Unique ID for drag and drop
  type: "segment" | "countryGroup" | "appVersionGroup";
  segmentId?: string; // For regular segments
  countryGroup?: string[]; // For country groups
  appVersionGroup?: string[]; // For app version groups
  label: string; // Display label
}

interface FunnelItem {
  id: string;
  name: string;
  selectedSteps: string[];
  startDate: string;
  endDate: string;
  breakdownDimension: string;
  rowsPerDimension: string;
  selectedSegments: string[];
  selectedSegmentComparisons: SegmentComparisonItem[];
  savedCountryArrays: string[][];
  savedAppVersionArrays: string[][];
  selectedDimensionValue: { value: string; type: string } | null;
  showElapsedTime: boolean;
  preset: string;
  savedFunnelId?: string; // Original funnel ID from API for savedFunnelId query param
}

interface FunnelGroup {
  id: string;
  name: string;
  funnels: FunnelItem[];
  activeFunnelId: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: string;
  icon?: string;
}

// Available Segments Data
const AVAILABLE_SEGMENTS: Segment[] = [
  {
    id: "all_users",
    name: "All Users",
    description: "Includes all your data.",
    conditions: "",
    icon: "👥",
  },
  {
    id: "direct_traffic",
    name: "Direct traffic",
    description: "Sessions acquired directly.",
    conditions: "Session default channel group = Direct",
    icon: "👥",
  },
  {
    id: "email_sms_push",
    name: "Email, SMS & push notifications traffic",
    description: "Sessions acquired via emails, SMS or push notifications.",
    conditions:
      'Session default channel group in "Email, SMS, Mobile Push Notifications"',
    icon: "👥",
  },
  {
    id: "mobile_traffic",
    name: "Mobile traffic",
    description: "Traffic on mobile phones.",
    conditions: "Device category = mobile",
    icon: "👥",
  },
  {
    id: "organic_traffic",
    name: "Organic traffic",
    description: "Sessions acquired via organic channels.",
    conditions:
      'Session default channel group in "Organic Search, Organic Video, Organic Social, Organic Shopping"',
    icon: "👥",
  },
  {
    id: "paid_traffic",
    name: "Paid traffic",
    description: "Sessions acquired via paid channels.",
    conditions:
      'Session default channel group in "Paid Shopping, Paid Search, Paid Social, Paid Other, Paid Video, Display, Cross-network, Audio"',
    icon: "👥",
  },
  {
    id: "referral_affiliates",
    name: "Referral & affiliates traffic",
    description: "Sessions acquired via referrals or affiliates.",
    conditions: 'Session default channel group in "Referral, Affiliates"',
    icon: "👥",
  },
  {
    id: "tablet_traffic",
    name: "Tablet traffic",
    description: "Traffic on tablets.",
    conditions: "Device category = tablet",
    icon: "👥",
  },
];

// ============================================
// Demo Data - Replace with actual API calls
// ============================================

const DEMO_EVENTS: FunnelEvent[] = [
  {
    eventName: "first_open",
    eventCount: 125000,
    displayName: "First Open/Visit",
  },
  {
    eventName: "session_start",
    eventCount: 98000,
    displayName: "Session Start",
  },
  {
    eventName: "screen_view",
    eventCount: 85000,
    displayName: "Screen/Page View",
  },
  {
    eventName: "user_engagement",
    eventCount: 72000,
    displayName: "User Engagement",
  },
  { eventName: "app_open", eventCount: 68000, displayName: "App Open" },
  { eventName: "scroll", eventCount: 55000, displayName: "Scroll" },
  { eventName: "click", eventCount: 48000, displayName: "Click" },
  { eventName: "view_item", eventCount: 42000, displayName: "View Item" },
  { eventName: "add_to_cart", eventCount: 28000, displayName: "Add to Cart" },
  {
    eventName: "begin_checkout",
    eventCount: 18000,
    displayName: "Begin Checkout",
  },
  {
    eventName: "add_payment_info",
    eventCount: 15000,
    displayName: "Add Payment Info",
  },
  { eventName: "purchase", eventCount: 12000, displayName: "Purchase" },
  {
    eventName: "subscription_start",
    eventCount: 8500,
    displayName: "Subscription Start",
  },
  {
    eventName: "in_app_purchase",
    eventCount: 6200,
    displayName: "In-App Purchase",
  },
  { eventName: "share", eventCount: 4500, displayName: "Share" },
  { eventName: "login", eventCount: 45000, displayName: "Login" },
  { eventName: "sign_up", eventCount: 32000, displayName: "Sign Up" },
  {
    eventName: "tutorial_begin",
    eventCount: 28000,
    displayName: "Tutorial Begin",
  },
  {
    eventName: "tutorial_complete",
    eventCount: 22000,
    displayName: "Tutorial Complete",
  },
  { eventName: "level_start", eventCount: 18000, displayName: "Level Start" },
  { eventName: "level_end", eventCount: 15000, displayName: "Level End" },
  {
    eventName: "unlock_achievement",
    eventCount: 9500,
    displayName: "Unlock Achievement",
  },
  {
    eventName: "ad_impression",
    eventCount: 65000,
    displayName: "Ad Impression",
  },
  { eventName: "ad_click", eventCount: 4200, displayName: "Ad Click" },
  {
    eventName: "notification_receive",
    eventCount: 78000,
    displayName: "Notification Receive",
  },
  {
    eventName: "notification_open",
    eventCount: 25000,
    displayName: "Notification Open",
  },
  { eventName: "search", eventCount: 35000, displayName: "Search" },
  {
    eventName: "select_content",
    eventCount: 42000,
    displayName: "Select Content",
  },
  {
    eventName: "view_promotion",
    eventCount: 38000,
    displayName: "View Promotion",
  },
  {
    eventName: "select_promotion",
    eventCount: 12000,
    displayName: "Select Promotion",
  },
];

const generateFunnelData = (selectedEvents: string[]): FunnelData => {
  if (selectedEvents.length === 0) {
    return { steps: [], totalUsers: 0, overallConversion: 0 };
  }

  let previousUsers = 0;
  const steps: FunnelStep[] = selectedEvents.map((eventName, index) => {
    const event = DEMO_EVENTS.find((e) => e.eventName === eventName);
    const baseUsers =
      event?.eventCount || Math.floor(Math.random() * 50000) + 10000;

    // Calculate users with natural drop-off
    let users: number;
    if (index === 0) {
      users = baseUsers;
    } else {
      // Each step retains 60-90% of previous step
      const retentionRate = 0.6 + Math.random() * 0.3;
      users = Math.floor(previousUsers * retentionRate);
    }

    previousUsers = users;

    const firstStepUsers =
      selectedEvents.length > 0
        ? DEMO_EVENTS.find((e) => e.eventName === selectedEvents[0])
            ?.eventCount || users
        : users;

    const conversionRate = index === 0 ? 100 : (users / firstStepUsers) * 100;
    const dropoffRate = index === 0 ? 0 : 100 - conversionRate;

    return {
      id: `step-${index}`,
      eventName,
      displayName: event?.displayName || eventName.replace(/_/g, " "),
      users,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dropoffRate: Math.round(dropoffRate * 100) / 100,
    };
  });

  const totalUsers = steps[0]?.users || 0;
  const lastStepUsers = steps[steps.length - 1]?.users || 0;
  const overallConversion =
    totalUsers > 0 ? (lastStepUsers / totalUsers) * 100 : 0;

  return {
    steps,
    totalUsers,
    overallConversion: Math.round(overallConversion * 100) / 100,
  };
};

// ============================================
// Helper Functions
// ============================================

const formatNumber = (n: number): string => {
  if (n === null || n === undefined || isNaN(n)) return "0";
  // Display full number with commas for thousands separator
  return Math.round(n).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
};

// ============================================
// Sub-Components
// ============================================

interface EventSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: FunnelEvent[];
  selectedSteps: string[];
  onAddEvent: (eventName: string) => void;
  onRemoveEvent?: (eventName: string) => void;
  loading?: boolean;
}

const EventSearchModal: React.FC<EventSearchModalProps> = ({
  open,
  onOpenChange,
  events,
  selectedSteps,
  onAddEvent,
  onRemoveEvent,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    events.forEach((e) => {
      const parts = e.eventName.split("_");
      if (parts.length > 1) {
        cats.add(parts[0]);
      }
    });
    return ["all", ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);
      const matchesCategory =
        selectedCategory === "all" ||
        event.eventName.startsWith(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Funnel Step
          </DialogTitle>
          <DialogDescription>
            Search and select events to add as funnel steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all"
                      ? "All Events"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events List */}
          <ScrollArea className="h-[400px] rounded-md border">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No events found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredEvents.map((event) => {
                  const isSelected = selectedSteps.includes(event.eventName);
                  return (
                    <div
                      key={event.eventName}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                      onClick={() => {
                        if (isSelected) {
                          // If already selected, remove it
                          if (onRemoveEvent) {
                            onRemoveEvent(event.eventName);
                          }
                        } else {
                          // If not selected, add it
                          onAddEvent(event.eventName);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <BarChart3 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {event.displayName ||
                              event.eventName.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {event.eventName}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dimension Search Modal Component
interface DimensionSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableDimensions: Array<{ id: string; name: string; icon: string }>;
  selectedDimensions: string[];
  onAddDimension: (dimensionId: string) => void;
  onRemoveDimension?: (dimensionId: string) => void;
}

const DimensionSearchModal: React.FC<DimensionSearchModalProps> = ({
  open,
  onOpenChange,
  availableDimensions,
  selectedDimensions,
  onAddDimension,
  onRemoveDimension,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDimensions = useMemo(() => {
    return availableDimensions.filter((dim) => {
      return (
        dim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dim.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [availableDimensions, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Add Dimension
          </DialogTitle>
          <DialogDescription>
            Select dimensions to break down your funnel data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dimensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Dimensions List */}
          <ScrollArea className="h-[350px] rounded-md border">
            {filteredDimensions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No dimensions found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredDimensions.map((dimension) => {
                  const isSelected = selectedDimensions.includes(dimension.id);
                  return (
                    <div
                      key={dimension.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                      onClick={() => {
                        if (isSelected) {
                          // If already selected, remove it
                          if (onRemoveDimension) {
                            onRemoveDimension(dimension.id);
                          }
                        } else {
                          // If not selected, add it
                          onAddDimension(dimension.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-sm">{dimension.icon}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {dimension.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {dimension.id}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Added
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FunnelStepCardProps {
  step: FunnelStep;
  index: number;
  totalSteps: number;
  onRemove: () => void;
  previousUsers?: number;
}

const FunnelStepCard: React.FC<FunnelStepCardProps> = ({
  step,
  index,
  totalSteps,
  onRemove,
  previousUsers,
}) => {
  const stepDropoff = previousUsers
    ? ((previousUsers - step.users) / previousUsers) * 100
    : 0;
  const stepConversion = previousUsers
    ? (step.users / previousUsers) * 100
    : 100;

  return (
    <div className="relative">
      {/* Step Card */}
      <Card className="relative overflow-hidden group">
        <div
          className="absolute left-0 top-0 bottom-0 bg-primary/10"
          style={{ width: `${step.conversionRate}%` }}
        />
        <CardContent className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
              </div>
              <div>
                <p className="font-semibold">{step.displayName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {step.eventName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Users Count */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-lg">
                    {formatNumber(step.users)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">users</p>
              </div>

              {/* Conversion Rate */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Percent className="h-4 w-4 text-green-500" />
                  <span className="font-bold text-lg text-green-600">
                    {step.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">from start</p>
              </div>

              {/* Step Conversion (from previous) */}
              {index > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                    <span className="font-bold text-lg text-orange-600">
                      {stepConversion.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">from prev</p>
                </div>
              )}

              {/* Remove Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove step</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connector Arrow */}
      {index < totalSteps - 1 && (
        <div className="flex items-center justify-center py-2">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 bg-border" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs">
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium text-red-500">
                -{stepDropoff.toFixed(1)}% dropoff
              </span>
            </div>
            <div className="w-0.5 h-4 bg-border" />
          </div>
        </div>
      )}
    </div>
  );
};

interface FunnelVisualizationProps {
  data: FunnelData;
  usersFunnel?: any;
  selectedSegmentComparisons?: any[]; // Can be string[] or SegmentComparisonItem[]
}

const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({
  data,
  usersFunnel,
  selectedSegmentComparisons,
}) => {
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.steps.length === 0) {
      return;
    }

    // Create root element
    const root = am5.Root.new(containerRef.current!);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        paddingRight: 0,
      })
    );
    chartRef.current = chart;

    // Calculate dynamic height based on number of steps
    const barHeight = 45;
    const chartHeight = Math.max(250, data.steps.length * barHeight + 60);
    chart.set("height", am5.percent(100));

    // Create X axis (categories - step names) for vertical chart
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: am5xy.AxisRendererX.new(root, {
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minGridDistance: 20,
        }),
      })
    );

    xAxis.data.setAll(
      data.steps.map((step, index) => ({
        category: step.displayName,
        value: step.users || 0,
        stepIndex: index,
      }))
    );

    // Calculate max value for Y-axis scaling
    let maxValue = Math.max(
      ...data.steps.map((step) => step.users || 0),
      1 // Ensure at least 1 to avoid division by zero
    );

    // Check if we have segments for comparison (need to check all segment values)
    const hasSegments =
      usersFunnel?.segments && usersFunnel.segments.length > 0;

    // If segments exist, also check segment values to find the overall max
    if (hasSegments) {
      const segmentValues: number[] = [];
      data.steps.forEach((step) => {
        const stage = usersFunnel.stages.find(
          (s: any) => s.eventName === step.eventName
        );
        if (stage && stage.segments) {
          usersFunnel.segments.forEach((segmentName: string) => {
            const segmentData = stage.segments[segmentName];
            const totalData = segmentData?.total || segmentData || {};
            const segmentValue = totalData.users || 0;
            segmentValues.push(segmentValue);
          });
        }
      });
      if (segmentValues.length > 0) {
        maxValue = Math.max(...segmentValues, maxValue);
      }
    }

    // Round up to next nice number for better Y-axis scaling
    const getNiceMax = (value: number): number => {
      if (value <= 0) return 1;
      const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
      const normalized = value / magnitude;
      let niceValue;
      if (normalized <= 1) niceValue = 1;
      else if (normalized <= 2) niceValue = 2;
      else if (normalized <= 5) niceValue = 5;
      else niceValue = 10;
      return niceValue * magnitude;
    };

    // Add 15% padding and round to nice number
    const niceMax = getNiceMax(maxValue * 1.15);

    // Create Y axis (values) for vertical chart
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: niceMax,
        renderer: am5xy.AxisRendererY.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    // Create tooltip
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false,
    });
    tooltip.get("background")!.setAll({
      fill: am5.color("#1e293b"),
      fillOpacity: 0.9,
      stroke: am5.color("#334155"),
      strokeWidth: 1,
    });
    tooltip.label.setAll({
      fill: am5.color("#ffffff"),
      fontSize: 13,
      fontWeight: "500",
    });

    // Define colors for segments (GA4-style colors)
    const segmentColors = [
      "#3b82f6", // Blue
      "#10b981", // Green
      "#f59e0b", // Orange
      "#ef4444", // Red
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#ec4899", // Pink
      "#84cc16", // Lime
    ];

    if (hasSegments) {
      // Create multiple series for segment comparison
      const segments = usersFunnel.segments as string[];

      segments.forEach((segmentName, segmentIndex) => {
        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: segmentName,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: `value_${segmentName}`,
            categoryXField: "category",
            sequencedInterpolation: true,
            calculateAggregates: true,
            maskBullets: false,
          })
        );

        // Configure columns - adjust width based on number of segments
        const columnWidth = segments.length > 1 ? 70 / segments.length : 70;
        series.columns.template.setAll({
          width: am5.percent(columnWidth),
          strokeOpacity: 0,
          cornerRadiusTL: 6,
          cornerRadiusTR: 6,
        });

        // Assign color to segment
        const color = segmentColors[segmentIndex % segmentColors.length];
        series.columns.template.set("fill", am5.color(color));
        series.columns.template.set("stroke", am5.color(color));

        // Set tooltip
        series.columns.template.set("tooltip", tooltip);
        series.columns.template.adapters.add("tooltipText", (text, target) => {
          const dataItem = target.dataItem;
          if (dataItem && dataItem.dataContext) {
            const dataContext = dataItem.dataContext as any;
            const value = dataContext[`value_${segmentName}`] as number;
            const category = dataContext.category as string;
            if (value !== undefined && category) {
              return `${segmentName}: ${formatNumber(value)} users`;
            }
          }
          return text || "";
        });

        // Prepare data with segment values
        const seriesData = data.steps.map((step) => {
          // Find the stage data for this step
          const stage = usersFunnel.stages.find(
            (s: any) => s.eventName === step.eventName
          );

          let segmentValue = 0;
          if (stage && stage.segments && stage.segments[segmentName]) {
            const segmentData = stage.segments[segmentName];
            // Use total object if available (new structure), otherwise use direct properties (old structure)
            const totalData = segmentData.total || segmentData;
            segmentValue = totalData.users || 0;
          }

          const dataPoint: any = {
            category: step.displayName,
          };
          dataPoint[`value_${segmentName}`] = segmentValue;
          return dataPoint;
        });

        series.data.setAll(seriesData);
        series.appear(1000);
      });
    } else {
      // Create single series for total values
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Users",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "category",
          sequencedInterpolation: true,
          calculateAggregates: true,
          maskBullets: false,
        })
      );

      // Configure columns
      series.columns.template.setAll({
        width: am5.percent(70),
        strokeOpacity: 0,
        cornerRadiusTL: 6,
        cornerRadiusTR: 6,
      });

      // Add GA4-style blue color
      series.columns.template.set("fill", am5.color("#3b82f6"));
      series.columns.template.set("stroke", am5.color("#3b82f6"));

      // Set tooltip
      series.columns.template.set("tooltip", tooltip);
      series.columns.template.adapters.add("tooltipText", (text, target) => {
        const dataItem = target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const dataContext = dataItem.dataContext as {
            category?: string;
            value?: number;
          };
          if (dataContext.value !== undefined && dataContext.category) {
            return `${dataContext.category}: ${formatNumber(
              dataContext.value
            )} users`;
          }
        }
        return text || "";
      });

      // Set data
      series.data.setAll(
        data.steps.map((step) => ({
          category: step.displayName,
          value: step.users || 0,
        }))
      );
      series.appear(1000);
    }

    // Add grid lines (horizontal for vertical chart)
    yAxis.get("renderer").grid.template.setAll({
      stroke: am5.color("#334155"),
      strokeDasharray: [4, 4],
      strokeOpacity: 0.3,
    });

    // Format Y axis labels
    yAxis.get("renderer").labels.template.adapters.add("text", (text) => {
      if (text) {
        const numValue = parseFloat(text);
        if (!isNaN(numValue)) {
          return formatNumber(numValue);
        }
      }
      return text;
    });

    // Make X axis labels smaller
    xAxis.get("renderer").labels.template.setAll({
      fontSize: 11,
      fill: am5.color("#94a3b8"),
    });

    // Add chart animation
    chart.appear(1000, 100);

    // Cleanup
    return () => {
      root.dispose();
    };
  }, [data, usersFunnel, selectedSegmentComparisons]);

  if (data.steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-base font-medium">No funnel steps selected</p>
        <p className="text-sm">Add events to build your funnel</p>
      </div>
    );
  }

  // Calculate dynamic height
  const barHeight = 45;
  const chartHeight = Math.max(250, data.steps.length * barHeight + 60);

  return (
    <div className="w-full" style={{ height: `${chartHeight}px` }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

// ============================================
// Funnel Table Types & Component
// ============================================

interface FunnelTableRow {
  stepName: string;
  stepNumber: number;
  country: string; // Used for breakdown dimension value
  segment?: string; // Used for segment name when segments are present
  isTotal: boolean;
  activeUsers: number;
  percentOfStep1: number;
  conversionRate: number;
  completionRate: number;
  abandonments: number;
  abandonmentRate: number;
}

interface FunnelTableProps {
  data: FunnelData;
  breakdownDimension: string;
  rowsPerDimension: number;
  onDimensionValueSelect?: (value: string, type: string) => void;
  selectedDimensionValue?: { value: string; type: string } | null;
  usersFunnel?: any;
  selectedSegmentComparisons?: any[]; // Can be string[] or SegmentComparisonItem[]
}

// Demo country breakdown data
const COUNTRY_BREAKDOWN = [
  { country: "India", percentage: 0.39 },
  { country: "Peru", percentage: 0.128 },
  { country: "Brazil", percentage: 0.095 },
  { country: "Saudi Arabia", percentage: 0.068 },
  { country: "Mexico", percentage: 0.06 },
  { country: "United States", percentage: 0.055 },
  { country: "Indonesia", percentage: 0.048 },
  { country: "Pakistan", percentage: 0.035 },
  { country: "Philippines", percentage: 0.032 },
  { country: "Egypt", percentage: 0.028 },
];

const generateTableData = (
  funnelData: FunnelData,
  breakdownDimension: string,
  rowsPerDimension: number,
  usersFunnel?: any,
  selectedSegmentComparisons?: any[] // Can be string[] or SegmentComparisonItem[]
): FunnelTableRow[] => {
  if (funnelData.steps.length === 0) return [];

  const rows: FunnelTableRow[] = [];
  // Get first step users from API total if available, otherwise use funnelData
  const firstStepUsers =
    usersFunnel?.stages?.[0]?.total?.users ||
    usersFunnel?.summary?.totalUsersAtStart ||
    funnelData.steps[0]?.users ||
    1;

  funnelData.steps.forEach((step, stepIndex) => {
    const previousStep = stepIndex > 0 ? funnelData.steps[stepIndex - 1] : null;
    const previousUsers = previousStep?.users || step.users;
    // Use API data if available, otherwise calculate
    const abandonments =
      step.abandonments !== undefined
        ? step.abandonments
        : previousUsers - step.users;
    const completionRate =
      step.completionRate !== undefined
        ? step.completionRate
        : previousUsers > 0
        ? (step.users / previousUsers) * 100
        : 100;
    const abandonmentRate =
      step.abandonmentRate !== undefined
        ? step.abandonmentRate
        : 100 - completionRate;

    // Check if segments are present - if yes, skip total row
    // Show segments if they exist in API response (from segment comparisons OR countries)
    const hasSegments =
      usersFunnel?.segments && usersFunnel.segments.length > 0;

    // Add total row for each step only if no segments are present
    if (!hasSegments) {
      rows.push({
        stepName: step.displayName,
        stepNumber: stepIndex + 1,
        country: "Total",
        isTotal: true,
        activeUsers: step.users,
        percentOfStep1: (step.users / firstStepUsers) * 100,
        conversionRate:
          step.conversionRate !== undefined ? step.conversionRate : 100,
        completionRate:
          step.completionRate !== undefined
            ? step.completionRate
            : stepIndex === 0
            ? 100
            : completionRate,
        abandonments:
          step.abandonments !== undefined
            ? step.abandonments
            : stepIndex === 0
            ? Math.floor(step.users * 0.006)
            : abandonments,
        abandonmentRate:
          step.abandonmentRate !== undefined
            ? step.abandonmentRate
            : stepIndex === 0
            ? 0.63
            : abandonmentRate,
      });
    }

    // Add segment comparison rows if segments are present in API response
    // This includes both segment comparisons and country/app version segments
    if (
      usersFunnel?.segments &&
      usersFunnel.segments.length > 0 &&
      usersFunnel?.stages
    ) {
      // Find the stage data for this step - match by eventName
      const stage = usersFunnel.stages.find(
        (s: any) => s.eventName === step.eventName
      );

      if (stage && stage.segments) {
        // Get segment data from API
        const segmentData = stage.segments;

        // Get breakdown dimension from API response
        const breakdownDim = usersFunnel.dimension;

        // Ensure segmentData is an object
        if (typeof segmentData === "object" && segmentData !== null) {
          // Iterate through each segment display name in the response
          usersFunnel.segments.forEach((segmentDisplayName: string) => {
            const segmentValueData = segmentData[segmentDisplayName];

            // Ensure segmentValueData exists and is an object
            if (segmentValueData && typeof segmentValueData === "object") {
              // Get total data for this segment
              const totalData = segmentValueData.total || segmentValueData;

              // Calculate percentOfStep1 for total
              const totalPercentOfStep1 =
                totalData.percentageOfStep1 !== undefined &&
                totalData.percentageOfStep1 !== null
                  ? totalData.percentageOfStep1
                  : firstStepUsers > 0
                  ? ((totalData.users || 0) / firstStepUsers) * 100
                  : 0;

              // Add total row for this segment
              rows.push({
                stepName: step.displayName,
                stepNumber: stepIndex + 1,
                country:
                  breakdownDim && breakdownDim !== "none"
                    ? ""
                    : segmentDisplayName, // Empty if breakdown exists, otherwise use segment name
                segment:
                  breakdownDim && breakdownDim !== "none"
                    ? segmentDisplayName
                    : undefined, // Segment name when breakdown exists
                isTotal: true,
                activeUsers: totalData.users || 0,
                percentOfStep1: totalPercentOfStep1,
                conversionRate:
                  totalData.conversionRate !== undefined
                    ? totalData.conversionRate
                    : 100,
                completionRate:
                  totalData.completionRate !== undefined &&
                  totalData.completionRate !== null
                    ? totalData.completionRate
                    : 0,
                abandonments:
                  totalData.abandonments !== undefined &&
                  totalData.abandonments !== null
                    ? totalData.abandonments
                    : 0,
                abandonmentRate:
                  totalData.abandonmentRate !== undefined &&
                  totalData.abandonmentRate !== null
                    ? totalData.abandonmentRate
                    : 0,
              });

              // If breakdown dimension is applied, add breakdown rows for this segment
              if (
                breakdownDim &&
                breakdownDim !== "none" &&
                segmentValueData[breakdownDim]
              ) {
                const breakdownData = segmentValueData[breakdownDim];

                if (
                  typeof breakdownData === "object" &&
                  breakdownData !== null
                ) {
                  // Get breakdown values and sort by users descending
                  const breakdownValues = Object.keys(breakdownData)
                    .sort((a, b) => {
                      const usersA = breakdownData[a]?.users || 0;
                      const usersB = breakdownData[b]?.users || 0;
                      return usersB - usersA;
                    })
                    .slice(0, rowsPerDimension);

                  // Add breakdown rows for this segment
                  breakdownValues.forEach((breakdownValue) => {
                    const valueData = breakdownData[breakdownValue];

                    if (valueData && typeof valueData === "object") {
                      const percentOfStep1 =
                        valueData.percentageOfStep1 !== undefined &&
                        valueData.percentageOfStep1 !== null
                          ? valueData.percentageOfStep1
                          : firstStepUsers > 0
                          ? ((valueData.users || 0) / firstStepUsers) * 100
                          : 0;

                      rows.push({
                        stepName: step.displayName,
                        stepNumber: stepIndex + 1,
                        country: breakdownValue, // Breakdown dimension value
                        segment: segmentDisplayName, // Segment name
                        isTotal: false,
                        activeUsers: valueData.users || 0,
                        percentOfStep1: percentOfStep1,
                        conversionRate:
                          valueData.conversionRate !== undefined
                            ? valueData.conversionRate
                            : 100,
                        completionRate:
                          valueData.completionRate !== undefined &&
                          valueData.completionRate !== null
                            ? valueData.completionRate
                            : 0,
                        abandonments:
                          valueData.abandonments !== undefined &&
                          valueData.abandonments !== null
                            ? valueData.abandonments
                            : 0,
                        abandonmentRate:
                          valueData.abandonmentRate !== undefined &&
                          valueData.abandonmentRate !== null
                            ? valueData.abandonmentRate
                            : 0,
                      });
                    }
                  });
                }
              }
            }
          });
        }
      }
    }

    // Add breakdown rows if breakdown is enabled and API data is available
    if (
      breakdownDimension &&
      breakdownDimension !== "none" &&
      usersFunnel?.stages &&
      (!usersFunnel?.segments || usersFunnel.segments.length === 0)
    ) {
      // Map UI dimension IDs to API dimension names
      const dimensionMap: Record<string, string> = {
        country: "country",
        deviceCategory: "deviceCategory",
        appVersion: "appVersion",
        osVersion: "operatingSystemVersion",
        device: "mobileDeviceModel",
      };

      // Use API dimension if available, otherwise use mapped dimension
      const apiDimension =
        usersFunnel?.dimension ||
        dimensionMap[breakdownDimension] ||
        breakdownDimension;

      // Find the stage data for this step - match by eventName
      const stage = usersFunnel.stages.find(
        (s: any) => s.eventName === step.eventName
      );

      if (stage && stage[apiDimension]) {
        // Get breakdown data from API
        const breakdownData = stage[apiDimension];

        // Ensure breakdownData is an object
        if (typeof breakdownData === "object" && breakdownData !== null) {
          const breakdownValues = Object.keys(breakdownData)
            .filter((key) => key !== "total") // Exclude 'total' if it exists as a key
            .sort((a, b) => {
              // Sort by users descending to show top values first
              const usersA = breakdownData[a]?.users || 0;
              const usersB = breakdownData[b]?.users || 0;
              return usersB - usersA;
            })
            .slice(0, rowsPerDimension);

          breakdownValues.forEach((dimensionValue) => {
            const valueData = breakdownData[dimensionValue];

            // Ensure valueData exists and is an object
            if (valueData && typeof valueData === "object") {
              // Use percentageOfStep1 from API if available, otherwise calculate it
              const percentOfStep1 =
                valueData.percentageOfStep1 !== undefined &&
                valueData.percentageOfStep1 !== null
                  ? valueData.percentageOfStep1
                  : firstStepUsers > 0
                  ? ((valueData.users || 0) / firstStepUsers) * 100
                  : 0;

              rows.push({
                stepName: step.displayName,
                stepNumber: stepIndex + 1,
                country: dimensionValue,
                isTotal: false,
                activeUsers: valueData.users || 0,
                percentOfStep1: percentOfStep1,
                conversionRate:
                  valueData.conversionRate !== undefined
                    ? valueData.conversionRate
                    : 100,
                completionRate: valueData.completionRate || 0,
                abandonments: valueData.abandonments || 0,
                abandonmentRate: valueData.abandonmentRate || 0,
              });
            }
          });
        }
      }
    }
  });

  return rows;
};

const FunnelTable: React.FC<FunnelTableProps> = ({
  data,
  breakdownDimension,
  rowsPerDimension,
  onDimensionValueSelect,
  selectedDimensionValue,
  usersFunnel,
  selectedSegmentComparisons,
}) => {
  const tableData = useMemo(
    () =>
      generateTableData(
        data,
        breakdownDimension,
        rowsPerDimension,
        usersFunnel,
        selectedSegmentComparisons
      ),
    [
      data,
      breakdownDimension,
      rowsPerDimension,
      usersFunnel,
      selectedSegmentComparisons,
    ]
  );

  if (data.steps.length === 0) {
    return null;
  }

  // Group rows by step for rendering
  const groupedByStep: { [key: number]: FunnelTableRow[] } = {};
  tableData.forEach((row) => {
    if (!groupedByStep[row.stepNumber]) {
      groupedByStep[row.stepNumber] = [];
    }
    groupedByStep[row.stepNumber].push(row);
  });

  return (
    <div className="overflow-x-auto">
      <div className="border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-white">
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Step
              </th>
              {/* Show Segment column when segments exist */}
              {usersFunnel?.segments && usersFunnel.segments.length > 0 && (
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Segment
                </th>
              )}
              {/* Show breakdown dimension column when breakdown dimension exists */}
              {(usersFunnel?.dimension && usersFunnel.dimension !== "none") ||
              (breakdownDimension && breakdownDimension !== "none") ? (
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  {usersFunnel?.dimension && usersFunnel.dimension !== "none"
                    ? usersFunnel.dimension === "country"
                      ? "Country"
                      : usersFunnel.dimension === "deviceCategory"
                      ? "Device category"
                      : usersFunnel.dimension === "appVersion"
                      ? "App version"
                      : usersFunnel.dimension === "osVersion"
                      ? "OS version"
                      : usersFunnel.dimension === "device"
                      ? "Device"
                      : usersFunnel.dimension.charAt(0).toUpperCase() +
                        usersFunnel.dimension.slice(1)
                    : breakdownDimension === "country"
                    ? "Country"
                    : breakdownDimension === "deviceCategory"
                    ? "Device category"
                    : breakdownDimension === "appVersion"
                    ? "App version"
                    : breakdownDimension === "osVersion"
                    ? "OS version"
                    : breakdownDimension === "device"
                    ? "Device"
                    : breakdownDimension.charAt(0).toUpperCase() +
                      breakdownDimension.slice(1)}
                </th>
              ) : null}
              {/* Fallback: Show single column if no segments and no breakdown */}
              {!(usersFunnel?.segments && usersFunnel.segments.length > 0) &&
                !(usersFunnel?.dimension && usersFunnel.dimension !== "none") &&
                !(breakdownDimension && breakdownDimension !== "none") && (
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Breakdown
                  </th>
                )}
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Active users (% of Step 1)
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Completion rate
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Abandonments
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Abandonment rate
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByStep).map(([stepNum, stepRows]) => (
              <React.Fragment key={stepNum}>
                {stepRows.map((row, rowIndex) => (
                  <tr
                    key={`${stepNum}-${row.country}-${rowIndex}`}
                    className={cn(
                      "border-b hover:bg-muted/30 transition-colors",
                      row.isTotal && "bg-muted/20 font-medium"
                    )}
                  >
                    <td className="py-3 px-4">
                      {rowIndex === 0 ? (
                        <span className="text-muted-foreground">
                          {row.stepNumber}. {row.stepName}
                        </span>
                      ) : null}
                    </td>
                    {/* Segment column - show when segments exist */}
                    {usersFunnel?.segments &&
                      usersFunnel.segments.length > 0 && (
                        <td className="py-3 px-4">
                          <span className={cn(row.isTotal && "font-semibold")}>
                            {row.isTotal ? row.segment || row.country : ""}
                          </span>
                        </td>
                      )}
                    {/* Breakdown dimension column - show when breakdown dimension exists */}
                    {(usersFunnel?.dimension &&
                      usersFunnel.dimension !== "none") ||
                    (breakdownDimension && breakdownDimension !== "none") ? (
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            row.isTotal
                              ? "font-semibold"
                              : "text-blue-600 cursor-pointer hover:underline",
                            !row.isTotal &&
                              selectedDimensionValue?.value === row.country &&
                              selectedDimensionValue?.type ===
                                ((usersFunnel?.dimension &&
                                usersFunnel.dimension !== "none"
                                  ? usersFunnel.dimension
                                  : breakdownDimension) === "country"
                                  ? "country"
                                  : (usersFunnel?.dimension &&
                                    usersFunnel.dimension !== "none"
                                      ? usersFunnel.dimension
                                      : breakdownDimension) === "deviceCategory"
                                  ? "deviceCategory"
                                  : (usersFunnel?.dimension &&
                                    usersFunnel.dimension !== "none"
                                      ? usersFunnel.dimension
                                      : breakdownDimension) === "appVersion"
                                  ? "appVersion"
                                  : (usersFunnel?.dimension &&
                                    usersFunnel.dimension !== "none"
                                      ? usersFunnel.dimension
                                      : breakdownDimension) === "osVersion"
                                  ? "operatingSystemVersion"
                                  : (usersFunnel?.dimension &&
                                    usersFunnel.dimension !== "none"
                                      ? usersFunnel.dimension
                                      : breakdownDimension) === "device"
                                  ? "mobileDeviceModel"
                                  : ""),
                            !row.isTotal &&
                              selectedDimensionValue?.value === row.country &&
                              "bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded font-semibold"
                          )}
                          onDoubleClick={() => {
                            if (!row.isTotal && onDimensionValueSelect) {
                              // Map breakdown dimension to segment type
                              const currentBreakdownDim =
                                usersFunnel?.dimension &&
                                usersFunnel.dimension !== "none"
                                  ? usersFunnel.dimension
                                  : breakdownDimension;
                              const typeMap: Record<string, string> = {
                                country: "country",
                                deviceCategory: "deviceCategory",
                                appVersion: "appVersion",
                                osVersion: "operatingSystemVersion",
                                device: "mobileDeviceModel",
                              };
                              const segmentType =
                                typeMap[currentBreakdownDim] ||
                                currentBreakdownDim;
                              onDimensionValueSelect(row.country, segmentType);
                            }
                          }}
                          title={
                            !row.isTotal
                              ? "Double-click to filter by this value"
                              : undefined
                          }
                        >
                          {row.isTotal ? "Total" : row.country}
                        </span>
                      </td>
                    ) : null}
                    {/* Fallback: Single column when no segments and no breakdown */}
                    {!(
                      usersFunnel?.segments && usersFunnel.segments.length > 0
                    ) &&
                      !(
                        usersFunnel?.dimension &&
                        usersFunnel.dimension !== "none"
                      ) &&
                      !(
                        breakdownDimension && breakdownDimension !== "none"
                      ) && (
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              row.isTotal
                                ? "font-semibold"
                                : "text-blue-600 cursor-pointer hover:underline"
                            )}
                          >
                            {row.country}
                          </span>
                        </td>
                      )}
                    <td className="text-right py-3 px-4">
                      <span className="text-blue-600">
                        {formatNumber(row.activeUsers)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({row.conversionRate.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {row.completionRate.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={cn(
                          row.abandonments > 0 ? "text-blue-600" : ""
                        )}
                      >
                        {formatNumber(row.abandonments)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      {row.abandonmentRate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

const FunnelAnalytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { eventNames, eventNamesLoading, usersFunnel, usersFunnelLoading } =
    useAppSelector((state) => state.Dashboard);

  // State
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ref to track if we're initializing selectedSteps from API (to prevent duplicate API calls)
  const isInitializingFromAPI = useRef(false);
  // Ref to track if we're switching to a saved funnel (to prevent duplicate API calls)
  const isSwitchingSavedFunnel = useRef(false);
  // Ref to track if we've auto-selected the first group
  const hasAutoSelectedFirstGroup = useRef(false);

  // Date Range State - Default to last 2 days
  const defaultDateRange = getDateRangeForPreset("last2");
  const [preset, setPreset] = useState("last2");
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);

  // Filters
  const [deviceCategory, setDeviceCategory] = useState("all");
  const [country, setCountry] = useState("all");

  // Dimensions State
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    "country",
    "deviceCategory",
    "appVersion",
    "osVersion",
    "device",
  ]);
  const [isAddDimensionOpen, setIsAddDimensionOpen] = useState(false);

  // Segments State - Select all segments by default
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    AVAILABLE_SEGMENTS.map((segment) => segment.id)
  );
  const [isAddSegmentOpen, setIsAddSegmentOpen] = useState(false);
  const [segmentSearchQuery, setSegmentSearchQuery] = useState("");

  // Breakdown State
  const [breakdownDimension, setBreakdownDimension] = useState<string>("");
  const [rowsPerDimension, setRowsPerDimension] = useState<string>("5");
  const [showElapsedTime, setShowElapsedTime] = useState(false);
  const [selectedDimensionValue, setSelectedDimensionValue] = useState<{
    value: string;
    type: string;
  } | null>(null);

  // Segment Comparisons State - Unified structure for segments, country groups, and app version groups
  const [selectedSegmentComparisons, setSelectedSegmentComparisons] = useState<
    SegmentComparisonItem[]
  >([]);

  // Segments By Country State
  interface CountryOption {
    value: string;
    label: string;
    userCount: number;
  }
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [savedCountryArrays, setSavedCountryArrays] = useState<string[][]>([]); // Array of country arrays to be sent in API
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Segments By App Version State
  interface AppVersionOption {
    value: string;
    label: string;
    userCount?: number;
  }
  const [appVersions, setAppVersions] = useState<AppVersionOption[]>([]);
  const [appVersionsLoading, setAppVersionsLoading] = useState(false);
  const [selectedAppVersions, setSelectedAppVersions] = useState<string[]>([]);
  const [savedAppVersionArrays, setSavedAppVersionArrays] = useState<
    string[][]
  >([]); // Array of app version arrays to be sent in API
  const [appVersionSearchQuery, setAppVersionSearchQuery] = useState("");
  const [isAppVersionDropdownOpen, setIsAppVersionDropdownOpen] =
    useState(false);

  // Available Dimensions
  const availableDimensions = [
    { id: "country", name: "Country", icon: "🌍" },
    { id: "deviceCategory", name: "Device category", icon: "📱" },
    { id: "appVersion", name: "App version", icon: "📦" },
    { id: "osVersion", name: "OS version", icon: "💻" },
    { id: "device", name: "Device", icon: "🖥️" },
  ];

  // Saved Funnels - now storing groups instead of individual funnels
  const [savedFunnels, setSavedFunnels] = useState<SavedFunnel[]>([]);
  const [saveFunnelName, setSaveFunnelName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [savedFunnelsLoading, setSavedFunnelsLoading] = useState(false);
  const [loadedSavedFunnelId, setLoadedSavedFunnelId] = useState<string | null>(
    null
  );
  const [loadingGroupFunnels, setLoadingGroupFunnels] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [deleteFunnelId, setDeleteFunnelId] = useState<string | null>(null);
  const [isDeletingFunnel, setIsDeletingFunnel] = useState(false);
  // Group creation state
  const [groupName, setGroupName] = useState("");
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  // Map activeGroupId to actual API groupId
  const [groupIdMapping, setGroupIdMapping] = useState<Record<string, string>>(
    {}
  );

  // Funnel Groups State - Multiple funnels in a group
  const [funnelGroups, setFunnelGroups] = useState<FunnelGroup[]>([
    {
      id: "default-group",
      name: "Funnel Group 1",
      funnels: [
        {
          id: "funnel-1",
          name: "Funnel 1",
          selectedSteps: [],
          startDate: defaultDateRange.startDate,
          endDate: defaultDateRange.endDate,
          breakdownDimension: "",
          rowsPerDimension: "5",
          selectedSegments: AVAILABLE_SEGMENTS.map((s) => s.id),
          selectedSegmentComparisons: [],
          savedCountryArrays: [],
          savedAppVersionArrays: [],
          selectedDimensionValue: null,
          showElapsedTime: false,
          preset: "last2",
        },
      ],
      activeFunnelId: "funnel-1",
    },
  ]);
  const [activeGroupId, setActiveGroupId] = useState<string>("default-group");
  const [funnelNameInput, setFunnelNameInput] = useState<string>("");
  const [isRenamingFunnel, setIsRenamingFunnel] = useState<string | null>(null);
  const [hoveredFunnelId, setHoveredFunnelId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track selected group name for display
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(
    null
  );

  // Fetch saved funnel groups from API
  const fetchSavedFunnels = useCallback(async () => {
    try {
      setSavedFunnelsLoading(true);
      const response = await getSavedFunnelGroups();
      console.log("Saved Funnel Groups API Response:", response);

      // Extract groups from response
      let groups: any[] = [];

      if (
        response?.data?.data?.groups &&
        Array.isArray(response.data.data.groups)
      ) {
        // Structure: { data: { groups: [...] } }
        groups = response.data.data.groups;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Fallback: data is directly an array of groups
        groups = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        groups = response.data;
      } else if (Array.isArray(response)) {
        groups = response;
      }

      if (groups.length > 0) {
        // Map groups to SavedFunnel interface for display in dropdown
        // Each group will be displayed, and we'll fetch its funnels when selected
        const mappedGroups = groups
          .filter((group: any) => group?.group?._id || group?._id) // Only include groups with an ID
          .map((group: any) => {
            const groupData = group.group || group;
            const funnels = group.funnels || [];

            return {
              id: groupData._id || groupData.id,
              name: groupData.name || "Unnamed Group",
              steps:
                funnels.length > 0
                  ? funnels[0]?.configuration?.eventNames || []
                  : [],
              createdAt: groupData.createdAt
                ? new Date(groupData.createdAt).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              groupId: groupData._id || groupData.id, // Store groupId for API call
              configuration:
                funnels.length > 0 ? funnels[0]?.configuration : undefined,
            };
          });
        console.log("Mapped Saved Groups:", mappedGroups);
        setSavedFunnels(mappedGroups);
      } else {
        console.warn("No groups data found in response:", response);
        setSavedFunnels([]);
      }
    } catch (error) {
      console.error("Error fetching saved funnel groups:", error);
      setSavedFunnels([]);
    } finally {
      setSavedFunnelsLoading(false);
    }
  }, []);

  // Fetch event names from API (without date parameters)
  useEffect(() => {
    dispatch(getGA4EventNamesThunk(undefined));
  }, [dispatch]);

  // Fetch saved funnels on component mount
  useEffect(() => {
    fetchSavedFunnels();
  }, [fetchSavedFunnels]);

  // Fetch countries from API (without date parameters)
  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const response = await getGA4CountryDimensions();
        if (response?.data?.status && response?.data?.data?.values) {
          setCountries(response.data.data.values);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setCountriesLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch app versions from API
  useEffect(() => {
    const fetchAppVersions = async () => {
      setAppVersionsLoading(true);
      try {
        const response = await getGA4AppVersionDimensions();
        console.log("App versions API response:", response);

        // Handle the actual API response structure: data.versions array
        if (
          response?.data?.data?.versions &&
          Array.isArray(response.data.data.versions)
        ) {
          const transformedVersions = response.data.data.versions.map(
            (item: {
              version: string;
              total_users?: number;
              active_users?: number;
              percentage?: number;
            }) => {
              return {
                value: item.version,
                label: item.version,
                userCount: item.active_users || item.total_users || 0,
              };
            }
          );
          setAppVersions(transformedVersions);
        }
        // Fallback: Handle if response has status and data structure
        else if (response?.data?.status && response?.data?.data) {
          // Handle if data is directly an array
          if (Array.isArray(response.data.data)) {
            const transformedVersions = response.data.data
              .map((item: string | { version: string }) => {
                if (typeof item === "string") {
                  return {
                    value: item,
                    label: item,
                    userCount: 0,
                  };
                } else if (item.version) {
                  return {
                    value: item.version,
                    label: item.version,
                    userCount: 0,
                  };
                }
                return null;
              })
              .filter(Boolean);
            setAppVersions(transformedVersions);
          }
          // Handle if response has values array like countries
          else if (
            response.data.data.values &&
            Array.isArray(response.data.data.values)
          ) {
            const transformedVersions = response.data.data.values.map(
              (item: string | { version: string; value?: string }) => {
                if (typeof item === "string") {
                  return {
                    value: item,
                    label: item,
                    userCount: 0,
                  };
                } else {
                  const version = item.version || item.value || "";
                  return {
                    value: version,
                    label: version,
                    userCount: 0,
                  };
                }
              }
            );
            setAppVersions(transformedVersions);
          }
        }
      } catch (error) {
        console.error("Error fetching app versions:", error);
      } finally {
        setAppVersionsLoading(false);
      }
    };
    fetchAppVersions();
  }, []);

  // Helper function to build segments array from selectedSegments
  const buildSegmentsArray = useCallback((): Array<{
    value: string;
    type: string;
  }> => {
    const segments: Array<{ value: string; type: string }> = [];

    selectedSegments.forEach((segmentId) => {
      // Skip "all_users" as it doesn't need to be sent
      if (segmentId === "all_users") return;

      const segment = AVAILABLE_SEGMENTS.find((s) => s.id === segmentId);
      if (!segment) return;

      // Map segment IDs to API segment types and values based on conditions
      if (segment.conditions.includes("Device category = mobile")) {
        segments.push({ value: "mobile", type: "deviceCategory" });
      } else if (segment.conditions.includes("Device category = tablet")) {
        segments.push({ value: "tablet", type: "deviceCategory" });
      } else if (
        segment.conditions.includes("Session default channel group = Direct")
      ) {
        segments.push({ value: "Direct", type: "sessionDefaultChannelGroup" });
      } else if (
        segment.conditions.includes('Session default channel group in "Paid')
      ) {
        segments.push({
          value: "Paid Search",
          type: "sessionDefaultChannelGroup",
        });
      }
      // Add more mappings as needed for other segment types
    });

    return segments;
  }, [selectedSegments]);

  // Helper function to build segments array from selectedSegmentComparisons
  const buildSegmentComparisonsArray = useCallback((): Array<{
    value: string | string[];
    type: string;
  }> => {
    const segments: Array<{ value: string | string[]; type: string }> = [];

    selectedSegmentComparisons.forEach((item) => {
      if (item.type === "segment" && item.segmentId) {
        const segmentId = item.segmentId;
        // Map segment IDs to API segment types and values based on conditions
        if (segmentId === "mobile_traffic") {
          segments.push({ value: "mobile", type: "deviceCategory" });
        } else if (segmentId === "tablet_traffic") {
          segments.push({ value: "tablet", type: "deviceCategory" });
        } else if (segmentId === "direct_traffic") {
          segments.push({
            value: "Direct",
            type: "sessionDefaultChannelGroup",
          });
        } else if (segmentId === "paid_traffic") {
          segments.push({ value: "Paid", type: "sessionDefaultChannelGroup" });
        } else if (segmentId === "organic_traffic") {
          segments.push({
            value: "Organic",
            type: "sessionDefaultChannelGroup",
          });
        } else if (segmentId === "referral_affiliates") {
          segments.push({
            value: "Referral",
            type: "sessionDefaultChannelGroup",
          });
        } else if (segmentId === "email_sms_push") {
          segments.push({
            value: "Email, SMS, Mobile Push Notifications",
            type: "sessionDefaultChannelGroup",
          });
        }
        // Add more mappings as needed for other segment types
      } else if (item.type === "countryGroup" && item.countryGroup) {
        // Add country group as a segment
        if (item.countryGroup.length > 0) {
          segments.push({ value: [...item.countryGroup], type: "country" });
        }
      } else if (item.type === "appVersionGroup" && item.appVersionGroup) {
        // Add app version group as a segment
        if (item.appVersionGroup.length > 0) {
          segments.push({
            value: [...item.appVersionGroup],
            type: "appVersion",
          });
        }
      }
    });

    return segments;
  }, [selectedSegmentComparisons]);

  // Fetch users funnel data from API with body and query params
  useEffect(() => {
    // Skip API call if we're just initializing selectedSteps from API response
    if (isInitializingFromAPI.current) {
      isInitializingFromAPI.current = false;
      return;
    }

    // If a saved funnel is loaded, use savedFunnelId instead of building body
    if (loadedSavedFunnelId) {
      // Set flag to prevent duplicate API calls when state is loaded from saved funnel
      isSwitchingSavedFunnel.current = true;

      // Build query params with only savedFunnelId (no dates or row params)
      const queryParams: {
        savedFunnelId?: string;
      } = {
        savedFunnelId: loadedSavedFunnelId,
      };

      console.log("Calling API with savedFunnelId:", loadedSavedFunnelId);

      dispatch(
        getGA4UsersFunnelThunk({
          body: undefined, // No body when using savedFunnelId
          queryParams: queryParams,
        })
      );

      // Clear loadedSavedFunnelId after API call
      setLoadedSavedFunnelId(null);

      // Reset flag after state updates from loadStateFromFunnel complete
      setTimeout(() => {
        isSwitchingSavedFunnel.current = false;
      }, 100);

      return;
    }

    // Skip API call if we're switching to a saved funnel (state is being loaded)
    if (isSwitchingSavedFunnel.current) {
      return;
    }

    // Build request body (normal operation when not loading saved funnel)
    const requestBody: {
      eventNames?: string[];
      dimension?: string;
      elapsedTime?: boolean;
      segments?: Array<{ value: string; type: string }>;
    } = {};

    // Add eventNames if steps are selected
    if (selectedSteps.length > 0) {
      requestBody.eventNames = selectedSteps;
    }

    // Add dimension if breakdown is selected (map UI dimension IDs to API format)
    if (breakdownDimension && breakdownDimension !== "none") {
      const dimensionMap: Record<string, string> = {
        country: "country",
        deviceCategory: "deviceCategory",
        appVersion: "appVersion",
        osVersion: "operatingSystemVersion",
        device: "mobileDeviceModel",
      };
      requestBody.dimension =
        dimensionMap[breakdownDimension] || breakdownDimension;
    }

    // Add elapsedTime if enabled
    if (showElapsedTime) {
      requestBody.elapsedTime = true;
    }

    // Only add segments from Segment Comparisons (not from regular segments section)
    const segments: Array<{ value: string; type: string }> = [];

    // Add segments from Segment Comparisons
    const segmentComparisons = buildSegmentComparisonsArray();
    segments.push(...(segmentComparisons as any));

    // Add selected dimension value as a segment if double-clicked
    if (selectedDimensionValue) {
      segments.push({
        ...selectedDimensionValue,
        value: selectedDimensionValue.value,
      } as any);
    }

    if (segments.length > 0) {
      requestBody.segments = segments as any;
    }

    // Build query params - always include dates if available
    const queryParams: {
      startDate?: string;
      endDate?: string;
      row?: number;
    } = {};

    // Always include dates if they are set and valid
    if (startDate && startDate.trim()) {
      queryParams.startDate = startDate.trim();
    }
    if (endDate && endDate.trim()) {
      queryParams.endDate = endDate.trim();
    }
    if (
      rowsPerDimension &&
      breakdownDimension &&
      breakdownDimension !== "none"
    ) {
      const rowValue = parseInt(rowsPerDimension);
      if (!isNaN(rowValue) && rowValue > 0) {
        queryParams.row = rowValue;
      }
    }

    // Always pass queryParams if we have at least dates
    dispatch(
      getGA4UsersFunnelThunk({
        body: requestBody as any,
        queryParams:
          queryParams.startDate || queryParams.endDate || queryParams.row
            ? queryParams
            : undefined,
      })
    );
  }, [
    dispatch,
    selectedSteps,
    breakdownDimension,
    showElapsedTime,
    startDate,
    endDate,
    rowsPerDimension,
    buildSegmentComparisonsArray,
    selectedDimensionValue,
    loadedSavedFunnelId,
  ]);

  // Automatically add events from API to Funnel Steps (only on initial load when no steps selected)
  useEffect(() => {
    if (
      usersFunnel &&
      usersFunnel.stages &&
      usersFunnel.stages.length > 0 &&
      selectedSteps.length === 0
    ) {
      isInitializingFromAPI.current = true;
      const eventNames = usersFunnel.stages.map((stage) => stage.eventName);
      setSelectedSteps(eventNames);
    }
  }, [usersFunnel, selectedSteps.length]);

  // Transform API data to FunnelEvent format
  const events: FunnelEvent[] = useMemo(() => {
    if (eventNames?.data && Array.isArray(eventNames.data)) {
      return eventNames.data
        .filter(
          (eventName: string | null | undefined) =>
            eventName && typeof eventName === "string"
        )
        .map((eventName: string) => ({
          eventName: eventName,
          eventCount: 0, // API doesn't provide count, will be fetched separately if needed
          displayName: eventName
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        }));
    }
    return [];
  }, [eventNames]);

  // Set first 5 events as default selected steps when events load
  // useEffect(() => {
  //   if (events.length > 0 && selectedSteps.length === 0) {
  //     const first5Events = events.slice(0, 5).map((e) => e.eventName);
  //     setSelectedSteps(first5Events);
  //   }
  // }, [events]);

  // Computed Data - Use API data for funnel based on selectedSteps
  const funnelData = useMemo(() => {
    // If steps are selected, show them (even if API data is still loading)
    if (selectedSteps.length > 0) {
      // Create a map of eventName to stage data for quick lookup
      const stageMap = new Map(
        usersFunnel?.stages?.map((stage) => [stage.eventName, stage]) || []
      );

      // Build steps based on selectedSteps order, using API data when available
      const steps: FunnelStep[] = selectedSteps.map((eventName, index) => {
        const stage = stageMap.get(eventName);
        const event = events.find((e) => e.eventName === eventName);

        // If stage data exists in API response, use it
        if (stage) {
          // Check if segments are present - if yes, aggregate from segment totals
          let stageData: any = null;

          if (stage.segments && Object.keys(stage.segments).length > 0) {
            // When segments are present, aggregate totals from all segments
            let totalUsers = 0;
            let totalAbandonments = 0;

            Object.values(stage.segments).forEach((segmentData: any) => {
              const segmentTotal = segmentData.total || segmentData;
              totalUsers += segmentTotal.users || 0;
              totalAbandonments += segmentTotal.abandonments || 0;
            });

            // Calculate rates from aggregated data
            // We need to calculate based on previous step, but we can't reference steps array in map
            // So we'll use the summary data for first step, and calculate relative to that
            const firstStepUsers =
              usersFunnel?.summary?.totalUsersAtStart || totalUsers;
            const conversionRate =
              index === 0 ? 100 : (totalUsers / firstStepUsers) * 100;

            // For completion and abandonment rates, we'll use the first segment's data as reference
            // or calculate from the aggregated total
            const firstSegmentData = Object.values(stage.segments)[0] as any;
            const firstSegmentTotal =
              firstSegmentData?.total || firstSegmentData;

            stageData = {
              users: totalUsers,
              abandonments: totalAbandonments,
              completionRate: firstSegmentTotal?.completionRate || 0,
              abandonmentRate: firstSegmentTotal?.abandonmentRate || 0,
              conversionRate: conversionRate,
              dropOffRate: firstSegmentTotal?.dropOffRate || 0,
            };
          } else {
            // If no segments, use total object or direct properties
            stageData = stage.total || stage;
          }

          return {
            id: `step-${index}`,
            eventName: stage.eventName,
            displayName:
              event?.displayName || stage.eventName.replace(/_/g, " "),
            users: stageData.users || 0,
            conversionRate: stageData.conversionRate || 0,
            dropoffRate: stageData.dropOffRate || 0,
            abandonments: stageData.abandonments || 0,
            completionRate: stageData.completionRate || 0,
            abandonmentRate: stageData.abandonmentRate || 0,
          } as FunnelStep;
        }

        // If stage data doesn't exist yet (still loading or no data), show with default values
        return {
          id: `step-${index}`,
          eventName: eventName,
          displayName: event?.displayName || eventName.replace(/_/g, " "),
          users: 0, // Will be updated when API responds
          conversionRate: 0,
          dropoffRate: 0,
          abandonments: 0,
          completionRate: 0,
          abandonmentRate: 0,
        } as FunnelStep;
      });

      // Calculate total users from first step (if available)
      const firstStep = steps[0];
      const totalUsers =
        firstStep?.users || usersFunnel?.summary?.totalUsersAtStart || 0;

      // Calculate overall conversion from first to last step
      const lastStep = steps[steps.length - 1];
      const overallConversion =
        totalUsers > 0 && lastStep && lastStep.users > 0
          ? (lastStep.users / totalUsers) * 100
          : usersFunnel?.summary?.overallConversionRate || 0;

      return {
        steps,
        totalUsers,
        overallConversion: Math.round(overallConversion * 100) / 100,
      };
    }

    // Fallback to empty if no steps selected
    return { steps: [], totalUsers: 0, overallConversion: 0 };
  }, [usersFunnel, events, selectedSteps]);

  // Handlers
  const handleAddEvent = useCallback((eventName: string) => {
    setSelectedSteps((prev) => [...prev, eventName]);
  }, []);

  const handleRemoveEvent = useCallback((eventName: string) => {
    setSelectedSteps((prev) => prev.filter((e) => e !== eventName));
  }, []);

  const handleRemoveStep = useCallback((index: number) => {
    setSelectedSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedSteps([]);
  }, []);

  // Dimension Handlers
  const handleAddDimension = useCallback((dimensionId: string) => {
    setSelectedDimensions((prev) => {
      if (prev.includes(dimensionId)) return prev;
      return [...prev, dimensionId];
    });
  }, []);

  const handleRemoveDimension = useCallback((dimensionId: string) => {
    setSelectedDimensions((prev) => prev.filter((d) => d !== dimensionId));
  }, []);

  const handleClearDimensions = useCallback(() => {
    setSelectedDimensions([]);
  }, []);

  // Segment Handlers
  const handleToggleSegment = useCallback((segmentId: string) => {
    setSelectedSegments((prev) => {
      if (prev.includes(segmentId)) {
        return prev.filter((s) => s !== segmentId);
      }
      return [...prev, segmentId];
    });
  }, []);

  const handleRemoveSegment = useCallback((segmentId: string) => {
    setSelectedSegments((prev) => prev.filter((s) => s !== segmentId));
  }, []);

  const handleClearSegments = useCallback(() => {
    setSelectedSegments([]);
  }, []);

  // Segment Comparisons Handlers
  const handleAddSegmentComparison = useCallback((segmentId: string) => {
    setSelectedSegmentComparisons((prev) => {
      // Check if already exists
      if (prev.some((item) => item.segmentId === segmentId)) {
        return prev; // Already selected
      }
      const segment = AVAILABLE_SEGMENTS.find((s) => s.id === segmentId);
      const newItem: SegmentComparisonItem = {
        id: `segment-${segmentId}-${Date.now()}`,
        type: "segment",
        segmentId: segmentId,
        label: segment?.name || segmentId,
      };
      return [...prev, newItem];
    });
  }, []);

  const handleRemoveSegmentComparison = useCallback((itemId: string) => {
    setSelectedSegmentComparisons((prev) => {
      const itemToRemove = prev.find((item) => item.id === itemId);
      if (!itemToRemove) return prev;

      // Also remove from saved arrays if it's a country or app version group
      if (itemToRemove.type === "countryGroup" && itemToRemove.countryGroup) {
        setSavedCountryArrays((prevArrays) =>
          prevArrays.filter(
            (arr) =>
              JSON.stringify(arr) !== JSON.stringify(itemToRemove.countryGroup)
          )
        );
      } else if (
        itemToRemove.type === "appVersionGroup" &&
        itemToRemove.appVersionGroup
      ) {
        setSavedAppVersionArrays((prevArrays) =>
          prevArrays.filter(
            (arr) =>
              JSON.stringify(arr) !==
              JSON.stringify(itemToRemove.appVersionGroup)
          )
        );
      }

      return prev.filter((item) => item.id !== itemId);
    });
  }, []);

  const handleClearSegmentComparisons = useCallback(() => {
    setSelectedSegmentComparisons([]);
    setSavedCountryArrays([]);
    setSavedAppVersionArrays([]);
  }, []);

  // Country Handlers
  const handleAddCountry = useCallback((countryValue: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(countryValue)) return prev;
      return [...prev, countryValue];
    });
    setCountrySearchQuery("");
  }, []);

  const handleRemoveCountry = useCallback((countryValue: string) => {
    setSelectedCountries((prev) => prev.filter((c) => c !== countryValue));
  }, []);

  const handleClearCountries = useCallback(() => {
    setSelectedCountries([]);
    setSavedCountryArrays([]);
  }, []);

  const handleSaveCountries = useCallback(() => {
    if (selectedCountries.length > 0) {
      const countryArray = [...selectedCountries];
      setSavedCountryArrays((prev) => [...prev, countryArray]);

      // Add to Segment Comparisons
      const countryLabels = countryArray
        .map((val) => countries.find((c) => c.value === val)?.label || val)
        .join(", ");
      const newItem: SegmentComparisonItem = {
        id: `country-group-${Date.now()}-${Math.random()}`,
        type: "countryGroup",
        countryGroup: countryArray,
        label: `Countries: ${countryLabels}`,
      };
      setSelectedSegmentComparisons((prev) => [...prev, newItem]);

      setSelectedCountries([]); // Clear selection after saving
    }
  }, [selectedCountries, countries]);

  // App Version Handlers
  const handleAddAppVersion = useCallback((appVersionValue: string) => {
    setSelectedAppVersions((prev) => {
      if (prev.includes(appVersionValue)) return prev;
      return [...prev, appVersionValue];
    });
    setAppVersionSearchQuery("");
  }, []);

  const handleRemoveAppVersion = useCallback((appVersionValue: string) => {
    setSelectedAppVersions((prev) => prev.filter((v) => v !== appVersionValue));
  }, []);

  const handleClearAppVersions = useCallback(() => {
    setSelectedAppVersions([]);
    setSavedAppVersionArrays([]);
  }, []);

  const handleSaveAppVersions = useCallback(() => {
    if (selectedAppVersions.length > 0) {
      const versionArray = [...selectedAppVersions];
      setSavedAppVersionArrays((prev) => [...prev, versionArray]);

      // Add to Segment Comparisons
      const versionLabels = versionArray
        .map((val) => appVersions.find((v) => v.value === val)?.label || val)
        .join(", ");
      const newItem: SegmentComparisonItem = {
        id: `appversion-group-${Date.now()}-${Math.random()}`,
        type: "appVersionGroup",
        appVersionGroup: versionArray,
        label: `App Versions: ${versionLabels}`,
      };
      setSelectedSegmentComparisons((prev) => [...prev, newItem]);

      setSelectedAppVersions([]); // Clear selection after saving
    }
  }, [selectedAppVersions, appVersions]);

  const filteredCountries = useMemo(() => {
    return countries.filter(
      (country) =>
        country.label
          .toLowerCase()
          .includes(countrySearchQuery.toLowerCase()) ||
        country.value.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [countries, countrySearchQuery]);

  const filteredAppVersions = useMemo(() => {
    return appVersions.filter(
      (version) =>
        version.label
          .toLowerCase()
          .includes(appVersionSearchQuery.toLowerCase()) ||
        version.value
          .toLowerCase()
          .includes(appVersionSearchQuery.toLowerCase())
    );
  }, [appVersions, appVersionSearchQuery]);

  const filteredSegments = useMemo(() => {
    return AVAILABLE_SEGMENTS.filter(
      (segment) =>
        segment.name.toLowerCase().includes(segmentSearchQuery.toLowerCase()) ||
        segment.description
          .toLowerCase()
          .includes(segmentSearchQuery.toLowerCase())
    );
  }, [segmentSearchQuery]);

  // Drag and Drop State
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dropTargetStepIndex, setDropTargetStepIndex] = useState<number | null>(
    null
  );
  const [draggedDimensionIndex, setDraggedDimensionIndex] = useState<
    number | null
  >(null);
  const [dropTargetDimensionIndex, setDropTargetDimensionIndex] = useState<
    number | null
  >(null);
  const [draggedSegmentIndex, setDraggedSegmentIndex] = useState<number | null>(
    null
  );
  const [dropTargetSegmentIndex, setDropTargetSegmentIndex] = useState<
    number | null
  >(null);
  const [draggedSegmentComparisonIndex, setDraggedSegmentComparisonIndex] =
    useState<number | null>(null);
  const [
    dropTargetSegmentComparisonIndex,
    setDropTargetSegmentComparisonIndex,
  ] = useState<number | null>(null);
  const [isDraggingToComparisons, setIsDraggingToComparisons] =
    useState<boolean>(false);

  // Drag Handlers for Steps
  const handleStepDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedStepIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleStepDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedStepIndex !== null && draggedStepIndex !== index) {
        setDropTargetStepIndex(index);
      }
    },
    [draggedStepIndex]
  );

  const handleStepDragLeave = useCallback(() => {
    setDropTargetStepIndex(null);
  }, []);

  const handleStepDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedStepIndex === null || draggedStepIndex === index) return;

      setSelectedSteps((prev) => {
        const newSteps = [...prev];
        const draggedItem = newSteps[draggedStepIndex];
        newSteps.splice(draggedStepIndex, 1);
        newSteps.splice(index, 0, draggedItem);
        return newSteps;
      });
      setDraggedStepIndex(null);
      setDropTargetStepIndex(null);
    },
    [draggedStepIndex]
  );

  const handleStepDragEnd = useCallback(() => {
    setDraggedStepIndex(null);
    setDropTargetStepIndex(null);
  }, []);

  // Drag Handlers for Dimensions
  const handleDimensionDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedDimensionIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDimensionDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedDimensionIndex !== null && draggedDimensionIndex !== index) {
        setDropTargetDimensionIndex(index);
      }
    },
    [draggedDimensionIndex]
  );

  const handleDimensionDragLeave = useCallback(() => {
    setDropTargetDimensionIndex(null);
  }, []);

  const handleDimensionDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedDimensionIndex === null || draggedDimensionIndex === index)
        return;

      setSelectedDimensions((prev) => {
        const newDimensions = [...prev];
        const draggedItem = newDimensions[draggedDimensionIndex];
        newDimensions.splice(draggedDimensionIndex, 1);
        newDimensions.splice(index, 0, draggedItem);
        return newDimensions;
      });
      setDraggedDimensionIndex(null);
      setDropTargetDimensionIndex(null);
    },
    [draggedDimensionIndex]
  );

  const handleDimensionDragEnd = useCallback(() => {
    setDraggedDimensionIndex(null);
    setDropTargetDimensionIndex(null);
  }, []);

  // Drag Handlers for Segments
  const handleSegmentDragStart = useCallback(
    (e: React.DragEvent, index: number, segmentId: string) => {
      setDraggedSegmentIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", segmentId);
      e.dataTransfer.setData("segmentId", segmentId);
      e.dataTransfer.setData("source", "segments");
    },
    []
  );

  const handleSegmentDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedSegmentIndex !== null && draggedSegmentIndex !== index) {
        setDropTargetSegmentIndex(index);
      }
    },
    [draggedSegmentIndex]
  );

  const handleSegmentDragLeave = useCallback(() => {
    setDropTargetSegmentIndex(null);
  }, []);

  const handleSegmentDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedSegmentIndex === null || draggedSegmentIndex === index) return;

      setSelectedSegments((prev) => {
        const newSegments = [...prev];
        const draggedItem = newSegments[draggedSegmentIndex];
        newSegments.splice(draggedSegmentIndex, 1);
        newSegments.splice(index, 0, draggedItem);
        return newSegments;
      });
      setDraggedSegmentIndex(null);
      setDropTargetSegmentIndex(null);
    },
    [draggedSegmentIndex]
  );

  const handleSegmentDragEnd = useCallback(() => {
    setDraggedSegmentIndex(null);
    setDropTargetSegmentIndex(null);
    setIsDraggingToComparisons(false);
  }, []);

  // Drag Handlers for Segment Comparisons
  const handleSegmentComparisonDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedSegmentComparisonIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleSegmentComparisonDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (
        draggedSegmentComparisonIndex !== null &&
        draggedSegmentComparisonIndex !== index
      ) {
        setDropTargetSegmentComparisonIndex(index);
      }
    },
    [draggedSegmentComparisonIndex]
  );

  const handleSegmentComparisonDragLeave = useCallback(() => {
    setDropTargetSegmentComparisonIndex(null);
  }, []);

  const handleSegmentComparisonDrop = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (
        draggedSegmentComparisonIndex === null ||
        draggedSegmentComparisonIndex === index
      )
        return;

      setSelectedSegmentComparisons((prev) => {
        const newComparisons = [...prev];
        const draggedItem = newComparisons[draggedSegmentComparisonIndex];
        newComparisons.splice(draggedSegmentComparisonIndex, 1);
        newComparisons.splice(index, 0, draggedItem);
        return newComparisons;
      });
      setDraggedSegmentComparisonIndex(null);
      setDropTargetSegmentComparisonIndex(null);
    },
    [draggedSegmentComparisonIndex]
  );

  const handleSegmentComparisonDragEnd = useCallback(() => {
    setDraggedSegmentComparisonIndex(null);
    setDropTargetSegmentComparisonIndex(null);
    setIsDraggingToComparisons(false);
  }, []);

  // Handlers for dropping segments into Segment Comparisons
  const handleComparisonsDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const source = e.dataTransfer.getData("source");
    if (source === "segments") {
      e.dataTransfer.dropEffect = "copy";
      setIsDraggingToComparisons(true);
    }
  }, []);

  const handleComparisonsDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the drop zone, not entering a child
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setIsDraggingToComparisons(false);
    }
  }, []);

  const handleComparisonsDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingToComparisons(false);

      const segmentId = e.dataTransfer.getData("segmentId");
      const source = e.dataTransfer.getData("source");

      if (source === "segments" && segmentId) {
        // Add segment to comparisons if not already present
        handleAddSegmentComparison(segmentId);
      }
    },
    [handleAddSegmentComparison]
  );

  const handleRefresh = useCallback(() => {
    // Fetch event names without date parameters
    dispatch(getGA4EventNamesThunk(undefined));

    // Build request body for users funnel (same logic as useEffect)
    const requestBody: {
      eventNames?: string[];
      dimension?: string;
      elapsedTime?: boolean;
      segments?: Array<{ value: string | string[]; type: string }>;
    } = {};

    if (selectedSteps.length > 0) {
      requestBody.eventNames = selectedSteps;
    }

    if (breakdownDimension && breakdownDimension !== "none") {
      const dimensionMap: Record<string, string> = {
        country: "country",
        deviceCategory: "deviceCategory",
        appVersion: "appVersion",
        osVersion: "operatingSystemVersion",
        device: "mobileDeviceModel",
      };
      requestBody.dimension =
        dimensionMap[breakdownDimension] || breakdownDimension;
    }

    if (showElapsedTime) {
      requestBody.elapsedTime = true;
    }

    // Only add segments from Segment Comparisons (not from regular segments section)
    const segments: Array<{ value: string | string[]; type: string }> = [];

    // Add segments from Segment Comparisons
    const segmentComparisons = buildSegmentComparisonsArray();
    segments.push(...(segmentComparisons as any));

    // Add selected dimension value as a segment if double-clicked
    if (selectedDimensionValue) {
      segments.push({
        ...selectedDimensionValue,
        value: selectedDimensionValue.value,
      } as any);
    }

    if (segments.length > 0) {
      requestBody.segments = segments as any;
    }

    // Build query params - always include dates if available
    const queryParams: {
      startDate?: string;
      endDate?: string;
      row?: number;
    } = {};

    // Always include dates if they are set and valid
    if (startDate && startDate.trim()) {
      queryParams.startDate = startDate.trim();
    }
    if (endDate && endDate.trim()) {
      queryParams.endDate = endDate.trim();
    }
    if (
      rowsPerDimension &&
      breakdownDimension &&
      breakdownDimension !== "none"
    ) {
      const rowValue = parseInt(rowsPerDimension);
      if (!isNaN(rowValue) && rowValue > 0) {
        queryParams.row = rowValue;
      }
    }

    // Always pass queryParams if we have at least dates
    dispatch(
      getGA4UsersFunnelThunk({
        body: requestBody as any,
        queryParams:
          queryParams.startDate || queryParams.endDate || queryParams.row
            ? queryParams
            : undefined,
      })
    );
  }, [
    dispatch,
    startDate,
    endDate,
    selectedSteps,
    breakdownDimension,
    showElapsedTime,
    rowsPerDimension,
    buildSegmentsArray,
    buildSegmentComparisonsArray,
    selectedDimensionValue,
  ]);

  // Load state from funnel
  const loadStateFromFunnel = useCallback((funnel: FunnelItem) => {
    setSelectedSteps(funnel.selectedSteps);
    setStartDate(funnel.startDate);
    setEndDate(funnel.endDate);
    setBreakdownDimension(funnel.breakdownDimension);
    setRowsPerDimension(funnel.rowsPerDimension);
    setSelectedSegments(funnel.selectedSegments);
    setSelectedSegmentComparisons(funnel.selectedSegmentComparisons);
    setSavedCountryArrays(funnel.savedCountryArrays);
    setSavedAppVersionArrays(funnel.savedAppVersionArrays);
    setSelectedDimensionValue(funnel.selectedDimensionValue);
    setShowElapsedTime(funnel.showElapsedTime);
    setPreset(funnel.preset);
  }, []);

  // Helper function to restore segments from saved configuration
  const restoreSegmentsFromConfig = useCallback(
    (config: {
      segments?: Array<{ value: string | string[]; type: string }>;
    }) => {
      if (!config.segments || !Array.isArray(config.segments)) return;

      const restoredComparisons: SegmentComparisonItem[] = [];
      const restoredCountryArrays: string[][] = [];
      const restoredAppVersionArrays: string[][] = [];

      config.segments.forEach(
        (segment: { value: string | string[]; type: string }) => {
          if (Array.isArray(segment.value)) {
            // Country or app version group
            if (segment.type === "country") {
              restoredCountryArrays.push([...segment.value]);
              const countryLabels = segment.value
                .map(
                  (val) => countries.find((c) => c.value === val)?.label || val
                )
                .join(", ");
              restoredComparisons.push({
                id: `country-group-${Date.now()}-${Math.random()}`,
                type: "countryGroup",
                countryGroup: [...segment.value],
                label: `Countries: ${countryLabels}`,
              });
            } else if (segment.type === "appVersion") {
              restoredAppVersionArrays.push([...segment.value]);
              const versionLabels = segment.value
                .map(
                  (val) =>
                    appVersions.find((v) => v.value === val)?.label || val
                )
                .join(", ");
              restoredComparisons.push({
                id: `appversion-group-${Date.now()}-${Math.random()}`,
                type: "appVersionGroup",
                appVersionGroup: [...segment.value],
                label: `App Versions: ${versionLabels}`,
              });
            }
          } else {
            // Regular segment - map back to segment ID
            // Reverse mapping from API format to segment ID
            if (segment.type === "deviceCategory") {
              if (segment.value === "mobile") {
                restoredComparisons.push({
                  id: `segment-mobile_traffic-${Date.now()}`,
                  type: "segment",
                  segmentId: "mobile_traffic",
                  label: "Mobile traffic",
                });
              } else if (segment.value === "tablet") {
                restoredComparisons.push({
                  id: `segment-tablet_traffic-${Date.now()}`,
                  type: "segment",
                  segmentId: "tablet_traffic",
                  label: "Tablet traffic",
                });
              }
            } else if (segment.type === "sessionDefaultChannelGroup") {
              if (segment.value === "Direct") {
                restoredComparisons.push({
                  id: `segment-direct_traffic-${Date.now()}`,
                  type: "segment",
                  segmentId: "direct_traffic",
                  label: "Direct traffic",
                });
              } else if (
                segment.value === "Paid" ||
                segment.value === "Paid Search"
              ) {
                restoredComparisons.push({
                  id: `segment-paid_traffic-${Date.now()}`,
                  type: "segment",
                  segmentId: "paid_traffic",
                  label: "Paid traffic",
                });
              } else if (segment.value === "Organic") {
                restoredComparisons.push({
                  id: `segment-organic_traffic-${Date.now()}`,
                  type: "segment",
                  segmentId: "organic_traffic",
                  label: "Organic traffic",
                });
              } else if (segment.value === "Referral") {
                restoredComparisons.push({
                  id: `segment-referral_affiliates-${Date.now()}`,
                  type: "segment",
                  segmentId: "referral_affiliates",
                  label: "Referral & affiliates traffic",
                });
              } else if (
                segment.value === "Email, SMS, Mobile Push Notifications"
              ) {
                restoredComparisons.push({
                  id: `segment-email_sms_push-${Date.now()}`,
                  type: "segment",
                  segmentId: "email_sms_push",
                  label: "Email, SMS & push notifications traffic",
                });
              }
            }
          }
        }
      );

      setSavedCountryArrays(restoredCountryArrays);
      setSavedAppVersionArrays(restoredAppVersionArrays);
      setSelectedSegmentComparisons(restoredComparisons);
    },
    [countries, appVersions]
  );

  const handleLoadFunnel = useCallback(
    async (funnel: SavedFunnel) => {
      // If it's a group (has groupId), fetch group funnels
      if (funnel.groupId) {
        try {
          setLoadingGroupFunnels(true);
          const response = await getGroupFunnels(funnel.groupId);
          console.log("Group Funnels API Response:", response);

          if (
            response?.data?.status &&
            response?.data?.data?.funnels &&
            Array.isArray(response.data.data.funnels)
          ) {
            const groupData = response.data.data.group;
            const funnelsData = response.data.data.funnels;

            // Map API funnels to FunnelItem objects
            const mappedFunnels: FunnelItem[] = funnelsData.map(
              (funnelData: any, index: number) => {
                const config = funnelData.configuration || {};

                // Restore segments for this funnel
                let restoredComparisons: SegmentComparisonItem[] = [];
                let restoredCountryArrays: string[][] = [];
                let restoredAppVersionArrays: string[][] = [];

                if (config.segments && Array.isArray(config.segments)) {
                  config.segments.forEach(
                    (segment: { value: string | string[]; type: string }) => {
                      if (Array.isArray(segment.value)) {
                        if (segment.type === "country") {
                          restoredCountryArrays.push([...segment.value]);
                          const countryLabels = segment.value
                            .map(
                              (val) =>
                                countries.find((c) => c.value === val)?.label ||
                                val
                            )
                            .join(", ");
                          restoredComparisons.push({
                            id: `country-group-${Date.now()}-${Math.random()}`,
                            type: "countryGroup",
                            countryGroup: [...segment.value],
                            label: `Countries: ${countryLabels}`,
                          });
                        } else if (segment.type === "appVersion") {
                          restoredAppVersionArrays.push([...segment.value]);
                          const versionLabels = segment.value
                            .map(
                              (val) =>
                                appVersions.find((v) => v.value === val)
                                  ?.label || val
                            )
                            .join(", ");
                          restoredComparisons.push({
                            id: `appversion-group-${Date.now()}-${Math.random()}`,
                            type: "appVersionGroup",
                            appVersionGroup: [...segment.value],
                            label: `App Versions: ${versionLabels}`,
                          });
                        }
                      }
                    }
                  );
                }

                // Determine preset from dates if available, otherwise use "custom"
                const funnelStartDate =
                  config.startDate || defaultDateRange.startDate;
                const funnelEndDate =
                  config.endDate || defaultDateRange.endDate;
                let funnelPreset = "custom";

                // Try to match dates to a preset
                if (funnelStartDate && funnelEndDate) {
                  const presets = [
                    "today",
                    "yesterday",
                    "last2",
                    "last7",
                    "last28",
                    "last30",
                    "last90",
                    "thisWeek",
                    "lastWeek",
                    "thisMonth",
                    "lastMonth",
                    "quarterToDate",
                    "thisYear",
                    "lastCalendarYear",
                  ];
                  for (const presetOption of presets) {
                    const presetRange = getDateRangeForPreset(presetOption);
                    if (
                      presetRange.startDate === funnelStartDate &&
                      presetRange.endDate === funnelEndDate
                    ) {
                      funnelPreset = presetOption;
                      break;
                    }
                  }
                } else {
                  funnelPreset = "last2";
                }

                return {
                  id: funnelData._id || funnelData.id || `funnel-${index}`,
                  name: funnelData.name || `Funnel ${index + 1}`,
                  selectedSteps:
                    config.eventNames || funnelData.eventNames || [],
                  startDate: funnelStartDate,
                  endDate: funnelEndDate,
                  breakdownDimension:
                    config.dimension === "none" ? "" : config.dimension || "",
                  rowsPerDimension: String(config.row || 5),
                  selectedSegments: AVAILABLE_SEGMENTS.map((s) => s.id),
                  selectedSegmentComparisons: restoredComparisons,
                  savedCountryArrays: restoredCountryArrays,
                  savedAppVersionArrays: restoredAppVersionArrays,
                  selectedDimensionValue: null,
                  showElapsedTime: false,
                  preset: funnelPreset,
                  savedFunnelId: funnelData._id || funnelData.id, // Store original ID for API call
                };
              }
            );

            if (mappedFunnels.length > 0) {
              // Create a new group with the funnels
              const newGroupId = `group-${funnel.groupId}`;
              const newGroup: FunnelGroup = {
                id: newGroupId,
                name: groupData?.name || funnel.name || "Loaded Group",
                funnels: mappedFunnels,
                activeFunnelId: mappedFunnels[0].id,
              };

              // Replace or add the group
              setFunnelGroups((prevGroups) => {
                const filtered = prevGroups.filter((g) => g.id !== newGroupId);
                return [...filtered, newGroup];
              });

              // Store the mapping between activeGroupId and actual API groupId
              setGroupIdMapping((prev) => ({
                ...prev,
                [newGroupId]: funnel.groupId!,
              }));

              // Set as active group
              setActiveGroupId(newGroupId);

              // Set the selected group name for display
              setSelectedGroupName(
                groupData?.name || funnel.name || "Loaded Group"
              );

              // Load the first funnel's state and set savedFunnelId for API call
              // Set savedFunnelId first before loading state to ensure API call uses it
              const firstFunnel = mappedFunnels[0];
              if (firstFunnel.savedFunnelId) {
                setLoadedSavedFunnelId(firstFunnel.savedFunnelId);
              } else {
                setLoadedSavedFunnelId(null);
              }
              // Load state after setting savedFunnelId so useEffect can use it
              loadStateFromFunnel(firstFunnel);

              // Clear selected dimension value
              setSelectedDimensionValue(null);
            }
          }
        } catch (error) {
          console.error("Error loading group funnels:", error);
        } finally {
          setLoadingGroupFunnels(false);
        }
      } else {
        // Legacy single funnel loading (for backward compatibility)
        const config = funnel.configuration || {};

        if (config.eventNames && config.eventNames.length > 0) {
          setSelectedSteps(config.eventNames);
        }

        if (config.startDate) {
          setStartDate(config.startDate);
        }
        if (config.endDate) {
          setEndDate(config.endDate);
        }

        // Determine preset from dates if available
        if (config.startDate && config.endDate) {
          const presets = [
            "today",
            "yesterday",
            "last2",
            "last7",
            "last28",
            "last30",
            "last90",
            "thisWeek",
            "lastWeek",
            "thisMonth",
            "lastMonth",
            "quarterToDate",
            "thisYear",
            "lastCalendarYear",
          ];
          let matchedPreset = "custom";
          for (const presetOption of presets) {
            const presetRange = getDateRangeForPreset(presetOption);
            if (
              presetRange.startDate === config.startDate &&
              presetRange.endDate === config.endDate
            ) {
              matchedPreset = presetOption;
              break;
            }
          }
          setPreset(matchedPreset);
        }

        if (config.dimension) {
          setBreakdownDimension(
            config.dimension === "none" ? "" : config.dimension
          );
        }

        if (config.row) {
          setRowsPerDimension(String(config.row));
        }

        restoreSegmentsFromConfig(config);
        setLoadedSavedFunnelId(funnel.id);
        setSelectedDimensionValue(null);
      }
    },
    [
      countries,
      appVersions,
      loadStateFromFunnel,
      defaultDateRange,
      restoreSegmentsFromConfig,
    ]
  );

  // Auto-select first group when groups are loaded and no group is selected
  useEffect(() => {
    if (
      !savedFunnelsLoading &&
      savedFunnels.length > 0 &&
      selectedGroupName === null &&
      !loadingGroupFunnels &&
      !hasAutoSelectedFirstGroup.current
    ) {
      // Automatically load the first group
      const firstGroup = savedFunnels[0];
      if (firstGroup) {
        hasAutoSelectedFirstGroup.current = true;
        handleLoadFunnel(firstGroup);
      }
    }
  }, [
    savedFunnels,
    savedFunnelsLoading,
    selectedGroupName,
    loadingGroupFunnels,
    handleLoadFunnel,
  ]);

  // Handle delete click - opens confirmation dialog
  const handleDeleteClick = useCallback(
    (groupId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteGroupId(groupId);
    },
    []
  );

  // Handle actual deletion after confirmation
  const handleDeleteSavedFunnel = useCallback(async () => {
    if (!deleteGroupId) return;

    try {
      setIsDeletingGroup(true);
      console.log("Deleting group with ID:", deleteGroupId);

      // Call API to delete the group
      const response = await deleteFunnelGroup(deleteGroupId);

      // Show success notification from API response
      const successMessage =
        response?.data?.message || "Group deleted successfully";
      toastSuccess(successMessage);

      // Remove from saved funnels list
      setSavedFunnels((prev) => prev.filter((f) => f.id !== deleteGroupId));

      // Remove from funnelGroups if it's loaded
      const groupIdInState = `group-${deleteGroupId}`;
      const currentGroup = funnelGroups.find((g) => g.id === groupIdInState);

      if (currentGroup) {
        // Remove the group from funnelGroups
        setFunnelGroups((prevGroups) =>
          prevGroups.filter((g) => g.id !== groupIdInState)
        );

        // If the deleted group is currently active, switch to default group
        if (activeGroupId === groupIdInState) {
          // Clear selected group name since we're switching to default
          setSelectedGroupName(null);

          // Find default group or create one
          const defaultGroup = funnelGroups.find(
            (g) => g.id === "default-group"
          );
          if (defaultGroup) {
            setActiveGroupId("default-group");
            const activeFunnel = defaultGroup.funnels.find(
              (f) => f.id === defaultGroup.activeFunnelId
            );
            if (activeFunnel) {
              loadStateFromFunnel(activeFunnel);
            }
          } else {
            // Create a new default group if none exists
            const newDefaultGroup: FunnelGroup = {
              id: "default-group",
              name: "Funnel Group 1",
              funnels: [
                {
                  id: "funnel-1",
                  name: "Funnel 1",
                  selectedSteps: [],
                  startDate: defaultDateRange.startDate,
                  endDate: defaultDateRange.endDate,
                  breakdownDimension: "",
                  rowsPerDimension: "5",
                  selectedSegments: AVAILABLE_SEGMENTS.map((s) => s.id),
                  selectedSegmentComparisons: [],
                  savedCountryArrays: [],
                  savedAppVersionArrays: [],
                  selectedDimensionValue: null,
                  showElapsedTime: false,
                  preset: "last2",
                },
              ],
              activeFunnelId: "funnel-1",
            };
            setFunnelGroups([newDefaultGroup]);
            setActiveGroupId("default-group");
            loadStateFromFunnel(newDefaultGroup.funnels[0]);
          }
        } else {
          // If deleting a different group, check if it's the selected one
          const deletedGroup = savedFunnels.find((f) => f.id === deleteGroupId);
          if (deletedGroup && selectedGroupName === deletedGroup.name) {
            setSelectedGroupName(null);
          }
        }
      }

      console.log("Group deleted successfully");
      setDeleteGroupId(null); // Close dialog
    } catch (error: any) {
      console.error("Error deleting group:", error);
      // Show error notification
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete group. Please try again.";
      toastError(errorMessage);
    } finally {
      setIsDeletingGroup(false);
    }
  }, [
    deleteGroupId,
    funnelGroups,
    activeGroupId,
    loadStateFromFunnel,
    defaultDateRange,
  ]);

  // Get current active funnel
  const getActiveFunnel = useCallback((): FunnelItem | null => {
    const group = funnelGroups.find((g) => g.id === activeGroupId);
    if (!group) return null;
    return group.funnels.find((f) => f.id === group.activeFunnelId) || null;
  }, [funnelGroups, activeGroupId]);

  // Save current state to active funnel
  const saveCurrentStateToFunnel = useCallback(() => {
    setFunnelGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== activeGroupId) return group;
        return {
          ...group,
          funnels: group.funnels.map((funnel) => {
            if (funnel.id !== group.activeFunnelId) return funnel;
            return {
              ...funnel,
              selectedSteps,
              startDate,
              endDate,
              breakdownDimension,
              rowsPerDimension,
              selectedSegments,
              selectedSegmentComparisons,
              savedCountryArrays,
              savedAppVersionArrays,
              selectedDimensionValue,
              showElapsedTime,
              preset,
            };
          }),
        };
      })
    );
  }, [
    activeGroupId,
    selectedSteps,
    startDate,
    endDate,
    breakdownDimension,
    rowsPerDimension,
    selectedSegments,
    selectedSegmentComparisons,
    savedCountryArrays,
    savedAppVersionArrays,
    selectedDimensionValue,
    showElapsedTime,
    preset,
  ]);

  // Debounce timer ref for auto-save
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to store previous state values for change detection
  const previousStateRef = useRef<{
    selectedSteps: string[];
    startDate: string;
    endDate: string;
    breakdownDimension: string;
    rowsPerDimension: string;
    selectedSegmentComparisons: SegmentComparisonItem[];
    selectedDimensionValue: { value: string; type: string } | null;
    activeGroupId: string;
  } | null>(null);

  // Helper function to deep compare arrays
  const arraysEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => {
      if (Array.isArray(val) && Array.isArray(b[idx])) {
        return arraysEqual(val, b[idx]);
      }
      if (typeof val === "object" && typeof b[idx] === "object") {
        return JSON.stringify(val) === JSON.stringify(b[idx]);
      }
      return val === b[idx];
    });
  };

  // Helper function to compare segment comparisons
  const segmentComparisonsEqual = (
    a: SegmentComparisonItem[],
    b: SegmentComparisonItem[]
  ): boolean => {
    if (a.length !== b.length) return false;

    // Compare by ID to handle order changes
    const aIds = new Set(a.map((item) => item.id));
    const bIds = new Set(b.map((item) => item.id));

    if (aIds.size !== bIds.size) return false;

    // Check if all IDs match
    for (const id of aIds) {
      if (!bIds.has(id)) return false;
    }

    // For each item in a, find corresponding item in b and compare
    return a.every((itemA) => {
      const itemB = b.find((item) => item.id === itemA.id);
      if (!itemB) return false;

      if (itemA.type !== itemB.type) return false;
      if (itemA.segmentId !== itemB.segmentId) return false;

      if (itemA.type === "countryGroup") {
        return arraysEqual(itemA.countryGroup || [], itemB.countryGroup || []);
      }
      if (itemA.type === "appVersionGroup") {
        return arraysEqual(
          itemA.appVersionGroup || [],
          itemB.appVersionGroup || []
        );
      }
      return true;
    });
  };

  // Helper function to check if state has actually changed
  const hasStateChanged = (): boolean => {
    if (!previousStateRef.current) return true;

    const prev = previousStateRef.current;

    // Compare simple values
    if (
      prev.selectedSteps.length !== selectedSteps.length ||
      !arraysEqual(prev.selectedSteps, selectedSteps) ||
      prev.startDate !== startDate ||
      prev.endDate !== endDate ||
      prev.breakdownDimension !== breakdownDimension ||
      prev.rowsPerDimension !== rowsPerDimension ||
      prev.activeGroupId !== activeGroupId
    ) {
      return true;
    }

    // Compare segment comparisons
    if (
      !segmentComparisonsEqual(
        prev.selectedSegmentComparisons,
        selectedSegmentComparisons
      )
    ) {
      return true;
    }

    // Compare dimension value
    if (
      prev.selectedDimensionValue?.value !== selectedDimensionValue?.value ||
      prev.selectedDimensionValue?.type !== selectedDimensionValue?.type
    ) {
      return true;
    }

    return false;
  };

  // Switch to a different funnel
  const handleSwitchFunnel = useCallback(
    (funnelId: string) => {
      // Save current state before switching
      saveCurrentStateToFunnel();

      // Find the target funnel first (before state update)
      const group = funnelGroups.find((g) => g.id === activeGroupId);
      if (!group) return;

      const targetFunnel = group.funnels.find((f) => f.id === funnelId);
      if (!targetFunnel) return;

      console.log("Switching to funnel:", {
        funnelId: funnelId,
        funnelName: targetFunnel.name,
        savedFunnelId: targetFunnel.savedFunnelId,
      });

      // Set savedFunnelId for API call - this must be set BEFORE loadStateFromFunnel
      // so the useEffect can detect it and call the API with savedFunnelId
      if (targetFunnel.savedFunnelId) {
        setLoadedSavedFunnelId(targetFunnel.savedFunnelId);
      } else {
        setLoadedSavedFunnelId(null);
      }

      // Switch to new funnel in state
      setFunnelGroups((prevGroups) =>
        prevGroups.map((g) => {
          if (g.id !== activeGroupId) return g;
          return {
            ...g,
            activeFunnelId: funnelId,
          };
        })
      );

      // Load the funnel's state - this will trigger useEffect which will see loadedSavedFunnelId
      loadStateFromFunnel(targetFunnel);
    },
    [activeGroupId, funnelGroups, saveCurrentStateToFunnel, loadStateFromFunnel]
  );

  // Helper function to build segments array from segment comparisons
  const buildSegmentsFromComparisons = useCallback(
    (
      comparisons: SegmentComparisonItem[],
      dimensionValue: { value: string; type: string } | null
    ): Array<{ value: string[] | string; type: string }> => {
      const segments: Array<{ value: string[] | string; type: string }> = [];

      // Add segments from Segment Comparisons
      comparisons.forEach((item) => {
        if (item.type === "segment") {
          const segment = AVAILABLE_SEGMENTS.find(
            (s) => s.id === item.segmentId
          );
          if (segment) {
            // Map segment to API format
            if (item.segmentId === "all_users") {
              // Skip all_users as it's default
              return;
            } else if (item.segmentId === "direct_traffic") {
              segments.push({
                value: "Direct",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "email_sms_push") {
              segments.push({
                value: "Email, SMS, Mobile Push Notifications",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "mobile_traffic") {
              segments.push({
                value: "mobile",
                type: "deviceCategory",
              });
            } else if (item.segmentId === "organic_traffic") {
              segments.push({
                value: "Organic",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "paid_traffic") {
              segments.push({
                value: "Paid",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "referral_affiliates") {
              segments.push({
                value: "Referral",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "tablet_traffic") {
              segments.push({
                value: "tablet",
                type: "deviceCategory",
              });
            }
          }
        } else if (item.type === "countryGroup" && item.countryGroup) {
          // Add country group as a segment
          if (item.countryGroup.length > 0) {
            segments.push({
              value: item.countryGroup,
              type: "country",
            });
          }
        } else if (item.type === "appVersionGroup" && item.appVersionGroup) {
          // Add app version group as a segment
          if (item.appVersionGroup.length > 0) {
            segments.push({
              value: item.appVersionGroup,
              type: "appVersion",
            });
          }
        }
      });

      // Add selected dimension value as a segment if double-clicked
      if (dimensionValue) {
        segments.push({
          value: dimensionValue.value,
          type: dimensionValue.type,
        });
      }

      return segments;
    },
    []
  );

  // Helper function to build segments array from current state
  const buildSegmentsForSave = useCallback((): Array<{
    value: string[] | string;
    type: string;
  }> => {
    return buildSegmentsFromComparisons(
      selectedSegmentComparisons,
      selectedDimensionValue
    );
  }, [selectedSegmentComparisons, selectedDimensionValue]);

  // Auto-save funnel to database when changes are made (debounced)
  const autoSaveFunnelToDatabase = useCallback(async () => {
    const activeFunnel = getActiveFunnel();

    // Only auto-save if the funnel has a savedFunnelId (meaning it's saved in database)
    if (!activeFunnel?.savedFunnelId) {
      return;
    }

    // Save current state to funnel first
    saveCurrentStateToFunnel();

    // Get the updated funnel after saving state (for name and groupId)
    const group = funnelGroups.find((g) => g.id === activeGroupId);
    if (!group) return;

    const updatedFunnel = group.funnels.find(
      (f) => f.id === group.activeFunnelId
    );
    if (!updatedFunnel) return;

    try {
      // Build segments array from CURRENT state (not from funnel's saved state)
      // This ensures removed segments are not included
      const segments = buildSegmentsFromComparisons(
        selectedSegmentComparisons, // Use current state
        selectedDimensionValue // Use current state
      );

      // Get the groupId for the active group
      const currentGroupId = groupIdMapping[activeGroupId];

      // Use CURRENT state values, not funnel's saved state
      const saveData: {
        name: string;
        groupId?: string;
        eventNames: string[];
        startDate: string;
        endDate: string;
        dimension: string | null;
        row: number;
        segments: Array<{ value: string[] | string; type: string }>;
      } = {
        name: updatedFunnel.name, // Use funnel name
        ...(currentGroupId && { groupId: currentGroupId }),
        eventNames: selectedSteps, // Use current state
        startDate: startDate, // Use current state
        endDate: endDate, // Use current state
        dimension:
          breakdownDimension &&
          breakdownDimension !== "none" &&
          breakdownDimension !== ""
            ? breakdownDimension // Use current state
            : null, // Send null when "none" or empty
        row: parseInt(rowsPerDimension) || 5, // Use current state
        segments: segments, // Built from current state
      };

      console.log("Auto-saving funnel to database:", saveData);

      // Call API to update the funnel
      const response = await saveGA4UsersFunnel(saveData);

      console.log("Auto-save API response:", response);

      // Auto-save is silent on success to avoid notification spam
      // Only show errors if something goes wrong
    } catch (error: any) {
      console.error("Error auto-saving funnel:", error);
      // Show error notification for auto-save failures
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to auto-save funnel. Please try again.";
      toastError(errorMessage);
    }
  }, [
    getActiveFunnel,
    saveCurrentStateToFunnel,
    funnelGroups,
    activeGroupId,
    buildSegmentsFromComparisons,
    groupIdMapping,
    selectedSteps,
    startDate,
    endDate,
    breakdownDimension,
    rowsPerDimension,
    selectedSegmentComparisons,
    selectedDimensionValue,
  ]);

  // Auto-save effect - watches for changes and saves after a delay
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Skip auto-save if:
    // 1. We're initializing from API
    // 2. We're switching to a saved funnel
    // 3. No steps are selected (funnel not configured yet)
    // 4. User is currently renaming a funnel
    if (
      isInitializingFromAPI.current ||
      isSwitchingSavedFunnel.current ||
      selectedSteps.length === 0 ||
      isRenamingFunnel !== null
    ) {
      // Update previous state ref even when skipping to prevent false positives
      previousStateRef.current = {
        selectedSteps: [...selectedSteps],
        startDate,
        endDate,
        breakdownDimension,
        rowsPerDimension,
        selectedSegmentComparisons: [...selectedSegmentComparisons],
        selectedDimensionValue: selectedDimensionValue
          ? { ...selectedDimensionValue }
          : null,
        activeGroupId,
      };
      return;
    }

    const activeFunnel = getActiveFunnel();

    // Only auto-save if the funnel has a savedFunnelId
    if (!activeFunnel?.savedFunnelId) {
      // Update previous state ref even when skipping
      previousStateRef.current = {
        selectedSteps: [...selectedSteps],
        startDate,
        endDate,
        breakdownDimension,
        rowsPerDimension,
        selectedSegmentComparisons: [...selectedSegmentComparisons],
        selectedDimensionValue: selectedDimensionValue
          ? { ...selectedDimensionValue }
          : null,
        activeGroupId,
      };
      return;
    }

    // Check if state has actually changed
    if (!hasStateChanged()) {
      return;
    }

    // Update previous state ref before setting timer
    previousStateRef.current = {
      selectedSteps: [...selectedSteps],
      startDate,
      endDate,
      breakdownDimension,
      rowsPerDimension,
      selectedSegmentComparisons: [...selectedSegmentComparisons],
      selectedDimensionValue: selectedDimensionValue
        ? { ...selectedDimensionValue }
        : null,
      activeGroupId,
    };

    // Debounce the auto-save - wait 300ms after last change for immediate feel
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveFunnelToDatabase();
    }, 300);

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    selectedSteps,
    startDate,
    endDate,
    breakdownDimension,
    rowsPerDimension,
    selectedSegmentComparisons,
    selectedDimensionValue,
    activeGroupId,
    isRenamingFunnel,
  ]);

  // Add new funnel - Save current funnel configuration to database
  const handleAddFunnel = useCallback(async () => {
    // Save current state before saving to database
    saveCurrentStateToFunnel();

    // Get the active group to determine next funnel number
    const group = funnelGroups.find((g) => g.id === activeGroupId);
    if (!group) return;

    // Generate next funnel number (Funnel 2, Funnel 3, etc.)
    const existingFunnelNumbers = group.funnels
      .map((f) => {
        const match = f.name.match(/^Funnel (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const nextFunnelNumber =
      existingFunnelNumbers.length > 0
        ? Math.max(...existingFunnelNumbers) + 1
        : group.funnels.length + 1;

    const newFunnelName = `Funnel ${nextFunnelNumber}`;

    // Build segments array
    const segments = buildSegmentsForSave();

    // Get the groupId for the active group
    const currentGroupId = groupIdMapping[activeGroupId];

    try {
      const saveData: {
        name: string;
        groupId?: string;
        eventNames: string[];
        startDate: string;
        endDate: string;
        dimension: string | null;
        row: number;
        segments: Array<{ value: string[] | string; type: string }>;
      } = {
        name: newFunnelName,
        ...(currentGroupId && { groupId: currentGroupId }),
        eventNames: selectedSteps,
        startDate: startDate,
        endDate: endDate,
        dimension:
          breakdownDimension &&
          breakdownDimension !== "none" &&
          breakdownDimension !== ""
            ? breakdownDimension
            : null, // Send null when "none" or empty
        row: parseInt(rowsPerDimension) || 5,
        segments: segments,
      };

      console.log("Saving new funnel with data:", saveData);

      // Call API to save the funnel
      const response = await saveGA4UsersFunnel(saveData);

      console.log("Funnel save API response:", response);

      // Show success notification from API response
      const successMessage =
        response?.data?.message ||
        `Funnel "${newFunnelName}" saved successfully`;
      toastSuccess(successMessage);

      if (response?.data?.status && response?.data?.data) {
        const savedFunnelData = response.data.data;
        const newFunnelId = `funnel-${Date.now()}`;

        // Create new funnel item with saved data
        const newFunnel: FunnelItem = {
          id: newFunnelId,
          name: newFunnelName,
          selectedSteps: selectedSteps,
          startDate: startDate,
          endDate: endDate,
          breakdownDimension: breakdownDimension || "",
          rowsPerDimension: rowsPerDimension,
          selectedSegments: selectedSegments,
          selectedSegmentComparisons: selectedSegmentComparisons,
          savedCountryArrays: savedCountryArrays,
          savedAppVersionArrays: savedAppVersionArrays,
          selectedDimensionValue: selectedDimensionValue,
          showElapsedTime: showElapsedTime,
          preset: preset,
          savedFunnelId: savedFunnelData._id, // Store the saved funnel ID from API
        };

        // Add new funnel to the group
        setFunnelGroups((prevGroups) =>
          prevGroups.map((g) => {
            if (g.id !== activeGroupId) return g;
            return {
              ...g,
              funnels: [...g.funnels, newFunnel],
              activeFunnelId: newFunnelId,
            };
          })
        );

        // Load new funnel's state after a brief delay
        setTimeout(() => {
          loadStateFromFunnel(newFunnel);
        }, 0);
      }
    } catch (error: any) {
      console.error("Error saving funnel:", error);
      // Show error notification
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save funnel. Please try again.";
      toastError(errorMessage);
      // You might want to show an error toast here
    }
  }, [
    activeGroupId,
    funnelGroups,
    saveCurrentStateToFunnel,
    buildSegmentsForSave,
    groupIdMapping,
    selectedSteps,
    startDate,
    endDate,
    breakdownDimension,
    rowsPerDimension,
    selectedSegments,
    selectedSegmentComparisons,
    savedCountryArrays,
    savedAppVersionArrays,
    selectedDimensionValue,
    showElapsedTime,
    preset,
    loadStateFromFunnel,
  ]);

  // Delete funnel - opens confirmation dialog
  const handleDeleteFunnel = useCallback(
    (funnelId: string) => {
      const group = funnelGroups.find((g) => g.id === activeGroupId);
      if (!group) return;

      // Don't allow deletion if only one funnel
      if (group.funnels.length <= 1) return;

      setDeleteFunnelId(funnelId);
    },
    [activeGroupId, funnelGroups]
  );

  // Confirm and execute funnel deletion
  const confirmDeleteFunnel = useCallback(() => {
    if (!deleteFunnelId) return;

    setIsDeletingFunnel(true);

    // Find the funnel to delete and determine the new active funnel
    const group = funnelGroups.find((g) => g.id === activeGroupId);
    if (!group || group.funnels.length <= 1) {
      setIsDeletingFunnel(false);
      setDeleteFunnelId(null);
      return;
    }

    const newFunnels = group.funnels.filter((f) => f.id !== deleteFunnelId);
    const newActiveFunnelId =
      group.activeFunnelId === deleteFunnelId
        ? newFunnels[0]?.id || ""
        : group.activeFunnelId;

    // Update funnel groups
    setFunnelGroups((prevGroups) =>
      prevGroups.map((g) => {
        if (g.id !== activeGroupId) return g;
        return {
          ...g,
          funnels: newFunnels,
          activeFunnelId: newActiveFunnelId,
        };
      })
    );

    // Load the new active funnel's state
    const targetFunnel = newFunnels.find((f) => f.id === newActiveFunnelId);
    if (targetFunnel) {
      loadStateFromFunnel(targetFunnel);
    }

    setIsDeletingFunnel(false);
    setDeleteFunnelId(null);
  }, [deleteFunnelId, activeGroupId, funnelGroups, loadStateFromFunnel]);

  // Rename funnel
  const handleRenameFunnel = useCallback(
    async (funnelId: string, newName: string) => {
      if (!newName.trim()) return;

      // Find the funnel being renamed
      const group = funnelGroups.find((g) => g.id === activeGroupId);
      if (!group) return;

      const funnelToRename = group.funnels.find((f) => f.id === funnelId);
      if (!funnelToRename) return;

      // Update local state first
      setFunnelGroups((prevGroups) =>
        prevGroups.map((g) => {
          if (g.id !== activeGroupId) return g;
          return {
            ...g,
            funnels: g.funnels.map((funnel) =>
              funnel.id === funnelId
                ? { ...funnel, name: newName.trim() }
                : funnel
            ),
          };
        })
      );
      setIsRenamingFunnel(null);
      setFunnelNameInput("");

      // If funnel has a savedFunnelId, update it via API
      if (funnelToRename.savedFunnelId) {
        try {
          // Call the specific API endpoint to update only the funnel name
          const updateData = {
            name: newName.trim(),
          };

          console.log("Updating funnel name with data:", updateData);

          // Call API to update only the funnel name
          const response = await updateFunnelName(
            funnelToRename.savedFunnelId,
            updateData
          );

          console.log("Funnel name update API response:", response);

          // Show success notification from API response
          const successMessage =
            response?.data?.message ||
            `Funnel name updated to "${newName.trim()}" successfully`;
          toastSuccess(successMessage);

          // Get the groupId for the active group to refresh if needed
          const currentGroupId = groupIdMapping[activeGroupId];

          // If we're in a group, reload the group funnels to reflect the update
          if (currentGroupId) {
            try {
              setLoadingGroupFunnels(true);
              const groupResponse = await getGroupFunnels(currentGroupId);
              console.log(
                "Refreshed Group Funnels API Response:",
                groupResponse
              );

              if (
                groupResponse?.data?.status &&
                groupResponse?.data?.data?.funnels &&
                Array.isArray(groupResponse.data.data.funnels)
              ) {
                // The funnels will be reloaded from the group, but we've already updated local state
                // so the UI should reflect the change immediately
              }
            } catch (error) {
              console.error("Error refreshing group funnels:", error);
            } finally {
              setLoadingGroupFunnels(false);
            }
          }
        } catch (error) {
          console.error("Error updating funnel name:", error);
          // Revert the name change on error
          setFunnelGroups((prevGroups) =>
            prevGroups.map((g) => {
              if (g.id !== activeGroupId) return g;
              return {
                ...g,
                funnels: g.funnels.map((funnel) =>
                  funnel.id === funnelId
                    ? { ...funnel, name: funnelToRename.name }
                    : funnel
                ),
              };
            })
          );
        }
      }
    },
    [activeGroupId, funnelGroups, groupIdMapping, setLoadingGroupFunnels]
  );

  // Sync state with active funnel when active funnel changes
  useEffect(() => {
    const activeFunnel = getActiveFunnel();
    if (activeFunnel) {
      loadStateFromFunnel(activeFunnel);
    }
  }, [activeGroupId, funnelGroups]);

  // Save state to active funnel whenever state changes (debounced)
  // Skip saving on initial mount to avoid overwriting
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveCurrentStateToFunnel();
    }, 500); // Debounce for 500ms
    return () => clearTimeout(timer);
  }, [
    selectedSteps,
    startDate,
    endDate,
    breakdownDimension,
    rowsPerDimension,
    selectedSegments,
    selectedSegmentComparisons,
    savedCountryArrays,
    savedAppVersionArrays,
    selectedDimensionValue,
    showElapsedTime,
    preset,
    saveCurrentStateToFunnel,
  ]);

  // Export helper functions
  const exportToJSON = useCallback(() => {
    const exportData = {
      funnel: selectedSteps,
      data: funnelData,
      dateRange: { startDate, endDate },
      filters: { deviceCategory, country },
      breakdownDimension,
      selectedSegmentComparisons,
      usersFunnel: usersFunnel
        ? {
            summary: usersFunnel.summary,
            dateRange: usersFunnel.dateRange,
            dimension: usersFunnel.dimension,
            segments: usersFunnel.segments,
          }
        : null,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    selectedSteps,
    funnelData,
    startDate,
    endDate,
    deviceCategory,
    country,
    breakdownDimension,
    selectedSegmentComparisons,
    usersFunnel,
  ]);

  const exportToCSV = useCallback(() => {
    // Generate table data for export
    const tableRows = generateTableData(
      funnelData,
      breakdownDimension,
      parseInt(rowsPerDimension),
      usersFunnel,
      selectedSegmentComparisons as any
    );

    // CSV Headers
    const headers = [
      "Step Number",
      "Step Name",
      breakdownDimension && breakdownDimension !== "none"
        ? breakdownDimension === "country"
          ? "Country"
          : breakdownDimension === "deviceCategory"
          ? "Device Category"
          : breakdownDimension === "appVersion"
          ? "App Version"
          : breakdownDimension === "osVersion"
          ? "OS Version"
          : breakdownDimension === "device"
          ? "Device"
          : breakdownDimension.charAt(0).toUpperCase() +
            breakdownDimension.slice(1)
        : selectedSegmentComparisons && selectedSegmentComparisons.length > 0
        ? "Segment"
        : "Breakdown",
      "Active Users",
      "Active Users (% of Step 1)",
      "Conversion Rate (%)",
      "Completion Rate (%)",
      "Abandonments",
      "Abandonment Rate (%)",
    ];

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number): string => {
      if (typeof value === "number") {
        return value.toString();
      }
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // CSV Rows
    const csvRows = [headers.map(escapeCSV).join(",")];

    tableRows.forEach((row) => {
      const csvRow = [
        row.stepNumber,
        escapeCSV(row.stepName),
        escapeCSV(row.country),
        row.activeUsers,
        row.percentOfStep1.toFixed(2),
        row.conversionRate.toFixed(2),
        row.completionRate.toFixed(2),
        row.abandonments,
        row.abandonmentRate.toFixed(2),
      ];
      csvRows.push(csvRow.join(","));
    });

    // Add summary section
    csvRows.push("");
    csvRows.push("Summary");
    csvRows.push(`Date Range,${escapeCSV(`${startDate} to ${endDate}`)}`);
    csvRows.push(`Total Steps,${funnelData.steps.length}`);
    if (usersFunnel?.summary) {
      csvRows.push(
        `Total Users at Start,${usersFunnel.summary.totalUsersAtStart}`
      );
      csvRows.push(`Total Users at End,${usersFunnel.summary.totalUsersAtEnd}`);
      csvRows.push(
        `Overall Conversion Rate (%),${usersFunnel.summary.overallConversionRate.toFixed(
          2
        )}`
      );
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    funnelData,
    breakdownDimension,
    rowsPerDimension,
    usersFunnel,
    selectedSegmentComparisons,
    startDate,
    endDate,
  ]);

  const exportToTSV = useCallback(() => {
    // Generate table data for export
    const tableRows = generateTableData(
      funnelData,
      breakdownDimension,
      parseInt(rowsPerDimension),
      usersFunnel,
      selectedSegmentComparisons as any
    );

    // TSV Headers
    const headers = [
      "Step Number",
      "Step Name",
      breakdownDimension && breakdownDimension !== "none"
        ? breakdownDimension === "country"
          ? "Country"
          : breakdownDimension === "deviceCategory"
          ? "Device Category"
          : breakdownDimension === "appVersion"
          ? "App Version"
          : breakdownDimension === "osVersion"
          ? "OS Version"
          : breakdownDimension === "device"
          ? "Device"
          : breakdownDimension.charAt(0).toUpperCase() +
            breakdownDimension.slice(1)
        : selectedSegmentComparisons && selectedSegmentComparisons.length > 0
        ? "Segment"
        : "Breakdown",
      "Active Users",
      "Active Users (% of Step 1)",
      "Conversion Rate (%)",
      "Completion Rate (%)",
      "Abandonments",
      "Abandonment Rate (%)",
    ];

    // TSV Rows (tab-separated)
    const tsvRows = [headers.join("\t")];

    tableRows.forEach((row) => {
      const tsvRow = [
        row.stepNumber,
        row.stepName,
        row.country,
        row.activeUsers,
        row.percentOfStep1.toFixed(2),
        row.conversionRate.toFixed(2),
        row.completionRate.toFixed(2),
        row.abandonments,
        row.abandonmentRate.toFixed(2),
      ];
      tsvRows.push(tsvRow.join("\t"));
    });

    // Add summary section
    tsvRows.push("");
    tsvRows.push("Summary");
    tsvRows.push("Date Range\t" + `${startDate} to ${endDate}`);
    tsvRows.push("Total Steps\t" + funnelData.steps.length);
    if (usersFunnel?.summary) {
      tsvRows.push(
        "Total Users at Start\t" + usersFunnel.summary.totalUsersAtStart
      );
      tsvRows.push(
        "Total Users at End\t" + usersFunnel.summary.totalUsersAtEnd
      );
      tsvRows.push(
        "Overall Conversion Rate (%)\t" +
          usersFunnel.summary.overallConversionRate.toFixed(2)
      );
    }

    const tsvContent = tsvRows.join("\n");
    const blob = new Blob([tsvContent], {
      type: "text/tab-separated-values;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-export-${new Date().toISOString().split("T")[0]}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    funnelData,
    breakdownDimension,
    rowsPerDimension,
    usersFunnel,
    selectedSegmentComparisons,
    startDate,
    endDate,
  ]);

  const exportToTXT = useCallback(() => {
    // Generate table data for export
    const tableRows = generateTableData(
      funnelData,
      breakdownDimension,
      parseInt(rowsPerDimension),
      usersFunnel,
      selectedSegmentComparisons as any
    );

    const txtRows: string[] = [];
    txtRows.push("FUNNEL ANALYTICS EXPORT");
    txtRows.push("=".repeat(50));
    txtRows.push("");
    txtRows.push(`Date Range: ${startDate} to ${endDate}`);
    txtRows.push(`Total Steps: ${funnelData.steps.length}`);
    if (usersFunnel?.summary) {
      txtRows.push(
        `Total Users at Start: ${usersFunnel.summary.totalUsersAtStart}`
      );
      txtRows.push(
        `Total Users at End: ${usersFunnel.summary.totalUsersAtEnd}`
      );
      txtRows.push(
        `Overall Conversion Rate: ${usersFunnel.summary.overallConversionRate.toFixed(
          2
        )}%`
      );
    }
    txtRows.push("");
    txtRows.push("FUNNEL DATA");
    txtRows.push("-".repeat(50));

    // Table header
    const header = [
      "Step",
      breakdownDimension && breakdownDimension !== "none"
        ? breakdownDimension === "country"
          ? "Country"
          : breakdownDimension === "deviceCategory"
          ? "Device Category"
          : breakdownDimension === "appVersion"
          ? "App Version"
          : breakdownDimension === "osVersion"
          ? "OS Version"
          : breakdownDimension === "device"
          ? "Device"
          : breakdownDimension.charAt(0).toUpperCase() +
            breakdownDimension.slice(1)
        : selectedSegmentComparisons && selectedSegmentComparisons.length > 0
        ? "Segment"
        : "Breakdown",
      "Active Users",
      "% of Step 1",
      "Conv. Rate",
      "Comp. Rate",
      "Abandonments",
      "Abandon Rate",
    ];
    txtRows.push(header.join(" | "));
    txtRows.push("-".repeat(50));

    // Table rows
    tableRows.forEach((row) => {
      const txtRow = [
        `${row.stepNumber}. ${row.stepName}`,
        row.country,
        row.activeUsers.toLocaleString(),
        `${row.percentOfStep1.toFixed(2)}%`,
        `${row.conversionRate.toFixed(2)}%`,
        `${row.completionRate.toFixed(2)}%`,
        row.abandonments.toLocaleString(),
        `${row.abandonmentRate.toFixed(2)}%`,
      ];
      txtRows.push(txtRow.join(" | "));
    });

    txtRows.push("");
    txtRows.push(`Exported at: ${new Date().toLocaleString()}`);

    const txtContent = txtRows.join("\n");
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-export-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    funnelData,
    breakdownDimension,
    rowsPerDimension,
    usersFunnel,
    selectedSegmentComparisons,
    startDate,
    endDate,
  ]);

  // Save funnel handler
  const handleSaveFunnel = useCallback(async () => {
    if (!saveFunnelName.trim()) {
      return;
    }

    try {
      // Build segments array from selected segment comparisons
      const segments: Array<{ value: string[] | string; type: string }> = [];

      // Add segments from Segment Comparisons
      selectedSegmentComparisons.forEach((item) => {
        if (item.type === "segment") {
          const segment = AVAILABLE_SEGMENTS.find(
            (s) => s.id === item.segmentId
          );
          if (segment) {
            // Map segment to API format - only handle the 7 available segments
            if (item.segmentId === "all_users") {
              // Skip all_users as it's default
              return;
            } else if (item.segmentId === "direct_traffic") {
              segments.push({
                value: "Direct",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "email_sms_push") {
              segments.push({
                value: "Email, SMS, Mobile Push Notifications",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "mobile_traffic") {
              segments.push({
                value: "mobile",
                type: "deviceCategory",
              });
            } else if (item.segmentId === "organic_traffic") {
              segments.push({
                value: "Organic",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "paid_traffic") {
              segments.push({
                value: "Paid",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "referral_affiliates") {
              segments.push({
                value: "Referral",
                type: "sessionDefaultChannelGroup",
              });
            } else if (item.segmentId === "tablet_traffic") {
              segments.push({
                value: "tablet",
                type: "deviceCategory",
              });
            }
          }
        } else if (item.type === "countryGroup" && item.countryGroup) {
          // Add country group as a segment
          if (item.countryGroup.length > 0) {
            segments.push({
              value: item.countryGroup,
              type: "country",
            });
          }
        } else if (item.type === "appVersionGroup" && item.appVersionGroup) {
          // Add app version group as a segment
          if (item.appVersionGroup.length > 0) {
            segments.push({
              value: item.appVersionGroup,
              type: "appVersion",
            });
          }
        }
      });

      // Add selected dimension value as a segment if double-clicked
      if (selectedDimensionValue) {
        segments.push({
          value: selectedDimensionValue.value,
          type: selectedDimensionValue.type,
        });
      }

      // Get the groupId for the active group
      const currentGroupId = groupIdMapping[activeGroupId];

      // Find the active group
      const currentActiveGroup = funnelGroups.find(
        (g) => g.id === activeGroupId
      );

      // Check if a funnel with the same name exists in the active group
      let existingFunnelId: string | undefined;
      if (currentActiveGroup) {
        const existingFunnel = currentActiveGroup.funnels.find(
          (f) => f.name === saveFunnelName.trim()
        );
        if (existingFunnel?.savedFunnelId) {
          existingFunnelId = existingFunnel.savedFunnelId;
        }
      }

      const saveData: {
        name: string;
        groupId?: string;
        eventNames: string[];
        startDate: string;
        endDate: string;
        dimension: string | null;
        row: number;
        segments: Array<{ value: string[] | string; type: string }>;
      } = {
        name: saveFunnelName.trim(),
        ...(currentGroupId && { groupId: currentGroupId }),
        eventNames: selectedSteps,
        startDate: startDate,
        endDate: endDate,
        dimension:
          breakdownDimension &&
          breakdownDimension !== "none" &&
          breakdownDimension !== ""
            ? breakdownDimension
            : null, // Send null when "none" or empty
        row: parseInt(rowsPerDimension) || 5,
        segments: segments,
      };

      console.log("Saving funnel with data:", saveData);
      if (existingFunnelId) {
        console.log(
          `Funnel with name "${saveFunnelName.trim()}" already exists, will update`
        );
      }

      // Call API to save the funnel (API will handle create vs update based on name)
      const response = await saveGA4UsersFunnel(saveData);

      console.log("Funnel save API response:", response);

      // Show success notification from API response
      const successMessage =
        response?.data?.message ||
        `Funnel "${saveFunnelName.trim()}" saved successfully`;
      toastSuccess(successMessage);

      // Reset form and close dialog
      setSaveFunnelName("");
      setIsSaveDialogOpen(false);

      // If we're in a group, reload the group funnels to show the newly saved/updated funnel
      if (currentGroupId && currentActiveGroup) {
        try {
          setLoadingGroupFunnels(true);
          const groupResponse = await getGroupFunnels(currentGroupId);
          console.log("Refreshed Group Funnels API Response:", groupResponse);

          if (
            groupResponse?.data?.status &&
            groupResponse?.data?.data?.funnels &&
            Array.isArray(groupResponse.data.data.funnels)
          ) {
            const groupData = groupResponse.data.data.group;
            const funnelsData = groupResponse.data.data.funnels;

            // Map API funnels to FunnelItem objects (similar to handleLoadFunnel)
            const mappedFunnels: FunnelItem[] = funnelsData.map(
              (funnelData: any, index: number) => {
                const config = funnelData.configuration || {};

                // Restore segments for this funnel
                let restoredComparisons: SegmentComparisonItem[] = [];
                let restoredCountryArrays: string[][] = [];
                let restoredAppVersionArrays: string[][] = [];

                if (config.segments && Array.isArray(config.segments)) {
                  config.segments.forEach(
                    (segment: { value: string | string[]; type: string }) => {
                      if (Array.isArray(segment.value)) {
                        if (segment.type === "country") {
                          restoredCountryArrays.push([...segment.value]);
                          const countryLabels = segment.value
                            .map(
                              (val) =>
                                countries.find((c) => c.value === val)?.label ||
                                val
                            )
                            .join(", ");
                          restoredComparisons.push({
                            id: `country-group-${restoredCountryArrays.length}`,
                            type: "countryGroup",
                            countryGroup: [...segment.value],
                            label: `Countries: ${countryLabels}`,
                          });
                        } else if (segment.type === "appVersion") {
                          restoredAppVersionArrays.push([...segment.value]);
                          const versionLabels = segment.value.join(", ");
                          restoredComparisons.push({
                            id: `app-version-group-${restoredAppVersionArrays.length}`,
                            type: "appVersionGroup",
                            appVersionGroup: [...segment.value],
                            label: `App Versions: ${versionLabels}`,
                          });
                        }
                      } else {
                        // Single value segments
                        const segmentId = AVAILABLE_SEGMENTS.find((s) => {
                          if (segment.type === "sessionDefaultChannelGroup") {
                            if (segment.value === "Direct")
                              return s.id === "direct_traffic";
                            if (segment.value === "Organic")
                              return s.id === "organic_traffic";
                            if (segment.value === "Paid")
                              return s.id === "paid_traffic";
                            if (segment.value === "Referral")
                              return s.id === "referral_affiliates";
                            if (
                              segment.value ===
                              "Email, SMS, Mobile Push Notifications"
                            )
                              return s.id === "email_sms_push";
                          } else if (segment.type === "deviceCategory") {
                            if (segment.value === "mobile")
                              return s.id === "mobile_traffic";
                            if (segment.value === "tablet")
                              return s.id === "tablet_traffic";
                          }
                          return false;
                        })?.id;

                        if (segmentId) {
                          restoredComparisons.push({
                            id: `segment-${segmentId}`,
                            type: "segment",
                            segmentId: segmentId,
                            label:
                              AVAILABLE_SEGMENTS.find((s) => s.id === segmentId)
                                ?.name || segmentId,
                          });
                        }
                      }
                    }
                  );
                }

                return {
                  id: `funnel-${funnelData._id || funnelData.id || index}`,
                  name: funnelData.name || `Funnel ${index + 1}`,
                  selectedSteps: config.eventNames || [],
                  startDate: config.startDate || defaultDateRange.startDate,
                  endDate: config.endDate || defaultDateRange.endDate,
                  breakdownDimension: config.dimension || "",
                  rowsPerDimension: String(config.row || 5),
                  selectedSegments: AVAILABLE_SEGMENTS.map((s) => s.id),
                  selectedSegmentComparisons: restoredComparisons,
                  savedCountryArrays: restoredCountryArrays,
                  savedAppVersionArrays: restoredAppVersionArrays,
                  selectedDimensionValue: null,
                  showElapsedTime: config.elapsedTime || false,
                  preset: "last2",
                  savedFunnelId: funnelData._id || funnelData.id,
                };
              }
            );

            // Update the active group with refreshed funnels
            setFunnelGroups((prevGroups) =>
              prevGroups.map((group) =>
                group.id === activeGroupId
                  ? {
                      ...group,
                      funnels: mappedFunnels,
                      // Keep the same active funnel if it still exists, otherwise use first
                      activeFunnelId: mappedFunnels.find(
                        (f) => f.id === group.activeFunnelId
                      )
                        ? group.activeFunnelId
                        : mappedFunnels[0]?.id || group.activeFunnelId,
                    }
                  : group
              )
            );
          }
        } catch (error) {
          console.error("Error refreshing group funnels:", error);
        } finally {
          setLoadingGroupFunnels(false);
        }
      }

      // Refresh saved funnels list to show the newly saved funnel
      await fetchSavedFunnels();

      // Show success message
      console.log("Funnel saved successfully");
    } catch (error: any) {
      console.error("Error saving funnel:", error);
      // Show error notification
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save funnel. Please try again.";
      toastError(errorMessage);
      // Keep dialog open on error so user can retry
    }
  }, [
    saveFunnelName,
    selectedSteps,
    startDate,
    endDate,
    breakdownDimension,
    rowsPerDimension,
    selectedSegmentComparisons,
    selectedDimensionValue,
    fetchSavedFunnels,
    activeGroupId,
    funnelGroups,
    groupIdMapping,
    countries,
    getGroupFunnels,
  ]);

  // Create group handler
  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) {
      return;
    }

    try {
      setIsCreatingGroup(true);
      console.log("Creating funnel group with name:", groupName.trim());

      // Call API to create the group
      const response = await createFunnelGroup({ name: groupName.trim() });

      console.log("Funnel group creation API response:", response);

      // Get the created group ID from response
      const createdGroupId =
        response?.data?.data?.group?._id || response?.data?.data?._id;
      const createdGroupName = groupName.trim();

      // Show success notification from API response
      const successMessage =
        response?.data?.message ||
        `Group "${createdGroupName}" created successfully`;
      toastSuccess(successMessage);

      // Reset form and close dialog
      setGroupName("");
      setIsCreateGroupDialogOpen(false);

      // Refresh saved funnels list to show the newly created group
      await fetchSavedFunnels();

      // If we got a group ID, automatically load and select the new group
      if (createdGroupId) {
        // Create a temporary group object to load
        const newGroup: SavedFunnel = {
          id: createdGroupId,
          name: createdGroupName,
          groupId: createdGroupId,
          steps: [],
          createdAt: new Date().toISOString().split("T")[0],
        };

        // Load the group (this will set the selected group name inside handleLoadFunnel)
        await handleLoadFunnel(newGroup);
      }

      // Show success message
      console.log("Funnel group created successfully");
    } catch (error: any) {
      console.error("Error creating funnel group:", error);
      // Show error notification
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create group. Please try again.";
      toastError(errorMessage);
      // Keep dialog open on error so user can retry
    } finally {
      setIsCreatingGroup(false);
    }
  }, [groupName, fetchSavedFunnels, savedFunnels, handleLoadFunnel]);

  // Combined loading state - show loader when any data is being fetched
  const isLoading = useMemo(() => {
    return (
      usersFunnelLoading ||
      eventNamesLoading ||
      countriesLoading ||
      appVersionsLoading
    );
  }, [
    usersFunnelLoading,
    eventNamesLoading,
    countriesLoading,
    appVersionsLoading,
  ]);

  // Close dropdowns when loading starts
  useEffect(() => {
    if (isLoading) {
      setIsCountryDropdownOpen(false);
      setIsAppVersionDropdownOpen(false);
    }
  }, [isLoading]);

  const activeGroup = funnelGroups.find((g) => g.id === activeGroupId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Funnel Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Build and analyze custom conversion funnels from your events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={usersFunnelLoading || eventNamesLoading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 mr-2",
                (usersFunnelLoading || eventNamesLoading) && "animate-spin"
              )}
            />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToTSV}>
                <Download className="h-4 w-4 mr-2" />
                Export as TSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToTXT}>
                <Download className="h-4 w-4 mr-2" />
                Export as TXT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters Bar - Two Separate Cards */}
      <div className="flex gap-4 flex-shrink-0 mb-3">
        {/* Left Card - Date Range (matches left sidebar width: w-80) */}
        <Card
          className={cn(
            "flex-shrink-0",
            preset === "custom" ? "w-auto min-w-[600px]" : "w-80"
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-sm font-medium whitespace-nowrap">
                Date Range:
              </Label>
              <Select
                value={preset}
                onValueChange={(v) => {
                  setPreset(v);
                  if (v !== "custom") {
                    const r = getDateRangeForPreset(v);
                    if (r.startDate && r.endDate) {
                      setStartDate(r.startDate);
                      setEndDate(r.endDate);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last2">Last 2 days</SelectItem>
                  <SelectItem value="last7">Last 7 days</SelectItem>
                  <SelectItem value="last28">Last 28 days</SelectItem>
                  <SelectItem value="last30">Last 30 days</SelectItem>
                  <SelectItem value="last90">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {preset === "custom" && (
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={(date) => {
                    setStartDate(date);
                    setPreset("custom");
                    // If new start date is after end date, clear end date
                    if (date && endDate && new Date(date) > new Date(endDate)) {
                      setEndDate("");
                    }
                  }}
                  onEndDateChange={(date) => {
                    setEndDate(date);
                    setPreset("custom");
                    // If new end date is before start date, clear start date
                    if (
                      date &&
                      startDate &&
                      new Date(date) < new Date(startDate)
                    ) {
                      setStartDate("");
                    }
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Card - Funnel Tabs and Saved Funnels (matches right section width) */}
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardContent className="p-3 overflow-hidden">
            <div className="flex items-center gap-4 w-full min-w-0 overflow-hidden max-w-full">
              {/* Funnel Tabs - Multiple Funnels in Group with Scrolling */}
              {activeGroup && (
                <div className="flex-1 min-w-0 overflow-hidden relative funnel-tabs-wrapper">
                  <div className="funnel-tabs-scroll flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 w-full max-w-full">
                    {activeGroup.funnels.map((funnel) => {
                      const isActive = funnel.id === activeGroup.activeFunnelId;
                      const isRenaming = isRenamingFunnel === funnel.id;
                      const isHovered = hoveredFunnelId === funnel.id;

                      return (
                        <div
                          key={funnel.id}
                          className={cn(
                            "group flex items-center gap-1 px-3 py-1.5 rounded-md border cursor-pointer flex-shrink-0 overflow-hidden",
                            "transition-[width,background-color,border-color] duration-200 ease-in-out",
                            isActive || isHovered ? "w-auto" : "w-[40px]",
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border"
                          )}
                          onMouseEnter={() => {
                            // Clear any pending collapse timeout
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                              hoverTimeoutRef.current = null;
                            }
                            setHoveredFunnelId(funnel.id);
                          }}
                          onMouseLeave={() => {
                            // Add delay before collapsing to allow smooth transition between tabs
                            hoverTimeoutRef.current = setTimeout(() => {
                              setHoveredFunnelId(null);
                              hoverTimeoutRef.current = null;
                            }, 200);
                          }}
                          onClick={() =>
                            !isRenaming && handleSwitchFunnel(funnel.id)
                          }
                        >
                          {isRenaming ? (
                            <Input
                              value={funnelNameInput}
                              onChange={(e) =>
                                setFunnelNameInput(e.target.value)
                              }
                              onBlur={() => {
                                if (funnelNameInput.trim()) {
                                  handleRenameFunnel(
                                    funnel.id,
                                    funnelNameInput
                                  );
                                } else {
                                  setIsRenamingFunnel(null);
                                  setFunnelNameInput("");
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (funnelNameInput.trim()) {
                                    handleRenameFunnel(
                                      funnel.id,
                                      funnelNameInput
                                    );
                                  }
                                } else if (e.key === "Escape") {
                                  setIsRenamingFunnel(null);
                                  setFunnelNameInput("");
                                }
                              }}
                              autoFocus
                              className="h-6 w-24 text-xs bg-background text-foreground border-border"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <>
                              <BarChart3 className="h-4 w-4 flex-shrink-0" />
                              <span
                                className={cn(
                                  "text-sm font-medium whitespace-nowrap transition-opacity ml-1",
                                  isActive
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
                                )}
                              >
                                {funnel.name}
                              </span>
                              {activeGroup.funnels.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                                    isActive && "opacity-100"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFunnel(funnel.id);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                              {isActive && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 opacity-100 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFunnelNameInput(funnel.name);
                                    setIsRenamingFunnel(funnel.id);
                                  }}
                                >
                                  <Settings2 className="h-3 w-3" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                    {/* Add New Funnel Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 h-8 px-3"
                      onClick={handleAddFunnel}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Funnel
                    </Button>
                  </div>
                </div>
              )}

              {/* Saved Funnels - Always Visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 whitespace-nowrap min-w-[140px]"
                  >
                    <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">
                      {selectedGroupName || "Saved Groups"}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 max-h-[400px] overflow-y-auto"
                >
                  {savedFunnelsLoading ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Loading saved Groups...
                    </div>
                  ) : savedFunnels.length === 0 ? (
                    <div className="p-4 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        No saved Groups
                      </p>
                    </div>
                  ) : (
                    savedFunnels.map((funnel) => {
                      const isSelected = selectedGroupName === funnel.name;
                      return (
                        <DropdownMenuItem
                          key={funnel.id}
                          className={cn(
                            "flex items-center justify-between",
                            isSelected && "bg-accent"
                          )}
                          onClick={() => handleLoadFunnel(funnel)}
                          disabled={loadingGroupFunnels}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                            <div>
                              <p className="font-medium">{funnel.name}</p>
                            </div>
                          </div>
                          {savedFunnels.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleDeleteClick(funnel.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </DropdownMenuItem>
                      );
                    })
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsCreateGroupDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Sidebar - Variables Panel (like Google Analytics) */}
        <div className="w-80 flex-shrink-0 flex flex-col min-h-0 relative">
          <div className="flex flex-col flex-1 min-h-0 relative border rounded-lg overflow-hidden bg-background">
            <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto p-3">
              {/* Segments Section */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Segments
                    </CardTitle>
                    {/* <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsAddSegmentOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button> */}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 space-y-1 max-h-[180px] overflow-y-auto">
                    {selectedSegments.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Users className="h-5 w-5 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No segments added</p>
                        <p className="text-xs opacity-70">
                          Click + to add segments
                        </p>
                      </div>
                    ) : (
                      selectedSegments.map((segmentId, index) => {
                        const segment = AVAILABLE_SEGMENTS.find(
                          (s) => s.id === segmentId
                        );
                        const isDragging = draggedSegmentIndex === index;
                        const isDropTarget = dropTargetSegmentIndex === index;
                        return (
                          <div
                            key={segmentId}
                            draggable
                            onDragStart={(e) =>
                              handleSegmentDragStart(e, index, segmentId)
                            }
                            onDragOver={(e) => handleSegmentDragOver(e, index)}
                            onDragLeave={handleSegmentDragLeave}
                            onDrop={(e) => handleSegmentDrop(e, index)}
                            onDragEnd={handleSegmentDragEnd}
                            onDoubleClick={() => {
                              handleAddSegmentComparison(segmentId);
                            }}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded border bg-background hover:bg-muted/50 group transition-all duration-150 select-none cursor-pointer",
                              isDragging &&
                                "opacity-50 border-dashed border-primary/50",
                              isDropTarget &&
                                !isDragging &&
                                "bg-primary/5 border-primary"
                            )}
                            title="Double-click to add to Segment Comparisons"
                          >
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <span className="text-sm truncate flex-1">
                              {segment?.name || segmentId}
                            </span>
                            <Users className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                            {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          onClick={() => handleRemoveSegment(segmentId)}
                        >
                          <X className="h-3 w-3" />
                        </Button> */}
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Segments By Country Section */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Segments By Country
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {selectedCountries.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={handleClearCountries}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 space-y-2">
                    {/* Country Dropdown */}
                    <Popover
                      open={isCountryDropdownOpen}
                      onOpenChange={setIsCountryDropdownOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal"
                        >
                          <span className="text-sm text-muted-foreground">
                            {selectedCountries.length > 0
                              ? `${selectedCountries.length} countr${
                                  selectedCountries.length === 1 ? "y" : "ies"
                                } selected`
                              : "Select countries"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 z-[40]" align="start">
                        <div className="flex flex-col">
                          {/* Search Input */}
                          <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                              placeholder="Search countries..."
                              value={countrySearchQuery}
                              onChange={(e) =>
                                setCountrySearchQuery(e.target.value)
                              }
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                            />
                          </div>
                          {/* Save Button */}
                          {selectedCountries.length > 0 && (
                            <div className="px-3 py-2 border-b">
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={() => {
                                  handleSaveCountries();
                                  setIsCountryDropdownOpen(false);
                                }}
                              >
                                <Save className="h-3 w-3 mr-2" />
                                Save ({selectedCountries.length} selected)
                              </Button>
                            </div>
                          )}
                          {/* Countries List */}
                          <ScrollArea className="h-[300px]">
                            {countriesLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2 text-sm text-muted-foreground">
                                  Loading countries...
                                </span>
                              </div>
                            ) : filteredCountries.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No countries found
                              </div>
                            ) : (
                              <div className="p-1">
                                {filteredCountries.map((country) => {
                                  const isSelected = selectedCountries.includes(
                                    country.value
                                  );
                                  return (
                                    <div
                                      key={country.value}
                                      className={cn(
                                        "flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors",
                                        isSelected && "bg-muted"
                                      )}
                                      onClick={() => {
                                        if (isSelected) {
                                          handleRemoveCountry(country.value);
                                        } else {
                                          handleAddCountry(country.value);
                                        }
                                      }}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            handleAddCountry(country.value);
                                          } else {
                                            handleRemoveCountry(country.value);
                                          }
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                          {country.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {country.userCount.toLocaleString()}{" "}
                                          users
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Saved Country Arrays List */}
                    {savedCountryArrays.length > 0 && (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto">
                        {savedCountryArrays.map((countryArray, arrayIndex) => (
                          <div
                            key={arrayIndex}
                            className="p-2 rounded border bg-muted/30 space-y-1"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Group {arrayIndex + 1} ({countryArray.length}{" "}
                                {countryArray.length === 1
                                  ? "country"
                                  : "countries"}
                                )
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {countryArray.map((countryValue) => {
                                const country = countries.find(
                                  (c) => c.value === countryValue
                                );
                                return (
                                  <Badge
                                    key={countryValue}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {country?.label || countryValue}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Segments By App Version Section */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Segments By App Version
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {selectedAppVersions.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={handleClearAppVersions}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 space-y-2">
                    {/* App Version Dropdown */}
                    <Popover
                      open={isAppVersionDropdownOpen}
                      onOpenChange={setIsAppVersionDropdownOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal"
                        >
                          <span className="text-sm text-muted-foreground">
                            {selectedAppVersions.length > 0
                              ? `${selectedAppVersions.length} version${
                                  selectedAppVersions.length === 1 ? "" : "s"
                                } selected`
                              : "Select app versions"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 z-[40]" align="start">
                        <div className="flex flex-col">
                          {/* Search Input */}
                          <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                              placeholder="Search app versions..."
                              value={appVersionSearchQuery}
                              onChange={(e) =>
                                setAppVersionSearchQuery(e.target.value)
                              }
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                            />
                          </div>
                          {/* Save Button */}
                          {selectedAppVersions.length > 0 && (
                            <div className="px-3 py-2 border-b">
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={() => {
                                  handleSaveAppVersions();
                                  setIsAppVersionDropdownOpen(false);
                                }}
                              >
                                <Save className="h-3 w-3 mr-2" />
                                Save ({selectedAppVersions.length} selected)
                              </Button>
                            </div>
                          )}
                          {/* App Versions List */}
                          <ScrollArea className="h-[300px]">
                            {appVersionsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2 text-sm text-muted-foreground">
                                  Loading app versions...
                                </span>
                              </div>
                            ) : filteredAppVersions.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No app versions found
                              </div>
                            ) : (
                              <div className="p-1">
                                {filteredAppVersions.map((version) => {
                                  const isSelected =
                                    selectedAppVersions.includes(version.value);
                                  return (
                                    <div
                                      key={version.value}
                                      className={cn(
                                        "flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors",
                                        isSelected && "bg-muted"
                                      )}
                                      onClick={() => {
                                        if (isSelected) {
                                          handleRemoveAppVersion(version.value);
                                        } else {
                                          handleAddAppVersion(version.value);
                                        }
                                      }}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            handleAddAppVersion(version.value);
                                          } else {
                                            handleRemoveAppVersion(
                                              version.value
                                            );
                                          }
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                          {version.label}
                                        </div>
                                        {version.userCount !== undefined &&
                                          version.userCount > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                              {version.userCount.toLocaleString()}{" "}
                                              users
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Saved App Version Arrays List */}
                    {savedAppVersionArrays.length > 0 && (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto">
                        {savedAppVersionArrays.map(
                          (versionArray, arrayIndex) => (
                            <div
                              key={arrayIndex}
                              className="p-2 rounded border bg-muted/30 space-y-1"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Group {arrayIndex + 1} ({versionArray.length}{" "}
                                  {versionArray.length === 1
                                    ? "version"
                                    : "versions"}
                                  )
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {versionArray.map((appVersionValue) => {
                                  const version = appVersions.find(
                                    (v) => v.value === appVersionValue
                                  );
                                  return (
                                    <Badge
                                      key={appVersionValue}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {version?.label || appVersionValue}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Segment Comparisons Section */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Segment Comparisons
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {selectedSegmentComparisons.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={handleClearSegmentComparisons}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div
                    className={cn(
                      "p-3 space-y-1 min-h-[60px] border-2 border-dashed rounded-md transition-colors",
                      isDraggingToComparisons
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                    onDragOver={handleComparisonsDragOver}
                    onDragLeave={handleComparisonsDragLeave}
                    onDrop={handleComparisonsDrop}
                  >
                    {selectedSegmentComparisons.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                        <Plus className="h-4 w-4" />
                        <span className="text-xs">Drop or select segment</span>
                      </div>
                    ) : (
                      selectedSegmentComparisons.map((item, index) => {
                        const isDragging =
                          draggedSegmentComparisonIndex === index;
                        const isDropTarget =
                          dropTargetSegmentComparisonIndex === index;
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) =>
                              handleSegmentComparisonDragStart(e, index)
                            }
                            onDragOver={(e) =>
                              handleSegmentComparisonDragOver(e, index)
                            }
                            onDragLeave={handleSegmentComparisonDragLeave}
                            onDrop={(e) =>
                              handleSegmentComparisonDrop(e, index)
                            }
                            onDragEnd={handleSegmentComparisonDragEnd}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded border bg-background hover:bg-muted/50 group transition-all duration-150 select-none",
                              isDragging &&
                                "opacity-50 border-dashed border-primary/50",
                              isDropTarget &&
                                !isDragging &&
                                "bg-primary/5 border-primary"
                            )}
                          >
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm truncate flex-1 cursor-default">
                                  {item.label}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{item.label}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Users className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              onClick={() =>
                                handleRemoveSegmentComparison(item.id)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Funnel Steps Section */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Funnel Steps
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {selectedSteps.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={handleClearAll}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 space-y-1 max-h-[200px] overflow-y-auto">
                    {selectedSteps.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Plus className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No steps added yet</p>
                        <p className="text-xs opacity-70">
                          Click below to add events
                        </p>
                      </div>
                    ) : (
                      selectedSteps.map((eventName, index) => {
                        const event = events.find(
                          (e) => e.eventName === eventName
                        );
                        const isDragging = draggedStepIndex === index;
                        const isDropTarget = dropTargetStepIndex === index;
                        return (
                          <div
                            key={`${eventName}-${index}`}
                            draggable
                            onDragStart={(e) => handleStepDragStart(e, index)}
                            onDragOver={(e) => handleStepDragOver(e, index)}
                            onDragLeave={handleStepDragLeave}
                            onDrop={(e) => handleStepDrop(e, index)}
                            onDragEnd={handleStepDragEnd}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded border bg-background hover:bg-muted/50 group transition-all duration-150 select-none",
                              isDragging &&
                                "opacity-50 border-dashed border-primary/50",
                              isDropTarget &&
                                !isDragging &&
                                "bg-primary/5 border-primary"
                            )}
                          >
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-sm truncate flex-1">
                              {event?.displayName ||
                                eventName.replace(/_/g, " ")}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              onClick={() => handleRemoveStep(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
                <div className="p-3 border-t flex-shrink-0">
                  <Button
                    variant="outline"
                    className="w-full h-8 text-xs"
                    onClick={() => setIsAddEventOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Step
                  </Button>
                </div>
              </Card>

              {/* Dimensions Section */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Dimensions
                    </CardTitle>
                    {/* <div className="flex items-center gap-1">
                  {selectedDimensions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleClearDimensions}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div> */}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-3 space-y-1 max-h-[180px] overflow-y-auto">
                    {selectedDimensions.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Filter className="h-5 w-5 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No dimensions added yet</p>
                        <p className="text-xs opacity-70">
                          Click below to add dimensions
                        </p>
                      </div>
                    ) : (
                      selectedDimensions.map((dimensionId, index) => {
                        const dimension = availableDimensions.find(
                          (d) => d.id === dimensionId
                        );
                        const isDragging = draggedDimensionIndex === index;
                        const isDropTarget = dropTargetDimensionIndex === index;
                        return (
                          <div
                            key={`${dimensionId}-${index}`}
                            draggable
                            onDragStart={(e) =>
                              handleDimensionDragStart(e, index)
                            }
                            onDragOver={(e) =>
                              handleDimensionDragOver(e, index)
                            }
                            onDragLeave={handleDimensionDragLeave}
                            onDrop={(e) => handleDimensionDrop(e, index)}
                            onDragEnd={handleDimensionDragEnd}
                            onDoubleClick={() => {
                              setBreakdownDimension(dimensionId);
                              // Clear selected dimension value when breakdown dimension changes
                              setSelectedDimensionValue(null);
                            }}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded border bg-background hover:bg-muted/50 group transition-all duration-150 select-none cursor-pointer",
                              isDragging &&
                                "opacity-50 border-dashed border-primary/50",
                              isDropTarget &&
                                !isDragging &&
                                "bg-primary/5 border-primary"
                            )}
                            title="Double-click to select in Breakdown"
                          >
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <span className="text-sm truncate flex-1">
                              {dimension?.name || dimensionId}
                            </span>
                            {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          onClick={() => handleRemoveDimension(dimensionId)}
                        >
                          <X className="h-3 w-3" />
                        </Button> */}
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
                {/* <div className="p-3 border-t flex-shrink-0">
              <Button
                variant="outline"
                className="w-full h-8 text-xs"
                onClick={() => setIsAddDimensionOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Dimension
              </Button>
            </div> */}
              </Card>

              {/* Breakdown Section */}
              <Card className="flex-shrink-0">
                <CardContent className="p-3 space-y-3">
                  {/* Breakdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Breakdown
                    </label>
                    <Select
                      value={breakdownDimension}
                      onValueChange={(value) => {
                        setBreakdownDimension(value);
                        // Clear selected dimension value when breakdown dimension changes
                        setSelectedDimensionValue(null);
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          <SelectValue placeholder="Select dimension" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {availableDimensions.map((dim) => (
                          <SelectItem key={dim.id} value={dim.id}>
                            {dim.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rows Per Dimension */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rows Per Dimension
                    </label>
                    <Select
                      value={rowsPerDimension}
                      onValueChange={setRowsPerDimension}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Elapsed Time */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Show Elapsed Time
                    </label>
                    <Switch
                      checked={showElapsedTime}
                      onCheckedChange={setShowElapsedTime}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Panel - Funnel Visualization & Table */}
        <div className="flex-1 pr-2 flex flex-col min-h-0 relative">
          <div className="flex flex-col flex-1 min-h-0 relative border rounded-lg overflow-hidden bg-background">
            {/* Loader Overlay - Only for Right Panel - Covers entire section including table */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      Loading funnel data...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please wait while we fetch the latest analytics
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div
              className={cn(
                "flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto p-3",
                isLoading && "pointer-events-none opacity-50"
              )}
            >
              {/* Funnel Chart Card */}
              <Card className="flex-shrink-0">
                <CardHeader className="border-b py-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Funnel Visualization
                    </CardTitle>
                    <Badge variant="outline">
                      {funnelData.steps.length} step
                      {funnelData.steps.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  {usersFunnelLoading || eventNamesLoading ? (
                    <div className="flex items-center justify-center h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <FunnelVisualization
                      data={funnelData}
                      usersFunnel={usersFunnel}
                      selectedSegmentComparisons={selectedSegmentComparisons}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Funnel Data Table */}
              {funnelData.steps.length > 0 && (
                <Card className="flex-shrink-0">
                  <CardHeader className="border-b py-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        Funnel Data Breakdown
                        {breakdownDimension &&
                          breakdownDimension !== "none" && (
                            <Badge variant="secondary" className="text-xs">
                              by{" "}
                              {availableDimensions.find(
                                (d) => d.id === breakdownDimension
                              )?.name || breakdownDimension}
                            </Badge>
                          )}
                        {selectedDimensionValue && (
                          <Badge variant="default" className="text-xs">
                            Filtered: {selectedDimensionValue.value}
                          </Badge>
                        )}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {breakdownDimension && breakdownDimension !== "none"
                          ? `Showing ${rowsPerDimension} rows per dimension`
                          : "Select breakdown dimension to see detailed data"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <FunnelTable
                      data={funnelData}
                      breakdownDimension={breakdownDimension}
                      rowsPerDimension={parseInt(rowsPerDimension)}
                      onDimensionValueSelect={(value, type) => {
                        setSelectedDimensionValue({ value, type });
                      }}
                      selectedDimensionValue={selectedDimensionValue}
                      usersFunnel={usersFunnel}
                      selectedSegmentComparisons={selectedSegmentComparisons}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Search Modal */}
      <EventSearchModal
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        events={events}
        selectedSteps={selectedSteps}
        onAddEvent={(eventName) => {
          handleAddEvent(eventName);
          // Don't close the modal to allow adding multiple events
        }}
        onRemoveEvent={(eventName) => {
          handleRemoveEvent(eventName);
        }}
        loading={eventNamesLoading}
      />

      {/* Dimension Search Modal */}
      <DimensionSearchModal
        open={isAddDimensionOpen}
        onOpenChange={setIsAddDimensionOpen}
        availableDimensions={availableDimensions}
        selectedDimensions={selectedDimensions}
        onAddDimension={(dimensionId) => {
          handleAddDimension(dimensionId);
          // Don't close the modal to allow adding multiple dimensions
        }}
        onRemoveDimension={(dimensionId) => {
          handleRemoveDimension(dimensionId);
        }}
      />

      {/* Segment Selection Modal */}
      <Dialog open={isAddSegmentOpen} onOpenChange={setIsAddSegmentOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DialogTitle className="text-xl">Add a new segment</DialogTitle>
                <span className="text-sm text-muted-foreground">
                  {selectedSegments.length} of {AVAILABLE_SEGMENTS.length}{" "}
                  selected
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex items-center gap-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={segmentSearchQuery}
                onChange={(e) => setSegmentSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">Create a new segment</Button>
            <Button
              onClick={() => setIsAddSegmentOpen(false)}
              className="bg-primary"
            >
              Confirm
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-[400px]">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="w-12 py-3 px-4"></th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Segment name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Conditions
                    </th>
                    <th className="w-12 py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSegments.map((segment) => {
                    const isSelected = selectedSegments.includes(segment.id);
                    return (
                      <tr
                        key={segment.id}
                        className={cn(
                          "border-b hover:bg-muted/30 transition-colors cursor-pointer",
                          isSelected && "bg-primary/5"
                        )}
                        onClick={() => handleToggleSegment(segment.id)}
                      >
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleToggleSegment(segment.id)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {segment.name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {segment.description}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs max-w-[250px] truncate">
                          {segment.conditions || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Items per page:</span>
              <Select defaultValue="25">
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span>
              1 – {filteredSegments.length} of {AVAILABLE_SEGMENTS.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Funnel Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Funnel</DialogTitle>
            <DialogDescription>
              Save your current funnel configuration for later use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Funnel Name</Label>
              <Input
                placeholder="Enter funnel name..."
                value={saveFunnelName}
                onChange={(e) => setSaveFunnelName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Steps ({selectedSteps.length})</Label>
              <div className="flex flex-wrap gap-1">
                {selectedSteps.map((step, index) => (
                  <Badge key={index} variant="secondary">
                    {index + 1}. {step.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFunnel}
              disabled={!saveFunnelName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Funnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog
        open={isCreateGroupDialogOpen}
        onOpenChange={setIsCreateGroupDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create First Group</DialogTitle>
            <DialogDescription>
              Create a new funnel group to organize your funnels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    groupName.trim() &&
                    !isCreatingGroup
                  ) {
                    handleCreateGroup();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateGroupDialogOpen(false);
                setGroupName("");
              }}
              disabled={isCreatingGroup}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || isCreatingGroup}
            >
              {isCreatingGroup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog
        open={!!deleteGroupId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteGroupId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              group "
              {savedFunnels.find((f) => f.id === deleteGroupId)?.name ||
                "this group"}
              ".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingGroup}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSavedFunnel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingGroup}
            >
              {isDeletingGroup ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Funnel Confirmation Dialog */}
      <AlertDialog
        open={!!deleteFunnelId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteFunnelId(null);
            setIsDeletingFunnel(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this funnel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              funnel "
              {funnelGroups
                .find((g) => g.id === activeGroupId)
                ?.funnels.find((f) => f.id === deleteFunnelId)?.name ||
                "this funnel"}
              ".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingFunnel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFunnel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingFunnel}
            >
              {isDeletingFunnel ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FunnelAnalytics;
