"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSchedule } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  Lock,
  User,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Flame,
  ShieldCheck,
} from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const redirectPath = searchParams.get("redirect") || "/";

  const { signIn, signUp, syncLocalDataToCloud, user, authLoading } = useSchedule();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [syncLocal, setSyncLocal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectPath);
    }
  }, [user, authLoading, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error);
        } else {
          if (syncLocal) {
            await syncLocalDataToCloud();
          }
          router.push(redirectPath);
        }
      } else {
        const { error, needsConfirmation } = await signUp(email, password, name);
        if (error) {
          setErrorMessage(error);
        } else if (needsConfirmation) {
          setSuccessMessage(
            "Account created! Please check your email inbox to confirm your address, then sign in."
          );
        } else {
          if (syncLocal) {
            await syncLocalDataToCloud();
          }
          router.push(redirectPath);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top back navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-all backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Planner</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Logo and Brand Title */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-xl shadow-blue-500/25 border border-blue-500/40 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.svg"
                alt="e-life Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {mode === "signin" ? "Welcome back to e-life" : "Start organizing with e-life"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm">
            {mode === "signin"
              ? "Sign in to access your synchronized schedule, routines, and activity backlog."
              : "Create your cloud account to sync daily schedules, habits, and focus sessions across all devices."}
          </p>
        </div>

        {/* Form Container Card */}
        <div className="mt-7 bg-zinc-950/80 border border-zinc-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => handleModeSwitch("signin")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("signup")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="flex-1">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-750 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-750 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Enter your password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-750 focus:border-blue-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sync local data checkbox */}
            <label className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors">
              <input
                type="checkbox"
                checked={syncLocal}
                onChange={(e) => setSyncLocal(e.target.checked)}
                className="mt-0.5 rounded text-blue-500 focus:ring-blue-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Cloud size={13} className="text-blue-400" />
                  Sync my current tasks & habits into this account
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Automatically migrates all unsaved browser items into your cloud database.
                </p>
              </div>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold mt-2 shadow-lg shadow-blue-600/25"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  <span>{mode === "signin" ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to Account" : "Create Account & Sync"}</span>
                  <ArrowRight size={16} className="ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Features highlight pill row */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-around text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-blue-400" />
              Day Timeline
            </span>
            <span className="flex items-center gap-1">
              <Flame size={13} className="text-amber-400" />
              Habit Streaks
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              Cloud Backed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
