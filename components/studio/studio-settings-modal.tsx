"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageSize, StudioSettings } from "@/types/document";
import { useTheme } from "next-themes";
import { useAppLock } from "@/components/security/app-lock-context";
import {
  Sun,
  Moon,
  Monitor,
  ListTree,
  ShieldCheck,
  ShieldLock,
  Sliders,
  Type,
  X,
  Sparkles,
} from "lucide-react";

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onUpdateSettings: (settings: Partial<StudioSettings>) => void;
  onOpenTocDrawer: () => void;
  onOpenCustomizer: () => void;
  onOpenSecurityModal: () => void;
}

export function StudioSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenTocDrawer,
  onOpenCustomizer,
  onOpenSecurityModal,
}: StudioSettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { isConfigured, lockApp } = useAppLock();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="relative my-auto w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-2xl text-neutral-900 dark:text-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/80 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-neutral-800 dark:text-neutral-200">
              Studio Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* Section 1: Appearance & Theme */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  theme === "light"
                    ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  theme === "dark"
                    ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  theme === "system"
                    ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Section 2: Editor & Display */}
          <div className="space-y-3">
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Editor & Layout
            </label>

            {/* Page Layout */}
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Page Layout
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-0.5">
                {(["continuous", "a4", "letter"] as PageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ pageSize: size })}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                      settings.pageSize === size
                        ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    {size === "continuous" ? "Web" : size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex items-center justify-between font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Font Size</span>
                </span>
                <span className="font-mono text-emerald-500 font-bold text-xs">
                  {settings.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="22"
                step="1"
                value={settings.fontSize}
                onChange={(e) =>
                  onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Line Numbers Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Line Numbers
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({ lineNumbers: !settings.lineNumbers })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.lineNumbers
                    ? "bg-emerald-600"
                    : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.lineNumbers ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Word Wrap Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Word Wrap
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({ wordWrap: !settings.wordWrap })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.wordWrap
                    ? "bg-emerald-600"
                    : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.wordWrap ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Tools & Actions */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 space-y-2">
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Quick Tools
            </label>

            {/* Document Outline */}
            <button
              onClick={() => {
                onClose();
                onOpenTocDrawer();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                <ListTree className="h-4 w-4 text-emerald-500" />
                <span>Document Outline</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 font-semibold">
                Alt + M
              </span>
            </button>

            {/* Custom Theme Creator */}
            <button
              onClick={() => {
                onClose();
                onOpenCustomizer();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Custom Theme Creator</span>
              </div>
              <span className="text-[10px] text-purple-500 font-semibold uppercase">
                Customize
              </span>
            </button>

            {/* Security Settings & Lock */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSecurityModal();
                }}
                className="flex-1 flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Security PIN</span>
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold uppercase">
                  {isConfigured ? "Active" : "Setup"}
                </span>
              </button>

              {isConfigured && (
                <button
                  onClick={() => {
                    onClose();
                    lockApp();
                  }}
                  title="Lock App Now"
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 transition-colors"
                >
                  <ShieldLock className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
