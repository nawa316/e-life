"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSchedule } from "@/lib/store";
import { AuthModal } from "./AuthModal";
import { User, LogIn, LogOut, Cloud, CloudCheck, RefreshCw, Sparkles, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, signOut, isCloudSynced, syncLocalDataToCloud } = useSchedule();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncLocalDataToCloud();
    setTimeout(() => setIsSyncing(false), 600);
  };

  const getUserInitials = () => {
    if (!user) return "G";
    const name = user.user_metadata?.full_name || user.email || "";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {user ? (
          /* Logged-In User Badge & Dropdown Trigger */
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition-all cursor-pointer shadow-xs group"
          >
            {/* Avatar */}
            <div className="w-6 h-6 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {getUserInitials()}
            </div>

            {/* User details / email snippet */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-200 truncate max-w-[110px]">
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </span>
              <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud Synced
              </span>
            </div>

            <ChevronDown size={13} className="text-zinc-500 group-hover:text-zinc-300 transition-transform" />
          </button>
        ) : (
          /* Guest / Sign-In Button */
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-blue-500/20 active:scale-95"
          >
            <Cloud size={14} />
            <span>Sign In / Sync</span>
          </button>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && user && (
          <div className="absolute right-0 mt-2 w-64 bg-zinc-950/95 border border-zinc-800/90 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Account Info Header */}
            <div className="p-2.5 pb-3 border-b border-zinc-800/60">
              <p className="text-xs font-bold text-zinc-100 truncate">
                {user.user_metadata?.full_name || "Account"}
              </p>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Real-time Database Active
              </div>
            </div>

            {/* Actions */}
            <div className="py-1 space-y-0.5">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={`text-blue-400 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing now..." : "Force Cloud Sync"}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsDropdownOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
