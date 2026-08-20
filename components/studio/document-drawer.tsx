"use client";

import React, { useState } from "react";
import { MarkdownDocument } from "@/types/document";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  X,
  Sparkles,
  Check,
  FolderOpen,
  GraduationCap,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_SHOWCASE, SAMPLE_ACADEMIC, SAMPLE_RFC } from "@/lib/markdown/samples";

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: MarkdownDocument[];
  activeDocId: string;
  onSelectDocument: (id: string) => void;
  onCreateDocument: (title: string, content?: string, presetId?: string) => void;
  onDeleteDocument: (id: string) => void;
  onDuplicateDocument: (doc: MarkdownDocument) => void;
}

export function DocumentDrawer({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onDuplicateDocument,
}: DocumentDrawerProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  if (!isOpen) return null;

  const handleCreateBlank = () => {
    onCreateDocument("Untitled Document", "# Untitled Document\n\nStart writing your markdown...", "minimal");
    onClose();
  };

  const handleCreateTemplate = (type: "showcase" | "academic" | "rfc") => {
    if (type === "showcase") {
      onCreateDocument("rendermd Showcase", SAMPLE_SHOWCASE, "minimal");
    } else if (type === "academic") {
      onCreateDocument("Academic Paper", SAMPLE_ACADEMIC, "academic");
    } else if (type === "rfc") {
      onCreateDocument("RFC Specification", SAMPLE_RFC, "technical");
    }
    setShowTemplates(false);
    onClose();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.(md|markdown|txt)$/i, "");
      onCreateDocument(title, content, "minimal");
      toast.success(`Imported ${file.name}`);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs">
      <div className="flex h-full w-80 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white">
            <FolderOpen className="h-4 w-4 text-blue-500" />
            <span>Documents ({documents.length})</span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="my-3 space-y-2">
          <button
            onClick={handleCreateBlank}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Templates</span>
            </button>
            <label className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-2 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Import .md</span>
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {showTemplates && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20 p-2 space-y-1">
              <div className="text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400">
                Choose Starter Template
              </div>
              <button
                onClick={() => handleCreateTemplate("showcase")}
                className="flex items-center gap-2 w-full text-left rounded px-2 py-1 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40 text-neutral-800 dark:text-neutral-200"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Complete Showcase</span>
              </button>
              <button
                onClick={() => handleCreateTemplate("academic")}
                className="flex items-center gap-2 w-full text-left rounded px-2 py-1 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40 text-neutral-800 dark:text-neutral-200"
              >
                <GraduationCap className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Academic Paper</span>
              </button>
              <button
                onClick={() => handleCreateTemplate("rfc")}
                className="flex items-center gap-2 w-full text-left rounded px-2 py-1 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/40 text-neutral-800 dark:text-neutral-200"
              >
                <Terminal className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Technical RFC</span>
              </button>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto space-y-1 py-1">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectDocument(doc.id);
                  onClose();
                }}
                className={`group flex items-center justify-between rounded-lg p-2.5 cursor-pointer transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-neutral-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <div
                      className={`truncate text-xs font-semibold ${
                        isActive
                          ? "text-blue-900 dark:text-blue-200"
                          : "text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      {doc.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {new Date(doc.updatedAt).toLocaleDateString()} • {doc.presetId}
                    </div>
                  </div>
                </div>

                {/* Actions on Hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateDocument(doc);
                    }}
                    title="Duplicate document"
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {documents.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${doc.title}"?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      title="Delete document"
                      className="rounded p-1 text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
