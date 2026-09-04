"use client";

import React from "react";
import { useSchedule } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";
import {
  CheckCircle2,
  Flame,
  Clock,
  BarChart3,
  RotateCcw,
  TrendingUp,
  Target,
  Layers,
  CalendarCheck,
  Calendar,
} from "lucide-react";
import { Button } from "../ui/Button";

export function AnalyticsView() {
  const { tasks, habits, categories, selectedDate, resetToDefaults } = useSchedule();

  const todayTasks = tasks.filter((t) => t.scheduledDate === selectedDate);
  const completedToday = todayTasks.filter((t) => t.completed);
  const totalPlannedMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalCompletedMinutes = completedToday.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const completionPct = todayTasks.length > 0
    ? Math.round((completedToday.length / todayTasks.length) * 100)
    : 0;

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const backlogTasks = tasks.filter((t) => !t.scheduledDate);
  const totalCompletedAllTime = tasks.filter((t) => t.completed).length;

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat.id);
    const completed = catTasks.filter((t) => t.completed).length;
    const totalMinutes = catTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    return {
      ...cat,
      count: catTasks.length,
      completed,
      totalMinutes,
    };
  });

  return (
    <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 backdrop-blur-md h-[760px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={22} />
            <h2 className="text-lg font-bold text-zinc-100">Performance & Statistics</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Overview of your daily focus, streaks, backlog distribution, and task completion metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="self-start sm:self-auto text-xs"
        >
          <RotateCcw size={13} />
          Reset Demo Data
        </Button>
      </div>

      {/* 4 Main Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Daily Completion</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-100">{completionPct}%</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              {completedToday.length} of {todayTasks.length} tasks finished today
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Active Habit Streaks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame size={17} className="fill-amber-500/20" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-100">{totalStreak} <span className="text-sm font-normal text-zinc-500">days</span></div>
            <p className="text-[11px] text-zinc-500 mt-3">
              Across {habits.length} active recurring routines
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Focus Time Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-100">{formatMinutes(totalCompletedMinutes)}</div>
            <p className="text-[11px] text-zinc-500 mt-3">
              Planned: {formatMinutes(totalPlannedMinutes)}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Backlog Health</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers size={17} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-100">{backlogTasks.length} <span className="text-sm font-normal text-zinc-500">pending</span></div>
            <p className="text-[11px] text-zinc-500 mt-3">
              {totalCompletedAllTime} total tasks accomplished
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Habit Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Category Distribution */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Category Breakdown</h3>
          </div>

          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-zinc-300">{cat.name}</span>
                  </div>
                  <span className="text-zinc-500 font-mono">
                    {cat.count} tasks ({formatMinutes(cat.totalMinutes)})
                  </span>
                </div>
                <div className="w-full bg-zinc-800/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: cat.color,
                      width: `${tasks.length > 0 ? (cat.count / tasks.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Summary */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={18} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Habit Streaks Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8">No habits tracked yet.</p>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Flame size={14} className="fill-amber-500" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-zinc-200 truncate">{habit.title}</p>
                      <p className="text-[10px] text-zinc-500">
                        {habit.frequency} • {formatMinutes(habit.targetMinutes)}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
                    {habit.streak} days
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
