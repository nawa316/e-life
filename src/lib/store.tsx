"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, Habit, Task } from "./types";
import { initialCategories, initialHabits, initialTasks } from "./mockData";
import { getTodayDateString, addMinutesToTime } from "./utils";
import confetti from "canvas-confetti";

interface ScheduleContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  scheduleTask: (taskId: string, date: string, startTime: string, durationMinutes?: number) => void;
  unscheduleTask: (taskId: string) => void;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  scheduleHabitForToday: (habitId: string) => void;
  importBackupData: (tasks: Task[], habits: Habit[], categories?: Category[]) => void;
  resetToDefaults: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = "elife_tasks_v1";
const HABITS_STORAGE_KEY = "elife_habits_v1";
const CATEGORIES_STORAGE_KEY = "elife_categories_v1";

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(initialTasks);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
      }

      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      } else {
        setHabits(initialHabits);
        localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(initialHabits));
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(initialCategories);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
      }
    } catch (e) {
      console.error("Error loading data from localStorage", e);
      setTasks(initialTasks);
      setHabits(initialHabits);
      setCategories(initialCategories);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Error saving tasks", e);
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error("Error saving habits", e);
    }
  }, [habits, isLoaded]);

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
              });
            } catch (e) {
              // ignore
            }
          }
          return {
            ...t,
            completed: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const scheduleTask = (
    taskId: string,
    date: string,
    startTime: string,
    durationMinutes?: number
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const dur = durationMinutes || t.estimatedMinutes || 30;
          const endTime = addMinutesToTime(startTime, dur);
          return {
            ...t,
            scheduledDate: date,
            startTime,
            endTime,
            estimatedMinutes: dur,
          };
        }
        return t;
      })
    );
  };

  const unscheduleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const { scheduledDate, startTime, endTime, ...rest } = t;
          return {
            ...rest,
            scheduledDate: undefined,
            startTime: undefined,
            endTime: undefined,
          };
        }
        return t;
      })
    );
  };

  const addHabit = (
    habitData: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">
  ) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isDone = h.completedDates.includes(date);
          let newDates: string[];
          let newStreak = h.streak;

          if (isDone) {
            newDates = h.completedDates.filter((d) => d !== date);
            newStreak = Math.max(0, newStreak - 1);
          } else {
            newDates = [...h.completedDates, date];
            newStreak += 1;
            try {
              confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.8 },
                colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
              });
            } catch (e) {
              // ignore
            }
          }

          return {
            ...h,
            completedDates: newDates,
            streak: newStreak,
          };
        }
        return h;
      })
    );
  };

  const scheduleHabitForToday = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const startTime = habit.preferredTime || "08:00";
    const endTime = addMinutesToTime(startTime, habit.targetMinutes || 30);

    const newTask: Task = {
      id: `task-habit-${habit.id}-${Date.now()}`,
      title: habit.title,
      description: habit.description || "Recurring habit session",
      category: habit.category,
      priority: "medium",
      estimatedMinutes: habit.targetMinutes || 30,
      completed: habit.completedDates.includes(selectedDate),
      scheduledDate: selectedDate,
      startTime,
      endTime,
      isHabitInstance: true,
      habitId: habit.id,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
  };

  const importBackupData = (newTasks: Task[], newHabits: Habit[], newCategories?: Category[]) => {
    if (newTasks) setTasks(newTasks);
    if (newHabits) setHabits(newHabits);
    if (newCategories) setCategories(newCategories);
  };

  const resetToDefaults = () => {
    setTasks(initialTasks);
    setHabits(initialHabits);
    setCategories(initialCategories);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initialTasks));
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(initialHabits));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
  };

  return (
    <ScheduleContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        tasks,
        habits,
        categories,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        scheduleTask,
        unscheduleTask,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        scheduleHabitForToday,
        importBackupData,
        resetToDefaults,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
