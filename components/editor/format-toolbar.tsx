"use client";

import React from "react";
import { Terminal } from "lucide-react";

interface FormatToolbarProps {
  onInsert?: (before: string, after?: string, defaultText?: string) => void;
}

export function FormatToolbar({}: FormatToolbarProps) {
  return (
    <div className="relative z-20 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-[#0b0f17]/70 px-4 py-1.5 backdrop-blur-xs text-neutral-400 shrink-0 select-none text-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-semibold ring-1 ring-emerald-500/20">
          <Terminal className="h-3 w-3" />
          <span>Type &apos;/&apos; for blocks</span>
        </div>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 hidden sm:inline">
          Insert headings, code blocks, tables, callouts &amp; diagrams
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-neutral-400">
        <span className="rounded bg-neutral-200/60 dark:bg-neutral-800 px-1 py-0.5">Ctrl+B</span> Bold
        <span className="ml-1.5 rounded bg-neutral-200/60 dark:bg-neutral-800 px-1 py-0.5">Ctrl+I</span> Italic
        <span className="ml-1.5 rounded bg-neutral-200/60 dark:bg-neutral-800 px-1 py-0.5">Ctrl+K</span> Link
      </div>
    </div>
  );
}
