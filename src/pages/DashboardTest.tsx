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

// amCharts 5 imports
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// Revenue Trend Chart Component
const RevenueTrendChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
      })
    );

    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, { behavior: "zoomX" })
    );
    cursor.lineY.set("visible", false);

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0,
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fontSize: 11,
      fill: am5.color("#6b7280"),
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    yAxis.get("renderer").labels.template.setAll({
      fontSize: 11,
      fill: am5.color("#6b7280"),
    });

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Revenue",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "${valueY}",
          pointerOrientation: "horizontal",
        }),
      })
    );

    series.fills.template.setAll({
      fillOpacity: 0.2,
      visible: true,
      fill: am5.color("#10b981"),
    });

    series.strokes.template.setAll({
      strokeWidth: 3,
      stroke: am5.color("#10b981"),
    });

    // Generate sample data
    const data = [];
    let value = 200;
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      value += Math.round((Math.random() - 0.45) * 50);
      data.push({ date: date.getTime(), value: Math.max(100, value) });
    }

    series.data.setAll(data);
    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "260px" }} />;
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

// Horizontal Bar Chart for Feature Performance
const FeaturePerformanceChart: React.FC = () => {
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

    const data = [
      { feature: "Faceswap", uses: 1330, color: am5.color("#3b82f6") },
      { feature: "AI Enhancer", uses: 18457, color: am5.color("#8b5cf6") },
      {
        feature: "Background Remover",
        uses: 8920,
        color: am5.color("#10b981"),
      },
      { feature: "Photo Editor", uses: 12450, color: am5.color("#f59e0b") },
    ];

    yAxis.data.setAll(data);
    series.data.setAll(data);

    data.forEach((item, index) => {
      const column = series.dataItems[index].get("graphics");
      if (column) {
        column.set("fill", item.color);
      }
    });

    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "240px" }} />;
};

// World Map Chart for Geography
const WorldMapChart: React.FC = () => {
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
      tooltipText: "{name}: {value} users",
      interactive: true,
    });

    polygonSeries.set("heatRules", [
      {
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color("#e0f2fe"),
        max: am5.color("#0c4a6e"),
        key: "fill",
      },
    ]);

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color("#3b82f6"),
    });

    polygonSeries.data.setAll([
      { id: "US", value: 15420 },
      { id: "GB", value: 8650 },
      { id: "IN", value: 12300 },
      { id: "DE", value: 6800 },
      { id: "BR", value: 4250 },
      { id: "CA", value: 5320 },
      { id: "AU", value: 4280 },
      { id: "FR", value: 5380 },
      { id: "JP", value: 7420 },
      { id: "KR", value: 3180 },
      { id: "MX", value: 2840 },
      { id: "ES", value: 3920 },
      { id: "IT", value: 3560 },
      { id: "NL", value: 2980 },
    ]);

    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

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

// Device Distribution Pie Chart
const DeviceDistributionChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.horizontalLayout,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
      })
    );

    series.slices.template.setAll({
      strokeOpacity: 0,
      tooltipText:
        "{category}: {value} ({valuePercentTotal.formatNumber('0.0')}%)",
    });

    series.labels.template.setAll({
      fontSize: 12,
      text: "{category}\n{value}",
    });

    const data = [
      { category: "Android", value: 18450, color: am5.color("#34d399") },
      { category: "iOS", value: 14956, color: am5.color("#3b82f6") },
    ];

    series.data.setAll(data);

    data.forEach((item, index) => {
      const slice = series.dataItems[index].get("slice");
      if (slice) {
        slice.set("fill", item.color);
      }
    });

    series.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "200px" }} />;
};

// App Version Distribution Chart
const AppVersionChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "version",
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
        valueYField: "users",
        categoryXField: "version",
      })
    );

    series.columns.template.setAll({
      tooltipText: "v{version}: {users} users",
      fill: am5.color("#3b82f6"),
      strokeOpacity: 0,
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
    });

    const data = [
      { version: "3.2.1", users: 18420 },
      { version: "3.2.0", users: 8650 },
      { version: "3.1.9", users: 4280 },
      { version: "3.1.8", users: 2056 },
    ];

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "200px" }} />;
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

const DashboardTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, liveStatus, liveStatusLoading } = useAppSelector(
    (state) => state.Dashboard
  );

  const [filter, setFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    dispatch(getDashboardStatsThunk());
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

      {/* Secondary Stats Row */}
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Insights */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Revenue Insights
              </h2>
              <p className="text-sm text-gray-500">
                Last 30 days revenue trend
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
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm text-gray-500">Revenue Trend</span>
              <span className="ml-auto text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                Last 7 Days →
              </span>
            </div>
          </div>
          <RevenueTrendChart />
        </div>

        {/* Feature Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
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
        </div>
      </div>

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
            <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg transition-colors">
              AI Enhancer →
            </button>
          </div>
          <FeaturePerformanceChart />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Total Uses</span>
                <span className="text-sm font-semibold text-gray-900">
                  16,980
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "92%" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">92% usage rate</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Paywall Hits</span>
                <span className="text-sm font-semibold text-gray-900">
                  16,980
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: "82%" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">82% conversion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Growth & Total Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Subscription Growth */}
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

        {/* Total Views */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Total Views
              </h2>
              <p className="text-sm text-gray-500">
                Daily page views and engagement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">
                52,480 views
              </span>
            </div>
          </div>
          <TotalViewsChart />
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Avg. Session</p>
              <p className="text-xl font-bold text-gray-900">4m 32s</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Bounce Rate</p>
              <p className="text-xl font-bold text-gray-900">32.4%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pages/Session</p>
              <p className="text-xl font-bold text-gray-900">3.8</p>
            </div>
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
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                73,554 users
              </span>
            </div>
          </div>
          <WorldMapChart />
          <div className="grid grid-cols-5 gap-3 mt-6">
            {[
              { country: "🇺🇸 USA", users: "15.4K", revenue: "$1,500" },
              { country: "🇮🇳 India", users: "12.3K", revenue: "$850" },
              { country: "🇬🇧 UK", users: "8.6K", revenue: "$920" },
              { country: "🇯🇵 Japan", users: "7.4K", revenue: "$1,120" },
              { country: "🇩🇪 Germany", users: "6.8K", revenue: "$740" },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {item.country}
                </p>
                <p className="text-sm font-bold text-blue-900">{item.users}</p>
                <p className="text-xs text-green-600 mt-1">{item.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Device Distribution
              </h2>
              <p className="text-sm text-gray-500">Platform breakdown</p>
            </div>
          </div>
          <DeviceDistributionChart />
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Android</p>
                  <p className="text-xs text-gray-500">18,450 users</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-600">55.2%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">iOS</p>
                  <p className="text-xs text-gray-500">14,956 users</p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-600">44.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Version & Feature Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* App Version Distribution */}
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
            <span className="px-3 py-1.5 bg-blue-50 text-xs font-medium text-blue-700 rounded-lg">
              Latest: v3.2.1
            </span>
          </div>
          <AppVersionChart />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-900">
                  Crash Rate
                </span>
              </div>
              <p className="text-2xl font-bold text-red-900">0.08%</p>
              <p className="text-xs text-gray-600 mt-1">
                v3.2.1: 0.05% | v3.2.0: 0.12%
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-900">
                  Failure Rate
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-900">1.2%</p>
              <p className="text-xs text-gray-600 mt-1">
                Android: 1.5% | iOS: 0.9%
              </p>
            </div>
          </div>
        </div>

        {/* Feature Completion Rates */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Feature Completion Rates
              </h2>
              <p className="text-sm text-gray-500">
                Entry to completion funnel
              </p>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { name: "AI Enhancer", completion: 67.4 },
              { name: "Background Remover", completion: 72.3 },
              { name: "Photo Editor", completion: 81.2 },
              { name: "Face Swap", completion: 58.9 },
            ].map((feature, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.name}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {feature.completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-violet-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${feature.completion}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Opened: {(18457 * (idx + 1) * 0.7).toFixed(0)}</span>
                  <span>
                    Completed:{" "}
                    {(
                      18457 *
                      (idx + 1) *
                      0.7 *
                      (feature.completion / 100)
                    ).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Entry Details */}
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
      </div>

      {/* AI Cost & Performance */}
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
      </div>

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
