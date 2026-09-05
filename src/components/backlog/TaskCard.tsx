"use client";

import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { formatMinutes } from "@/lib/utils";
import { GripVertical, Clock, CheckCircle2, Circle, Trash2, CalendarPlus, ChevronRight } from "lucide-react";
import { useSchedule } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showScheduleAction?: boolean;
}

export function TaskCard({ task, onEdit, showScheduleAction = true }: TaskCardProps) {
  const { toggleTaskCompletion, deleteTask, scheduleTask, selectedDate, categories } = useSchedule();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(selectedDate);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [duration, setDuration] = useState(task.estimatedMinutes || 30);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `backlog-${task.id}`,
    data: {
      type: "task",
      task,
    },
  });

  const category = categories.find((c) => c.id === task.category);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleTask(task.id, scheduleDate, scheduleTime, Number(duration) || 30);
    setIsScheduleModalOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group relative bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3 sm:p-3.5 shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing touch-none select-none ${
          task.completed ? "opacity-60 bg-zinc-950/40" : ""
        } ${isDragging ? "ring-2 ring-blue-500 scale-[1.02]" : ""}`}
      >
        <div className="flex items-start gap-2.5">
          {/* Drag handle */}
          <div
            className="mt-0.5 text-zinc-500 group-hover:text-blue-400 p-0.5 rounded transition-colors shrink-0"
            title="Drag onto timeline"
          >
            <GripVertical size={16} />
          </div>

          {/* Checkbox button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskCompletion(task.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-0.5 text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <Circle size={18} />
            )}
          </button>

          {/* Task Details */}
          <div
            className="flex-1 min-w-0"
            onClick={(e) => {
              if (onEdit) {
                e.stopPropagation();
                onEdit(task);
              }
            }}
          >
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4
                className={`text-sm font-medium text-zinc-100 truncate ${
                  task.completed ? "line-through text-zinc-500" : ""
                }`}
              >
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 mb-2 font-normal">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mt-2">
              {/* Category tag */}
              {category && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-md font-medium border"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                    borderColor: `${category.color}30`,
                  }}
                >
                  {category.name}
                </span>
              )}

              {/* Priority tag */}
              <Badge variant={task.priority}>
                {task.priority.toUpperCase()}
              </Badge>

              {/* Duration */}
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Clock size={12} />
                {formatMinutes(task.estimatedMinutes)}
              </span>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
            {showScheduleAction && !task.scheduledDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsScheduleModalOpen(true);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg cursor-pointer transition-all active:scale-95 shadow-2xs"
                title="Schedule into calendar"
              >
                <CalendarPlus size={14} />
                <span className="hidden xs:inline">Schedule</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              title="Delete task"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule into Calendar Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Task into Calendar"
        description={`Place "${task.title}" onto your timeline.`}
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
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={10}
                max={480}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick preset durations */}
          <div className="flex gap-2 pt-1">
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setDuration(mins)}
                className={`flex-1 py-1 text-xs rounded-md border font-medium cursor-pointer transition-all ${
                  duration === mins
                    ? "bg-blue-600/30 border-blue-500 text-blue-400"
                    : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
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
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
