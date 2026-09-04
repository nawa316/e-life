"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { formatMinutes } from "@/lib/utils";
import { GripVertical, Clock, CheckCircle2, Circle, Trash2, CalendarPlus } from "lucide-react";
import { useSchedule } from "@/lib/store";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showScheduleAction?: boolean;
}

export function TaskCard({ task, onEdit, showScheduleAction = true }: TaskCardProps) {
  const { toggleTaskCompletion, deleteTask, scheduleTask, selectedDate, categories } = useSchedule();

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

  const handleQuickSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default schedule to next available hour or 09:00
    scheduleTask(task.id, selectedDate, "09:00", task.estimatedMinutes || 30);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3.5 shadow-sm transition-all duration-150 ${
        task.completed ? "opacity-60 bg-zinc-950/40" : ""
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 text-zinc-600 hover:text-zinc-300 cursor-grab active:cursor-grabbing p-0.5 rounded touch-none transition-colors"
          title="Drag to timeline"
        >
          <GripVertical size={16} />
        </div>

        {/* Checkbox button */}
        <button
          onClick={() => toggleTaskCompletion(task.id)}
          className="mt-0.5 text-zinc-500 hover:text-blue-400 transition-colors cursor-pointer"
        >
          {task.completed ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0" onClick={() => onEdit && onEdit(task)}>
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
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {showScheduleAction && !task.scheduledDate && (
            <button
              onClick={handleQuickSchedule}
              className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              title={`Schedule for today (${selectedDate})`}
            >
              <CalendarPlus size={15} />
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
