"use client";

import React from "react";
import { ScheduleProvider } from "@/lib/store";

export function ScheduleClientProvider({ children }: { children: React.ReactNode }) {
  return <ScheduleProvider>{children}</ScheduleProvider>;
}
