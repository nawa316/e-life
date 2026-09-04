"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog with max height & scrollability for mobile */}
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 mb-3 sm:mb-5 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100">{title}</h2>
            {description && (
              <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form content area */}
        <div className="overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
}
