import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 active:scale-98",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 active:scale-98",
    outline: "border border-zinc-800 hover:bg-zinc-800/60 text-zinc-300 hover:text-white active:scale-98",
    ghost: "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100",
    danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 active:scale-98",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
    md: "px-3.5 py-1.5 text-sm rounded-lg gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5",
    icon: "p-2 rounded-lg justify-center",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
