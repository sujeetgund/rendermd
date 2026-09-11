"use client";

import { DocumentStats } from "@/types/document";
import { Type, Clock } from "lucide-react";

interface EditorStatusBarProps {
  stats: DocumentStats;
}

export function EditorStatusBar({ stats }: EditorStatusBarProps) {
  return (
    <div className="flex h-7.5 w-full items-center justify-between border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/90 dark:bg-[#090c14] px-3 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 select-none">
      {/* Left: Enhanced Document Statistics & Auto-save status */}
      <div className="flex items-center gap-3 truncate">
        <div className="flex items-center gap-1.5" title="Word count">
          <Type className="h-3 w-3 text-emerald-500/80 shrink-0" />
          <span>{stats.words.toLocaleString()} words</span>
        </div>
        <span className="opacity-30">•</span>
        <div className="flex items-center gap-1.5" title="Character count">
          <span>{stats.characters.toLocaleString()} chars</span>
        </div>
        <span className="opacity-30">•</span>
        <div
          className="flex items-center gap-1.5 hidden xs:flex"
          title="Estimated reading time"
        >
          <Clock className="h-3 w-3 text-blue-500/80 shrink-0" />
          <span>{stats.readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* Right: Re-imagined Attribution (Made by Sujeet Gund • Hosted on Vercel) */}
      <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-sans font-medium text-neutral-500 dark:text-neutral-400">
        <span>Made by</span>
        <a
          href="https://sujeetgund.in"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://sujeetgund.in/logo.png"
            alt="Sujeet Gund Logo"
            className="h-3.5 w-3.5 object-contain group-hover:scale-110 transition-transform shrink-0 rounded-xs"
          />
          <span>Sujeet Gund</span>
        </a>
        <span className="opacity-30 mx-0.5">•</span>
        <span>Hosted on</span>
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 group"
        >
          <svg
            className="h-2.5 w-2.5 fill-current text-neutral-800 dark:text-neutral-200 group-hover:scale-110 transition-transform shrink-0"
            viewBox="0 0 76 65"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <span>Vercel</span>
        </a>
      </div>
    </div>
  );
}
