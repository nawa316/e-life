"use client";

import React, { useState } from "react";
import { formatMinutes } from "@/lib/utils";
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from "lucide-react";

interface VisualChartsProps {
  tasks: any[];
  categories: any[];
  selectedDate: string;
}

export function VisualCharts({ tasks, categories, selectedDate }: VisualChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<"trend" | "category" | "hourly">("trend");

  // 1. Calculate 7-day completion and planned trends
  const daysData = [];
  const [currY, currM, currD] = selectedDate.split("-").map(Number);
  const baseDate = new Date(currY, currM - 1, currD);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${dayStr}`;
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    const dayTasks = tasks.filter((t) => t.scheduledDate === dateStr);
    const completed = dayTasks.filter((t) => t.completed || t.status === "completed").length;
    const missed = dayTasks.filter((t) => t.status === "missed").length;
    const total = dayTasks.length;
    const totalMins = dayTasks
      .filter((t) => t.completed || t.status === "completed")
      .reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

    daysData.push({
      dateStr,
      dayLabel,
      total,
      completed,
      missed,
      totalMins,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  // 2. Category Pie / Donut Breakdown
  const totalTasksCount = tasks.length || 1;
  const categoryData = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat.id);
    const count = catTasks.length;
    const percentage = Math.round((count / totalTasksCount) * 100);
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color || "#3b82f6",
      count,
      percentage,
    };
  }).filter((c) => c.count > 0);

  // SVG Pie calculations
  let accumulatedAngle = 0;
  const pieSlices = categoryData.map((cat) => {
    const angle = (cat.count / (tasks.length || 1)) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    // Convert polar coordinates to Cartesian
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = (((startAngle + angle) - 90) * Math.PI) / 180;
    const r = 40;
    const cx = 50;
    const cy = 50;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData =
      angle >= 359.99
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      ...cat,
      pathData,
      angle,
    };
  });

  // 3. Hourly Focus Distribution (6:00 to 23:00)
  const hourlyData = [];
  for (let h = 6; h <= 22; h += 2) {
    const hourLabel = `${String(h).padStart(2, "0")}:00`;
    const tasksInSlot = tasks.filter((t) => {
      if (!t.scheduledDate || !t.startTime) return false;
      const startH = parseInt(t.startTime.split(":")[0], 10);
      return startH >= h && startH < h + 2;
    });

    hourlyData.push({
      hourLabel,
      count: tasksInSlot.length,
      completed: tasksInSlot.filter((t) => t.completed || t.status === "completed").length,
    });
  }

  const maxDailyPlanned = Math.max(1, ...daysData.map((d) => Math.max(d.total, d.completed)));
  const maxHourlyCount = Math.max(1, ...hourlyData.map((h) => h.count));

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
      {/* Chart Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/70">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Activity className="text-blue-500" size={17} />
            Visual Performance Analytics
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Interactive breakdown of trends, category distribution, and peak productivity hours.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveChartTab("trend")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === "trend"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingUp size={13} />
            <span>7-Day Trend</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab("category")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === "category"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <PieIcon size={13} />
            <span>Categories</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab("hourly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === "hourly"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 size={13} />
            <span>Peak Hours</span>
          </button>
        </div>
      </div>

      {/* Chart View Content */}
      <div className="pt-4 min-h-[220px]">
        {/* 1. 7-DAY TREND BAR / LINE CHART */}
        {activeChartTab === "trend" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
              <span>Past 7 Days Activity & Completion Rate</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-700" /> Planned
                </span>
              </div>
            </div>

            {/* Bar Chart Columns */}
            <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4 px-2 border-b border-zinc-800/80">
              {daysData.map((d) => {
                const isSelected = d.dateStr === selectedDate;
                const completedHeight = (d.completed / maxDailyPlanned) * 100;
                const totalHeight = (d.total / maxDailyPlanned) * 100;

                return (
                  <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-700 px-2 py-1 rounded-lg text-[10px] text-zinc-200 pointer-events-none z-20 whitespace-nowrap shadow-md">
                      {d.dayLabel}: {d.completed}/{d.total} tasks ({d.rate}%)
                    </div>

                    <div className="w-full max-w-[28px] h-full flex items-end justify-center gap-1">
                      {/* Completed Bar */}
                      <div
                        style={{ height: `${Math.max(4, completedHeight)}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isSelected ? "bg-emerald-400 shadow-sm shadow-emerald-500/30" : "bg-emerald-500/80 hover:bg-emerald-400"
                        }`}
                      />
                      {/* Total Planned Bar */}
                      {d.total > d.completed && (
                        <div
                          style={{ height: `${Math.max(4, totalHeight)}%` }}
                          className="w-1.5 bg-zinc-700 rounded-t-sm"
                        />
                      )}
                    </div>

                    <span className={`text-[11px] mt-2 font-medium ${isSelected ? "text-blue-400 font-bold" : "text-zinc-400"}`}>
                      {d.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. CATEGORY DONUT / PIE CHART */}
        {activeChartTab === "category" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Pie Representation */}
            <div className="md:col-span-5 flex items-center justify-center">
              {tasks.length === 0 ? (
                <p className="text-xs text-zinc-500">No tasks created yet.</p>
              ) : (
                <div className="relative w-44 h-44">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {pieSlices.map((slice) => (
                      <path
                        key={slice.id}
                        d={slice.pathData}
                        fill={slice.color}
                        className="transition-all hover:opacity-85 hover:scale-105 origin-center cursor-pointer"
                      >
                        <title>{`${slice.name}: ${slice.count} tasks (${slice.percentage}%)`}</title>
                      </path>
                    ))}
                    {/* Inner hole for donut style */}
                    <circle cx="50" cy="50" r="24" fill="#18181b" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-bold text-zinc-100">{tasks.length}</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Tasks</span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Legend & List */}
            <div className="md:col-span-7 space-y-2.5">
              {categoryData.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-zinc-950/60 border border-zinc-850">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-zinc-200">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono text-[11px]">{cat.count} tasks</span>
                    <span className="font-bold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded-md text-[10px]">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. HOURLY PEAK PRODUCTIVITY BAR CHART */}
        {activeChartTab === "hourly" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
              <span>Time Slot Distribution Across the Day</span>
              <span className="text-[11px] text-zinc-500">Scheduled Task Frequency</span>
            </div>

            <div className="grid grid-cols-9 gap-2 items-end h-36 pt-4 px-2 border-b border-zinc-800/80">
              {hourlyData.map((slot) => {
                const heightPct = (slot.count / maxHourlyCount) * 100;
                return (
                  <div key={slot.hourLabel} className="flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-700 px-2 py-0.5 rounded text-[10px] text-zinc-200 pointer-events-none z-20 whitespace-nowrap">
                      {slot.count} scheduled
                    </div>

                    <div className="w-full max-w-[24px] h-full flex items-end justify-center">
                      <div
                        style={{ height: `${Math.max(6, heightPct)}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          slot.count > 0 ? "bg-blue-500 hover:bg-blue-400 shadow-sm shadow-blue-500/20" : "bg-zinc-800/60"
                        }`}
                      />
                    </div>

                    <span className="text-[10px] text-zinc-400 mt-2 font-mono">
                      {slot.hourLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
