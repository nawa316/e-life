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
  const { tasks, habits, categories, selectedDate, resetToDefaults, updateTask, deleteTask } = useSchedule();

  const todayTasks = tasks.filter((t) => t.scheduledDate === selectedDate);
  const completedToday = todayTasks.filter((t) => t.completed || t.status === "completed");
  const missedToday = todayTasks.filter((t) => t.status === "missed");
  const totalPlannedMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalCompletedMinutes = completedToday.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalMissedMinutes = missedToday.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const allMissedTasks = tasks.filter((t) => t.status === "missed");
  const completionPct = todayTasks.length > 0
    ? Math.round((completedToday.length / todayTasks.length) * 100)
    : 0;

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const backlogTasks = tasks.filter((t) => !t.scheduledDate && t.status !== "missed");
  const totalCompletedAllTime = tasks.filter((t) => t.completed || t.status === "completed").length;

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat.id);
    const completed = catTasks.filter((t) => t.completed || t.status === "completed").length;
    const missed = catTasks.filter((t) => t.status === "missed").length;
    const totalMinutes = catTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    return {
      ...cat,
      count: catTasks.length,
      completed,
      missed,
      totalMinutes,
    };
  });

  const handleRestoreTask = (taskId: string) => {
    updateTask(taskId, { status: "pending", completed: false });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Permanently remove this missed task?")) {
      deleteTask(taskId);
    }
  };

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
            Overview of your daily focus, completed vs missed activities, habit consistency, and backlog metrics.
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
        {/* Daily Completion & Missed */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Daily Completion</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-100">{completionPct}%</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0}%` }}
                title={`${completedToday.length} completed`}
              />
              <div
                className="bg-red-500/80 h-full transition-all duration-300"
                style={{ width: `${todayTasks.length > 0 ? (missedToday.length / todayTasks.length) * 100 : 0}%` }}
                title={`${missedToday.length} missed`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
              <span className="text-emerald-400">{completedToday.length} Done</span>
              <span className="text-red-400 font-medium">{missedToday.length} Missed</span>
              <span>{todayTasks.length} Total</span>
            </div>
          </div>
        </div>

        {/* Active Habit Streaks */}
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

        {/* Focus Time Today (Done vs Missed) */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Focus Time Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock size={17} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-100">{formatMinutes(totalCompletedMinutes)}</div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-3">
              <span>Planned: {formatMinutes(totalPlannedMinutes)}</span>
              {totalMissedMinutes > 0 && (
                <span className="text-red-400/90 font-medium">Missed: {formatMinutes(totalMissedMinutes)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Missed & Backlog Health */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Missed Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Layers size={17} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-400">{allMissedTasks.length} <span className="text-sm font-normal text-zinc-500">missed</span></div>
            <p className="text-[11px] text-zinc-500 mt-3">
              {totalCompletedAllTime} completed • {backlogTasks.length} in backlog
            </p>
          </div>
        </div>
      </div>

      {/* Missed Tasks Manager Section (Restore or Delete) */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-zinc-200">Missed Activities & Tasks</h3>
            <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
              {allMissedTasks.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 hidden sm:block">
            You can restore any missed task back to active status or delete it.
          </p>
        </div>

        {allMissedTasks.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-zinc-800/80 rounded-xl">
            <p className="text-xs text-zinc-400">Great job! You have zero missed tasks.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {allMissedTasks.map((t) => {
              const cat = categories.find((c) => c.id === t.category);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 bg-zinc-950/70 border border-red-500/25 rounded-xl text-xs gap-3 hover:border-red-500/40 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat?.color || "#ef4444" }}
                    />
                    <div className="truncate">
                      <p className="font-semibold text-zinc-200 line-through truncate">{t.title}</p>
                      <p className="text-[10px] text-zinc-500">
                        {t.scheduledDate || "Backlog"} {t.startTime ? `• ${t.startTime}` : ""} • {formatMinutes(t.estimatedMinutes || 30)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreTask(t.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg cursor-pointer transition-colors"
                      title="Restore task to active"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg cursor-pointer transition-colors"
                      title="Delete missed task"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                    {cat.count} tasks ({cat.completed} done, {cat.missed} missed)
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
