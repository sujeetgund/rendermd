"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MarkdownDocument,
  ViewMode,
  StudioSettings,
  PageSize,
} from "@/types/document";
import { PresetId, DocumentPreset } from "@/types/preset";
import { getPresetById } from "@/lib/presets";
import {
  loadStoredDocuments,
  saveStoredDocuments,
  getStoredActiveDocId,
  saveStoredActiveDocId,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredCustomPreset,
  saveStoredCustomPreset,
} from "@/lib/storage/document-store";
import {
  calculateDocumentStats,
  extractTocFromMarkdown,
} from "@/lib/markdown/toc";
import { generateStandaloneHtml, downloadHtmlFile } from "@/lib/export/html-exporter";
import { exportToPdfPrint } from "@/lib/export/pdf-exporter";
import { exportElementAsImage } from "@/lib/export/image-exporter";
import {
  copyMarkdownToClipboard,
  copyRichTextToClipboard,
} from "@/lib/export/clipboard";

import { TopNav } from "@/components/studio/top-nav";
import { SplitPane } from "@/components/studio/split-pane";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { FormatToolbar } from "@/components/editor/format-toolbar";
import { MarkdownPreview } from "@/components/preview/markdown-preview";
import { TocDrawer } from "@/components/studio/toc-drawer";
import { DocumentDrawer } from "@/components/studio/document-drawer";
import { CustomThemeModal } from "@/components/presets/custom-theme-modal";
import { StatsBadge } from "@/components/studio/stats-badge";
import { Toaster, toast } from "sonner";

export default function RendermdStudio() {
  const [documents, setDocuments] = useState<MarkdownDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [settings, setSettings] = useState<StudioSettings>({
    syncScroll: true,
    lineNumbers: false,
    wordWrap: true,
    fontSize: 14,
    pageSize: "continuous",
    appTheme: "dark",
  });
  const [customPreset, setCustomPreset] = useState<DocumentPreset | null>(null);

  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState<boolean>(false);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState<boolean>(false);
  const [isCustomThemeOpen, setIsCustomThemeOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isScrollingSyncRef = useRef<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const loadedDocs = loadStoredDocuments();
    const activeId = getStoredActiveDocId(loadedDocs[0]?.id || "");
    const loadedSettings = loadStoredSettings();
    const loadedCustomPreset = loadStoredCustomPreset();

    setDocuments(loadedDocs);
    setActiveDocId(activeId);
    setSettings(loadedSettings);
    setCustomPreset(loadedCustomPreset);
    setIsHydrated(true);
  }, []);

  // Save documents on change
  useEffect(() => {
    if (isHydrated && documents.length > 0) {
      saveStoredDocuments(documents);
    }
  }, [documents, isHydrated]);

  // Save active document ID on change
  useEffect(() => {
    if (isHydrated && activeDocId) {
      saveStoredActiveDocId(activeDocId);
    }
  }, [activeDocId, isHydrated]);

  // Save settings on change
  useEffect(() => {
    if (isHydrated) {
      saveStoredSettings(settings);
    }
  }, [settings, isHydrated]);

  // Active document object
  const currentDoc = useMemo(() => {
    return (
      documents.find((d) => d.id === activeDocId) ||
      documents[0] || {
        id: "default",
        title: "Untitled",
        content: "",
        presetId: "minimal" as PresetId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    );
  }, [documents, activeDocId]);

  // Active preset object
  const activePreset = useMemo(() => {
    return getPresetById(currentDoc.presetId, currentDoc.customPreset || customPreset || undefined);
  }, [currentDoc.presetId, currentDoc.customPreset, customPreset]);

  // Document stats and TOC
  const stats = useMemo(() => {
    return calculateDocumentStats(currentDoc.content || "");
  }, [currentDoc.content]);

  const toc = useMemo(() => {
    return extractTocFromMarkdown(currentDoc.content || "");
  }, [currentDoc.content]);

  // Document state mutators
  const updateContent = useCallback(
    (newContent: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocId
            ? { ...doc, content: newContent, updatedAt: Date.now() }
            : doc
        )
      );
    },
    [activeDocId]
  );

  const updateTitle = useCallback(
    (newTitle: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocId
            ? { ...doc, title: newTitle, updatedAt: Date.now() }
            : doc
        )
      );
      toast.success("Document renamed");
    },
    [activeDocId]
  );

  const selectPreset = useCallback(
    (presetId: PresetId) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocId ? { ...doc, presetId } : doc
        )
      );
      toast.success(`Preset switched to ${presetId.toUpperCase()}`);
    },
    [activeDocId]
  );

  const handleSaveCustomPreset = useCallback(
    (newPreset: DocumentPreset) => {
      setCustomPreset(newPreset);
      saveStoredCustomPreset(newPreset);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocId
            ? { ...doc, presetId: "custom", customPreset: newPreset }
            : doc
        )
      );
    },
    [activeDocId]
  );

  const createDocument = useCallback(
    (title: string, content = "", presetId: string = "minimal") => {
      const newDoc: MarkdownDocument = {
        id: `doc-${Date.now()}`,
        title,
        content,
        presetId: presetId as PresetId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
      toast.success(`Created "${title}"`);
    },
    []
  );

  const deleteDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const remaining = prev.filter((d) => d.id !== id);
        if (activeDocId === id && remaining.length > 0) {
          setActiveDocId(remaining[0].id);
        }
        return remaining;
      });
      toast.success("Document deleted");
    },
    [activeDocId]
  );

  const duplicateDocument = useCallback(
    (doc: MarkdownDocument) => {
      const duplicated: MarkdownDocument = {
        ...doc,
        id: `doc-${Date.now()}`,
        title: `${doc.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setDocuments((prev) => [duplicated, ...prev]);
      setActiveDocId(duplicated.id);
      toast.success(`Duplicated "${doc.title}"`);
    },
    []
  );

  // Synchronized Scrolling Logic
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    const textarea = e.currentTarget;
    const preview = previewRef.current;
    if (!preview) return;

    isScrollingSyncRef.current = true;
    const percentage =
      textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight || 1);
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 50);
  };

  // Insertion from Toolbar
  const handleToolbarInsert = (
    before: string,
    after = "",
    defaultText = "text"
  ) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.substring(selectionStart, selectionEnd) || defaultText;
    const newValue =
      value.substring(0, selectionStart) +
      before +
      selected +
      after +
      value.substring(selectionEnd);

    updateContent(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart + before.length;
      textarea.selectionEnd = selectionStart + before.length + selected.length;
    }, 0);
  };

  // Export Actions
  const handleExportHtml = () => {
    const previewEl = document.getElementById("markdown-preview-root");
    if (!previewEl) return;
    const html = generateStandaloneHtml({
      title: currentDoc.title,
      markdownHtml: previewEl.innerHTML,
      preset: activePreset,
    });
    downloadHtmlFile(currentDoc.title, html);
    toast.success("Standalone HTML downloaded");
  };

  const handleExportPdf = () => {
    const previewEl = document.getElementById("markdown-preview-root");
    if (!previewEl) return;
    exportToPdfPrint({
      title: currentDoc.title,
      markdownElement: previewEl,
      preset: activePreset,
      pageSize: settings.pageSize,
    });
  };

  const handleExportImage = (format: "png" | "svg") => {
    const previewEl = document.getElementById("markdown-preview-root");
    if (!previewEl) return;
    exportElementAsImage({
      element: previewEl,
      filename: currentDoc.title.toLowerCase().replace(/\s+/g, "-"),
      format,
      backgroundColor: activePreset.colors.background,
    });
  };

  const handleCopyRichText = () => {
    const previewEl = document.getElementById("markdown-preview-root");
    if (!previewEl) return;
    copyRichTextToClipboard(previewEl);
  };

  const handleCopyMarkdown = () => {
    copyMarkdownToClipboard(currentDoc.content);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([currentDoc.content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded");
  };

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090d16] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="font-mono text-xs opacity-70">Loading rendermd...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#090d16] text-neutral-100">
      <Toaster position="bottom-right" richColors />

      {/* Top Navigation Bar */}
      <TopNav
        document={currentDoc}
        onUpdateTitle={updateTitle}
        preset={activePreset}
        onSelectPreset={selectPreset}
        onOpenCustomizer={() => setIsCustomThemeOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        stats={stats}
        onOpenDocDrawer={() => setIsDocDrawerOpen(true)}
        onOpenTocDrawer={() => setIsTocDrawerOpen(!isTocDrawerOpen)}
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onExportImage={handleExportImage}
        onCopyRichText={handleCopyRichText}
        onCopyMarkdown={handleCopyMarkdown}
        onDownloadMarkdown={handleDownloadMarkdown}
      />

      {/* Main Dual-Pane Workspace */}
      <main className="flex flex-1 overflow-hidden">
        <SplitPane
          viewMode={viewMode}
          left={
            <div className="relative flex h-full w-full flex-col bg-white dark:bg-[#0c1017]">
              <FormatToolbar onInsert={handleToolbarInsert} />
              <div className="flex-1 overflow-hidden">
                <MarkdownEditor
                  value={currentDoc.content}
                  onChange={updateContent}
                  onScroll={handleEditorScroll}
                  editorRef={editorRef}
                  lineNumbers={settings.lineNumbers}
                  wordWrap={settings.wordWrap}
                  fontSize={settings.fontSize}
                />
              </div>
              {/* Bottom Editor Status Bar */}
              <div className="flex h-7 items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0d14] px-3">
                <StatsBadge stats={stats} />
                <span className="text-[10px] font-mono text-neutral-400">
                  {currentDoc.presetId.toUpperCase()} • UTF-8
                </span>
              </div>
            </div>
          }
          right={
            <div
              ref={previewRef}
              className="h-full w-full overflow-y-auto bg-neutral-100/60 dark:bg-[#06080d]"
            >
              <MarkdownPreview
                content={currentDoc.content}
                preset={activePreset}
                pageSize={settings.pageSize}
                showLineNumbers={settings.lineNumbers}
              />
            </div>
          }
        />
      </main>

      {/* Table of Contents Drawer */}
      <TocDrawer
        isOpen={isTocDrawerOpen}
        onClose={() => setIsTocDrawerOpen(false)}
        items={toc}
      />

      {/* Document Manager Drawer */}
      <DocumentDrawer
        isOpen={isDocDrawerOpen}
        onClose={() => setIsDocDrawerOpen(false)}
        documents={documents}
        activeDocId={activeDocId}
        onSelectDocument={setActiveDocId}
        onCreateDocument={createDocument}
        onDeleteDocument={deleteDocument}
        onDuplicateDocument={duplicateDocument}
      />

      {/* Custom Theme Studio Modal */}
      <CustomThemeModal
        isOpen={isCustomThemeOpen}
        onClose={() => setIsCustomThemeOpen(false)}
        preset={activePreset}
        onSavePreset={handleSaveCustomPreset}
      />
    </div>
  );
}
