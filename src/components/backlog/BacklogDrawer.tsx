"use client";

import React, { useState } from "react";
import { useSchedule } from "@/lib/store";
import { TaskCard } from "./TaskCard";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Priority, Task } from "@/lib/types";
import { Plus, Search, Filter, Inbox, CheckCircle, Clock } from "lucide-react";

export function BacklogDrawer() {
  const { tasks, categories, addTask } = useSchedule();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]?.id || "work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  // Filter unscheduled backlog tasks
  const backlogTasks = tasks.filter((task) => !task.scheduledDate);

  const filteredTasks = backlogTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      completed: false,
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
          <Inbox className="text-blue-500" size={20} />
          <h3 className="font-semibold text-zinc-100 text-base">Activity Backlog</h3>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
            {backlogTasks.length}
          </span>
        </div>
        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={15} />
          Add Task
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="py-3 space-y-2 border-b border-zinc-800/60">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={15} />
          <input
            type="text"
            placeholder="Search backlog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer flex-1"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Backlog List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
        {filteredTasks.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            <Inbox size={32} className="mb-2 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No tasks found</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">
              Add your upcoming thoughts, tasks or backlog items to drag into your schedule.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add to Activity Backlog"
        description="Create an unscheduled task that you can drag into your day calendar."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read research paper, Review PR"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add key notes, links, or acceptance criteria"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
            />
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
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Estimated Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setEstimatedMinutes(mins)}
                  className={`py-1.5 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                    estimatedMinutes === mins
                      ? "bg-blue-600/30 border-blue-500 text-blue-400"
                      : "bg-zinc-800 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
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
            <Button type="submit">Add to Backlog</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
