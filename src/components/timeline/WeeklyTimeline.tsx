"use client";

import React from "react";
import { useSchedule } from "@/lib/store";
import { timeToMinutes, formatMinutes } from "@/lib/utils";
import { Task } from "@/lib/types";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";

export function WeeklyTimeline() {
  const { selectedDate, setSelectedDate, tasks, categories, toggleTaskCompletion } = useSchedule();

  // Calculate the 7 days of the current week (Mon-Sun or Sun-Sat)
  const [y, m, d] = selectedDate.split("-").map(Number);
  const current = new Date(y, m - 1, d);
  const dayOfWeek = current.getDay(); // 0 = Sun, 1 = Mon ...
  const distanceToMonday = (dayOfWeek + 6) % 7; // Monday as start of week

  const monday = new Date(current);
  monday.setDate(monday.getDate() - distanceToMonday);

  const weekDays: { dateStr: string; dayName: string; dayNumber: number; isSelected: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(dayDate.getDate() + i);
    const yr = dayDate.getFullYear();
    const mo = String(dayDate.getMonth() + 1).padStart(2, "0");
    const da = String(dayDate.getDate()).padStart(2, "0");
    const dateStr = `${yr}-${mo}-${da}`;

    weekDays.push({
      dateStr,
      dayName: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: dayDate.getDate(),
      isSelected: dateStr === selectedDate,
    });
  }

  const shiftWeek = (deltaWeeks: number) => {
    const newDate = new Date(current);
    newDate.setDate(newDate.getDate() + deltaWeeks * 7);
    const yr = newDate.getFullYear();
    const mo = String(newDate.getMonth() + 1).padStart(2, "0");
    const da = String(newDate.getDate()).padStart(2, "0");
    setSelectedDate(`${yr}-${mo}-${da}`);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Week Header Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => shiftWeek(-1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2.5 py-1 text-xs font-semibold text-zinc-200">
              Week of {weekDays[0]?.dayName} {weekDays[0]?.dayNumber}
            </span>
            <button
              onClick={() => shiftWeek(1)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <span className="text-xs text-zinc-400">
          Click any column to jump to that day&apos;s 24h timeline
        </span>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-zinc-800/60 overflow-y-auto min-h-[600px]">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.scheduledDate === day.dateStr);
          const totalMins = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

          return (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex flex-col p-2.5 transition-colors cursor-pointer ${
                day.isSelected
                  ? "bg-blue-950/15 ring-1 ring-inset ring-blue-500/40"
                  : "hover:bg-zinc-900/40"
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col items-center pb-2 border-b border-zinc-800/60 mb-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase">
                  {day.dayName}
                </span>
                <span
                  className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mt-0.5 ${
                    day.isSelected
                      ? "bg-blue-600 text-white shadow-xs shadow-blue-500/30"
                      : "text-zinc-200"
                  }`}
                >
                  {day.dayNumber}
                </span>
                {totalMins > 0 && (
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    {formatMinutes(totalMins)}
                  </span>
                )}
              </div>

              {/* Day Task Pills */}
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {dayTasks.map((t) => {
                  const category = categories.find((c) => c.id === t.category);
                  const color = category?.color || "#3b82f6";
                  return (
                    <div
                      key={t.id}
                      className={`p-1.5 rounded-lg border text-left transition-all ${
                        t.completed
                          ? "bg-zinc-900/40 border-zinc-850 opacity-60 line-through text-zinc-500"
                          : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[11px] font-medium truncate flex-1">
                          {t.title}
                        </span>
                      </div>
                      {t.startTime && (
                        <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                          {t.startTime} ({t.estimatedMinutes}m)
                        </span>
                      )}
                    </div>
                  );
                })}

                {dayTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center p-2 opacity-30 text-[10px] text-zinc-600">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
