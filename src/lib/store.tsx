"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
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
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  isCloudSynced: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  syncLocalDataToCloud: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  toggleTaskMissed: (id: string) => Promise<void>;
  restoreMissedTask: (id: string) => Promise<void>;
  scheduleTask: (taskId: string, date: string, startTime: string, durationMinutes?: number) => Promise<void>;
  unscheduleTask: (taskId: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "streak" | "completedDates">) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  toggleHabitMissed: (habitId: string, date: string) => Promise<void>;
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

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Helper to load user-scoped data from Supabase
  const loadUserData = useCallback(async (currentUser: User) => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const [tasksRes, habitsRes, catsRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", currentUser.id),
        supabase.from("habits").select("*").eq("user_id", currentUser.id),
        supabase.from("categories").select("*").eq("user_id", currentUser.id),
      ]);

      let loadedTasks: Task[] = [];
      let loadedHabits: Habit[] = [];
      let loadedCats: Category[] = initialCategories;

      if (tasksRes.data && tasksRes.data.length > 0) {
        loadedTasks = tasksRes.data.map((t) => {
          let resolvedStatus: "pending" | "completed" | "missed" = "pending";
          let rawDesc = t.description || "";
          let cleanDescription: string | undefined = t.description || undefined;

          if (rawDesc.includes("__STATUS:missed__")) {
            resolvedStatus = "missed";
            cleanDescription = rawDesc.replace(/\n?__STATUS:[a-z]+__/, "").trim() || undefined;
          } else if (rawDesc.includes("__STATUS:completed__")) {
            resolvedStatus = "completed";
            cleanDescription = rawDesc.replace(/\n?__STATUS:[a-z]+__/, "").trim() || undefined;
          } else if (t.status) {
            resolvedStatus = t.status as any;
          } else if (t.tags && Array.isArray(t.tags) && (t.tags.includes("status:missed") || t.tags.includes("missed"))) {
            resolvedStatus = "missed";
          } else if (t.completed) {
            resolvedStatus = "completed";
          }

          // Normalize scheduled_date (e.g., handles "2026-09-07T00:00:00+00:00" or "2026-09-07")
          let normalizedScheduledDate = t.scheduled_date || undefined;
          if (normalizedScheduledDate && typeof normalizedScheduledDate === "string" && normalizedScheduledDate.includes("T")) {
            normalizedScheduledDate = normalizedScheduledDate.split("T")[0];
          }

          return {
            id: t.id,
            title: t.title,
            description: cleanDescription,
            category: t.category,
            priority: t.priority,
            estimatedMinutes: t.estimated_minutes,
            completed: Boolean(t.completed),
            status: resolvedStatus,
            completedAt: t.completed_at || undefined,
            scheduledDate: normalizedScheduledDate,
            startTime: t.start_time || undefined,
            endTime: t.end_time || undefined,
            isHabitInstance: Boolean(t.is_habit_instance),
            habitId: t.habit_id || undefined,
            tags: t.tags || [],
            createdAt: t.created_at,
          };
        });
      }

      if (habitsRes.data && habitsRes.data.length > 0) {
        loadedHabits = habitsRes.data.map((h) => {
          let resolvedMissedDates: string[] = h.missed_dates || [];
          // Fallback if missed_dates column didn't exist in Supabase yet but was encoded in description JSON
          if ((!resolvedMissedDates || resolvedMissedDates.length === 0) && h.description && h.description.includes("__MISSED_DATES__:")) {
            try {
              const match = h.description.match(/__MISSED_DATES__:(\[[^\]]*\])/);
              if (match && match[1]) {
                resolvedMissedDates = JSON.parse(match[1]);
              }
            } catch (e) {}
          }

          const cleanDescription = h.description ? h.description.replace(/\n?__MISSED_DATES__:\[[^\]]*\]/, "").trim() || undefined : undefined;

          return {
            id: h.id,
            title: h.title,
            description: cleanDescription,
            category: h.category,
            targetMinutes: h.target_minutes,
            preferredTime: h.preferred_time || undefined,
            frequency: h.frequency,
            streak: h.streak || 0,
            completedDates: h.completed_dates || [],
            missedDates: resolvedMissedDates,
            icon: h.icon || "Flame",
            color: h.color || "#f59e0b",
            createdAt: h.created_at,
          };
        });
      }

      if (catsRes.data && catsRes.data.length > 0) {
        loadedCats = catsRes.data.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          icon: c.icon || undefined,
        }));
      }

      // If user has local cache data for this user ID, intelligently merge
      const localCachedTasks = localStorage.getItem(`elife_tasks_user_${currentUser.id}`);
      const localCachedHabits = localStorage.getItem(`elife_habits_user_${currentUser.id}`);
      
      let parsedLocalTasks: Task[] = [];
      let parsedLocalHabits: Habit[] = [];
      if (localCachedTasks) {
        try { parsedLocalTasks = JSON.parse(localCachedTasks); } catch (e) {}
      }
      if (localCachedHabits) {
        try { parsedLocalHabits = JSON.parse(localCachedHabits); } catch (e) {}
      }

      // Merge remote tasks with local cache by ID (remote takes precedence, local un-synced items preserved)
      const taskMap = new Map<string, Task>();
      parsedLocalTasks.forEach((t) => taskMap.set(t.id, t));
      loadedTasks.forEach((t) => taskMap.set(t.id, t));
      const finalTasks = Array.from(taskMap.values());

      const habitMap = new Map<string, Habit>();
      parsedLocalHabits.forEach((h) => habitMap.set(h.id, h));
      loadedHabits.forEach((h) => habitMap.set(h.id, h));
      const finalHabits = Array.from(habitMap.values());

      setTasks(finalTasks);
      setHabits(finalHabits);
      setCategories(loadedCats);
      setIsCloudSynced(true);
    } catch (err) {
      console.error("Error loading user data from Supabase:", err);
      // Try loading from local cached user data
      try {
        const cachedTasks = localStorage.getItem(`elife_tasks_user_${currentUser.id}`);
        const cachedHabits = localStorage.getItem(`elife_habits_user_${currentUser.id}`);
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));
        if (cachedHabits) setHabits(JSON.parse(cachedHabits));
      } catch (e) {}
    }
  }, []);

  // Helper to load guest data from LocalStorage (defaults to blank/empty)
  const loadGuestData = useCallback(() => {
    try {
      const storedTasks = localStorage.getItem("elife_tasks_guest");
      const storedHabits = localStorage.getItem("elife_habits_guest");
      const storedCategories = localStorage.getItem("elife_categories_guest");

      setTasks(storedTasks ? JSON.parse(storedTasks) : []);
      setHabits(storedHabits ? JSON.parse(storedHabits) : []);
      setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
    } catch (e) {
      setTasks([]);
      setHabits([]);
      setCategories(initialCategories);
    }
    setIsCloudSynced(false);
  }, []);

  // Initialize Auth & Data Loading
  useEffect(() => {
    async function initAuthAndData() {
      if (!isSupabaseConfigured || !supabase) {
        loadGuestData();
        setAuthLoading(false);
        setIsLoaded(true);
        return;
      }

      const client = supabase;

      try {
        const { data: { session: initialSession } } = await client.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await loadUserData(initialSession.user);
        } else {
          loadGuestData();
        }
      } catch (err) {
        console.error("Auth init error:", err);
        loadGuestData();
      } finally {
        setAuthLoading(false);
        setIsLoaded(true);
      }

      // Listen for auth state changes (login, logout, refresh)
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await loadUserData(newSession.user);
        } else {
          loadGuestData();
        }
      });

      // Real-time Database Subscription for instant cross-device updates (Desktop <-> Mobile)
      const channel = client
        .channel("db-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          async () => {
            const { data: { session: curSession } } = await client.auth.getSession();
            if (curSession?.user) {
              await loadUserData(curSession.user);
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "habits" },
          async () => {
            const { data: { session: curSession } } = await client.auth.getSession();
            if (curSession?.user) {
              await loadUserData(curSession.user);
            }
          }
        )
        .subscribe();

      // Listen for visibility / tab focus changes to auto-refresh data when switching to mobile browser
      const handleVisibilityChange = async () => {
        if (document.visibilityState === "visible") {
          const { data: { session: curSession } } = await client.auth.getSession();
          if (curSession?.user) {
            await loadUserData(curSession.user);
          }
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleVisibilityChange);

      return () => {
        subscription.unsubscribe();
        client.removeChannel(channel);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleVisibilityChange);
      };
    }

    initAuthAndData();
  }, [loadUserData, loadGuestData]);

  // Sync state to LocalStorage for offline cache (user-scoped)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (user) {
        localStorage.setItem(`elife_tasks_user_${user.id}`, JSON.stringify(tasks));
        localStorage.setItem(`elife_habits_user_${user.id}`, JSON.stringify(habits));
        localStorage.setItem(`elife_categories_user_${user.id}`, JSON.stringify(categories));
      } else {
        localStorage.setItem("elife_tasks_guest", JSON.stringify(tasks));
        localStorage.setItem("elife_habits_guest", JSON.stringify(habits));
        localStorage.setItem("elife_categories_guest", JSON.stringify(categories));
      }
    } catch (e) {
      console.error("Failed saving to localStorage cache", e);
    }
  }, [tasks, habits, categories, isLoaded, user]);

  // Auth Methods
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: "Supabase is not configured." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await loadUserData(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message || "Sign in failed" };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: "Supabase is not configured." };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split("@")[0],
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        await loadUserData(data.user);
        return { error: null, needsConfirmation: false };
      }

      return { error: null, needsConfirmation: true };
    } catch (err: any) {
      return { error: err?.message || "Sign up failed" };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setTasks([]);
    setHabits([]);
    setCategories(initialCategories);
    setIsCloudSynced(false);
    try {
      localStorage.removeItem("elife_tasks_guest");
      localStorage.removeItem("elife_habits_guest");
      localStorage.removeItem("elife_categories_guest");
      localStorage.removeItem("elife_tasks_v1");
      localStorage.removeItem("elife_habits_v1");
      localStorage.removeItem("elife_categories_v1");
    } catch (e) {}
  };

  // Sync local data to logged-in user cloud account
  const syncLocalDataToCloud = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;

    try {
      if (tasks.length > 0) {
        const taskPayload = tasks.map((t) => {
          const effectiveStatus = t.status || (t.completed ? "completed" : "pending");
          let rawDesc = t.description || "";
          rawDesc = rawDesc.replace(/\n?__STATUS:[a-z]+__/, "").trim();
          if (effectiveStatus === "missed") {
            rawDesc = `${rawDesc}\n__STATUS:missed__`.trim();
          }

          return {
            id: t.id,
            user_id: user.id,
            title: t.title,
            description: rawDesc || null,
            category: t.category,
            priority: t.priority,
            estimated_minutes: t.estimatedMinutes,
            completed: t.completed,
            completed_at: t.completedAt || null,
            scheduled_date: t.scheduledDate || null,
            start_time: t.startTime || null,
            end_time: t.endTime || null,
            is_habit_instance: t.isHabitInstance || false,
            habit_id: t.habitId || null,
          };
        });

        const { error } = await supabase.from("tasks").upsert(taskPayload, { onConflict: "id" });
        if (error) {
          console.error("Task sync error:", error);
        }
      }

      if (habits.length > 0) {
        const habitPayload = habits.map((h) => {
          let descriptionWithFallback = h.description || "";
          if (h.missedDates && h.missedDates.length > 0) {
            descriptionWithFallback = `${descriptionWithFallback.replace(/\n?__MISSED_DATES__:\[[^\]]*\]/, "")}\n__MISSED_DATES__:${JSON.stringify(h.missedDates)}`.trim();
          } else {
            descriptionWithFallback = descriptionWithFallback.replace(/\n?__MISSED_DATES__:\[[^\]]*\]/, "").trim();
          }

          return {
            id: h.id,
            user_id: user.id,
            title: h.title,
            description: descriptionWithFallback || null,
            category: h.category,
            target_minutes: h.targetMinutes,
            preferred_time: h.preferredTime || "08:00",
            frequency: h.frequency,
            streak: h.streak || 0,
            completed_dates: h.completedDates || [],
            icon: h.icon || "Flame",
            color: h.color || "#f59e0b",
          };
        });

        const { error } = await supabase.from("habits").upsert(habitPayload, { onConflict: "id" });
        if (error) {
          console.warn("Habit sync error:", error);
        }
      }

      setIsCloudSynced(true);
    } catch (err) {
      console.error("Manual cloud sync failed:", err);
    }
  };

  // Task & Habit Actions
  const addTask = async (taskData: Omit<Task, "id" | "createdAt">) => {
    const effectiveStatus = taskData.status || (taskData.completed ? "completed" : "pending");
    let effectiveTags = taskData.tags ? [...taskData.tags] : [];
    if (effectiveStatus === "missed" && !effectiveTags.includes("status:missed")) {
      effectiveTags.push("status:missed");
    }

    const newTask: Task = {
      ...taskData,
      status: effectiveStatus,
      tags: effectiveTags,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    if (user && isSupabaseConfigured && supabase) {
      let rawDesc = newTask.description || "";
      rawDesc = rawDesc.replace(/\n?__STATUS:[a-z]+__/, "").trim();
      if (effectiveStatus === "missed") {
        rawDesc = `${rawDesc}\n__STATUS:missed__`.trim();
      }

      const payload: any = {
        id: newTask.id,
        user_id: user.id,
        title: newTask.title,
        description: rawDesc || null,
        category: newTask.category,
        priority: newTask.priority,
        estimated_minutes: newTask.estimatedMinutes,
        completed: newTask.completed,
        scheduled_date: newTask.scheduledDate || null,
        start_time: newTask.startTime || null,
        end_time: newTask.endTime || null,
        is_habit_instance: newTask.isHabitInstance || false,
        habit_id: newTask.habitId || null,
      };

      const { error } = await supabase.from("tasks").insert([payload]);
      if (error) {
        console.error("Error inserting task to Supabase:", error);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    let resolvedUpdatedTask: Task | undefined;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const merged = { ...t, ...updates };
          const stat = merged.status || (merged.completed ? "completed" : "pending");
          let tgs = merged.tags ? [...merged.tags] : [];
          if (stat === "missed" && !tgs.includes("status:missed")) {
            tgs.push("status:missed");
          } else if (stat !== "missed") {
            tgs = tgs.filter((tag) => tag !== "status:missed" && tag !== "missed");
          }
          merged.tags = tgs;
          resolvedUpdatedTask = merged;
          return merged;
        }
        return t;
      })
    );

    if (user && isSupabaseConfigured && supabase) {
      const currentTask = resolvedUpdatedTask || tasks.find((t) => t.id === id);
      const effectiveStatus = updates.status ?? currentTask?.status ?? (updates.completed ? "completed" : "pending");
      
      let rawDesc = (updates.description !== undefined ? updates.description : currentTask?.description) || "";
      rawDesc = rawDesc.replace(/\n?__STATUS:[a-z]+__/, "").trim();
      if (effectiveStatus === "missed") {
        rawDesc = `${rawDesc}\n__STATUS:missed__`.trim();
      }

      const dbUpdates: any = { 
        updated_at: new Date().toISOString(),
        description: rawDesc || null,
      };
      if ("title" in updates) dbUpdates.title = updates.title;
      if ("category" in updates) dbUpdates.category = updates.category;
      if ("priority" in updates) dbUpdates.priority = updates.priority;
      if ("estimatedMinutes" in updates) dbUpdates.estimated_minutes = updates.estimatedMinutes;
      if ("completed" in updates) dbUpdates.completed = updates.completed;
      if ("completedAt" in updates) dbUpdates.completed_at = updates.completedAt ?? null;
      if ("scheduledDate" in updates) dbUpdates.scheduled_date = updates.scheduledDate ?? null;
      if ("startTime" in updates) dbUpdates.start_time = updates.startTime ?? null;
      if ("endTime" in updates) dbUpdates.end_time = updates.endTime ?? null;

      try {
        const { error } = await supabase.from("tasks").update(dbUpdates).eq("id", id).eq("user_id", user.id);
        if (error && currentTask) {
          await supabase.from("tasks").upsert({
            id: currentTask.id,
            user_id: user.id,
            title: "title" in updates ? updates.title : currentTask.title,
            description: rawDesc || null,
            category: "category" in updates ? updates.category : currentTask.category,
            priority: "priority" in updates ? updates.priority : currentTask.priority,
            estimated_minutes: "estimatedMinutes" in updates ? updates.estimatedMinutes : currentTask.estimatedMinutes,
            completed: "completed" in updates ? updates.completed : currentTask.completed,
            scheduled_date: "scheduledDate" in updates ? (updates.scheduledDate ?? null) : (currentTask.scheduledDate ?? null),
            start_time: "startTime" in updates ? (updates.startTime ?? null) : (currentTask.startTime ?? null),
            end_time: "endTime" in updates ? (updates.endTime ?? null) : (currentTask.endTime ?? null),
            is_habit_instance: currentTask.isHabitInstance || false,
            habit_id: currentTask.habitId || null,
          });
        }
      } catch (err) {
        console.error("Failed to update task in Supabase:", err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (user && isSupabaseConfigured && supabase) {
      await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    let resolvedUpdatedHabit: Habit | undefined;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const merged = { ...h, ...updates };
          resolvedUpdatedHabit = merged;
          return merged;
        }
        return h;
      })
    );

    if (user && isSupabaseConfigured && supabase) {
      const currentHabit = resolvedUpdatedHabit || habits.find((h) => h.id === id);
      const missedDates = updates.missedDates ?? currentHabit?.missedDates ?? [];
      let descriptionWithFallback = updates.description ?? currentHabit?.description ?? "";
      if (missedDates && missedDates.length > 0) {
        descriptionWithFallback = `${descriptionWithFallback.replace(/\n?__MISSED_DATES__:\[[^\]]*\]/, "")}\n__MISSED_DATES__:${JSON.stringify(missedDates)}`.trim();
      } else {
        descriptionWithFallback = descriptionWithFallback.replace(/\n?__MISSED_DATES__:\[[^\]]*\]/, "").trim();
      }

      const dbUpdates: any = { 
        updated_at: new Date().toISOString(),
        description: descriptionWithFallback || null,
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.targetMinutes !== undefined) dbUpdates.target_minutes = updates.targetMinutes;
      if (updates.preferredTime !== undefined) dbUpdates.preferred_time = updates.preferredTime;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
      if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;
      if (updates.missedDates !== undefined) dbUpdates.missed_dates = updates.missedDates;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.color !== undefined) dbUpdates.color = updates.color;

      try {
        const { error } = await supabase.from("habits").update(dbUpdates).eq("id", id).eq("user_id", user.id);
        if (error) {
          console.warn("Direct update failed, trying fallback without missed_dates column:", error);
          const fallbackUpdates = { ...dbUpdates };
          delete fallbackUpdates.missed_dates;
          const { error: err2 } = await supabase.from("habits").update(fallbackUpdates).eq("id", id).eq("user_id", user.id);
          if (err2 && currentHabit) {
            await supabase.from("habits").upsert({
              id: currentHabit.id,
              user_id: user.id,
              title: updates.title ?? currentHabit.title,
              description: descriptionWithFallback || null,
              category: updates.category ?? currentHabit.category,
              target_minutes: updates.targetMinutes ?? currentHabit.targetMinutes,
              preferred_time: updates.preferredTime ?? currentHabit.preferredTime ?? "08:00",
              frequency: updates.frequency ?? currentHabit.frequency,
              streak: updates.streak ?? currentHabit.streak ?? 0,
              completed_dates: updates.completedDates ?? currentHabit.completedDates ?? [],
              icon: updates.icon ?? currentHabit.icon ?? "Flame",
              color: updates.color ?? currentHabit.color ?? "#f59e0b",
            });
          }
        }
      } catch (err) {
        console.error("Failed to update habit in Supabase:", err);
      }
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isDone = habit.completedDates.includes(date);
    const wasMissed = habit.missedDates?.includes(date);
    let newDates: string[];
    let newMissedDates = habit.missedDates ? [...habit.missedDates] : [];
    let newStreak = habit.streak;

    if (isDone) {
      newDates = habit.completedDates.filter((d) => d !== date);
      newStreak = Math.max(0, newStreak - 1);
    } else {
      newDates = [...habit.completedDates, date];
      newStreak += 1;
      if (wasMissed) {
        newMissedDates = newMissedDates.filter((d) => d !== date);
      }
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
      missedDates: newMissedDates,
      streak: newStreak,
    });

    // Synchronize to any scheduled tasks on the Day Schedule for this habit & date
    const targetStatus = !isDone ? "completed" : "pending";
    const matchingTasks = tasks.filter(
      (t) => (t.habitId === habitId || (t.isHabitInstance && t.title.toLowerCase().trim() === habit.title.toLowerCase().trim())) &&
             (t.scheduledDate === date || (!t.scheduledDate && date === selectedDate))
    );

    for (const t of matchingTasks) {
      await updateTask(t.id, {
        completed: !isDone,
        status: targetStatus,
        completedAt: !isDone ? new Date().toISOString() : undefined,
      });
    }
  };

  const toggleHabitMissed = async (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const wasMissed = habit.missedDates?.includes(date);
    const isDone = habit.completedDates.includes(date);
    let newMissedDates: string[];
    let newCompletedDates = [...habit.completedDates];
    let newStreak = habit.streak;

    if (wasMissed) {
      newMissedDates = (habit.missedDates || []).filter((d) => d !== date);
    } else {
      newMissedDates = [...(habit.missedDates || []), date];
      if (isDone) {
        newCompletedDates = newCompletedDates.filter((d) => d !== date);
        newStreak = Math.max(0, newStreak - 1);
      }
    }

    await updateHabit(habitId, {
      completedDates: newCompletedDates,
      missedDates: newMissedDates,
      streak: newStreak,
    });

    // Synchronize to any scheduled tasks on the Day Schedule for this habit & date
    const targetStatus = !wasMissed ? "missed" : "pending";
    const matchingTasks = tasks.filter(
      (t) => (t.habitId === habitId || (t.isHabitInstance && t.title.toLowerCase().trim() === habit.title.toLowerCase().trim())) &&
             (t.scheduledDate === date || (!t.scheduledDate && date === selectedDate))
    );

    for (const t of matchingTasks) {
      await updateTask(t.id, {
        completed: false,
        status: targetStatus,
        completedAt: undefined,
      });
    }
  };

  // Synchronized completion for tasks & habits
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextState = !task.completed;
    const nextStatus = nextState ? "completed" : "pending";
    if (nextState) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}
    }

    await updateTask(id, {
      completed: nextState,
      status: nextStatus,
      completedAt: nextState ? new Date().toISOString() : undefined,
    });

    // If this task is linked to a habit, sync the habit streak & completed dates
    if (task.habitId) {
      const taskDate = task.scheduledDate || selectedDate;
      const linkedHabit = habits.find((h) => h.id === task.habitId);
      if (linkedHabit) {
        const isDateDoneInHabit = linkedHabit.completedDates.includes(taskDate);

        if (nextState && !isDateDoneInHabit) {
          // Add date and increment streak
          await updateHabit(task.habitId, {
            completedDates: [...linkedHabit.completedDates, taskDate],
            missedDates: (linkedHabit.missedDates || []).filter((d) => d !== taskDate),
            streak: linkedHabit.streak + 1,
          });
        } else if (!nextState && isDateDoneInHabit) {
          // Remove date and decrement streak
          await updateHabit(task.habitId, {
            completedDates: linkedHabit.completedDates.filter((d) => d !== taskDate),
            streak: Math.max(0, linkedHabit.streak - 1),
          });
        }
      }
    }
  };

  const toggleTaskMissed = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const isCurrentlyMissed = task.status === "missed";
    const nextStatus = isCurrentlyMissed ? "pending" : "missed";

    await updateTask(id, {
      completed: false,
      status: nextStatus,
      completedAt: undefined,
    });

    // If this task is linked to a habit, sync the habit missedDates & streak
    if (task.habitId) {
      const taskDate = task.scheduledDate || selectedDate;
      const linkedHabit = habits.find((h) => h.id === task.habitId);
      if (linkedHabit) {
        const isDoneInHabit = linkedHabit.completedDates.includes(taskDate);
        let newStreak = linkedHabit.streak;
        let newCompletedDates = [...linkedHabit.completedDates];
        let newMissedDates = linkedHabit.missedDates ? [...linkedHabit.missedDates] : [];

        if (nextStatus === "missed") {
          if (isDoneInHabit) {
            newCompletedDates = newCompletedDates.filter((d) => d !== taskDate);
            newStreak = Math.max(0, newStreak - 1);
          }
          if (!newMissedDates.includes(taskDate)) {
            newMissedDates.push(taskDate);
          }
        } else {
          newMissedDates = newMissedDates.filter((d) => d !== taskDate);
        }

        await updateHabit(task.habitId, {
          completedDates: newCompletedDates,
          missedDates: newMissedDates,
          streak: newStreak,
        });
      }
    }
  };

  // Restore task from missed status: remove from schedule timeline and move to active backlog
  const restoreMissedTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    await updateTask(id, {
      completed: false,
      status: "pending",
      scheduledDate: undefined,
      startTime: undefined,
      endTime: undefined,
      completedAt: undefined,
    });

    // If linked to a habit, unmark missed date from habit as well
    if (task.habitId) {
      const taskDate = task.scheduledDate || selectedDate;
      const linkedHabit = habits.find((h) => h.id === task.habitId);
      if (linkedHabit && linkedHabit.missedDates?.includes(taskDate)) {
        await updateHabit(task.habitId, {
          missedDates: linkedHabit.missedDates.filter((d) => d !== taskDate),
        });
      }
    }
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
    const habitId = `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newHabit: Habit = {
      ...habitData,
      id: habitId,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);

    if (user && isSupabaseConfigured && supabase) {
      await supabase.from("habits").insert([
        {
          id: newHabit.id,
          user_id: user.id,
          title: newHabit.title,
          description: newHabit.description || null,
          category: newHabit.category,
          target_minutes: newHabit.targetMinutes,
          preferred_time: newHabit.preferredTime || "08:00",
          frequency: newHabit.frequency,
          streak: 0,
          completed_dates: [],
          icon: newHabit.icon || "Flame",
          color: newHabit.color || "#f59e0b",
        },
      ]);
    }

    // Automatically place the habit onto today's timeline schedule once in the first set
    const startTime = newHabit.preferredTime || "08:00";
    const endTime = addMinutesToTime(startTime, newHabit.targetMinutes || 30);
    const targetDate = selectedDate || getTodayDateString();

    await addTask({
      title: newHabit.title,
      description: newHabit.description || "Recurring habit session",
      category: newHabit.category,
      priority: "medium",
      estimatedMinutes: newHabit.targetMinutes || 30,
      completed: false,
      scheduledDate: targetDate,
      startTime,
      endTime,
      isHabitInstance: true,
      habitId: newHabit.id,
    });
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setTasks((prev) => prev.filter((t) => t.habitId !== id));

    if (user && isSupabaseConfigured && supabase) {
      await Promise.all([
        supabase.from("habits").delete().eq("id", id).eq("user_id", user.id),
        supabase.from("tasks").delete().eq("habit_id", id).eq("user_id", user.id),
      ]);
    }
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
        user,
        session,
        authLoading,
        isCloudSynced,
        signIn,
        signUp,
        signOut,
        syncLocalDataToCloud,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        toggleTaskMissed,
        restoreMissedTask,
        scheduleTask,
        unscheduleTask,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        toggleHabitMissed,
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
