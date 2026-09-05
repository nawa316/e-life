import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-life | Daily Interactive Scheduler, Habits & Focus",
  description: "Modern daily & weekly life planner with drag-to-time scheduling, activity backlog, recurring habit tracking, and deep focus timer.",
  keywords: ["e-life", "day scheduler", "drag and drop calendar", "habit tracker", "time blocking", "pomodoro", "nextjs", "supabase"],
  authors: [{ name: "nawa316" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
    shortcut: "/logo.svg",
  },
  openGraph: {
    title: "e-life | Daily Interactive Scheduler & Habit Tracker",
    description: "Design your day effortlessly with drag-to-time blocking, activity backlog, and habit streak tracking.",
    url: "https://github.com/nawa316/e-life",
    siteName: "e-life",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "e-life Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "e-life | Daily Interactive Scheduler",
    description: "Modern daily & weekly life planner with drag-to-time scheduling and habit tracker.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#09090b] text-zinc-100 min-h-screen selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
