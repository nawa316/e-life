"use client";

import React, { useState } from "react";
import { Habit } from "@/lib/types";
import { useSchedule } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";
import { Flame, Check, Plus, Calendar, Trash2, Clock, CalendarPlus } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface HabitCardProps {
  habit: Habit;
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HabitCard({ habit }: HabitCardProps) {
  const { selectedDate, toggleHabitCompletion, addTask, deleteHabit, categories } = useSchedule();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(selectedDate);
  const [scheduleTime, setScheduleTime] = useState(habit.preferredTime || "08:00");
  const [duration, setDuration] = useState(habit.targetMinutes || 15);

  const isCompletedToday = habit.completedDates.includes(selectedDate);
  const category = categories.find((c) => c.id === habit.category);

  // Format active days description
  const getDaysSummary = () => {
    if (!habit.daysOfWeek || habit.daysOfWeek.length === 7) return "Every day";
    if (habit.daysOfWeek.length === 5 && [1, 2, 3, 4, 5].every((d) => habit.daysOfWeek?.includes(d))) {
      return "Mon - Fri";
    }
    if (habit.daysOfWeek.length === 2 && [0, 6].every((d) => habit.daysOfWeek?.includes(d))) {
      return "Sat - Sun";
    }
    return habit.daysOfWeek.map((d) => DAYS_SHORT[d]).join(", ");
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title: habit.title,
      description: habit.description || "Recurring habit session",
      category: habit.category,
      priority: "medium",
      estimatedMinutes: Number(duration) || 15,
      completed: habit.completedDates.includes(scheduleDate),
      scheduledDate: scheduleDate,
      startTime: scheduleTime,
      isHabitInstance: true,
      habitId: habit.id,
    });
    setIsScheduleModalOpen(false);
  };

  return (
    <>
      <div
        className={`group relative bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-3 sm:p-3.5 transition-all duration-150 ${
          isCompletedToday ? "border-emerald-500/30 bg-emerald-950/10" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Check Button */}
            <button
              onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
              className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                isCompletedToday
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/30"
                  : "border-zinc-700 hover:border-amber-400 text-transparent hover:text-zinc-400 bg-zinc-800/50"
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
                  {habit.streak} streak
                </span>

                {/* Preferred time & days badge */}
                {habit.preferredTime && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/50">
                    <Clock size={11} className="text-amber-400" />
                    {habit.preferredTime}
                  </span>
                )}

                {/* Days of Week summary */}
                <span className="text-[11px] bg-zinc-800/80 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700/50">
                  {getDaysSummary()}
                </span>

                {/* Target duration */}
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  {formatMinutes(habit.targetMinutes)}
                </span>
              </div>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Schedule habit on calendar"
            >
              <CalendarPlus size={14} />
              <span className="hidden xs:inline">Schedule</span>
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

      {/* Schedule Habit into Calendar Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Habit into Calendar"
        description={`Place habit "${habit.title}" onto your daily schedule.`}
      >
        <form onSubmit={handleConfirmSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Start Time (Preferred: {habit.preferredTime || "08:00"})
              </label>
              <input
                type="time"
                required
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Target Duration (mins)
              </label>
              <input
                type="number"
                min={5}
                max={240}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick preset durations */}
          <div className="flex gap-2 pt-1">
            {[10, 15, 20, 30, 45, 60].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setDuration(mins)}
                className={`flex-1 py-1 text-xs rounded-md border font-medium cursor-pointer transition-all ${
                  duration === mins
                    ? "bg-amber-500/30 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <CalendarPlus size={14} />
              Schedule Habit
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
