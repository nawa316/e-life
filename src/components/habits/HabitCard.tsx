"use client";

import React from "react";
import { Habit } from "@/lib/types";
import { useSchedule } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";
import { Flame, Check, Plus, Calendar, Trash2, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const { selectedDate, toggleHabitCompletion, scheduleHabitForToday, deleteHabit, categories } = useSchedule();
  
  const isCompletedToday = habit.completedDates.includes(selectedDate);
  const category = categories.find((c) => c.id === habit.category);

  // Frequency label helper
  const frequencyLabel = {
    daily: "Daily",
    weekdays: "Weekdays",
    weekends: "Weekends",
    weekly: "Weekly",
  }[habit.frequency];

  return (
    <div
      className={`group relative bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-3.5 transition-all duration-150 ${
        isCompletedToday ? "border-emerald-500/30 bg-emerald-950/10" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Check Button */}
          <button
            onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
            className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              isCompletedToday
                ? "bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/30"
                : "border-zinc-700 hover:border-blue-400 text-transparent hover:text-zinc-400 bg-zinc-800/50"
            }`}
          >
            <Check size={16} className={isCompletedToday ? "stroke-[2.5]" : ""} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className={`text-sm font-semibold text-zinc-100 truncate ${isCompletedToday ? "text-zinc-300" : ""}`}>
                {habit.title}
              </h4>
            </div>

            {habit.description && (
              <p className="text-xs text-zinc-400 line-clamp-1 mb-2">
                {habit.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Streak Badge */}
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                <Flame size={13} className="text-amber-500 fill-amber-500" />
                {habit.streak} day streak
              </span>

              {/* Frequency */}
              <span className="text-[11px] bg-zinc-800/80 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700/50">
                {frequencyLabel}
              </span>

              {/* Target duration */}
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Clock size={12} />
                {formatMinutes(habit.targetMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => scheduleHabitForToday(habit.id)}
            className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
            title="Schedule onto today's timeline"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => deleteHabit(habit.id)}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
            title="Delete habit"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
