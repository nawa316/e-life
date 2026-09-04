"use client";

import React, { useState } from "react";
import { useSchedule } from "@/lib/store";
import { HabitCard } from "./HabitCard";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { HabitFrequency } from "@/lib/types";
import { Flame, Plus, Sparkles, Clock, Calendar } from "lucide-react";

const DAYS_OF_WEEK = [
  { id: 1, label: "M", full: "Monday" },
  { id: 2, label: "T", full: "Tuesday" },
  { id: 3, label: "W", full: "Wednesday" },
  { id: 4, label: "T", full: "Thursday" },
  { id: 5, label: "F", full: "Friday" },
  { id: 6, label: "S", full: "Saturday" },
  { id: 0, label: "S", full: "Sunday" },
];

export function HabitTracker() {
  const { habits, categories, addHabit, selectedDate } = useSchedule();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New habit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "health");
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [preferredTime, setPreferredTime] = useState("08:00");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

  const completedTodayCount = habits.filter((h) =>
    h.completedDates.includes(selectedDate)
  ).length;

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((d) => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleFrequencyChange = (newFreq: HabitFrequency) => {
    setFrequency(newFreq);
    if (newFreq === "daily") setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    else if (newFreq === "weekdays") setSelectedDays([1, 2, 3, 4, 5]);
    else if (newFreq === "weekends") setSelectedDays([0, 6]);
    else if (newFreq === "weekly") setSelectedDays([1]); // Monday default
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      targetMinutes: Number(targetMinutes) || 15,
      preferredTime: preferredTime || "08:00",
      frequency,
      daysOfWeek: selectedDays,
      icon: "Sparkles",
      color: "#3b82f6",
    });

    setTitle("");
    setDescription("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Flame className="text-amber-500 fill-amber-500" size={20} />
          <h3 className="font-semibold text-zinc-100 text-base">Habits & Routines</h3>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
            {completedTodayCount}/{habits.length} Done
          </span>
        </div>
        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={15} />
          New Habit
        </Button>
      </div>

      {/* Habit List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
        {habits.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            <Flame size={32} className="mb-2 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No habits tracked yet</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">
              Build daily momentum by creating recurring routines.
            </p>
          </div>
        ) : (
          habits.map((habit) => <HabitCard key={habit.id} habit={habit} />)
        )}
      </div>

      {/* Add Habit Modal with Day Selector and Preferred Time */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Habit & Routine"
        description="Choose your recurring days and preferred time of day."
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15m Morning Meditation, Workout, Read Books"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 1. SELECT RECURRING DAYS */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Select Active Days *</span>
              <span className="text-[11px] text-zinc-500">
                {selectedDays.length === 7
                  ? "Every day"
                  : `${selectedDays.length} day(s) selected`}
              </span>
            </label>

            {/* Quick Frequency Presets */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => handleFrequencyChange("daily")}
                className={`py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                  frequency === "daily"
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
                  frequency === "weekdays"
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
                  frequency === "weekends"
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
                  frequency === "custom"
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
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setFrequency("custom");
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
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
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
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
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
                onClick={() => setTargetMinutes(mins)}
                className={`flex-1 py-1 text-xs rounded-md border font-medium cursor-pointer transition-all ${
                  targetMinutes === mins
                    ? "bg-amber-500/30 border-amber-500 text-amber-400"
                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Habit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
