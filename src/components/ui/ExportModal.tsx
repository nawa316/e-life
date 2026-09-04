"use client";

import React, { useRef } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useSchedule } from "@/lib/store";
import { exportDataAsJSON, exportScheduleAsICal, BackupData } from "@/lib/exportImport";
import { Download, Upload, Calendar, FileJson, CheckCircle2 } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { tasks, habits, categories, selectedDate, importBackupData } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    exportDataAsJSON(tasks, habits, categories);
  };

  const handleExportICal = () => {
    exportScheduleAsICal(tasks, selectedDate);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed: BackupData = JSON.parse(content);
        if (parsed.tasks && parsed.habits) {
          importBackupData(parsed.tasks, parsed.habits, parsed.categories);
          alert("Backup successfully restored!");
          onClose();
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Backup & Calendar Sync"
      description="Export your schedule and habits, sync with external calendars, or restore from a backup."
    >
      <div className="space-y-4">
        {/* Export JSON Card */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-800/50 border border-zinc-750 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileJson size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Full JSON Backup</h4>
              <p className="text-[11px] text-zinc-400">Export all tasks, habits, categories & streak history</p>
            </div>
          </div>
          <Button size="sm" onClick={handleExportJSON}>
            <Download size={13} /> Export
          </Button>
        </div>

        {/* Export iCal Card */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-800/50 border border-zinc-750 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Export as iCal (.ics)</h4>
              <p className="text-[11px] text-zinc-400">Sync selected day&apos;s schedule into Google / Apple Calendar</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={handleExportICal}>
            <Download size={13} /> .ics
          </Button>
        </div>

        {/* Restore from Backup */}
        <div className="p-3.5 bg-zinc-800/50 border border-zinc-750 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Upload size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Restore Backup File</h4>
              <p className="text-[11px] text-zinc-400">Upload an e-life .json backup to restore state</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={13} /> Select Backup JSON File
          </Button>
        </div>
      </div>
    </Modal>
  );
}
