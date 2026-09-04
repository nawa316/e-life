# e-life ⚡

> Modern, intuitive Day Scheduler, Drag-to-Time Planner, Activity Backlog & Habit Tracker built with **Next.js 16 (App Router)**, **Tailwind CSS**, **shadcn/ui aesthetics**, and **@dnd-kit**.

![e-life preview](public/preview.png)

---

## ✨ Features

- 🕒 **Interactive 24-Hour Day Timeline**:
  - Drag tasks directly from your backlog onto your day schedule.
  - Quick-adjust duration buttons (`-15m` / `+15m`).
  - Real-time red indicator line highlighting the current time of day.
  - Daily completion tracker and planned focus hours.

- 📥 **Activity Backlog Drawer**:
  - Keep all unscheduled tasks, side projects, and thoughts organized.
  - Search, filter by category (*Work, Personal, Health, Learning, Side Projects*), and priority (*Urgent, High, Medium, Low*).
  - Quick "Schedule Today" action.

- 🔥 **Habits & Routines Engine**:
  - Daily streak counters & celebration confetti on completions.
  - Frequency scheduling: *Daily*, *Weekdays*, *Weekends*, or *Weekly*.
  - One-click "Add to Today's Timeline" from habits.

- 📊 **Analytics & Focus Overview**:
  - Real-time completion rates, total active streaks, and daily focus time.
  - Instant reset/seed demo data button to explore sample schedules.

- 🎨 **Modern Sleek Aesthetics**:
  - Dark-mode first design inspired by shadcn/ui.
  - Smooth Lucide icons and drag preview overlays.
  - LocalStorage synchronization to persist your schedule across reloads.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ / 24+ recommended)
- npm, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/nawa316/e-life.git

# Navigate to project directory
cd e-life

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Deployment Ready**: Vercel / Docker

---

## 📄 License
MIT © [nawa316](https://github.com/nawa316)
