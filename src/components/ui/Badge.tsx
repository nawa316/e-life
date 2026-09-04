import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "urgent" | "high" | "medium" | "low";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    secondary: "bg-zinc-800 text-zinc-300 border-zinc-700",
    outline: "text-zinc-400 border-zinc-800",
    urgent: "bg-red-950/60 text-red-400 border-red-800/50",
    high: "bg-amber-950/60 text-amber-400 border-amber-800/50",
    medium: "bg-blue-950/60 text-blue-400 border-blue-800/50",
    low: "bg-zinc-800/80 text-zinc-400 border-zinc-700/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
