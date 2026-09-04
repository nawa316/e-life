"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { useSchedule } from "@/lib/store";
import { timeToMinutes, formatMinutes, minutesToTime } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Trash2, ArrowUpRight, Flame, Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";

interface TimeBlockProps {
  task: Task;
  pixelsPerMinute: number;
  timelineStartHour: number;
}

export function TimeBlock({ task, pixelsPerMinute, timelineStartHour }: TimeBlockProps) {
  const { toggleTaskCompletion, deleteTask, unscheduleTask, updateTask, categories } = useSchedule();
  const [isResizing, setIsResizing] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `scheduled-${task.id}`,
    data: {
      type: "scheduled-task",
      task,
    },
  });

  const category = categories.find((c) => c.id === task.category);

  const startMinutes = timeToMinutes(task.startTime || "09:00");
  const duration = task.estimatedMinutes || 30;
  
  // Calculate relative top position from timeline start
  const topOffsetMinutes = startMinutes - timelineStartHour * 60;
  const top = Math.max(0, topOffsetMinutes * pixelsPerMinute);
  const height = Math.max(28, duration * pixelsPerMinute);

  const style: React.CSSProperties = {
    top: `${top}px`,
    height: `${height}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 10,
  };

  const handleDurationChange = (deltaMinutes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newDuration = Math.max(15, Math.min(240, duration + deltaMinutes));
    const startM = timeToMinutes(task.startTime || "09:00");
    const newEndTime = minutesToTime(startM + newDuration);
    updateTask(task.id, {
      estimatedMinutes: newDuration,
      endTime: newEndTime,
    });
  };

  const categoryColor = category?.color || "#3b82f6";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group absolute left-14 right-2 rounded-xl p-2.5 transition-shadow border select-none overflow-hidden ${
        task.completed
          ? "bg-zinc-900/60 border-zinc-800/80 text-zinc-500 shadow-none"
          : "bg-zinc-900/90 hover:bg-zinc-850 border-zinc-700/80 shadow-md hover:shadow-lg hover:border-zinc-500/50"
      }`}
    >
      {/* Accent left border / indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all"
        style={{
          backgroundColor: task.completed ? "#3f3f46" : categoryColor,
        }}
      />

      <div className="flex items-start justify-between gap-2 h-full">
        {/* Drag handle & Title area */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-start gap-2 min-w-0 flex-1 cursor-grab active:cursor-grabbing pl-1.5"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompletion(task.id);
            }}
            className="mt-0.5 text-zinc-400 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
              <Circle size={16} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-semibold text-zinc-100 truncate leading-tight ${
                  task.completed ? "line-through text-zinc-500" : ""
                }`}
              >
                {task.title}
              </span>

              {task.isHabitInstance && (
                <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium">
                  <Flame size={10} /> Habit
                </span>
              )}
            </div>

            {height >= 48 && (
              <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-zinc-400">
                <span className="font-mono text-zinc-300">
                  {task.startTime} - {task.endTime}
                </span>
                <span>•</span>
                <span>{formatMinutes(duration)}</span>
                {category && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                    style={{
                      backgroundColor: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {category.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {/* Resize quick adjust buttons */}
          <button
            onClick={(e) => handleDurationChange(-15, e)}
            className="p-1 text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
            title="Decrease 15 min"
          >
            -15m
          </button>
          <button
            onClick={(e) => handleDurationChange(15, e)}
            className="p-1 text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
            title="Increase 15 min"
          >
            +15m
          </button>

          <button
            onClick={() => unscheduleTask(task.id)}
            className="p-1 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded cursor-pointer"
            title="Move back to backlog"
          >
            <ArrowUpRight size={14} />
          </button>

          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded cursor-pointer"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
