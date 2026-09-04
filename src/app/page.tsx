"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ScheduleProvider, useSchedule } from "@/lib/store";
import { DayTimeline } from "@/components/timeline/DayTimeline";
import { BacklogDrawer } from "@/components/backlog/BacklogDrawer";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";
import { AnalyticsOverview } from "@/components/stats/AnalyticsOverview";
import { PomodoroTimer } from "@/components/timeline/PomodoroTimer";
import { ExportModal } from "@/components/ui/ExportModal";
import { Task } from "@/lib/types";
import { Sparkles, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

function ScheduleApp() {
  const { selectedDate, scheduleTask, habits } = useSchedule();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"planner" | "habits">("planner");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.task) {
      setActiveTask(data.task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskData = active.data.current?.task as Task;
    if (!taskData) return;

    if (over.id === "timeline-droppable") {
      const currentStart = taskData.startTime || "09:00";
      scheduleTask(
        taskData.id,
        selectedDate,
        currentStart,
        taskData.estimatedMinutes || 30
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles size={19} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">e-life</h1>
                <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.2 rounded-full">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Daily Interactive Scheduler, Backlog, Habits & Pomodoro Focus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs on small screens */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 lg:hidden">
              <button
                onClick={() => setActiveTab("planner")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "planner"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Schedule & Backlog
              </button>
              <button
                onClick={() => setActiveTab("habits")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "habits"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Habits & Streaks
              </button>
            </div>

            {/* Sync / Export Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExportOpen(true)}
              className="hidden sm:inline-flex"
            >
              <DownloadCloud size={14} />
              Sync & Backup
            </Button>

            <a
              href="https://github.com/nawa316/e-life"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 space-y-5">
          {/* Top Analytics Stats */}
          <AnalyticsOverview />

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Backlog Activity Drawer + Focus Pomodoro */}
            <div
              className={`lg:col-span-4 space-y-4 ${
                activeTab === "habits" ? "hidden lg:block" : "block"
              }`}
            >
              <div className="h-[520px]">
                <BacklogDrawer />
              </div>
              <PomodoroTimer />
            </div>

            {/* Center Column: Interactive Day Timeline */}
            <div
              className={`lg:col-span-5 h-[760px] ${
                activeTab === "habits" ? "hidden lg:block" : "block"
              }`}
            >
              <DayTimeline startHour={6} endHour={23} />
            </div>

            {/* Right Column: Habit Tracker & Consistency Heatmap */}
            <div
              className={`lg:col-span-3 space-y-4 ${
                activeTab === "planner" ? "hidden lg:block" : "block"
              }`}
            >
              <div className="h-[520px]">
                <HabitTracker />
              </div>
              <HabitHeatmap habits={habits} />
            </div>
          </div>
        </main>

        {/* Sync & Export Modal */}
        <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      </div>

      {/* Drag Overlay Preview */}
      <DragOverlay>
        {activeTask ? (
          <div className="bg-zinc-900 border border-blue-500/80 rounded-xl p-3 shadow-2xl opacity-90 w-64 pointer-events-none scale-105">
            <h4 className="text-xs font-semibold text-white">{activeTask.title}</h4>
            <p className="text-[10px] text-zinc-400 mt-1">
              {activeTask.estimatedMinutes} mins • {activeTask.priority}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function Home() {
  return (
    <ScheduleProvider>
      <ScheduleApp />
    </ScheduleProvider>
  );
}
