"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/db/visits";

export function VisitTracker() {
  useEffect(() => {
    const hasVisited = localStorage.getItem("kz-visited");
    if (!hasVisited) {
      localStorage.setItem("kz-visited", "true");
      recordVisit();
    }
  }, []);
  return null;
}
