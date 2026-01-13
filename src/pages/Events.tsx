import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGA4EventsThunk,
  getGA4EventsOverTimeThunk,
} from "@/store/dashboard/thunk";
import { getDateRangeForPreset } from "@/helpers/dateRange.helper";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAX_SERIES = 8;

const formatNumber = (n: number) => {
  if (!n) return "0";
  return n.toLocaleString();
};

const Events = () => {
  const dispatch = useAppDispatch();
  const { ga4Events, ga4EventsOverTime } = useAppSelector((s) => s.Dashboard);

  const [preset, setPreset] = useState("last28");
  const [startDate, setStartDate] = useState(
    getDateRangeForPreset("last28").startDate
  );
  const [endDate, setEndDate] = useState(
    getDateRangeForPreset("last28").endDate
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(
    () => (Array.isArray(ga4Events?.data) ? ga4Events.data : []),
    [ga4Events]
  );

  /* ---------------- FETCH TABLE ---------------- */
  useEffect(() => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      page: String(page),
      limit: String(limit),
    });
    dispatch(getGA4EventsThunk(params.toString()));
  }, [dispatch, startDate, endDate, page, limit]);

  /* ---------------- AUTO SELECT FIRST EVENT ---------------- */
  useEffect(() => {
    if (!rows.length) return;

    setSelectedEvents((prev) => {
      const valid = prev.filter((e) => rows.some((r) => r.eventName === e));

      if (valid.length === 0) return [rows[0].eventName];
      return valid;
    });
  }, [rows]);

  /* ---------------- FETCH CHART DATA ---------------- */
  useEffect(() => {
    if (!selectedEvents.length) return;

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    selectedEvents.forEach((e) => params.append("eventNames", e));
    dispatch(getGA4EventsOverTimeThunk(params.toString()));
  }, [dispatch, selectedEvents, startDate, endDate]);

  /* ---------------- CHART DATA ---------------- */
  const visibleEvents = showAll
    ? selectedEvents
    : selectedEvents.slice(0, MAX_SERIES);

  const series = useMemo(() => {
    if (!ga4EventsOverTime?.data) return [];

    return visibleEvents.map((name) => ({
      name: name.replace(/_/g, " "),
      data: ga4EventsOverTime.data.map((d) => d.events[name] || 0),
    }));
  }, [ga4EventsOverTime, visibleEvents]);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.25, opacityTo: 0.05 },
    },
    xaxis: {
      categories: ga4EventsOverTime?.data?.map((d) => d.date) || [],
    },
    yaxis: {
      labels: {
        formatter: (v) => formatNumber(v),
      },
    },
    tooltip: { shared: true, intersect: false },
    legend: { position: "top", horizontalAlign: "left" },
  };

  const chartHeight = Math.min(520, Math.max(300, visibleEvents.length * 35));

  const allSelected = rows.length > 0 && selectedEvents.length === rows.length;

  /* ---------------- RENDER ---------------- */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            GA4 Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze your Google Analytics 4 events
          </p>
        </div>
        {selectedEvents.length > 0 && (
          <Badge variant="secondary" className="text-sm px-3 py-1.5">
            {selectedEvents.length} event
            {selectedEvents.length !== 1 ? "s" : ""} selected
          </Badge>
        )}
      </div>

      {/* FILTERS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={preset}
                onValueChange={(v) => {
                  setPreset(v);
                  if (v !== "custom") {
                    const r = getDateRangeForPreset(v);
                    setStartDate(r.startDate);
                    setEndDate(r.endDate);
                  }
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 days</SelectItem>
                  <SelectItem value="last28">Last 28 days</SelectItem>
                  <SelectItem value="last30">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {preset === "custom" && (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(d) => {
                  setStartDate(d);
                  setPreset("custom");
                }}
                onEndDateChange={(d) => {
                  setEndDate(d);
                  setPreset("custom");
                }}
              />
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select value={String(limit)} onValueChange={(v) => setLimit(+v)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CHART */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Events Over Time</CardTitle>
            {selectedEvents.length > MAX_SERIES && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `Show All (${selectedEvents.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-base font-medium">No events selected</p>
              <p className="text-sm">
                Select events from the table below to view the chart
              </p>
            </div>
          ) : (
            <Chart
              type="area"
              height={chartHeight}
              options={chartOptions}
              series={series}
            />
          )}
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Events Table</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-center w-12 bg-muted/50">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) =>
                          setSelectedEvents(
                            e.target.checked
                              ? rows.map((r) => r.eventName)
                              : [rows[0]?.eventName]
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground bg-muted/50">
                      Event
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground bg-muted/50">
                      Count
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground bg-muted/50">
                      Users
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground bg-muted/50">
                      Per User
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground bg-muted/50">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No events found
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const checked = selectedEvents.includes(row.eventName);

                      return (
                        <tr
                          key={row.eventName}
                          className={cn(
                            "transition-colors cursor-pointer",
                            checked
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() =>
                            setSelectedEvents((prev) => {
                              const updated = prev.includes(row.eventName)
                                ? prev.filter((e) => e !== row.eventName)
                                : [...prev, row.eventName];

                              return updated.length ? updated : [row.eventName];
                            })
                          }
                        >
                          <td
                            className="px-4 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedEvents((prev) => {
                                  if (e.target.checked) {
                                    return prev.includes(row.eventName)
                                      ? prev
                                      : [...prev, row.eventName];
                                  } else {
                                    const updated = prev.filter(
                                      (e) => e !== row.eventName
                                    );
                                    return updated.length > 0
                                      ? updated
                                      : [row.eventName];
                                  }
                                });
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {row.eventName}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {formatNumber(row.eventCount)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {formatNumber(row.totalUsers)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {Number(row.eventCountPerActiveUser).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">
                            ${Number(row.totalRevenue || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing page{" "}
          <span className="font-semibold text-foreground">{page}</span> of{" "}
          <span className="font-semibold text-foreground">
            {ga4Events?.pagination?.totalPages || 1}
          </span>
          {ga4Events?.pagination?.totalItems && (
            <span className="ml-2">
              ({ga4Events.pagination.totalItems} total events)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (ga4Events?.pagination?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Events;
