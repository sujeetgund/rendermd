"use client";

import React, { useState } from "react";
import { DocumentPreset } from "@/types/preset";
import { X, Download, Upload, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

interface CustomThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: DocumentPreset;
  onSavePreset: (preset: DocumentPreset) => void;
}

export function CustomThemeModal({
  isOpen,
  onClose,
  preset,
  onSavePreset,
}: CustomThemeModalProps) {
  const [theme, setTheme] = useState<DocumentPreset>({
    ...preset,
    id: "custom",
    name: "Custom Theme",
  });

  if (!isOpen) return null;

  const handleColorChange = (key: keyof typeof theme.colors, value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleMermaidChange = (key: keyof typeof theme.mermaid, value: string) => {
    setTheme((prev) => ({
      ...prev,
      mermaid: {
        ...prev.mermaid,
        [key]: value,
      },
    }));
  };

  const handleTypographyChange = (key: keyof typeof theme.typography, value: string) => {
    setTheme((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value,
      },
    }));
  };

  const handleSpacingChange = (key: keyof typeof theme.spacing, value: string) => {
    setTheme((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onSavePreset(theme);
    toast.success("Custom preset applied successfully");
    onClose();
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rendermd-preset-${theme.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Preset JSON exported");
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.colors && parsed.typography) {
          setTheme({ ...parsed, id: "custom" });
          toast.success("Preset JSON loaded successfully");
        } else {
          toast.error("Invalid preset file format");
        }
      } catch {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Custom Theme Studio
            </h2>
            <p className="text-xs text-neutral-500">
              Design your own document tokens. Changes dynamically apply to Markdown, KaTeX, and Mermaid diagrams.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              title="Export preset JSON"
              className="flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
            <label className="flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={importJson} className="hidden" />
            </label>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Settings Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Theme Name
              </label>
              <input
                type="text"
                value={theme.name}
                onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Max Page Width
              </label>
              <input
                type="text"
                value={theme.spacing.maxWidth}
                onChange={(e) => handleSpacingChange("maxWidth", e.target.value)}
                placeholder="e.g. 800px"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Typography Tokens */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Typography & Fonts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Body Font</label>
                <select
                  value={theme.typography.fontFamily}
                  onChange={(e) => handleTypographyChange("fontFamily", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs"
                >
                  <option value='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'>
                    System Sans (Apple/Segoe)
                  </option>
                  <option value='"Newsreader", "Charter", "Georgia", serif'>
                    Newsreader / Serif
                  </option>
                  <option value='"Inter", -apple-system, sans-serif'>Inter Sans</option>
                  <option value='"JetBrains Mono", monospace'>JetBrains Mono</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Heading Font</label>
                <select
                  value={theme.typography.headingFontFamily}
                  onChange={(e) => handleTypographyChange("headingFontFamily", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs"
                >
                  <option value='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'>
                    System Sans
                  </option>
                  <option value='"Newsreader", "Charter", "Georgia", serif'>
                    Newsreader / Serif
                  </option>
                  <option value='"JetBrains Mono", monospace'>JetBrains Mono</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Base Font Size</label>
                <input
                  type="text"
                  value={theme.typography.bodySize}
                  onChange={(e) => handleTypographyChange("bodySize", e.target.value)}
                  placeholder="1rem"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Color Tokens */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Document Colors
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: "Background", key: "background" },
                { label: "Text Foreground", key: "foreground" },
                { label: "Heading Text", key: "heading" },
                { label: "Accent / Link", key: "accent" },
                { label: "Border Line", key: "border" },
                { label: "Code Background", key: "codeBackground" },
                { label: "Quote Background", key: "quoteBackground" },
                { label: "Quote Border", key: "quoteBorder" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-[11px] text-neutral-500 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors[key as keyof typeof theme.colors] || "#000000"}
                      onChange={(e) =>
                        handleColorChange(key as keyof typeof theme.colors, e.target.value)
                      }
                      className="h-7 w-7 rounded border border-neutral-300 dark:border-neutral-700 p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.colors[key as keyof typeof theme.colors]}
                      onChange={(e) =>
                        handleColorChange(key as keyof typeof theme.colors, e.target.value)
                      }
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mermaid Diagram Palette */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Mermaid Diagram Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: "Primary Node", key: "primaryColor" },
                { label: "Node Border", key: "primaryBorderColor" },
                { label: "Node Text", key: "primaryTextColor" },
                { label: "Connecting Lines", key: "lineColor" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-[11px] text-neutral-500 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.mermaid[key as keyof typeof theme.mermaid] || "#000000"}
                      onChange={(e) =>
                        handleMermaidChange(key as keyof typeof theme.mermaid, e.target.value)
                      }
                      className="h-7 w-7 rounded border border-neutral-300 dark:border-neutral-700 p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.mermaid[key as keyof typeof theme.mermaid]}
                      onChange={(e) =>
                        handleMermaidChange(key as keyof typeof theme.mermaid, e.target.value)
                      }
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50 dark:bg-neutral-950">
          <button
            onClick={() => setTheme({ ...preset, id: "custom", name: "Custom Theme" })}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to preset default</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-white px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 shadow-md hover:opacity-90 transition-opacity"
            >
              <Check className="h-4 w-4" />
              <span>Apply Custom Preset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
