"use client";

import React, { useState, useRef, useEffect } from "react";
import { DocumentPreset, PresetId } from "@/types/preset";
import { PRESET_LIST } from "@/lib/presets";
import {
  ChevronDown,
  Sparkles,
  Check,
  SlidersHorizontal,
  Type,
  GitBranch,
  GraduationCap,
  Terminal,
  Moon,
  BookOpen,
  Palette,
} from "lucide-react";

interface PresetSelectorProps {
  currentPresetId: PresetId;
  onSelectPreset: (id: PresetId) => void;
  onOpenCustomizer: () => void;
  customPreset?: DocumentPreset;
}

export function getPresetIcon(id: string) {
  switch (id) {
    case "minimal":
      return <Type className="h-3.5 w-3.5" />;
    case "github":
      return <GitBranch className="h-3.5 w-3.5" />;
    case "academic":
      return <GraduationCap className="h-3.5 w-3.5 text-blue-500" />;
    case "technical":
      return <Terminal className="h-3.5 w-3.5 text-emerald-500" />;
    case "midnight":
      return <Moon className="h-3.5 w-3.5 text-indigo-400" />;
    case "editorial":
      return <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
    case "custom":
      return <Palette className="h-3.5 w-3.5 text-purple-500" />;
    default:
      return <Sparkles className="h-3.5 w-3.5" />;
  }
}

export function PresetSelector({
  currentPresetId,
  onSelectPreset,
  onOpenCustomizer,
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePreset = PRESET_LIST.find((p) => p.id === currentPresetId) || PRESET_LIST[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          {getPresetIcon(currentPresetId)}
        </span>
        <span className="hidden sm:inline font-medium">
          Preset: <span className="font-semibold text-neutral-950 dark:text-white">{activePreset?.name || "Custom"}</span>
        </span>
        <span className="sm:hidden font-semibold text-neutral-950 dark:text-white">
          {activePreset?.name || "Custom"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-1.5 z-50 w-72 max-h-[80vh] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-2xl backdrop-blur-md">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Document Styling Presets
          </div>

          <div className="space-y-1">
            {PRESET_LIST.map((preset) => {
              const isSelected = preset.id === currentPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset.id as PresetId);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-all ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-950 dark:text-white shadow-xs"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Visual Preset Icon Box */}
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold shadow-2xs"
                      style={{
                        backgroundColor: preset.colors.background,
                        borderColor: preset.colors.border,
                        color: preset.colors.heading,
                      }}
                    >
                      {getPresetIcon(preset.id)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{preset.name}</div>
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-1">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="my-1.5 border-t border-neutral-200 dark:border-neutral-800" />

          {/* Custom Theme Studio Link */}
          <button
            onClick={() => {
              onOpenCustomizer();
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Customize / Build Theme</span>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          </button>
        </div>
      )}
    </div>
  );
}
