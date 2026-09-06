export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Category = {
  id: string;
  name: string;
  color: string; // Tailwind hex or class badge
  icon?: string;
};

export type TaskStatus = 'pending' | 'completed' | 'missed';

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: string; // Category ID
  priority: Priority;
  estimatedMinutes: number;
  completed: boolean;
  status?: TaskStatus;
  completedAt?: string;
  scheduledDate?: string; // YYYY-MM-DD
  startTime?: string;     // HH:mm (e.g., "09:30")
  endTime?: string;       // HH:mm (e.g., "10:30")
  isHabitInstance?: boolean;
  habitId?: string;
  tags?: string[];
  createdAt: string;
};

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export type Habit = {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetMinutes: number;
  preferredTime?: string; // HH:mm
  frequency: HabitFrequency;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  streak: number;
  completedDates: string[]; // ['2026-09-01', '2026-09-02']
  missedDates?: string[]; // ['2026-09-01']
  icon: string;
  color: string;
  createdAt: string;
};

export type DayStats = {
  totalScheduledMinutes: number;
  completedMinutes: number;
  completionRate: number;
  tasksCompleted: number;
  tasksTotal: number;
};
