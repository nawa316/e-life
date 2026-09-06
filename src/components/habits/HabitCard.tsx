"use client";

import React, { useState } from "react";
import { Habit, HabitFrequency } from "@/lib/types";
import { useSchedule } from "@/lib/store";
import { formatMinutes } from "@/lib/utils";
import { Flame, Check, Trash2, Clock, CalendarPlus, Pencil } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface HabitCardProps {
  habit: Habit;
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_OF_WEEK = [
  { id: 1, label: "M", full: "Monday" },
  { id: 2, label: "T", full: "Tuesday" },
  { id: 3, label: "W", full: "Wednesday" },
  { id: 4, label: "T", full: "Thursday" },
  { id: 5, label: "F", full: "Friday" },
  { id: 6, label: "S", full: "Saturday" },
  { id: 0, label: "S", full: "Sunday" },
];

export function HabitCard({ habit }: HabitCardProps) {
  const { selectedDate, toggleHabitCompletion, addTask, updateHabit, deleteHabit, categories } = useSchedule();
  
  // Schedule Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(selectedDate);
  const [scheduleTime, setScheduleTime] = useState(habit.preferredTime || "08:00");
  const [duration, setDuration] = useState(habit.targetMinutes || 15);

  // Edit Habit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(habit.title);
  const [editDescription, setEditDescription] = useState(habit.description || "");
  const [editCategory, setEditCategory] = useState(habit.category || categories[0]?.id || "health");
  const [editTargetMinutes, setEditTargetMinutes] = useState(habit.targetMinutes || 15);
  const [editPreferredTime, setEditPreferredTime] = useState(habit.preferredTime || "08:00");
  const [editFrequency, setEditFrequency] = useState<HabitFrequency>(habit.frequency || "daily");
  const [editDaysOfWeek, setEditDaysOfWeek] = useState<number[]>(
    habit.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
  );
  const [editStreak, setEditStreak] = useState(habit.streak || 0);

  const isCompletedToday = habit.completedDates.includes(selectedDate);
  const category = categories.find((c) => c.id === habit.category);

  // Sync state when opening edit modal
  const openEditModal = () => {
    setEditTitle(habit.title);
    setEditDescription(habit.description || "");
    setEditCategory(habit.category || categories[0]?.id || "health");
    setEditTargetMinutes(habit.targetMinutes || 15);
    setEditPreferredTime(habit.preferredTime || "08:00");
    setEditFrequency(habit.frequency || "daily");
    setEditDaysOfWeek(habit.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
    setEditStreak(habit.streak || 0);
    setIsEditModalOpen(true);
  };

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

  const toggleDay = (dayId: number) => {
    setEditDaysOfWeek((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleFrequencyChange = (newFreq: HabitFrequency) => {
    setEditFrequency(newFreq);
    if (newFreq === "daily") setEditDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    else if (newFreq === "weekdays") setEditDaysOfWeek([1, 2, 3, 4, 5]);
    else if (newFreq === "weekends") setEditDaysOfWeek([0, 6]);
    else if (newFreq === "weekly") setEditDaysOfWeek([1]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    updateHabit(habit.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      category: editCategory,
      targetMinutes: Number(editTargetMinutes) || 15,
      preferredTime: editPreferredTime,
      frequency: editFrequency,
      daysOfWeek: editDaysOfWeek,
      streak: Number(editStreak) || 0,
    });

    setIsEditModalOpen(false);
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleHabitCompletion(habit.id, selectedDate);
              }}
              className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                isCompletedToday
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/30"
                  : "border-zinc-700 hover:border-amber-400 text-transparent hover:text-zinc-400 bg-zinc-800/50"
              }`}
            >
              <Check size={16} className={isCompletedToday ? "stroke-[2.5]" : ""} />
            </button>

            {/* Habit Details (Click to Edit) */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={openEditModal}
              title="Click to edit habit"
            >
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

          {/* Action icons: Always accessible on mobile, visible on desktop hover */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
            {/* 1. Schedule on Calendar Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Schedule habit on calendar"
            >
              <CalendarPlus size={14} />
              <span className="hidden xs:inline">Schedule</span>
            </button>

            {/* 2. Edit Habit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal();
              }}
              className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              title="Edit habit"
            >
              <Pencil size={14} />
            </button>

            {/* 3. Delete Habit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete habit "${habit.title}" and its schedule instances?`)) {
                  deleteHabit(habit.id);
                }
              }}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              title="Delete habit"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Habit & Routine"
        description="Update your habit schedule, recurring days, duration, or streak."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15m Morning Meditation, Workout, Read Books"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description / Goal (Optional)
            </label>
            <input
              type="text"
              placeholder="Why this routine matters to you"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 1. SELECT RECURRING DAYS */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Select Active Days *</span>
              <span className="text-[11px] text-zinc-500">
                {editDaysOfWeek.length === 7
                  ? "Every day"
                  : `${editDaysOfWeek.length} day(s) selected`}
              </span>
            </label>

            {/* Quick Frequency Presets */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => handleFrequencyChange("daily")}
                className={`py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                  editFrequency === "daily"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyChange("weekdays")}
                className={`py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                  editFrequency === "weekdays"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyChange("weekends")}
                className={`py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                  editFrequency === "weekends"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Weekends
              </button>
              <button
                type="button"
                onClick={() => handleFrequencyChange("custom")}
                className={`py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                  editFrequency === "custom"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Individual Day of Week Pill Buttons */}
            <div className="flex items-center justify-between gap-1.5 p-2 bg-zinc-950/60 border border-zinc-800 rounded-xl">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = editDaysOfWeek.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setEditFrequency("custom");
                      toggleDay(d.id);
                    }}
                    title={d.full}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 shadow-xs shadow-amber-500/30"
                        : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850"
                    }`}
                  >
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PREFERRED TIME & TARGET DURATION */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <Clock size={12} className="text-amber-400" /> Preferred Time *
              </label>
              <input
                type="time"
                required
                value={editPreferredTime}
                onChange={(e) => setEditPreferredTime(e.target.value)}
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
                value={editTargetMinutes}
                onChange={(e) => setEditTargetMinutes(Number(e.target.value))}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick preset durations */}
          <div className="flex gap-2">
            {[10, 15, 20, 30, 45, 60].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setEditTargetMinutes(mins)}
                className={`flex-1 py-1 text-xs rounded-md border font-medium cursor-pointer transition-all ${
                  editTargetMinutes === mins
                    ? "bg-amber-500/30 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Category Selector & Streak Adjustment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                <Flame size={12} className="text-amber-400" /> Current Streak
              </label>
              <input
                type="number"
                min={0}
                max={9999}
                value={editStreak}
                onChange={(e) => setEditStreak(Number(e.target.value))}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm(`Delete habit "${habit.title}" and its schedule instances?`)) {
                  deleteHabit(habit.id);
                  setIsEditModalOpen(false);
                }
              }}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </Modal>

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
