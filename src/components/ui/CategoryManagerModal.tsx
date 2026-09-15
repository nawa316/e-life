"use client";

import React, { useState } from "react";
import { useSchedule } from "@/lib/store";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Tag, Plus, Trash2, Check, Sparkles } from "lucide-react";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#ef4444", // Red
];

export function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const { categories, addCategory, deleteCategory } = useSchedule();
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      color: selectedColor,
    });

    setNewCatName("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Categories"
      description="Create custom categories to organize your tasks, habits, and focus sessions."
    >
      <div className="space-y-5">
        {/* Form: Add New Category */}
        <form onSubmit={handleAddCategory} className="bg-zinc-800/50 border border-zinc-700/80 rounded-xl p-3.5 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Plus size={14} className="text-blue-400" />
            Add New Category
          </h4>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design, Meeting, Finance, Reading"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {selectedColor === color && (
                    <Check size={14} className="text-white drop-shadow-md stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <Button type="submit" size="sm">
              <Plus size={14} />
              Add Category
            </Button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div>
          <h4 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
            <Tag size={13} className="text-zinc-400" />
            Existing Categories ({categories.length})
          </h4>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-medium text-zinc-200">{cat.name}</span>
                </div>

                {/* Allow delete if more than 1 category */}
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
