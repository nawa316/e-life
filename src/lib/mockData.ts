import { Category, Habit, Task } from "./types";

export const initialCategories: Category[] = [
  { id: "work", name: "Work & Focus", color: "#3b82f6", icon: "Briefcase" },
  { id: "personal", name: "Personal & Life", color: "#10b981", icon: "User" },
  { id: "health", name: "Health & Fitness", color: "#f59e0b", icon: "Activity" },
  { id: "learning", name: "Learning & Skill", color: "#8b5cf6", icon: "BookOpen" },
  { id: "creative", name: "Side Projects", color: "#ec4899", icon: "Sparkles" },
];

export const initialHabits: Habit[] = [];
export const initialTasks: Task[] = [];
