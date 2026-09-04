"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Category, Habit, Task } from "./types";
import { initialCategories, initialHabits, initialTasks } from "./mockData";
import { getTodayDateString, addMinutesToTime } from "./utils";
import { supabase, isSupabaseConfigured } from "./supabase";
import confetti from "canvas-confetti";

interface ScheduleContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
  isUsingSupabase: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  scheduleTask: (taskId: string, date: string, startTime: string, durationMinutes?: number) => Promise<void>;
  unscheduleTask: (taskId: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  scheduleHabitForToday: (habitId: string) => Promise<void>;
  importBackupData: (tasks: Task[], habits: Habit[], categories?: Category[]) => void;
  resetToDefaults: () => Promise<void>;
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

  // Load from Supabase or Fallback to LocalStorage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured && supabase) {
        try {
          const [tasksRes, habitsRes, catsRes] = await Promise.all([
            supabase.from("tasks").select("*"),
            supabase.from("habits").select("*"),
            supabase.from("categories").select("*"),
          ]);

          if (tasksRes.data && tasksRes.data.length > 0) {
            setTasks(
              tasksRes.data.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description || undefined,
                category: t.category,
                priority: t.priority,
                estimatedMinutes: t.estimated_minutes,
                completed: t.completed,
                completedAt: t.completed_at || undefined,
                scheduledDate: t.scheduled_date || undefined,
                startTime: t.start_time || undefined,
                endTime: t.end_time || undefined,
                isHabitInstance: t.is_habit_instance,
                habitId: t.habit_id || undefined,
                tags: t.tags || [],
                createdAt: t.created_at,
              }))
            );
          } else {
            setTasks(initialTasks);
          }

          if (habitsRes.data && habitsRes.data.length > 0) {
            setHabits(
              habitsRes.data.map((h) => ({
                id: h.id,
                title: h.title,
                description: h.description || undefined,
                category: h.category,
                targetMinutes: h.target_minutes,
                preferredTime: h.preferred_time || undefined,
                frequency: h.frequency,
                streak: h.streak || 0,
                completedDates: h.completed_dates || [],
                icon: h.icon || "Sparkles",
                color: h.color || "#3b82f6",
                createdAt: h.created_at,
              }))
            );
          } else {
            setHabits(initialHabits);
          }

          if (catsRes.data && catsRes.data.length > 0) {
            setCategories(catsRes.data);
          } else {
            setCategories(initialCategories);
          }

          setIsLoaded(true);
          return;
        } catch (err) {
          console.error("Supabase load failed, falling back to localStorage", err);
        }
      }

      // LocalStorage fallback
      try {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
        const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

        setTasks(storedTasks ? JSON.parse(storedTasks) : initialTasks);
        setHabits(storedHabits ? JSON.parse(storedHabits) : initialHabits);
        setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
      } catch (e) {
        setTasks(initialTasks);
        setHabits(initialHabits);
        setCategories(initialCategories);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Save changes to localStorage if not using Supabase
  useEffect(() => {
    if (!isLoaded || isSupabaseConfigured) return;
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed saving to localStorage", e);
    }
  }, [tasks, habits, categories, isLoaded]);

  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    if (isSupabaseConfigured && supabase) {
      await supabase.from("tasks").insert([
        {
          id: newTask.id,
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          priority: newTask.priority,
          estimated_minutes: newTask.estimatedMinutes,
          completed: newTask.completed,
          scheduled_date: newTask.scheduledDate || null,
          start_time: newTask.startTime || null,
          end_time: newTask.endTime || null,
          is_habit_instance: newTask.isHabitInstance || false,
          habit_id: newTask.habitId || null,
        },
      ]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;

      await supabase.from("tasks").update(dbUpdates).eq("id", id);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from("tasks").delete().eq("id", id);
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextState = !task.completed;
    if (nextState) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}
    }

    await updateTask(id, {
      completed: nextState,
      completedAt: nextState ? new Date().toISOString() : undefined,
    });
  };

  const scheduleTask = async (
    taskId: string,
    date: string,
    startTime: string,
    durationMinutes?: number
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    const dur = durationMinutes || task?.estimatedMinutes || 30;
    const endTime = addMinutesToTime(startTime, dur);

    await updateTask(taskId, {
      scheduledDate: date,
      startTime,
      endTime,
      estimatedMinutes: dur,
    });
  };

  const unscheduleTask = async (taskId: string) => {
    await updateTask(taskId, {
      scheduledDate: undefined,
      startTime: undefined,
      endTime: undefined,
    });
  };

  const addHabit = async (
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

    if (isSupabaseConfigured && supabase) {
      await supabase.from("habits").insert([
        {
          id: newHabit.id,
          title: newHabit.title,
          description: newHabit.description,
          category: newHabit.category,
          target_minutes: newHabit.targetMinutes,
          preferred_time: newHabit.preferredTime,
          frequency: newHabit.frequency,
          streak: 0,
          completed_dates: [],
          icon: newHabit.icon,
          color: newHabit.color,
        },
      ]);
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );

    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.targetMinutes !== undefined) dbUpdates.target_minutes = updates.targetMinutes;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
      if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;

      await supabase.from("habits").update(dbUpdates).eq("id", id);
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from("habits").delete().eq("id", id);
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isDone = habit.completedDates.includes(date);
    let newDates: string[];
    let newStreak = habit.streak;

    if (isDone) {
      newDates = habit.completedDates.filter((d) => d !== date);
      newStreak = Math.max(0, newStreak - 1);
    } else {
      newDates = [...habit.completedDates, date];
      newStreak += 1;
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
          colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        });
      } catch (e) {}
    }

    await updateHabit(habitId, {
      completedDates: newDates,
      streak: newStreak,
    });
  };

  const scheduleHabitForToday = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const startTime = habit.preferredTime || "08:00";
    const endTime = addMinutesToTime(startTime, habit.targetMinutes || 30);

    await addTask({
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
    });
  };

  const importBackupData = (newTasks: Task[], newHabits: Habit[], newCategories?: Category[]) => {
    if (newTasks) setTasks(newTasks);
    if (newHabits) setHabits(newHabits);
    if (newCategories) setCategories(newCategories);
  };

  const resetToDefaults = async () => {
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
        isUsingSupabase: isSupabaseConfigured,
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
