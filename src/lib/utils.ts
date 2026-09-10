import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const currentMinutes = timeToMinutes(timeStr);
  return minutesToTime(currentMinutes + minutesToAdd);
}

export function getTodayDateString(): string {
  const d = new Date();
  return formatDateStr(d);
}

export function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function doesHabitApplyToDate(
  habit: { frequency: string; daysOfWeek?: number[]; createdAt?: string },
  dateStr: string
): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
    return habit.daysOfWeek.includes(dayOfWeek);
  }

  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "weekly":
      return dayOfWeek === 1; // default Monday
    case "custom":
      return habit.daysOfWeek ? habit.daysOfWeek.includes(dayOfWeek) : true;
    default:
      return true;
  }
}

export function getDateRange(centerDateStr: string, pastDays = 14, futureDays = 45): string[] {
  const [y, m, d] = centerDateStr.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const dates: string[] = [];

  for (let i = -pastDays; i <= futureDays; i++) {
    const cur = new Date(base);
    cur.setDate(cur.getDate() + i);
    dates.push(formatDateStr(cur));
  }

  return dates;
}

