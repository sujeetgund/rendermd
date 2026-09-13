"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Link2,
  ShieldLock,
  ShieldCheck,
  Shield,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { generateShareUrl } from "@/lib/storage/share";
import { useAppLock } from "@/components/security/app-lock-context";
import { SecuritySettings } from "@/components/security/security-settings";
import { StudioSettingsModal } from "./studio-settings-modal";

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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { isConfigured, lockApp } = useAppLock();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = !mounted || resolvedTheme === "dark";
  const logoSrc = isDarkTheme
    ? "/logo-horizontal-dark.png"
    : "/logo-horizontal.png";

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

  const handleShareLink = () => {
    try {
      const shareUrl = generateShareUrl(
        currentDoc.title,
        currentDoc.content,
        currentDoc.presetId,
      );
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Share link copied to clipboard!", {
          description: "",
        });
      });
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.1, x: 0.85 },
          colors: ["#10b981", "#3b82f6", "#8b5cf6"],
        });
      } catch {
        // Confetti is decorative
      }
    } catch {
      toast.error("Failed to generate share link");
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
            className="rounded border border-emerald-500 bg-white dark:bg-neutral-900 px-2 py-0.5 text-sm font-semibold text-neutral-900 dark:text-white outline-hidden"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename document"
            className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors truncate max-w-[150px] xs:max-w-[210px] sm:max-w-[360px]"
          >
            <span className="truncate">{currentDoc.title}</span>
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0 hidden xs:inline-block" />
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
        {/* View Mode Segment Control */}
        <div className="hidden sm:flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs">
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

        {/* Share Link Button (Desktop) */}
        <button
          onClick={handleShareLink}
          title="Share Instant URL Link (Works Offline)"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
        >
          <Link2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Share</span>
        </button>

        {/* Export Dropdown Menu (Desktop) */}
        <div ref={exportRef} className="hidden sm:block relative">
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

        {/* Unified Studio Settings Button */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          title="Studio Settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Studio Settings Modal */}
      <StudioSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onOpenTocDrawer={onOpenTocDrawer}
        onOpenCustomizer={onOpenCustomizer}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
      />

      {/* Security Settings Modal */}
      {showSecurityModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto w-full text-slate-100 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowSecurityModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              Security & Protection Settings
            </h3>
            <SecuritySettings />
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
