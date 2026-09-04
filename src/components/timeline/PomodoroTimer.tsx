"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Sparkles, Coffee } from "lucide-react";
import { Button } from "../ui/Button";
import confetti from "canvas-confetti";

type Mode = "focus" | "shortBreak" | "longBreak";

const MODE_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        } catch (e) {
          // ignore
        }
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(MODE_DURATIONS[mode]);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalDuration = MODE_DURATIONS[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-400" size={16} />
          <h4 className="text-xs font-semibold text-zinc-200">Focus Pomodoro</h4>
        </div>
        <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full">
          {sessionsCompleted} sessions done
        </span>
      </div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950/60 rounded-xl mb-3 border border-zinc-800/60">
        <button
          onClick={() => switchMode("focus")}
          className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
            mode === "focus"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => switchMode("shortBreak")}
          className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
            mode === "shortBreak"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          5m Break
        </button>
        <button
          onClick={() => switchMode("longBreak")}
          className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
            mode === "longBreak"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          15m Break
        </button>
      </div>

      {/* Timer Display & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold tracking-tight text-white">
            {formattedTime}
          </span>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
            {mode}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={isRunning ? "secondary" : "primary"}
            onClick={() => setIsRunning(!isRunning)}
            className="w-20"
          >
            {isRunning ? (
              <>
                <Pause size={13} /> Pause
              </>
            ) : (
              <>
                <Play size={13} /> Start
              </>
            )}
          </Button>
          <Button size="icon" variant="ghost" onClick={resetTimer} title="Reset Timer">
            <RotateCcw size={14} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            mode === "focus"
              ? "bg-blue-500"
              : mode === "shortBreak"
              ? "bg-emerald-500"
              : "bg-purple-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
