"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MarkdownDocument,
  ViewMode,
  PageSize,
  StudioSettings,
  DocumentStats,
} from "@/types/document";
import { DocumentPreset, PresetId } from "@/types/preset";
import { PresetSelector } from "@/components/presets/preset-selector";
import { StatsBadge } from "./stats-badge";
import {
  FileText,
  Download,
  Share2,
  Columns2,
  Edit3,
  Eye,
  Maximize,
  Settings2,
  ListTree,
  FileCode,
  Printer,
  Image as ImageIcon,
  Copy,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Check,
  PanelLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface TopNavProps {
  document: MarkdownDocument;
  onUpdateTitle: (title: string) => void;
  preset: DocumentPreset;
  onSelectPreset: (id: PresetId) => void;
  onOpenCustomizer: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  settings: StudioSettings;
  onUpdateSettings: (settings: Partial<StudioSettings>) => void;
  stats: DocumentStats;
  onOpenDocDrawer: () => void;
  onOpenTocDrawer: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onExportImage: (format: "png" | "svg") => void;
  onCopyRichText: () => void;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
}

export function TopNav({
  document: currentDoc,
  onUpdateTitle,
  preset,
  onSelectPreset,
  onOpenCustomizer,
  viewMode,
  onChangeViewMode,
  settings,
  onUpdateSettings,
  stats,
  onOpenDocDrawer,
  onOpenTocDrawer,
  onExportHtml,
  onExportPdf,
  onExportImage,
  onCopyRichText,
  onCopyMarkdown,
  onDownloadMarkdown,
}: TopNavProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(currentDoc.title);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = !mounted || resolvedTheme === "dark";
  const logoSrc = isDarkTheme ? "/logo-horizontal-dark.png" : "/logo-horizontal.png";

  useEffect(() => {
    setTitleValue(currentDoc.title);
  }, [currentDoc.title]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== currentDoc.title) {
      onUpdateTitle(titleValue.trim());
    } else {
      setTitleValue(currentDoc.title);
    }
  };

  const triggerExportWithConfetti = (action: () => void) => {
    action();
    setShowExportMenu(false);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.1, x: 0.9 },
        colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"],
      });
    } catch {
      // Confetti is purely decorative
    }
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-[#0b0f17]/90 px-4 backdrop-blur-md z-40 select-none">
      {/* Left Section: Logo & Document Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenDocDrawer}
          title="Open Document Manager"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
        >
          <PanelLeft className="h-4 w-4 text-emerald-500" />
        </button>

        <div className="flex items-center gap-2">
          {/* Logo Mark */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="rendermd logo"
            className="h-7 w-auto object-contain shrink-0 rounded-md"
          />
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
        </div>

        {/* Editable Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            autoFocus
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
              if (e.key === "Escape") {
                setIsEditingTitle(false);
                setTitleValue(currentDoc.title);
              }
            }}
            className="rounded border border-emerald-500 bg-transparent px-2 py-0.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 outline-hidden"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename document"
            className="group flex items-center gap-1.5 truncate rounded px-2 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
          >
            <span className="truncate max-w-[200px]">{currentDoc.title}</span>
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>

      {/* Middle Section: Preset Selector */}
      <div className="hidden md:flex items-center gap-3">
        <PresetSelector
          currentPresetId={currentDoc.presetId}
          onSelectPreset={onSelectPreset}
          onOpenCustomizer={onOpenCustomizer}
          customPreset={currentDoc.customPreset}
        />
      </div>

      {/* Right Section: View Switcher, TOC, Theme, Settings, Export */}
      <div className="flex items-center gap-1.5">
        {/* View Mode Toggle (Split, Editor, Preview, Zen) */}
        <div className="flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-900 p-0.5 text-xs">
          <button
            onClick={() => onChangeViewMode("split")}
            title="Split Mode (Editor + Preview)"
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "split"
                ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode("editor")}
            title="Editor Only"
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "editor"
                ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode("preview")}
            title="Preview Only"
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "preview"
                ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode("zen")}
            title="Zen Focus Mode"
            className={`rounded-md p-1.5 transition-all ${
              viewMode === "zen"
                ? "bg-white dark:bg-neutral-800 text-purple-600 dark:text-purple-400 shadow-2xs font-semibold"
                : "text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Maximize className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Theme Mode Toggle */}
        <button
          onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
          title={`Switch to ${isDarkTheme ? "Light" : "Dark"} Mode`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
        >
          {isDarkTheme ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-neutral-600" />
          )}
        </button>

        {/* Outline / TOC Toggle */}
        <button
          onClick={onOpenTocDrawer}
          title="Document Outline / Table of Contents"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
        >
          <ListTree className="h-3.5 w-3.5" />
        </button>

        {/* Settings Popover */}
        <div ref={settingsRef} className="relative">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            title="Studio Settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>

          {showSettingsMenu && (
            <div className="absolute right-0 top-10 z-40 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-2xl space-y-3">
              <div className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                Studio Preferences
              </div>

              {/* Page Layout Size */}
              <div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300 mb-1.5 font-medium">
                  Page Layout
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 text-xs">
                  {(["continuous", "a4", "letter"] as PageSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => onUpdateSettings({ pageSize: size })}
                      className={`rounded-md py-1 text-[11px] font-medium capitalize transition-all text-center ${
                        settings.pageSize === size
                          ? "bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      {size === "continuous" ? "Web Flow" : size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 space-y-2">
                {/* Sync Scrolling */}
                <label className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <span>Synchronized Scrolling</span>
                  <input
                    type="checkbox"
                    checked={settings.syncScroll}
                    onChange={(e) =>
                      onUpdateSettings({ syncScroll: e.target.checked })
                    }
                    className="rounded accent-emerald-600"
                  />
                </label>

                {/* Line Numbers */}
                <label className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <span>Line Numbers</span>
                  <input
                    type="checkbox"
                    checked={settings.lineNumbers}
                    onChange={(e) =>
                      onUpdateSettings({ lineNumbers: e.target.checked })
                    }
                    className="rounded accent-emerald-600"
                  />
                </label>

                {/* Word Wrap */}
                <label className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <span>Word Wrap</span>
                  <input
                    type="checkbox"
                    checked={settings.wordWrap}
                    onChange={(e) =>
                      onUpdateSettings({ wordWrap: e.target.checked })
                    }
                    className="rounded accent-emerald-600"
                  />
                </label>
              </div>

              {/* Font Size Slider */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2">
                <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300 mb-1">
                  <span>Editor Font Size</span>
                  <span className="font-mono text-neutral-400">
                    {settings.fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) =>
                    onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Dropdown Menu */}
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-10 z-40 w-60 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-2xl">
              <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Export Document
              </div>

              <button
                onClick={() => triggerExportWithConfetti(onExportHtml)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <FileCode className="h-4 w-4 text-orange-500 shrink-0" />
                <div>
                  <div className="font-medium">Standalone HTML</div>
                  <div className="text-[10px] text-neutral-400">
                    Self-contained file with inlined styles
                  </div>
                </div>
              </button>

              <button
                onClick={() => triggerExportWithConfetti(onExportPdf)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Printer className="h-4 w-4 text-red-500 shrink-0" />
                <div>
                  <div className="font-medium">PDF Print Document</div>
                  <div className="text-[10px] text-neutral-400">
                    A4 / Letter optimized layout
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  triggerExportWithConfetti(() => onExportImage("png"))
                }
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-medium">High-Res PNG Image</div>
                  <div className="text-[10px] text-neutral-400">
                    2x Retina document snapshot
                  </div>
                </div>
              </button>

              <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

              <button
                onClick={() => triggerExportWithConfetti(onCopyRichText)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span>Copy as Formatted Rich Text</span>
              </button>

              <button
                onClick={() => triggerExportWithConfetti(onCopyMarkdown)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Copy Markdown Source</span>
              </button>

              <button
                onClick={() => triggerExportWithConfetti(onDownloadMarkdown)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <span>Download .md File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
