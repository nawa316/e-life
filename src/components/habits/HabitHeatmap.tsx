"use client";

import React from "react";
import { Habit } from "@/lib/types";

interface HabitHeatmapProps {
  habits: Habit[];
  daysToShow?: number;
}

export function HabitHeatmap({ habits, daysToShow = 21 }: HabitHeatmapProps) {
  // Generate date list for last `daysToShow` days
  const dates: { dateStr: string; dayNum: number; dayLabel: string }[] = [];
  const today = new Date();

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${dayStr}`;

    dates.push({
      dateStr,
      dayNum: d.getDate(),
      dayLabel: d.toLocaleDateString("en-US", { weekday: "narrow" }),
    });
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-zinc-200">Habit Completion Consistency (3-Week Heatmap)</h4>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-zinc-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700/60" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      <div className="space-y-2">
        {habits.slice(0, 4).map((habit) => (
          <div key={habit.id} className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-300 w-28 truncate shrink-0" title={habit.title}>
              {habit.title}
            </span>

            <div className="flex items-center gap-1 flex-1 overflow-x-auto pb-0.5">
              {dates.map((d) => {
                const isCompleted = habit.completedDates.includes(d.dateStr);
                return (
                  <div
                    key={d.dateStr}
                    title={`${habit.title} on ${d.dateStr}: ${isCompleted ? "Completed" : "Missed"}`}
                    className={`w-3.5 h-3.5 rounded-xs shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 shadow-xs shadow-emerald-500/30"
                        : "bg-zinc-800/80 hover:bg-zinc-700/80"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
