"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { useSchedule } from "@/lib/store";
import { timeToMinutes, formatMinutes, minutesToTime } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Trash2, ArrowUpRight, Flame, GripVertical } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface TimeBlockProps {
  task: Task;
  pixelsPerMinute: number;
  timelineStartHour: number;
}

export function TimeBlock({ task, pixelsPerMinute, timelineStartHour }: TimeBlockProps) {
  const { toggleTaskCompletion, deleteTask, unscheduleTask, updateTask, categories } = useSchedule();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editStartTime, setEditStartTime] = useState(task.startTime || "09:00");
  const [editDuration, setEditDuration] = useState(task.estimatedMinutes || 30);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `scheduled-${task.id}`,
    data: {
      type: "scheduled-task",
      task,
    },
  });

  const category = categories.find((c) => c.id === task.category);
  const categoryColor = category?.color || "#3b82f6";

  const startMinutes = timeToMinutes(task.startTime || "09:00");
  const duration = task.estimatedMinutes || 30;
  
  // Calculate relative top position from timeline start
  const topOffsetMinutes = startMinutes - timelineStartHour * 60;
  const top = Math.max(0, topOffsetMinutes * pixelsPerMinute);
  const height = Math.max(34, duration * pixelsPerMinute);

  const style: React.CSSProperties = {
    top: `${top}px`,
    height: `${height}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.35 : 1,
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const startM = timeToMinutes(editStartTime);
    const newEndTime = minutesToTime(startM + Number(editDuration));
    updateTask(task.id, {
      title: editTitle.trim(),
      startTime: editStartTime,
      endTime: newEndTime,
      estimatedMinutes: Number(editDuration),
    });
    setIsEditModalOpen(false);
  };

  const isCompact = height < 48;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setIsEditModalOpen(true)}
        className={`group absolute left-14 right-2 sm:right-3 rounded-xl transition-all duration-150 border select-none overflow-hidden cursor-pointer shadow-xs ${
          task.completed
            ? "bg-zinc-900/40 border-zinc-800/60 text-zinc-500 opacity-60"
            : "bg-zinc-900/95 hover:bg-zinc-850/95 border-zinc-800 hover:border-zinc-700 shadow-md hover:shadow-lg"
        }`}
      >
        {/* Accent indicator pillar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-all"
          style={{
            backgroundColor: task.completed ? "#52525b" : categoryColor,
          }}
        />

        <div className="flex items-center justify-between gap-2 h-full px-2.5 py-1.5 pl-3.5">
          {/* Main Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Complete Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.id);
              }}
              className="text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
            >
              {task.completed ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <Circle size={16} />
              )}
            </button>

            {/* Title & Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-xs font-semibold text-zinc-100 truncate ${
                    task.completed ? "line-through text-zinc-500" : ""
                  }`}
                >
                  {task.title}
                </span>

                {task.isHabitInstance && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-medium">
                    <Flame size={9} /> Habit
                  </span>
                )}
              </div>

              {!isCompact && (
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-normal">
                  <span className="font-mono text-zinc-300 font-medium">
                    {task.startTime} – {task.endTime}
                  </span>
                  <span>•</span>
                  <span>{formatMinutes(duration)}</span>
                  {category && (
                    <span
                      className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                      style={{
                        backgroundColor: `${categoryColor}15`,
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

          {/* Right Action Icons: Always accessible on mobile, visible on desktop hover */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
            {/* Quick Adjust duration buttons (desktop) */}
            <button
              type="button"
              onClick={(e) => handleDurationChange(-15, e)}
              className="hidden sm:inline-flex p-1 text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
              title="Decrease 15 min"
            >
              -15m
            </button>
            <button
              type="button"
              onClick={(e) => handleDurationChange(15, e)}
              className="hidden sm:inline-flex p-1 text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded cursor-pointer"
              title="Increase 15 min"
            >
              +15m
            </button>

            {/* Drag handle (desktop) */}
            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:inline-flex p-1 text-zinc-500 hover:text-zinc-200 cursor-grab active:cursor-grabbing rounded hover:bg-zinc-800"
              title="Drag on timeline"
            >
              <GripVertical size={14} />
            </div>

            {/* Move to backlog */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                unscheduleTask(task.id);
              }}
              className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
              title="Move back to backlog"
            >
              <ArrowUpRight size={14} />
            </button>

            {/* Explicit Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${task.title}" from schedule?`)) {
                  deleteTask(task.id);
                }
              }}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
              title="Delete task"
            >
              <Trash2 size={14} className="text-red-400/80 hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Scheduled Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Scheduled Task"
        description="Adjust task title, timing, or duration."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                min={10}
                max={480}
                step={5}
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setEditDuration(mins)}
                className={`flex-1 py-1 text-xs rounded-md border font-medium cursor-pointer transition-all ${
                  editDuration === mins
                    ? "bg-blue-600/30 border-blue-500 text-blue-400"
                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteTask(task.id);
                  setIsEditModalOpen(false);
                }}
              >
                <Trash2 size={13} />
                Delete
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  unscheduleTask(task.id);
                  setIsEditModalOpen(false);
                }}
              >
                <ArrowUpRight size={13} />
                To Backlog
              </Button>
            </div>

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
    </>
  );
}
