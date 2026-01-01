import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
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
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Globe,
  AlertTriangle,
  Share2,
  Save,
  TrendingDown,
  Smartphone,
  Monitor,
  Upload,
  Download,
  Eye,
  Bell,
  Star,
  Heart,
  MessageSquare,
  Shield,
  Wallet,
  CreditCard,
  RefreshCw,
  Flame,
  Award,
  Crown,
  Timer,
  BarChart2,
  PieChart,
  LineChart,
  TrendingUpIcon,
  Package,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  MousePointer,
  Fingerprint,
  UserPlus,
  UserMinus,
  Repeat,
  Gift,
  Percent,
  Hash,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  Info,
  Settings,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Image,
  Video,
  Music,
  FileText,
  Layers,
  Grid,
  List,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Link,
  Send,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Headphones,
  Camera,
  Film,
  Aperture,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Compass,
  Navigation,
  Map,
  Flag,
  Bookmark,
  Tag,
  Briefcase,
  ShoppingCart,
  ShoppingBag,
  CreditCard as CardIcon,
  Receipt,
  PiggyBank,
  Banknote,
  Coins,
  CircleDollarSign,
  TrendingUp as TrendIcon,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Move,
  Crosshair,
  MousePointer2,
  Hand,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Coffee,
  Utensils,
  Home,
  Building,
  Store,
  Factory,
  Warehouse,
  Car,
  Truck,
  Plane,
  Train,
  Bus,
  Bike,
  Footprints,
  Accessibility,
  Baby,
  PersonStanding,
  Cat,
  Dog,
  Fish,
  Bird,
  Bug,
  Leaf,
  TreePine,
  Flower2,
  Mountain,
  Waves,
  Anchor,
  Rocket,
  Satellite,
  Radio,
  Tv,
  Monitor as ScreenIcon,
  Laptop,
  Tablet,
  Watch,
  Gamepad2,
  Joystick,
  Puzzle,
  Dices,
  Trophy,
  Medal,
  Target as TargetIcon,
  Swords,
  Wand2,
  Palette,
  PenTool,
  Brush,
  Scissors,
  Ruler,
  Wrench,
  Hammer,
  Key,
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  AlertCircle,
  AlertOctagon,
  HelpCircle,
  InfoIcon,
  MessageCircle,
  MessagesSquare,
  AtSign,
  Asterisk,
  Command,
  Option,
  Delete,
  CornerDownLeft,
  CornerUpRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getDashboardStatsThunk,
  getLiveStatusThunk,
  getGA4UserDemographicsThunk,
  getGA4AppVersionsThunk,
  getGA4RevenueTrendThunk,
  getGA4EngagementTimeThunk,
  getGA4UserActivityOverTimeThunk,
  getGA4UserRetentionThunk,
} from "@/store/dashboard/thunk";
import { getDateRangeForPreset } from "@/helpers/dateRange.helper";
import { fetchPlatformUsers } from "@/helpers/api_helper";
import {
  getFeaturePerformance,
  getDeviceDistribution,
} from "@/helpers/backend_helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// amCharts 5 imports
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface UserActivityPoint {
  date: string;
  activeUsers: number;
}

const RevenueTrendChart: React.FC<{
  points?: RevenuePoint[];
  startDate?: string;
  endDate?: string;
}> = ({ points = [], startDate, endDate }) => {
  const series = [
    {
      name: "Revenue",
      data: (points || []).map((p) => [
        new Date(p.date).getTime(),
        p.revenue || 0,
      ]),
    },
  ];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(v);

  // x-axis bounds: derived from passed points or left empty (auto) when not available
  const dataDates = (points || []).map((p) => new Date(p.date).getTime());
  const dataMin = dataDates.length ? Math.min(...dataDates) : undefined;
  const dataMax = dataDates.length ? Math.max(...dataDates) : undefined;
  const minMs = startDate ? new Date(startDate).getTime() : dataMin;
  const maxMs = endDate ? new Date(endDate + "T23:59:59").getTime() : dataMax;

  const options: ApexOptions = {
    chart: {
      id: "revenue-trend",
      type: "area",
      // enable toolbar and include a CSV download icon similar to Engagement chart
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
      pan: {
        enabled: true,
        type: "x",
      },
    },
    colors: ["#3b82f6"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.15,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      type: "datetime",
      min: minMs,
      max: maxMs,
      tickAmount: 6,
      labels: { datetimeUTC: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCurrency(Number(val)),
      },
    },
    tooltip: {
      x: { format: "yyyy-MM-dd" },
      y: { formatter: (val) => formatCurrency(Number(val)) },
    },
    grid: { strokeDashArray: 4 },
  };

  return (
    <div>
      <Chart options={options} series={series} type="area" height={260} />
    </div>
  );
};

const UserActivityChart: React.FC<{
  trend?: UserActivityPoint[];
  summary?: {
    last30Days: number;
    last7Days: number;
    last1Day: number;
  };
  startDate?: string;
  endDate?: string;
}> = ({ trend = [], summary, startDate, endDate }) => {
  const avg30Days = summary ? summary.last30Days / 30 : 0;
  const avg7Days = summary ? summary.last7Days / 7 : 0;
  const avg1Day = summary ? summary.last1Day / 1 : 0;

  const series = [
    {
      name: "Daily Active Users",
      data: trend.map((p) => [new Date(p.date).getTime(), p.activeUsers || 0]),
      type: "line",
    },
  ];

  // x-axis bounds
  const dataDates = trend.map((p) => new Date(p.date).getTime());
  const dataMin = dataDates.length ? Math.min(...dataDates) : undefined;
  const dataMax = dataDates.length ? Math.max(...dataDates) : undefined;
  const minMs = startDate ? new Date(startDate).getTime() : dataMin;
  const maxMs = endDate ? new Date(endDate + "T23:59:59").getTime() : dataMax;

  const options: ApexOptions = {
    chart: {
      id: "user-activity-trend",
      type: "line",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
      pan: {
        enabled: true,
        type: "x",
      },
    },
    colors: ["#3b82f6"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      type: "datetime",
      min: minMs,
      max: maxMs,
      tickAmount: 6,
      labels: { datetimeUTC: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => Number(val).toLocaleString(),
      },
    },
    tooltip: {
      x: { format: "dd/MM/yyyy" },
      y: { formatter: (val) => Number(val).toLocaleString() },
      // Custom tooltip to show only daily active users
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        // Determine date string in dd/mm/yyyy format
        let dateStr = "";
        try {
          const ts = w?.globals?.seriesX?.[0]?.[dataPointIndex];
          if (ts) {
            const date = new Date(ts);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            dateStr = `${day}/${month}/${year}`;
          } else {
            dateStr = w?.globals?.labels?.[dataPointIndex] || "";
          }
        } catch (e) {
          dateStr = "";
        }

        const value = series?.[seriesIndex]?.[dataPointIndex] ?? 0;

        // Simple HTML tooltip - only showing date and active users
        return `
          <div class="apexcharts-tooltip-custom" style="padding:8px;">
            <div style="font-weight:700;margin-bottom:4px;">${dateStr}</div>
            <div style="color:#3b82f6;font-weight:600;">Active Users: ${Number(
              value
            ).toLocaleString()}</div>
          </div>`;
      },
    },
    grid: { strokeDashArray: 4 },
    legend: { show: false },
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" height={260} />
    </div>
  );
};

// User Retention Chart Component
const UserRetentionChart: React.FC<{
  data?: Array<{
    date: string;
    day: number;
    activeUsers: number;
    retentionRate: number;
  }>;
  startDate?: string;
  endDate?: string;
}> = ({ data = [], startDate, endDate }) => {
  const series = [
    {
      name: "Retention Rate",
      data: data.map((p) => [new Date(p.date).getTime(), p.retentionRate || 0]),
      type: "line",
    },
  ];

  // x-axis bounds
  const dataDates = data.map((p) => new Date(p.date).getTime());
  const dataMin = dataDates.length ? Math.min(...dataDates) : undefined;
  const dataMax = dataDates.length ? Math.max(...dataDates) : undefined;
  const minMs = startDate ? new Date(startDate).getTime() : dataMin;
  const maxMs = endDate ? new Date(endDate + "T23:59:59").getTime() : dataMax;

  const options: ApexOptions = {
    chart: {
      id: "user-retention-trend",
      type: "line",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
      pan: {
        enabled: true,
        type: "x",
      },
    },
    colors: ["#8b5cf6"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      type: "datetime",
      min: minMs,
      max: maxMs,
      tickAmount: 6,
      labels: { datetimeUTC: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${Number(val).toFixed(1)}%`,
      },
      min: 0,
      max: 100,
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        // Format date as dd/mm/yyyy
        let dateStr = "";
        try {
          const ts = w?.globals?.seriesX?.[0]?.[dataPointIndex];
          if (ts) {
            const date = new Date(ts);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            dateStr = `${day}/${month}/${year}`;
          } else {
            dateStr = w?.globals?.labels?.[dataPointIndex] || "";
          }
        } catch (e) {
          dateStr = "";
        }

        const value = series?.[seriesIndex]?.[dataPointIndex] ?? 0;

        // Simple HTML tooltip - only showing date and retention rate
        return `
          <div class="apexcharts-tooltip-custom" style="padding:8px;">
            <div style="font-weight:700;margin-bottom:4px;">${dateStr}</div>
            <div style="color:#8b5cf6;font-weight:600;">Retention Rate: ${Number(
              value
            ).toFixed(2)}%</div>
          </div>`;
      },
    },
    grid: { strokeDashArray: 4 },
    legend: { show: false },
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" height={260} />
    </div>
  );
};

// User Funnel Chart Component
const FunnelChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.SlicedChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    const series = chart.series.push(
      am5percent.FunnelSeries.new(root, {
        alignLabels: false,
        orientation: "vertical",
        valueField: "value",
        categoryField: "category",
        bottomRatio: 1,
      })
    );

    series.slices.template.setAll({
      strokeOpacity: 0,
      fillOpacity: 1,
    });

    series.labels.template.setAll({
      text: "{category}",
      fontSize: 13,
      fontWeight: "600",
      fill: am5.color("#ffffff"),
    });

    series.ticks.template.setAll({
      strokeOpacity: 0,
    });

    const data = [
      {
        value: 42115,
        category: "42,115\nApp Opens",
        fill: am5.color("#3b82f6"),
        sliceSettings: { fillOpacity: 1 },
      },
      {
        value: 35284,
        category: "35,284\nPhoto Uploads",
        fill: am5.color("#8b5cf6"),
        sliceSettings: { fillOpacity: 1 },
      },
      {
        value: 28616,
        category: "28,616\nFeature Used",
        fill: am5.color("#a855f7"),
        sliceSettings: { fillOpacity: 1 },
      },
      {
        value: 24685,
        category: "24,685\nPaywall Shown",
        fill: am5.color("#c084fc"),
        sliceSettings: { fillOpacity: 1 },
      },
      {
        value: 10914,
        category: "10,914\nPurchases",
        fill: am5.color("#e0b3ff"),
        sliceSettings: { fillOpacity: 1 },
      },
    ];

    series.data.setAll(data);

    data.forEach((item, index) => {
      const slice = series.dataItems[index].get("slice");
      if (slice) {
        slice.set("fill", item.fill);
      }
    });

    series.appear();
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "380px" }} />;
};

// Donut Chart for Feature Revenue
const FeatureRevenueDonut: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(60),
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
      })
    );

    series.labels.template.set("visible", false);
    series.ticks.template.set("visible", false);

    series.slices.template.setAll({
      strokeOpacity: 0,
      tooltipText:
        "{category}: ${value}\n{valuePercentTotal.formatNumber('0.0')}%",
    });

    const data = [
      { category: "AI Enhancer", value: 18457, color: am5.color("#8b5cf6") },
      { category: "Photo Editor", value: 0, color: am5.color("#ec4899") },
      { category: "BG Remover", value: 0, color: am5.color("#f59e0b") },
      { category: "Face Swap", value: 0, color: am5.color("#3b82f6") },
    ];

    series.data.setAll(data);

    data.forEach((item, index) => {
      const slice = series.dataItems[index].get("slice");
      if (slice) {
        slice.set("fill", item.color);
      }
    });

    // Center label
    const label = chart.seriesContainer.children.push(
      am5.Label.new(root, {
        text: "18,457\n[fontSize: 11px]Total Uses[/]",
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        populateText: true,
      })
    );

    series.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "260px" }} />;
};
// add a small feature data type
type FeatureData = {
  feature: string;
  uses: number;
  color?: string;
};

// Horizontal Bar Chart for Feature Performance
// changed: accept optional `data` prop and use it if provided
const FeaturePerformanceChart: React.FC<{ data?: FeatureData[] }> = ({
  data,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "feature",
        renderer: am5xy.AxisRendererY.new(root, {
          minGridDistance: 20,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
        }),
      })
    );

    yAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
      fill: am5.color("#374151"),
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        min: 0,
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fontSize: 11,
      fill: am5.color("#6b7280"),
    });

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Uses",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "uses",
        categoryYField: "feature",
      })
    );

    series.columns.template.setAll({
      cornerRadiusTR: 5,
      cornerRadiusBR: 5,
      strokeOpacity: 0,
      tooltipText: "{feature}: {uses}",
    });

    // Always render chart with dynamic data - use empty array if no data
    const chartData = data && data.length ? data : [];

    yAxis.data.setAll(chartData as any);
    series.data.setAll(chartData as any);

    chartData.forEach((item, index) => {
      const column = series.dataItems[index].get("graphics");
      if (column) {
        column.set("fill", am5.color(item.color || "#3b82f6"));
      }
    });

    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "240px" }} />;
};

// World Map Chart for Geography

interface CountryData {
  country: string;
  countryCode: string;
  total_users: number;
  active_users: number;
  percentage: number;
}

interface WorldMapChartProps {
  countries?: CountryData[];
  highlightCountries?: string[];
}

const WorldMapChart: React.FC<WorldMapChartProps> = ({
  countries = [],
  highlightCountries = [],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "none",
        projection: am5map.geoNaturalEarth1(),
      })
    );

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        valueField: "value",
        calculateAggregates: true,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color("#f1f5f9"),
    });

    // Tooltip adapter to show both total and active users
    polygonSeries.mapPolygons.template.adapters.add(
      "tooltipText",
      (text, target) => {
        const dataItem = target.dataItem;
        if (dataItem) {
          const dataContext = dataItem.dataContext as any;
          const name =
            dataContext && dataContext.name ? dataContext.name : "Unknown";
          const total =
            dataContext && typeof dataContext.total_users === "number"
              ? dataContext.total_users
              : 0;
          const active =
            dataContext && typeof dataContext.active_users === "number"
              ? dataContext.active_users
              : 0;
          return `${name}:\nTotal Users: ${total.toLocaleString()}\nActive Users: ${active.toLocaleString()}`;
        }
        return text;
      }
    );

    polygonSeries.set("heatRules", [
      {
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color("#bfdbfe"),
        max: am5.color("#0c4a6e"),
        minValue: 1,
        key: "fill",
      },
    ]);

    // Apply darker colors to highlighted countries
    if (highlightCountries.length > 0) {
      polygonSeries.mapPolygons.template.adapters.add(
        "fill",
        (fill, target) => {
          const dataItem = target.dataItem;
          if (dataItem) {
            const dataContext = dataItem.dataContext as any;
            const countryCode = dataContext?.id;
            if (countryCode && highlightCountries.includes(countryCode)) {
              // Apply darker blue for highlighted countries
              const value = dataContext?.value || 0;
              if (value > 0) {
                return am5.color("#1e3a8a"); // Dark blue for highlighted
              }
            }
          }
          return fill;
        }
      );
    }

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color("#3b82f6"),
    });

    // Transform API data to map format, filtering out invalid country codes
    const mapData = countries
      .filter(
        (c) =>
          c.countryCode &&
          c.countryCode.length === 2 &&
          c.countryCode !== "(other)" &&
          c.countryCode !== "(not set)"
      )
      .map((c) => ({
        id: c.countryCode,
        value: c.total_users,
        total_users: c.total_users,
        active_users: c.active_users,
        name: c.country,
      }));

    polygonSeries.data.setAll(mapData);

    chart.appear(1000, 100);

    return () => root.dispose();
  }, [countries, highlightCountries]);

  return <div ref={chartRef} style={{ width: "100%", height: "350px" }} />;
};

// Subscription Growth Chart
const SubscriptionGrowthChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series1 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Free Users",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "free",
        valueXField: "date",
        stroke: am5.color("#94a3b8"),
        fill: am5.color("#94a3b8"),
      })
    );

    series1.strokes.template.setAll({ strokeWidth: 2 });
    series1.fills.template.setAll({ fillOpacity: 0.1, visible: true });

    const series2 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Premium Users",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "premium",
        valueXField: "date",
        stroke: am5.color("#8b5cf6"),
        fill: am5.color("#8b5cf6"),
      })
    );

    series2.strokes.template.setAll({ strokeWidth: 3 });
    series2.fills.template.setAll({ fillOpacity: 0.2, visible: true });

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
      })
    );
    legend.data.setAll(chart.series.values);

    // Generate data
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.getTime(),
        free: 22000 + Math.random() * 2000,
        premium: 1100 + Math.random() * 150,
      });
    }

    series1.data.setAll(data);
    series2.data.setAll(data);

    series1.appear(1000);
    series2.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "260px" }} />;
};

// Device Distribution (presentational) - receives platforms and renders donut
const DeviceDistributionChart: React.FC<{
  platforms: {
    platform: string;
    totalUsers: number;
    activeUsers: number;
    share?: number;
  }[];
  loading?: boolean;
  startDate?: string;
  endDate?: string;
  colors?: string[];
}> = ({ platforms = [], loading = false, startDate, endDate, colors = [] }) => {
  const totalUsers = platforms.reduce((s, p) => s + (p.totalUsers || 0), 0);
  const activeUsers = platforms.reduce((s, p) => s + (p.activeUsers || 0), 0);

  const labels = platforms.map((p) => p.platform || "Unknown");
  const series = platforms.map((p) =>
    typeof p.share === "number" && p.share >= 0
      ? p.share
      : totalUsers
      ? Number(((p.totalUsers || 0) / totalUsers) * 100)
      : 0
  );

  const colorMap = {
    Android: "#34d399",
    iOS: "#3b82f6",
  } as Record<string, string>;

  const chartColors =
    colors && colors.length >= labels.length
      ? colors
      : labels.map((l) => colorMap[l] || "#93c5fd");

  const options: ApexOptions = {
    chart: {
      id: "device-distribution",
      type: "donut",
      toolbar: {
        show: true,
        tools: { download: true, selection: false, zoom: false, reset: false },
      },
    },
    labels,
    colors: chartColors,
    legend: { position: "bottom" },
    tooltip: {
      y: {
        formatter: (val: number, opts: any) => {
          const idx = opts?.dataPointIndex ?? 0;
          const p = platforms[idx] ?? {};
          const fmt = (n: any) => new Intl.NumberFormat().format(n ?? 0);
          const total = fmt(p.totalUsers || 0);
          const active = fmt(p.activeUsers || 0);
          const share = p.share ?? Math.round(series[idx] * 10) / 10 ?? 0;
          return `<div style="text-align:left; line-height:1.25;">
            <div><strong>Total:</strong> ${total}</div>
            <div><strong>Active:</strong> ${active}</div>
            <div><strong>Share:</strong> ${share}%</div>
          </div>`;
        },
      },
      shared: false,
      x: { show: true },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: chartColors,
        inverseColors: false,
        opacityFrom: 0.95,
        opacityTo: 0.9,
        stops: [0, 50, 100],
      },
    },
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: "65%" } } },
  };

  return (
    <div>
      <div className="w-full">
        <Chart options={options} series={series} type="donut" height={240} />
      </div>

      {/* summary grid removed per request */}
    </div>
  );
};

// App Version Distribution Chart
const AppVersionChart: React.FC<{ versions?: any[] }> = ({ versions = [] }) => {
  // Prepare and sort versions by total_users desc
  const cleaned = (versions || []).filter((v: any) => v && v.version);
  const sorted = cleaned
    .slice()
    .sort((a: any, b: any) => (b.total_users || 0) - (a.total_users || 0));

  const categories = sorted.map((v: any) => v.version);
  const totalData = sorted.map((v: any) => v.total_users || 0);
  const activeData = sorted.map((v: any) => v.active_users || 0);

  const series = [
    { name: "Total", data: totalData },
    { name: "Active", data: activeData },
  ];

  const numberFmt = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

  const options: ApexOptions = {
    chart: {
      id: "app-version",
      type: "bar",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "44%", borderRadius: 6 },
    },
    colors: ["#3b82f6", "#10b981"],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        rotate: -90,
        rotateAlways: true,
        hideOverlappingLabels: false,
        trim: false,
        style: {
          fontSize: "10px",
        },
        offsetY: 0,
        maxHeight: 120,
      },
    },
    yaxis: {
      labels: { formatter: (val) => numberFmt(Number(val)) },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const ver = w.config.xaxis.categories[dataPointIndex] ?? "";
        const tot = series[0][dataPointIndex] ?? 0;
        const act = series[1][dataPointIndex] ?? 0;
        const pct = sorted[dataPointIndex]?.percentage;
        let html = `<div style="padding:8px; font-size:13px; line-height:1.35;">
          <div style="font-weight:600; margin-bottom:6px;">${ver}</div>
          <div>Total: ${numberFmt(tot)}</div>
          <div>Active: ${numberFmt(act)}</div>`;
        if (typeof pct === "number") {
          html += `<div>Share: ${Number(pct).toFixed(1)}%</div>`;
        }
        html += `</div>`;
        return html;
      },
    },
    grid: { strokeDashArray: 4 },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: { bar: { columnWidth: "60%" } },
          xaxis: { labels: { rotate: -30 } },
        },
      },
    ],
  };

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={380} />
      <p className="text-xs text-gray-400 mt-2">Sorted by Total Users (desc)</p>
    </div>
  );
};

// Feature Completion Funnel
const FeatureCompletionChart: React.FC<{ featureName: string }> = ({
  featureName,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.SlicedChart.new(root, {
        layout: root.horizontalLayout,
      })
    );

    const series = chart.series.push(
      am5percent.FunnelSeries.new(root, {
        alignLabels: false,
        orientation: "horizontal",
        valueField: "value",
        categoryField: "category",
      })
    );

    series.slices.template.setAll({
      strokeOpacity: 0,
    });

    series.labels.template.setAll({
      fontSize: 10,
      text: "{category}: {value}",
    });

    const data = [
      { category: "Opened", value: 18457 },
      { category: "Uploaded", value: 16980 },
      { category: "Processed", value: 15840 },
      { category: "Saved/Shared", value: 12450 },
    ];

    series.data.setAll(data);
    series.appear(1000, 100);

    return () => root.dispose();
  }, [featureName]);

  return <div ref={chartRef} style={{ width: "100%", height: "140px" }} />;
};

// Total Views Chart
const TotalViewsChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "views",
        valueXField: "date",
      })
    );

    series.columns.template.setAll({
      fill: am5.color("#f59e0b"),
      strokeOpacity: 0,
      cornerRadiusTL: 3,
      cornerRadiusTR: 3,
    });

    // Generate data
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.getTime(),
        views: 1500 + Math.random() * 500,
      });
    }

    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "200px" }} />;
};

// Engagement Chart for User Engagements (ApexCharts - dashed multi-line)
interface EngagementPoint {
  date: string;
  engagementTime?: string;
  engagementSessionPerUser?: string | number;
  engagementTimePerSession?: string;
}
const EngagementChart: React.FC<{
  points?: EngagementPoint[];
  startDate?: string;
  endDate?: string;
}> = ({ points = [], startDate, endDate }) => {
  const parseToSeconds = (t?: string) => {
    if (!t) return 0;
    const m = t.match(/(\d+)m/)?.[1];
    const s = t.match(/(\d+)s/)?.[1];
    const mm = m ? parseInt(m, 10) : 0;
    const ss = s ? parseInt(s, 10) : 0;
    return mm * 60 + ss;
  };

  const formatSeconds = (num: number) => {
    const mm = Math.floor(num / 60);
    const ss = Math.round(num % 60);
    return `${mm}m ${ss}s`;
  };

  const labels = (points || []).map((p) => new Date(p.date).toISOString());

  // compute x-axis min/max from provided start/end or fallback to data bounds
  const dataDates = (points || []).map((p) => new Date(p.date).getTime());
  const dataMin = dataDates.length ? Math.min(...dataDates) : undefined;
  const dataMax = dataDates.length ? Math.max(...dataDates) : undefined;
  const minMs = startDate ? new Date(startDate).getTime() : dataMin;
  const maxMs = endDate ? new Date(endDate + "T23:59:59").getTime() : dataMax;

  // convert seconds to minutes and scale sessions to fit the same time axis
  const engagementMins = (points || []).map(
    (p) => parseToSeconds(p.engagementTime) / 60
  );
  const timePerSessionMins = (points || []).map(
    (p) => parseToSeconds(p.engagementTimePerSession) / 60
  );
  const sessionsArr = (points || []).map((p) =>
    Number(p.engagementSessionPerUser || 0)
  );

  // compute scale factor so sessions fit within the same minutes-based axis
  const maxTime = Math.max(1, ...engagementMins.concat(timePerSessionMins));

  // separate numeric sessions and sessions provided as time string
  const sessionsNumeric: Array<number | null> = (points || []).map((p) => {
    const v = p.engagementSessionPerUser as any;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      // treat pure numeric strings as numbers
      const num = Number(v);
      if (!isNaN(num)) return num;
      // otherwise it may be a time string like '1m 15s' -> leave as null here
    }
    return null;
  });
  const sessionsTimeMins: Array<number | null> = (points || []).map((p) => {
    const v = p.engagementSessionPerUser as any;
    if (typeof v === "string" && /m|s/.test(v)) {
      return parseToSeconds(v) / 60;
    }
    return null;
  });

  const maxNumericSessions = Math.max(
    0,
    ...(sessionsNumeric.filter((n) => n != null) as number[])
  );
  const scaleFactor =
    maxNumericSessions > 0 ? (maxTime * 0.9) / maxNumericSessions : 1;

  const series: any[] = [
    {
      name: "Engagement Time",
      data: labels.map((l, i) => [
        new Date(l).getTime(),
        engagementMins[i] ?? 0,
      ]),
    },
    {
      name: "Time per Session",
      data: labels.map((l, i) => [
        new Date(l).getTime(),
        timePerSessionMins[i] ?? 0,
      ]),
    },
    {
      name: "Sessions/User",
      // plot scaled or time-derived sessions on the same minutes axis
      data: labels.map((l, i) => [
        new Date(l).getTime(),
        (sessionsTimeMins[i] != null
          ? sessionsTimeMins[i]
          : sessionsNumeric[i] != null
          ? (sessionsNumeric[i] as number) * scaleFactor
          : 0) ?? 0,
      ]),
    },
  ];

  const options: ApexOptions = {
    chart: {
      id: "engagement-chart",
      type: "line",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      }, // toolbar

      zoom: { enabled: true, type: "x" },
    },
    stroke: {
      curve: "smooth",
      width: [3, 2, 2],
      dashArray: [0, 6, 6],
    },
    colors: ["#f59e0b", "#10b981", "#3b82f6"],
    xaxis: {
      type: "datetime",
      // honor selected date range when available so ticks start/end on chosen dates
      min: minMs,
      max: maxMs,
      tickAmount: 6,
      labels: { datetimeUTC: false },
    },

    yaxis: [
      {
        // unified left axis (minutes) for all series; labels are shown as mm:ss
        title: { text: "Time (mm:ss)" },
        labels: {
          formatter: (val) => {
            const seconds = Math.round(Number(val) * 60);
            return formatSeconds(seconds);
          },
        },
        min: 0,
        max: Math.ceil(maxTime),
      },
    ],
    tooltip: {
      x: { format: "yyyy-MM-dd" },
      y: {
        formatter: function (val: number, opts: any) {
          // if 'Sessions/User' series (index 2), show original sessions value or time
          if (opts.seriesIndex === 2) {
            const idx = opts.dataPointIndex;
            if (sessionsTimeMins[idx] != null) {
              const secs = Math.round((sessionsTimeMins[idx] as number) * 60);
              return formatSeconds(secs);
            }
            if (sessionsNumeric[idx] != null) {
              return `${Number(sessionsNumeric[idx]).toFixed(2)} sessions`;
            }
            return "0 sessions";
          }
          const secs = Math.round(Number(val) * 60);
          return formatSeconds(secs);
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      floating: false,
      offsetY: 8,
      markers: { width: 10, height: 10, radius: 6 },
      itemMargin: { horizontal: 12, vertical: 0 },
    },
    markers: { size: 4 },
    grid: { strokeDashArray: 4 },
    responsive: [
      {
        breakpoint: 768,
        options: { legend: { position: "bottom", horizontalAlign: "center" } },
      },
    ],
  };

  return (
    <div className="engagement-chart">
      <style>{`
        /* Force single-line legend with horizontal scrolling if needed */
        .engagement-chart .apexcharts-legend {
          display: block !important;
          white-space: nowrap !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          text-align: center !important;
          padding-bottom: 6px;
        }

        /* Make each legend item inline and prevent internal wrapping */
        .engagement-chart .apexcharts-legend .apexcharts-legend-row,
        .engagement-chart .apexcharts-legend > div {
          display: block !important;
          white-space: nowrap !important;
        }
        .engagement-chart .apexcharts-legend .apexcharts-legend-series {
          display: inline-block !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
          margin: 0 12px !important;
        }

        .engagement-chart .apexcharts-legend-series { gap:8px !important; }
        .engagement-chart .apexcharts-legend-text { white-space: nowrap !important; display:inline-block !important; }
        .engagement-chart .apexcharts-legend-marker { width:10px !important; height:10px !important; border-radius:6px !important; display:inline-block !important; margin-right:6px !important; }

        /* Small custom scrollbar */
        .engagement-chart .apexcharts-legend::-webkit-scrollbar { height: 6px; }
        .engagement-chart .apexcharts-legend::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 3px; }
      `}</style>
      <Chart options={options} series={series} type="line" height={300} />
    </div>
  );
};

const DashboardTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    stats,
    loading,
    liveStatus,
    liveStatusLoading,
    userDemographics,
    demographicsLoading,
    appVersions,
    appVersionsLoading,
    revenueTrend,
    revenueTrendLoading,
    engagement,
    engagementLoading,
    userActivity,
    userActivityLoading,
    userRetention,
    userRetentionLoading,
  } = useAppSelector((state) => state.Dashboard);

  // Filter state for demographics section
  const [geoFilter, setGeoFilter] = useState<string>("last7");
  const [geoStartDate, setGeoStartDate] = useState<string>(
    () => getDateRangeForPreset("last7").startDate
  );
  const [geoEndDate, setGeoEndDate] = useState<string>(
    () => getDateRangeForPreset("last7").endDate
  );
  const [geoHighlightFilter, setGeoHighlightFilter] = useState<string>("top5");

  // Device Distribution filters (separate from Geography)
  const [deviceFilter, setDeviceFilter] = useState<string>("last7");
  const [deviceStartDate, setDeviceStartDate] = useState<string>(
    () => getDateRangeForPreset("last7").startDate
  );
  const [deviceEndDate, setDeviceEndDate] = useState<string>(
    () => getDateRangeForPreset("last7").endDate
  );

  // Restore liveStatus filter state (for API performance section)
  const [filter, setFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // App Versions filter (mirrors Geography controls)
  const [appFilter, setAppFilter] = useState<string>("last7");
  const [appStartDate, setAppStartDate] = useState<string>(
    () => getDateRangeForPreset("last7").startDate
  );
  const [appEndDate, setAppEndDate] = useState<string>(
    () => getDateRangeForPreset("last7").endDate
  );

  // Revenue filters
  const [revenueGroup, setRevenueGroup] = useState<string>("weekly");
  const [revenuePreset, setRevenuePreset] = useState<string>("last30");
  const [revenueStartDate, setRevenueStartDate] = useState<string>(
    () => getDateRangeForPreset("last30").startDate
  );
  const [revenueEndDate, setRevenueEndDate] = useState<string>(
    () => getDateRangeForPreset("last30").endDate
  );
  const [featurePerformanceData, setFeaturePerformanceData] = useState<
    FeatureData[]
  >([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [featurePerformanceMetrics, setFeaturePerformanceMetrics] = useState<{
    totalUses: number;
    paywallHits: number;
    usageRate: number;
    conversionRate: number;
  }>({
    totalUses: 0,
    paywallHits: 0,
    usageRate: 0,
    conversionRate: 0,
  });

  // Device distribution state
  const [deviceDistributionData, setDeviceDistributionData] = useState<{
    ios: { count: number; percentage: number };
    android: { count: number; percentage: number };
    other: { count: number; percentage: number };
    total: number;
  }>({
    ios: { count: 0, percentage: 0 },
    android: { count: 0, percentage: 0 },
    other: { count: 0, percentage: 0 },
    total: 0,
  });
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Engagement filters (for User Engagements)
  const [engagementPreset, setEngagementPreset] = useState<string>("last30");
  const [engagementStartDate, setEngagementStartDate] = useState<string>(
    () => getDateRangeForPreset("last30").startDate
  );
  const [engagementEndDate, setEngagementEndDate] = useState<string>(
    () => getDateRangeForPreset("last30").endDate
  );

  // User Activity filters
  const [userActivityPreset, setUserActivityPreset] =
    useState<string>("last30");
  const [userActivityStartDate, setUserActivityStartDate] = useState<string>(
    () => getDateRangeForPreset("last30").startDate
  );
  const [userActivityEndDate, setUserActivityEndDate] = useState<string>(
    () => getDateRangeForPreset("last30").endDate
  );

  // User Retention filters
  const [retentionPreset, setRetentionPreset] = useState<string>("last30");
  const [retentionStartDate, setRetentionStartDate] = useState<string>(
    () => getDateRangeForPreset("last30").startDate
  );
  const [retentionEndDate, setRetentionEndDate] = useState<string>(
    () => getDateRangeForPreset("last30").endDate
  );

  // Fetch dashboard stats and live status (existing logic)
  useEffect(() => {
    dispatch(getDashboardStatsThunk());
    // if (filter !== "custom") {
    //   dispatch(getLiveStatusThunk({ filter }));loadFeaturePerformance
    // }
  }, [dispatch, filter]);

  // fetch feature performance data using the API helper
  useEffect(() => {
    const loadFeaturePerformance = async () => {
      setIsLoadingFeatures(true);
      try {
        const result = await getFeaturePerformance();

        // Handle both old format (array) and new format (object with properties)
        if (Array.isArray(result)) {
          // Old format - direct array
          const parsed = result.map((f) => ({
            feature: f.feature,
            uses: f.uses,
            color: f.color || undefined,
          }));
          setFeaturePerformanceData(parsed);
          const totalUses = parsed.reduce((s, f) => s + (f.uses || 0), 0);
          setFeaturePerformanceMetrics({
            totalUses,
            paywallHits: 0,
            usageRate: 0,
            conversionRate: 0,
          });
        } else {
          // New format - object with features and metrics
          const parsed = result.features.map((f: any) => ({
            feature: f.feature,
            uses: f.uses,
            color: f.color || undefined,
          }));
          setFeaturePerformanceData(parsed);
          setFeaturePerformanceMetrics({
            totalUses: Number(result.totalUses || 0),
            paywallHits: Number(result.paywallHits || 0),
            usageRate: Number(result.usageRate || 0),
            conversionRate: Number(result.conversionRate || 0),
          });
        }
      } catch (error) {
        // Keep empty array to use default data
      } finally {
        setIsLoadingFeatures(false);
      }
    };

    loadFeaturePerformance();
  }, []);

  // fetch device distribution data using the API helper
  useEffect(() => {
    const loadDeviceDistribution = async () => {
      setIsLoadingDevices(true);
      try {
        const result = await getDeviceDistribution();
        setDeviceDistributionData(result);
      } catch (error) {
        // Keep default empty data
      } finally {
        setIsLoadingDevices(false);
      }
    };

    loadDeviceDistribution();
  }, []);

  // derived values for the UI under Feature Performance - trust API metrics
  const totalUses = featurePerformanceMetrics.totalUses;
  const paywallHitsVal = featurePerformanceMetrics.paywallHits;
  const usageRate = featurePerformanceMetrics.usageRate;
  const paywallConversionRate = featurePerformanceMetrics.conversionRate;

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (newFilter !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleApplyCustomFilter = () => {
    if (filter !== "custom" || !startDate || !endDate) return;
    dispatch(getLiveStatusThunk({ filter, startDate, endDate }));
  };

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening with your app today.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Last 7 Days</span>
        </button>
      </div>
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Categories */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>23.64%</span>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Total Categories</p>
            <p className="text-3xl font-bold">{stats.totalCategories || 0}</p>
            <p className="text-xs opacity-75 mt-2">
              +{stats.totalCategories || 0} from last month
            </p>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>11.3%</span>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Active Categories</p>
            <p className="text-3xl font-bold">{stats.activeCategories || 0}</p>
            <p className="text-xs opacity-75 mt-2">
              {stats.activeCategories || 0} categories active
            </p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>23,406</span>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Total Users</p>
            <p className="text-3xl font-bold">
              {(stats.totalUsers || 0).toLocaleString()}
            </p>
            <p className="text-xs opacity-75 mt-2">
              +1,227 new users this week
            </p>
          </div>
        </div>

        {/* Premium Subscribers */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>1,237</span>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Premium Users</p>
            <p className="text-3xl font-bold">
              {(stats.subscribedUsers || 0).toLocaleString()}
            </p>
            <p className="text-xs opacity-75 mt-2">Active subscriptions</p>
          </div>
        </div>
      </div>
      {/* Secondary Stats Row
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">$204</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>8.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Workspace
              </p>
              <p className="text-2xl font-bold text-gray-900">$1,022</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>2.4%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Total View
              </p>
              <p className="text-2xl font-bold text-gray-900">$4,732</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <TrendingDown className="w-3 h-3" />
              <span>0.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Subscriptions
              </p>
              <p className="text-2xl font-bold text-gray-900">1,237</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* AI Cost & Performance
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              AI Cost & Performance
            </h2>
            <p className="text-sm text-gray-500">Last 30 Days cost analysis</p>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg transition-colors">
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-2">Total Cost</p>
            <p className="text-2xl font-bold text-blue-900">$5,550</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-600">+12% vs last month</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
            <p className="text-xs text-emerald-600 font-medium mb-2">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-emerald-900">$14,700</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-600">
                +24% vs last month
              </span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg">
            <p className="text-xs text-violet-600 font-medium mb-2">
              Net Profit
            </p>
            <p className="text-2xl font-bold text-violet-900">$9,150</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-violet-600" />
              <span className="text-xs text-violet-600">
                +32% vs last month
              </span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
            <p className="text-xs text-amber-600 font-medium mb-2">ROI</p>
            <p className="text-2xl font-bold text-amber-900">+165%</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              <span className="text-xs text-amber-600">Excellent</span>
            </div>
          </div>
        </div>
      </div> */}
      {/* Revenue Insights & User Activity Insights - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Insights (Left Column) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Revenue Insights
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={revenuePreset}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRevenuePreset(v);
                    const { startDate, endDate } = getDateRangeForPreset(v);
                    setRevenueStartDate(startDate);
                    setRevenueEndDate(endDate);
                  }}
                  disabled={revenueTrendLoading}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last28">Last 28 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="thisWeek">This week</option>
                  <option value="lastWeek">Last week</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="last90">Last 90 days</option>
                  <option value="quarterToDate">Quarter to date</option>
                  <option value="thisYear">This year</option>
                  <option value="lastCalendarYear">Last calendar year</option>
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={revenueStartDate}
                  max={revenueEndDate || today}
                  onChange={(e) => {
                    setRevenueStartDate(e.target.value);
                    setRevenuePreset("");
                  }}
                  placeholder="Start Date"
                  style={{ minWidth: 110 }}
                  disabled={revenueTrendLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={revenueEndDate}
                  min={revenueStartDate}
                  max={today}
                  onChange={(e) => {
                    setRevenueEndDate(e.target.value);
                    setRevenuePreset("");
                  }}
                  placeholder="End Date"
                  style={{ minWidth: 110 }}
                  disabled={revenueTrendLoading}
                />

                <span className="px-3 py-1.5 bg-blue-50 text-xs font-medium text-blue-700 rounded-lg">
                  Total: ${(revenueTrend?.totalRevenue || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm text-gray-500">Revenue Trend</span>
            </div>
          </div>

          <div className="relative">
            <RevenueTrendChart
              points={revenueTrend?.points}
              startDate={revenueStartDate}
              endDate={revenueEndDate}
            />
            {revenueTrendLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>

        {/* User Activity Insights (Right Column) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                User Activity Insights
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={userActivityPreset}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUserActivityPreset(v);
                    const { startDate, endDate } = getDateRangeForPreset(v);
                    setUserActivityStartDate(startDate);
                    setUserActivityEndDate(endDate);
                  }}
                  disabled={userActivityLoading}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last28">Last 28 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="thisWeek">This week</option>
                  <option value="lastWeek">Last week</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="last90">Last 90 days</option>
                  <option value="quarterToDate">Quarter to date</option>
                  <option value="thisYear">This year</option>
                  <option value="lastCalendarYear">Last calendar year</option>
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={userActivityStartDate}
                  max={userActivityEndDate || today}
                  onChange={(e) => {
                    setUserActivityStartDate(e.target.value);
                    setUserActivityPreset("");
                  }}
                  placeholder="Start Date"
                  style={{ minWidth: 110 }}
                  disabled={userActivityLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={userActivityEndDate}
                  min={userActivityStartDate}
                  max={today}
                  onChange={(e) => {
                    setUserActivityEndDate(e.target.value);
                    setUserActivityPreset("");
                  }}
                  placeholder="End Date"
                  style={{ minWidth: 110 }}
                  disabled={userActivityLoading}
                />

                <span className="px-3 py-1.5 bg-blue-50 text-xs font-medium text-blue-700 rounded-lg">
                  Last 30 Days:{" "}
                  {(userActivity?.summary?.last30Days || 0).toLocaleString()}
                </span>
                <span className="px-3 py-1.5 bg-green-50 text-xs font-medium text-green-700 rounded-lg">
                  Last 7 Days:{" "}
                  {(userActivity?.summary?.last7Days || 0).toLocaleString()}
                </span>
                <span className="px-3 py-1.5 bg-orange-50 text-xs font-medium text-orange-700 rounded-lg">
                  Last 1 Day:{" "}
                  {(userActivity?.summary?.last1Day || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm text-gray-500">User Activity Trend</span>
            </div>
          </div>

          <div className="relative">
            <UserActivityChart
              trend={userActivity?.trend}
              summary={userActivity?.summary}
              startDate={userActivityStartDate}
              endDate={userActivityEndDate}
            />
            {userActivityLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Feature Revenue
            </h2>
            <p className="text-sm text-gray-500">AI Enhancer performance</p>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg transition-colors">
            AI Enhancer
          </button>
        </div>
        <FeatureRevenueDonut />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Uses</p>
            <p className="text-lg font-semibold text-gray-900">18,457</p>
            <p className="text-xs text-green-600 mt-0.5">73.3% of total</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Avg. CPU Cost</p>
            <p className="text-lg font-semibold text-gray-900">$0.115</p>
            <p className="text-xs text-amber-600 mt-0.5">63.8%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Base Rent. 6%</p>
            <p className="text-lg font-semibold text-gray-900">Revenue</p>
            <p className="text-xs text-gray-500 mt-0.5">Per conversion</p>
          </div>
        </div>
      </div> */}
      {/* User Funnel & Feature Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Funnel */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                User Funnel
              </h2>
              <p className="text-sm text-gray-500">
                Conversion funnel analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Daily
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg">
                Weekly
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Monthly
              </button>
            </div>
          </div>
          <FunnelChart />
        </div>

        {/* Feature Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Feature Performance
              </h2>
              <p className="text-sm text-gray-500">Usage across features</p>
            </div>
          </div>
          {isLoadingFeatures ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">
                Loading feature data...
              </span>
            </div>
          ) : (
            <FeaturePerformanceChart data={featurePerformanceData} />
          )}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Total Uses</span>
                <span className="text-sm font-semibold text-gray-900">
                  {totalUses.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${usageRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usageRate}% usage rate
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Paywall Hits</span>
                <span className="text-sm font-semibold text-gray-900">
                  {paywallHitsVal.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${paywallConversionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {paywallConversionRate}% conversion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Growth & User Retention - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subscription Growth (Left Column) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Subscription Growth
              </h2>
              <p className="text-sm text-gray-500">
                Free vs Premium users over time
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-600 rounded-full" />
              <span className="text-xs font-medium text-purple-900">
                Premium: 1,237
              </span>
            </div>
          </div>
          <SubscriptionGrowthChart />
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Conversion Rate</p>
              <p className="text-xl font-bold text-gray-900">5.3%</p>
              <p className="text-xs text-green-600 mt-0.5">+0.3% this month</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Churn Rate</p>
              <p className="text-xl font-bold text-gray-900">2.1%</p>
              <p className="text-xs text-green-600 mt-0.5">-0.5% improvement</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">ARPU</p>
              <p className="text-xl font-bold text-gray-900">$8.20</p>
              <p className="text-xs text-green-600 mt-0.5">
                +12% vs last month
              </p>
            </div>
          </div>
        </div>

        {/* User Retention (Right Column) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                User Retention
              </h2>
              <p className="text-sm text-gray-500">
                User retention rate over time
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={retentionPreset}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRetentionPreset(v);
                    const { startDate, endDate } = getDateRangeForPreset(v);
                    setRetentionStartDate(startDate);
                    setRetentionEndDate(endDate);
                  }}
                  disabled={userRetentionLoading}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last28">Last 28 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="thisWeek">This week</option>
                  <option value="lastWeek">Last week</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="last90">Last 90 days</option>
                  <option value="quarterToDate">Quarter to date</option>
                  <option value="thisYear">This year</option>
                  <option value="lastCalendarYear">Last calendar year</option>
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={retentionStartDate}
                  max={retentionEndDate || today}
                  onChange={(e) => {
                    setRetentionStartDate(e.target.value);
                    setRetentionPreset("");
                  }}
                  placeholder="Start Date"
                  style={{ minWidth: 110 }}
                  disabled={userRetentionLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={retentionEndDate}
                  min={retentionStartDate}
                  max={today}
                  onChange={(e) => {
                    setRetentionEndDate(e.target.value);
                    setRetentionPreset("");
                  }}
                  placeholder="End Date"
                  style={{ minWidth: 110 }}
                  disabled={userRetentionLoading}
                />
              </div>
            </div>
          </div>

          {userRetentionLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <UserRetentionChart
              data={userRetention?.data || []}
              startDate={retentionStartDate}
              endDate={retentionEndDate}
            />
          )}

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Base Users</p>
              <p className="text-xl font-bold text-gray-900">
                {userRetention?.baseUsers?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Avg Retention</p>
              <p className="text-xl font-bold text-gray-900">
                {userRetention?.data?.length
                  ? (
                      userRetention.data.reduce(
                        (sum, d) => sum + d.retentionRate,
                        0
                      ) / userRetention.data.length
                    ).toFixed(1)
                  : "0"}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Day 30 Retention</p>
              <p className="text-xl font-bold text-gray-900">
                {userRetention?.data
                  ?.find((d) => d.day === 30)
                  ?.retentionRate.toFixed(1) ||
                  userRetention?.data?.[
                    userRetention?.data?.length - 1
                  ]?.retentionRate.toFixed(1) ||
                  "0"}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Engagements & App Version Distribution - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Engagements (Left Column) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                User Engagements
              </h2>
              <p className="text-sm text-gray-500">Average engagement time</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={engagementPreset}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEngagementPreset(v);
                    const { startDate, endDate } = getDateRangeForPreset(v);
                    setEngagementStartDate(startDate);
                    setEngagementEndDate(endDate);
                  }}
                  disabled={engagementLoading}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last28">Last 28 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="thisWeek">This week</option>
                  <option value="lastWeek">Last week</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="last90">Last 90 days</option>
                  <option value="quarterToDate">Quarter to date</option>
                  <option value="thisYear">This year</option>
                  <option value="lastCalendarYear">Last calendar year</option>
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={engagementStartDate}
                  max={engagementEndDate || today}
                  onChange={(e) => {
                    setEngagementStartDate(e.target.value);
                    setEngagementPreset("");
                  }}
                  placeholder="Start Date"
                  style={{ minWidth: 110 }}
                  disabled={engagementLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={engagementEndDate}
                  min={engagementStartDate}
                  max={today}
                  onChange={(e) => {
                    setEngagementEndDate(e.target.value);
                    setEngagementPreset("");
                  }}
                  placeholder="End Date"
                  style={{ minWidth: 110 }}
                  disabled={engagementLoading}
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <EngagementChart
              points={engagement?.points}
              startDate={engagementStartDate}
              endDate={engagementEndDate}
            />
            {engagementLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-1">Avg Engagement</p>
              <p className="text-xl font-bold text-gray-900">
                {engagement?.averageEngagementTime || "0m 0s"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-1">Sessions/User</p>
              <p className="text-xl font-bold text-gray-900">
                {engagement?.averageEngagedSessionsPerUser || "0.00"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-1">Avg. Session</p>
              <p className="text-xl font-bold text-gray-900">
                {engagement?.averageEngagementTimePerSession || "0m 0s"}
              </p>
            </div>
          </div>
        </div>

        {/* App Version Distribution (Right Column) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                App Version Distribution
              </h2>
              <p className="text-sm text-gray-500">
                User distribution by app version
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1.5 bg-blue-50 text-xs font-medium text-blue-700 rounded-lg">
                Latest: v
                {(() => {
                  const versions = appVersions?.versions || [];
                  if (!Array.isArray(versions) || versions.length === 0)
                    return "N/A";
                  const filtered = versions.filter(
                    (v: any) =>
                      v &&
                      v.version &&
                      v.version !== "(other)" &&
                      v.version !== "(not set)"
                  );
                  if (filtered.length === 0) return "N/A";
                  const compareVer = (a: string, b: string) => {
                    const pa = (a || "").split(".").map((n) => Number(n) || 0);
                    const pb = (b || "").split(".").map((n) => Number(n) || 0);
                    const len = Math.max(pa.length, pb.length);
                    for (let i = 0; i < len; i++) {
                      const na = pa[i] || 0;
                      const nb = pb[i] || 0;
                      if (na !== nb) return na - nb;
                    }
                    return 0;
                  };
                  const byVer = filtered
                    .slice()
                    .sort((a: any, b: any) =>
                      compareVer(b.version, a.version)
                    )[0];
                  if (byVer && byVer.version) return byVer.version;
                  const topByUsers = filtered
                    .slice()
                    .sort(
                      (a: any, b: any) =>
                        (b.total_users || 0) - (a.total_users || 0)
                    )[0];
                  return topByUsers ? topByUsers.version : "N/A";
                })()}
              </span>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={appFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAppFilter(v);
                    const { startDate, endDate } = getDateRangeForPreset(v);
                    setAppStartDate(startDate);
                    setAppEndDate(endDate);
                  }}
                  disabled={appVersionsLoading}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last28">Last 28 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="thisWeek">This week</option>
                  <option value="lastWeek">Last week</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="last90">Last 90 days</option>
                  <option value="quarterToDate">Quarter to date</option>
                  <option value="thisYear">This year</option>
                  <option value="lastCalendarYear">Last calendar year</option>
                </select>

                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={appStartDate}
                  max={appEndDate || today}
                  onChange={(e) => setAppStartDate(e.target.value)}
                  placeholder="Start Date"
                  style={{ minWidth: 110 }}
                  disabled={appVersionsLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={appEndDate}
                  min={appStartDate}
                  max={today}
                  onChange={(e) => setAppEndDate(e.target.value)}
                  placeholder="End Date"
                  style={{ minWidth: 110 }}
                  disabled={appVersionsLoading}
                />
              </div>
            </div>
          </div>
          <div className="relative">
            <AppVersionChart versions={appVersions?.versions} />
            {appVersionsLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geography & Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* World Map */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Geography-Based Usage
              </h2>
              <p className="text-sm text-gray-500">
                User distribution across the world
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  {(userDemographics.totalUsers || 0).toLocaleString()} users
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={geoHighlightFilter}
                  onChange={(e) => setGeoHighlightFilter(e.target.value)}
                  disabled={demographicsLoading}
                >
                  <option value="top5">Top 5 Countries</option>
                  <option value="top10">Top 10 Countries</option>
                </select>
                <select
                  className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none"
                  value={geoFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setGeoFilter(v);
                    // auto-populate date range for the selected preset
                    const { startDate, endDate } = getDateRangeForPreset(v);
                    setGeoStartDate(startDate);
                    setGeoEndDate(endDate);
                  }}
                  disabled={demographicsLoading}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last28">Last 28 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="thisWeek">This week</option>
                  <option value="lastWeek">Last week</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="last90">Last 90 days</option>
                  <option value="quarterToDate">Quarter to date</option>
                  <option value="thisYear">This year</option>
                  <option value="lastCalendarYear">Last calendar year</option>
                </select>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={geoStartDate}
                  max={geoEndDate || today}
                  onChange={(e) => setGeoStartDate(e.target.value)}
                  placeholder="Start Date"
                  style={{ minWidth: 110 }}
                  disabled={demographicsLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={geoEndDate}
                  min={geoStartDate}
                  max={today}
                  onChange={(e) => setGeoEndDate(e.target.value)}
                  placeholder="End Date"
                  style={{ minWidth: 110 }}
                  disabled={demographicsLoading}
                />
              </div>
            </div>
          </div>
          <div className="relative">
            <WorldMapChart
              countries={userDemographics.countries.map((c) => ({
                country: c.country,
                countryCode: c.countryCode,
                total_users: (c as any).total_users ?? (c as any).users ?? 0,
                active_users: (c as any).active_users ?? 0,
                percentage: c.percentage ?? 0,
              }))}
              highlightCountries={userDemographics.countries
                .filter(
                  (c) =>
                    c.countryCode &&
                    c.countryCode !== "(other)" &&
                    c.countryCode !== "(not set)" &&
                    c.countryCode.length === 2
                )
                .slice(0, geoHighlightFilter === "top5" ? 5 : 10)
                .map((c) => c.countryCode)}
            />
            {/* {demographicsLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )} */}
          </div>
          <div className="grid grid-cols-5 gap-3 mt-6">
            {topCountries
              .slice(0, geoHighlightFilter === "top5" ? 5 : 10)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50 rounded-lg text-center"
                >
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    {getCountryFlag(item.countryCode)}{" "}
                    {item.country.length > 10 ? item.countryCode : item.country}
                  </p>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[13px] text-blue-900 font-bold">
                      Total: {(item.total_users || 0).toLocaleString()}
                    </span>
                    <span className="text-[13px] text-emerald-700 font-semibold">
                      Active: {(item.active_users || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Device Distribution
              </h2>
              <p className="text-sm text-gray-500">Platform breakdown</p>
            </div>

            <div className="ml-auto flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              <select
                className="px-2 py-1 text-xs rounded-lg font-medium border bg-white text-gray-700 border-gray-200 focus:outline-none min-w-0"
                value={deviceFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setDeviceFilter(v);
                  const { startDate, endDate } = getDateRangeForPreset(v);
                  setDeviceStartDate(startDate);
                  setDeviceEndDate(endDate);
                }}
                disabled={platformsLoading}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7">Last 7 days</option>
                <option value="last28">Last 28 days</option>
                <option value="last30">Last 30 days</option>
                <option value="thisWeek">This week</option>
                <option value="lastWeek">Last week</option>
                <option value="thisMonth">This month</option>
                <option value="lastMonth">Last month</option>
                <option value="last90">Last 90 days</option>
                <option value="quarterToDate">Quarter to date</option>
                <option value="thisYear">This year</option>
                <option value="lastCalendarYear">Last calendar year</option>
              </select>

              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-28 sm:w-[110px] min-w-0"
                  value={deviceStartDate}
                  max={deviceEndDate || today}
                  onChange={(e) => {
                    setDeviceStartDate(e.target.value);
                    setDeviceFilter("");
                  }}
                  disabled={platformsLoading}
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-28 sm:w-[110px] min-w-0"
                  value={deviceEndDate}
                  min={deviceStartDate}
                  max={today}
                  onChange={(e) => {
                    setDeviceEndDate(e.target.value);
                    setDeviceFilter("");
                  }}
                  disabled={platformsLoading}
                />
              </div>
            </div>
          </div>

          <DeviceDistributionChart
            platforms={platformUsers}
            loading={platformsLoading}
            startDate={deviceStartDate}
            endDate={deviceEndDate}
          />
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
            {platformUsers && platformUsers.length > 0 ? (
              platformUsers.map((p) => {
                const total = p.totalUsers || 0;
                const pct = deviceTotalUsers
                  ? (total / deviceTotalUsers) * 100
                  : 0;
                const pctStr = `${(Math.round(pct * 10) / 10).toFixed(1)}%`;
                const isAndroid = /android/i.test(p.platform || "");
                const bgClass = isAndroid ? "bg-green-50" : "bg-blue-50";
                const textClass = isAndroid
                  ? "text-green-600"
                  : "text-blue-600";
                const Icon = isAndroid ? Smartphone : Monitor;
                return (
                  <div
                    key={p.platform}
                    className={`flex items-center justify-between p-3 ${bgClass} rounded-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${textClass}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                          {p.platform}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Intl.NumberFormat().format(total)} users
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${textClass}`}>
                      {pctStr}
                    </span>
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-400">--</p>
                      <p className="text-xs text-gray-400">-- users</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-400">--%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-400">--</p>
                      <p className="text-xs text-gray-400">-- users</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-400">--%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Feature Entry Details
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Feature Entry vs Completion
            </h2>
            <p className="text-sm text-gray-500">
              Step-by-step completion analysis for each feature
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            "AI Enhancer",
            "Background Remover",
            "Photo Editor",
            "Face Swap",
          ].map((feature, idx) => (
            <div key={idx} className="p-5 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">{feature}</h3>
              <FeatureCompletionChart featureName={feature} />
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Upload className="w-3 h-3 text-blue-600" />
                    <p className="text-xs text-gray-500">Opened</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">18,457</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Upload className="w-3 h-3 text-violet-600" />
                    <p className="text-xs text-gray-500">Uploaded</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">16,980</p>
                  <p className="text-xs text-green-600">92%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <p className="text-xs text-gray-500">Processed</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">15,840</p>
                  <p className="text-xs text-green-600">86%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Download className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-gray-500">Saved</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">12,450</p>
                  <p className="text-xs text-green-600">67%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      <br></br>

      {/* Live Status */}
      {Object.keys(liveStatus).length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Live Status
              </h2>
              <p className="text-sm text-gray-500">Real-time API performance</p>
            </div>
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {categoryDisplayName}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Success
                        </span>
                        <span className="font-semibold text-gray-900">
                          {categoryData.success_calls.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Failed
                        </span>
                        <span className="font-semibold text-gray-900">
                          {categoryData.failed_calls.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                          Success Rate
                        </span>
                        <span className="font-semibold text-green-600">
                          {categoryData.success_rate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-500" />
                          Avg Response
                        </span>
                        <span className="font-semibold text-gray-900">
                          {(categoryData.avg_response_time_ms / 1000).toFixed(
                            2
                          )}
                          s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTest;
