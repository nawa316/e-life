"use client";

import React, { useState } from "react";
import { useSchedule } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Mail, Lock, User, Cloud, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const { signIn, signUp, syncLocalDataToCloud, user } = useSchedule();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [syncLocal, setSyncLocal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          onClose();
        }
      } else {
        const { error, needsConfirmation } = await signUp(email, password, name);
        if (error) {
          setErrorMessage(error);
        } else if (needsConfirmation) {
          setSuccessMessage(
            "Account created! Please check your email inbox to verify your address before signing in."
          );
        } else {
          if (syncLocal) {
            await syncLocalDataToCloud();
          }
          onClose();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "signin" ? "Sign In to e-life" : "Create e-life Account"}
      description={
        mode === "signin"
          ? "Access your schedules, tasks, and habits seamlessly synced across all your devices."
          : "Keep your daily schedule, habits, and backlog backed up and synced in the cloud."
      }
    >
      {/* Mode Switcher Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-5">
        <button
          type="button"
          onClick={() => handleModeSwitch("signin")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mode === "signup"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-zinc-500" size={15} />
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-zinc-500" size={15} />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-zinc-500" size={15} />
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sync Local Data Option */}
        <label className="flex items-start gap-2.5 p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors">
          <input
            type="checkbox"
            checked={syncLocal}
            onChange={(e) => setSyncLocal(e.target.checked)}
            className="mt-0.5 rounded text-blue-500 focus:ring-blue-500 bg-zinc-800 border-zinc-700 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Cloud size={13} className="text-blue-400" />
              Sync my current tasks & habits to this account
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Uploads existing items from your browser into your cloud database.
            </p>
          </div>
        </label>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
              </>
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
