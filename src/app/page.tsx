"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
} from "@dnd-kit/core";
import { ScheduleProvider, useSchedule } from "@/lib/store";
import { DayTimeline } from "@/components/timeline/DayTimeline";
import { WeeklyTimeline } from "@/components/timeline/WeeklyTimeline";
import { BacklogDrawer } from "@/components/backlog/BacklogDrawer";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";
import { AnalyticsView } from "@/components/stats/AnalyticsView";
import { PomodoroTimer } from "@/components/timeline/PomodoroTimer";
import { ExportModal } from "@/components/ui/ExportModal";
import { Task } from "@/lib/types";
import { UserMenu } from "@/components/auth/UserMenu";
import {
  DownloadCloud,
  CalendarDays,
  Clock,
  Inbox,
  Flame,
  Timer,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

function ScheduleApp() {
  const { selectedDate, setSelectedDate, scheduleTask, habits } = useSchedule();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<"planner" | "stats">("planner");
  const [mobileTab, setMobileTab] = useState<"planner" | "backlog" | "habits" | "focus" | "stats">("planner");
  const [timelineView, setTimelineView] = useState<"day" | "week">("day");
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Collapsible panels state for desktop
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
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

    const overData = over.data.current;
    const overId = String(over.id);

    // 1. Dropped on a specific half-hour / hour slot
    const isSlot = overData?.type === "timeline-slot" || overId.startsWith("slot-");
    const slotTime = overData?.time || (overId.startsWith("slot-") ? overId.replace("slot-", "") : null);

    if (isSlot && slotTime) {
      scheduleTask(
        taskData.id,
        selectedDate,
        slotTime,
        taskData.estimatedMinutes || 30
      );
      return;
    }

    // 2. Dropped on a week day column
    const isWeekDay = overData?.type === "week-day" || overId.startsWith("week-day-");
    const weekDate = overData?.date || (overId.startsWith("week-day-") ? overId.replace("week-day-", "") : null);

    if (isWeekDay && weekDate) {
      const currentStart = taskData.startTime || "09:00";
      scheduleTask(
        taskData.id,
        weekDate,
        currentStart,
        taskData.estimatedMinutes || 30
      );
      return;
    }

    // 3. Dropped on the general timeline droppable area
    if (over.id === "timeline-droppable" || overData?.type === "timeline-general") {
      const currentStart = taskData.startTime || "09:00";
      scheduleTask(
        taskData.id,
        selectedDate,
        currentStart,
        taskData.estimatedMinutes || 30
      );
    }
  };

  const handleSelectDayFromWeek = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTimelineView("day");
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
      collisionDetection={(args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
          return pointerCollisions;
        }
        return closestCenter(args);
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
        {/* Navigation Header with official logo */}
        <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 relative rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 shrink-0 border border-blue-500/30">
              <Image
                src="/logo.svg"
                alt="e-life Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">e-life</h1>
                <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden md:block">
                Daily & Weekly Scheduler, Backlog, Habits & Analytics
              </p>
            </div>
          </div>

          {/* Desktop Center Switcher: Planner vs Statistics */}
          <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => {
                setActiveView("planner");
                setMobileTab("planner");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === "planner"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Clock size={13} />
              <span>Planner</span>
            </button>
            <button
              onClick={() => {
                setActiveView("stats");
                setMobileTab("stats");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === "stats"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <BarChart3 size={13} />
              <span>Statistics</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop Panel Collapse Toggles */}
            {activeView === "planner" && (
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
            )}

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
                <span>Day</span>
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
                <span>Week</span>
              </button>
            </div>

            {/* Sync / Export Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExportOpen(true)}
              className="px-2 py-1 text-xs sm:px-2.5"
            >
              <DownloadCloud size={13} />
              <span className="hidden sm:inline">Backup</span>
            </Button>

            {/* Account & Cloud Sync Menu */}
            <UserMenu />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-2.5 sm:p-5 pb-24 lg:pb-6">
          {/* 1. DEDICATED STATISTICS VIEW */}
          {activeView === "stats" || mobileTab === "stats" ? (
            <AnalyticsView />
          ) : (
            <>
              {/* 2. DESKTOP 3-COLUMN PLANNER GRID */}
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
                    <WeeklyTimeline onSelectDay={handleSelectDayFromWeek} />
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

              {/* 3. MOBILE TAB-BASED VIEW */}
              <div className="block lg:hidden">
                {mobileTab === "planner" && (
                  <div className="h-[calc(100vh-140px)] min-h-[480px]">
                    {timelineView === "day" ? (
                      <DayTimeline startHour={6} endHour={23} />
                    ) : (
                      <WeeklyTimeline onSelectDay={handleSelectDayFromWeek} />
                    )}
                  </div>
                )}

                {mobileTab === "backlog" && (
                  <div className="h-[calc(100vh-140px)] min-h-[480px]">
                    <BacklogDrawer />
                  </div>
                )}

                {mobileTab === "habits" && (
                  <div className="h-[calc(100vh-140px)] min-h-[480px] overflow-y-auto space-y-4 pb-4">
                    <div className="h-[460px]">
                      <HabitTracker />
                    </div>
                    <HabitHeatmap habits={habits} />
                  </div>
                )}

                {mobileTab === "focus" && (
                  <div className="h-[calc(100vh-140px)] min-h-[480px] overflow-y-auto pt-1">
                    <PomodoroTimer />
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Optimized Mobile Bottom Navigation Bar */}
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
          <nav className="bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] safe-area-pb">
            <button
              type="button"
              onClick={() => {
                setActiveView("planner");
                setMobileTab("planner");
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeView === "planner" && mobileTab === "planner"
                  ? "text-blue-400 bg-blue-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Clock size={18} />
              <span className="text-[10px] tracking-wide mt-0.5">Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("planner");
                setMobileTab("backlog");
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeView === "planner" && mobileTab === "backlog"
                  ? "text-blue-400 bg-blue-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Inbox size={18} />
              <span className="text-[10px] tracking-wide mt-0.5">Backlog</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("planner");
                setMobileTab("habits");
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeView === "planner" && mobileTab === "habits"
                  ? "text-amber-400 bg-amber-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame size={18} />
              <span className="text-[10px] tracking-wide mt-0.5">Habits</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("planner");
                setMobileTab("focus");
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                activeView === "planner" && mobileTab === "focus"
                  ? "text-purple-400 bg-purple-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Timer size={18} />
              <span className="text-[10px] tracking-wide mt-0.5">Focus</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("stats");
                setMobileTab("stats");
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                mobileTab === "stats"
                  ? "text-emerald-400 bg-emerald-500/15 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-[10px] tracking-wide mt-0.5">Stats</span>
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
