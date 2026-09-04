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
import { WeeklyTimeline } from "@/components/timeline/WeeklyTimeline";
import { BacklogDrawer } from "@/components/backlog/BacklogDrawer";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";
import { AnalyticsOverview } from "@/components/stats/AnalyticsOverview";
import { PomodoroTimer } from "@/components/timeline/PomodoroTimer";
import { ExportModal } from "@/components/ui/ExportModal";
import { Task } from "@/lib/types";
import {
  Sparkles,
  DownloadCloud,
  CalendarDays,
  Clock,
  Inbox,
  Flame,
  Timer,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

function ScheduleApp() {
  const { selectedDate, scheduleTask, habits } = useSchedule();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mobileTab, setMobileTab] = useState<"planner" | "backlog" | "habits" | "focus">("planner");
  const [timelineView, setTimelineView] = useState<"day" | "week">("day");
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Collapsible panels state for desktop
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

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

  const getCenterSpanClass = () => {
    if (leftPanelOpen && rightPanelOpen) return "lg:col-span-5";
    if (!leftPanelOpen && !rightPanelOpen) return "lg:col-span-12";
    if (!leftPanelOpen && rightPanelOpen) return "lg:col-span-8";
    if (leftPanelOpen && !rightPanelOpen) return "lg:col-span-8";
    return "lg:col-span-5";
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">e-life</h1>
                <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded-full">
                  v1.6
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Daily & Weekly Scheduler, Backlog & Habit Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Panel Collapse Toggles */}
            <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
              <button
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  leftPanelOpen ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={leftPanelOpen ? "Collapse Left Panel (Backlog)" : "Expand Left Panel (Backlog)"}
              >
                {leftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
              </button>

              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  rightPanelOpen ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={rightPanelOpen ? "Collapse Right Panel (Habits)" : "Expand Right Panel (Habits)"}
              >
                {rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
              </button>
            </div>

            {/* View Mode Switcher (Day vs Week) */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
              <button
                onClick={() => setTimelineView("day")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timelineView === "day"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Clock size={12} />
                <span className="hidden xs:inline">Day</span>
              </button>
              <button
                onClick={() => setTimelineView("week")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timelineView === "week"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <CalendarDays size={12} />
                <span className="hidden xs:inline">Week</span>
              </button>
            </div>

            {/* Sync / Export Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExportOpen(true)}
              className="px-2.5 py-1 text-xs"
            >
              <DownloadCloud size={13} />
              <span className="hidden sm:inline">Sync & Backup</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-5 space-y-4 sm:space-y-5 pb-24 lg:pb-6">
          {/* Top Analytics Stats */}
          <AnalyticsOverview />

          {/* Desktop Responsive Collapsible Grid */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Backlog Activity Drawer + Focus Pomodoro */}
            {leftPanelOpen && (
              <div className="lg:col-span-4 space-y-4 animate-in fade-in duration-200">
                <div className="h-[520px]">
                  <BacklogDrawer />
                </div>
                <PomodoroTimer />
              </div>
            )}

            {/* Center Column: Interactive Day or Week Timeline */}
            <div className={`${getCenterSpanClass()} h-[760px] transition-all duration-300`}>
              {timelineView === "day" ? (
                <DayTimeline startHour={6} endHour={23} />
              ) : (
                <WeeklyTimeline />
              )}
            </div>

            {/* Right Column: Habit Tracker & Consistency Heatmap */}
            {rightPanelOpen && (
              <div className="lg:col-span-3 space-y-4 animate-in fade-in duration-200">
                <div className="h-[520px]">
                  <HabitTracker />
                </div>
                <HabitHeatmap habits={habits} />
              </div>
            )}
          </div>

          {/* Mobile Tab-Based View */}
          <div className="block lg:hidden">
            {mobileTab === "planner" && (
              <div className="h-[calc(100vh-220px)] min-h-[500px]">
                {timelineView === "day" ? (
                  <DayTimeline startHour={6} endHour={23} />
                ) : (
                  <WeeklyTimeline />
                )}
              </div>
            )}

            {mobileTab === "backlog" && (
              <div className="h-[calc(100vh-220px)] min-h-[500px]">
                <BacklogDrawer />
              </div>
            )}

            {mobileTab === "habits" && (
              <div className="space-y-4 pb-2">
                <div className="h-[460px]">
                  <HabitTracker />
                </div>
                <HabitHeatmap habits={habits} />
              </div>
            )}

            {mobileTab === "focus" && (
              <div className="pt-2">
                <PomodoroTimer />
              </div>
            )}
          </div>
        </main>

        {/* Guaranteed Fixed Mobile Bottom Navigation Bar */}
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
          <nav className="bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl px-3 py-2 flex items-center justify-around shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] safe-area-pb">
            <button
              type="button"
              onClick={() => setMobileTab("planner")}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                mobileTab === "planner"
                  ? "text-blue-400 bg-blue-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Clock size={19} />
              <span className="text-[10px] tracking-wide mt-1">Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("backlog")}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                mobileTab === "backlog"
                  ? "text-blue-400 bg-blue-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Inbox size={19} />
              <span className="text-[10px] tracking-wide mt-1">Backlog</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("habits")}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                mobileTab === "habits"
                  ? "text-amber-400 bg-amber-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame size={19} />
              <span className="text-[10px] tracking-wide mt-1">Habits</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab("focus")}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                mobileTab === "focus"
                  ? "text-purple-400 bg-purple-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Timer size={19} />
              <span className="text-[10px] tracking-wide mt-1">Focus</span>
            </button>
          </nav>
        </div>

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
