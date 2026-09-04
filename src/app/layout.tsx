import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "e-life | Daily Interactive Scheduler & Habit Tracker",
  description: "Modern day scheduler with drag-and-drop time blocking, activity backlog, and habit streak tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
