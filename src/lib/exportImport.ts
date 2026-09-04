import { Habit, Task, Category } from "./types";

export interface BackupData {
  version: string;
  exportedAt: string;
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
}

export function exportDataAsJSON(tasks: Task[], habits: Habit[], categories: Category[]): void {
  const data: BackupData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    tasks,
    habits,
    categories,
  };

  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `elife_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportScheduleAsICal(tasks: Task[], selectedDate: string): void {
  const scheduledTasks = tasks.filter((t) => t.scheduledDate === selectedDate && t.startTime && t.endTime);
  if (scheduledTasks.length === 0) {
    alert("No scheduled tasks for this date to export as iCal.");
    return;
  }

  const dateClean = selectedDate.replace(/-/g, ""); // YYYYMMDD

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//e-life//Day Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  scheduledTasks.forEach((task) => {
    const startClean = (task.startTime || "09:00").replace(":", "") + "00";
    const endClean = (task.endTime || "10:00").replace(":", "") + "00";

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@elife.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART:${dateClean}T${startClean}`,
      `DTEND:${dateClean}T${endClean}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${task.description || "Scheduled with e-life"}`,
      `STATUS:${task.completed ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT"
    );
  });

  icsContent.push("END:VCALENDAR");

  const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `elife_schedule_${selectedDate}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
