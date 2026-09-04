# e-life ⚡

> Modern, intuitive Day & Weekly Scheduler, Drag-to-Time Planner, Activity Backlog, Habit Tracker & Pomodoro Focus Timer built with **Next.js 16 (App Router)**, **Tailwind CSS**, **shadcn/ui aesthetics**, **@dnd-kit**, and optional **Supabase Database**.

![e-life preview](public/preview.png)

---

## ✨ Features

- 🕒 **Interactive 24-Hour Day & 7-Day Weekly Timeline**:
  - Drag tasks directly from your backlog onto your day schedule with 15-minute resolution.
  - Quick-adjust duration controls (`-15m` / `+15m`).
  - Real-time live red indicator line highlighting current time of day.
  - 7-Day matrix overview with single-click jump into any day.

- 📥 **Activity Backlog Drawer**:
  - Keep all unscheduled tasks, side projects, and thoughts organized.
  - Search, filter by category (*Work, Personal, Health, Learning, Side Projects*), and priority (*Urgent, High, Medium, Low*).

- 🔥 **Habits & Routines Engine**:
  - Daily streak counters, celebration confetti, and 3-week visual heatmap grid.
  - Multi-frequency routines (*Daily*, *Weekdays*, *Weekends*, *Weekly*).
  - One-click "Add to Today's Timeline" from habits.

- 🍅 **Deep Focus Pomodoro Timer**:
  - 25m Focus, 5m Short Break, and 15m Long Break intervals with progress ring & session counter.

- 🗄️ **Supabase Database Integration & Local Offline Fallback**:
  - Cloud persistence with Supabase PostgreSQL or offline LocalStorage.
  - Included SQL schema migration script with Row Level Security (`supabase/schema.sql`).

- 💾 **Data Backup, JSON Restore & iCal Calendar Sync**:
  - One-click JSON backup export & restore.
  - Apple Calendar / Google Calendar export (`.ics`).

---

## 🗄️ Setting Up Supabase Database (Optional)

1. Create a project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the script in `supabase/schema.sql`.
3. Create a `.env.local` file in your root folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

*(If no Supabase credentials are provided, `e-life` runs automatically in LocalStorage offline mode)*.

---

## 🚀 Getting Started

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

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📄 License
MIT © [nawa316](https://github.com/nawa316)
