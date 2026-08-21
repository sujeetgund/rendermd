"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Eye,
  Type,
  Sun,
  Moon,
  Link2,
  Download,
  ListTree,
  X,
  ChevronUp,
} from "lucide-react";
import { ViewMode } from "@/types/document";
import { PresetId } from "@/types/preset";
import { PRESET_LIST } from "@/lib/presets";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { generateShareUrl } from "@/lib/storage/share";

interface AppleDockProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  currentPresetId: PresetId;
  onSelectPreset: (id: PresetId) => void;
  onOpenCustomizer: () => void;
  documentTitle: string;
  documentContent: string;
  onOpenTocDrawer: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onExportImage: (format: "png" | "svg") => void;
}

export function AppleDock({
  viewMode,
  onChangeViewMode,
  currentPresetId,
  onSelectPreset,
  onOpenCustomizer,
  documentTitle,
  documentContent,
  onOpenTocDrawer,
  onExportHtml,
  onExportPdf,
  onExportImage,
}: AppleDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"preset" | "export" | null>(
    null,
  );
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const dockRef = useRef<HTMLDivElement>(null);

  // Close dock submenus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = () => {
    try {
      const shareUrl = generateShareUrl(
        documentTitle,
        documentContent,
        currentPresetId,
      );
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Share link copied!", {
          description: "URL hash payload (works offline).",
        });
      });
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.85 } });
      } catch {
        // decorative
      }
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div
      ref={dockRef}
      className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 select-none"
    >
      {/* Submenu Popovers (Preset / Export) */}
      {activeMenu === "preset" && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0c1017]/95 p-2 shadow-2xl backdrop-blur-xl mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Preset</span>
            <button
              onClick={() => setActiveMenu(null)}
              className="text-neutral-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {PRESET_LIST.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset.id as PresetId);
                  setActiveMenu(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-left transition-colors ${
                  currentPresetId === preset.id
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMenu === "export" && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-56 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#0c1017]/95 p-2 shadow-2xl backdrop-blur-xl mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Export Document</span>
            <button
              onClick={() => setActiveMenu(null)}
              className="text-neutral-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1 mt-1">
            <button
              onClick={() => {
                onExportHtml();
                setActiveMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>Standalone HTML</span>
            </button>
            <button
              onClick={() => {
                onExportPdf();
                setActiveMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>PDF Print Document</span>
            </button>
            <button
              onClick={() => {
                onExportImage("png");
                setActiveMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>PNG Image</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill when Dock is collapsed */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border border-neutral-200/80 dark:border-neutral-700/80 bg-white/75 dark:bg-[#0c1017]/80 px-4 py-2 shadow-2xl backdrop-blur-xl text-xs font-semibold text-neutral-900 dark:text-white hover:scale-105 active:scale-95 transition-all"
        >
          <span>Actions</span>
          <ChevronUp className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      ) : (
        /* Glassmorphism Apple Dock Container */
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-700/80 bg-white/85 dark:bg-[#090d16]/90 p-2 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
          {/* Edit / View Mode Switch */}
          <button
            onClick={() => {
              onChangeViewMode(viewMode === "editor" ? "preview" : "editor");
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
              viewMode === "editor"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
            title={
              viewMode === "editor" ? "Switch to Preview" : "Switch to Editor"
            }
          >
            {viewMode === "editor" ? (
              <Eye className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </button>

          {/* Presets Button */}
          <button
            onClick={() =>
              setActiveMenu(activeMenu === "preset" ? null : "preset")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-emerald-500 transition-all"
            title="Design Presets"
          >
            <Type className="h-4 w-4" />
          </button>

          {/* Share Link */}
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-all"
            title="Share Document Link"
          >
            <Link2 className="h-4 w-4" />
          </button>

          {/* Export Menu */}
          <button
            onClick={() =>
              setActiveMenu(activeMenu === "export" ? null : "export")
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-emerald-500 transition-all"
            title="Export Document"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-600" />
            )}
          </button>

          {/* TOC / Outline */}
          <button
            onClick={onOpenTocDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all"
            title="Table of Contents"
          >
            <ListTree className="h-4 w-4" />
          </button>

          {/* Close Dock */}
          <button
            onClick={() => {
              setIsOpen(false);
              setActiveMenu(null);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-500 hover:text-foreground transition-all ml-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
