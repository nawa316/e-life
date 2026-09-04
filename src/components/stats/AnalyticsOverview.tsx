"use client";

import React from "react";
import { useSchedule } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";
import { CheckCircle2, Flame, Clock, Calendar, BarChart3, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

export function AnalyticsOverview() {
  const { tasks, habits, selectedDate, resetToDefaults } = useSchedule();

  const todayTasks = tasks.filter((t) => t.scheduledDate === selectedDate);
  const completedTasks = todayTasks.filter((t) => t.completed);
  const totalPlannedMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalCompletedMinutes = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const completionPct = todayTasks.length > 0
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="text-xs text-zinc-400 font-medium">Daily Completion</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-zinc-100">{completionPct}%</span>
            <span className="text-[11px] text-zinc-500">
              ({completedTasks.length}/{todayTasks.length})
            </span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Flame size={20} className="fill-amber-500/20" />
        </div>
        <div>
          <p className="text-xs text-zinc-400 font-medium">Total Streaks</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-zinc-100">{totalStreak}</span>
            <span className="text-[11px] text-zinc-500">days active</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-xs text-zinc-400 font-medium">Focus Time Today</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-zinc-100">
              {formatMinutes(totalCompletedMinutes)}
            </span>
            <span className="text-[11px] text-zinc-500">/ {formatMinutes(totalPlannedMinutes)}</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Backlog Health</p>
            <p className="text-sm font-semibold text-zinc-200 mt-0.5">
              {tasks.filter((t) => !t.scheduledDate).length} pending
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          title="Reset to sample demo data"
        >
          <RotateCcw size={13} />
        </Button>
      </div>
    </div>
  );
}
