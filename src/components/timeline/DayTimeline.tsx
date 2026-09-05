"use client";

import React, { useRef, useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSchedule } from "@/lib/store";
import { TimeBlock } from "./TimeBlock";
import { minutesToTime, timeToMinutes } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

interface DayTimelineProps {
  startHour?: number;
  endHour?: number;
}

export function DayTimeline({ startHour = 6, endHour = 24 }: DayTimelineProps) {
  const { selectedDate, setSelectedDate, tasks, scheduleTask } = useSchedule();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const PIXELS_PER_MINUTE = 1.35; // Height scaling factor
  const totalHours = endHour - startHour;
  const hours = Array.from({ length: totalHours }, (_, i) => startHour + i);

  const { isOver, setNodeRef } = useDroppable({
    id: "timeline-droppable",
    data: {
      type: "timeline",
      date: selectedDate,
    },
  });

  // Today's scheduled tasks
  const todayTasks = tasks.filter((t) => t.scheduledDate === selectedDate);

  // Real-time current time indicator
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hh}:${mm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Quick date shifts
  const changeDay = (deltaDays: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + deltaDays);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, "0");
    const newD = String(dateObj.getDate()).padStart(2, "0");
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const minutesFromStart = Math.floor(clickY / PIXELS_PER_MINUTE);
    const snappedMinutes = Math.floor(minutesFromStart / 15) * 15; // 15m snap
    const calculatedMinutes = startHour * 60 + snappedMinutes;
    const timeStr = minutesToTime(calculatedMinutes);
  };

  // Format header date string
  const [y, m, d] = selectedDate.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Calculate stats for day
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalMinutes = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  // Current time position
  const curMinutes = currentTime ? timeToMinutes(currentTime) : 0;
  const curOffset = (curMinutes - startHour * 60) * PIXELS_PER_MINUTE;
  const isTimeInView = curMinutes >= startHour * 60 && curMinutes <= endHour * 60;

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Responsive Header bar */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between p-3 sm:p-4 gap-2 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => changeDay(-1)}
              className="p-1 sm:p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                setSelectedDate(`${year}-${month}-${day}`);
              }}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-zinc-200 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => changeDay(1)}
              className="p-1 sm:p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <CalendarIcon size={16} className="text-blue-500 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-zinc-100">{formattedDate}</h2>
          </div>
        </div>

        {/* Daily progress indicators */}
        <div className="flex items-center gap-3 text-xs self-end xs:self-auto">
          <div className="flex items-center gap-1 text-zinc-400 text-[11px] sm:text-xs">
            <Clock size={13} className="text-zinc-500" />
            <span>
              <strong className="text-zinc-200">{Math.round(totalMinutes / 60 * 10) / 10}h</strong> planned
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-16 sm:w-20 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                style={{
                  width: `${todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="font-semibold text-[11px] sm:text-xs text-zinc-300">
              {completedCount}/{todayTasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto relative p-3 sm:p-4 transition-colors ${
          isOver ? "bg-blue-950/15" : ""
        }`}
      >
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative min-h-full"
          style={{ height: `${totalHours * 60 * PIXELS_PER_MINUTE}px` }}
        >
          {/* Hour grid lines and labels */}
          {hours.map((hour) => {
            const hourOffset = (hour - startHour) * 60 * PIXELS_PER_MINUTE;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start"
                style={{ top: `${hourOffset}px` }}
              >
                <div className="w-11 sm:w-12 text-right pr-2 sm:pr-3 -mt-2 text-[11px] sm:text-xs font-mono font-medium text-zinc-500 select-none">
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="flex-1 border-t border-zinc-800/60 relative">
                  {/* Half-hour dashed line */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-zinc-850"
                    style={{ top: `${30 * PIXELS_PER_MINUTE}px` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Current Live Time Indicator Line */}
          {isTimeInView && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: `${curOffset}px` }}
            >
              <div className="w-11 sm:w-12 text-right pr-1.5 sm:pr-2 text-[9px] sm:text-[10px] font-mono font-bold text-red-400 bg-zinc-950 px-0.5 rounded">
                {currentTime}
              </div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500 -ml-1 sm:-ml-1.5" />
              <div className="flex-1 border-t-2 border-red-500 shadow-sm shadow-red-500/30" />
            </div>
          )}

          {/* Render Scheduled Tasks */}
          {todayTasks.map((task) => (
            <TimeBlock
              key={task.id}
              task={task}
              pixelsPerMinute={PIXELS_PER_MINUTE}
              timelineStartHour={startHour}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
