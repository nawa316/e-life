"use client";

import React, { useState } from "react";
import { useSchedule } from "@/lib/store";
import { HabitCard } from "./HabitCard";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { HabitFrequency } from "@/lib/types";
import { Flame, Plus, Sparkles, CheckCircle2 } from "lucide-react";

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

  const completedTodayCount = habits.filter((h) =>
    h.completedDates.includes(selectedDate)
  ).length;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      targetMinutes: Number(targetMinutes) || 15,
      preferredTime,
      frequency,
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

      {/* Add Habit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Habit & Routine"
        description="Track streaks and recurring activities seamlessly in your daily schedule."
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 10min Meditation, Morning Run, Read 15 pages"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description / Motivation (Optional)
            </label>
            <input
              type="text"
              placeholder="Why this habit matters to your life"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends (Sat-Sun)</option>
                <option value="weekly">Once a Week</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Target Duration (mins)
              </label>
              <input
                type="number"
                min={5}
                max={240}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
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
