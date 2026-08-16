"use client";

import React from "react";
import { DocumentStats } from "@/types/document";
import { BookOpen, Type, Clock } from "lucide-react";

interface StatsBadgeProps {
  stats: DocumentStats;
}

export function StatsBadge({ stats }: StatsBadgeProps) {
  return (
    <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
      <div className="flex items-center gap-1" title="Word count">
        <Type className="h-3 w-3" />
        <span>{stats.words.toLocaleString()} words</span>
      </div>
      <span className="opacity-30">•</span>
      <div className="flex items-center gap-1" title="Character count">
        <span>{stats.characters.toLocaleString()} chars</span>
      </div>
      <span className="opacity-30">•</span>
      <div className="flex items-center gap-1" title="Estimated reading time">
        <Clock className="h-3 w-3" />
        <span>{stats.readingTimeMinutes} min read</span>
      </div>
    </div>
  );
}
