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
import { parseShareUrlHash } from "@/lib/storage/share";
import {
  calculateDocumentStats,
  extractTocFromMarkdown,
  slugify,
} from "@/lib/markdown/toc";
import { extractFrontmatter } from "@/lib/markdown/frontmatter";
import { generateStandaloneHtml, downloadHtmlFile } from "@/lib/export/html-exporter";
import { exportToPdfPrint } from "@/lib/export/pdf-exporter";
import { exportElementAsImage } from "@/lib/export/image-exporter";
import {
  copyMarkdownToClipboard,
  copyRichTextToClipboard,
} from "@/lib/export/clipboard";

import { TopNav } from "@/components/studio/top-nav";
import { SplitPane } from "@/components/studio/split-pane";
import { AppleDock } from "@/components/studio/apple-dock";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { MarkdownPreview } from "@/components/preview/markdown-preview";
import { TocDrawer } from "@/components/studio/toc-drawer";
import { DocumentDrawer } from "@/components/studio/document-drawer";
import { CustomThemeModal } from "@/components/presets/custom-theme-modal";
import { StatsBadge } from "@/components/studio/stats-badge";
import { Toaster, toast } from "sonner";
import { AppLockProvider, useAppLock } from "@/components/security/app-lock-context";
import { LockScreen } from "@/components/security/lock-screen";
import { getSyntaxThemeForPreset } from "@/lib/microlighter/microlighter-service";

function StudioContent() {
  const { isLocked, unlockedDocuments, sessionPasscode } = useAppLock();

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

  const hasSyncedUnlockedRef = useRef(false);

  // Sync decrypted documents when unlocked (only once per unlock session)
  useEffect(() => {
    if (unlockedDocuments && unlockedDocuments.length > 0 && !hasSyncedUnlockedRef.current) {
      setDocuments(unlockedDocuments);
      if (!activeDocId || !unlockedDocuments.find((d) => d.id === activeDocId)) {
        setActiveDocId(unlockedDocuments[0].id);
      }
      hasSyncedUnlockedRef.current = true;
    }
  }, [unlockedDocuments, activeDocId]);

  // Reset sync ref when app gets locked
  useEffect(() => {
    if (isLocked) {
      hasSyncedUnlockedRef.current = false;
    }
  }, [isLocked]);

  // Save documents on change without triggering AppLockContext re-renders
  useEffect(() => {
    if (isHydrated && documents.length > 0) {
      if (sessionPasscode) {
        saveStoredDocuments(documents, sessionPasscode);
      } else {
        saveStoredDocuments(documents);
      }
    }
  }, [documents, isHydrated, sessionPasscode]);

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

  // Handle incoming shared URL hash links (#doc=...)
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window !== "undefined" && window.location.hash.includes("#doc=")) {
      const payload = parseShareUrlHash(window.location.hash);
      if (payload && payload.c) {
        const sharedTitle = payload.t || "Shared Document";
        const newDocId = `shared-${Date.now()}`;
        const newDoc: MarkdownDocument = {
          id: newDocId,
          title: sharedTitle,
          content: payload.c,
          presetId: payload.p || "minimal",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setDocuments((prev) => [newDoc, ...prev]);
        setActiveDocId(newDocId);

        // Clear hash from URL without page reload
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );

        toast.success(`Loaded shared document: "${sharedTitle}"`, {
          description: "Saved to your local documents list.",
        });
      }
    }
  }, [isHydrated]);

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

  // Sync syntax theme to document body for MicroLighter CSS Custom Highlight API
  const syntaxTheme = useMemo(
    () => getSyntaxThemeForPreset(activePreset.id, activePreset.isDark),
    [activePreset.id, activePreset.isDark]
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.syntaxTheme = syntaxTheme;
    }
  }, [syntaxTheme]);

  // Document stats and TOC
  const stats = useMemo(() => {
    return calculateDocumentStats(currentDoc.content || "");
  }, [currentDoc.content]);

  const toc = useMemo(() => {
    return extractTocFromMarkdown(currentDoc.content || "");
  }, [currentDoc.content]);

  // Sync document title to browser window title bar
  useEffect(() => {
    if (isHydrated && currentDoc?.title) {
      document.title = `${currentDoc.title} — rendermd`;
    }
  }, [currentDoc?.title, isHydrated]);

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

  // Heading-Sectional Synchronized Scrolling Logic
  function getSectionAnchors(
    markdown: string,
    textarea: HTMLTextAreaElement,
    preview: HTMLDivElement
  ) {
    const lines = markdown.split("\n");
    const totalLines = lines.length || 1;
    const lineHeight = textarea.scrollHeight / totalLines;

    const anchors: { yEditor: number; yPreview: number }[] = [];
    anchors.push({ yEditor: 0, yPreview: 0 });

    const slugCounts: Record<string, number> = {};

    for (let i = 0; i < lines.length; i++) {
      const match = /^(#{1,6})\s+(.+)$/.exec(lines[i]);
      if (!match) continue;

      const rawText = match[2].trim();
      const cleanText = rawText
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/\$(.*?)\$/g, "$1");

      let slug = slugify(cleanText);
      if (!slug) slug = `heading-${anchors.length}`;
      if (slugCounts[slug]) {
        slugCounts[slug]++;
        slug = `${slug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 1;
      }

      const previewEl = preview.querySelector<HTMLElement>(`[id="${slug}"]`);
      if (previewEl) {
        const yEditor = i * lineHeight;
        const yPreview = previewEl.offsetTop;
        anchors.push({ yEditor, yPreview });
      }
    }

    const maxEditor = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
    const maxPreview = Math.max(0, preview.scrollHeight - preview.clientHeight);
    anchors.push({ yEditor: maxEditor, yPreview: maxPreview });

    return anchors;
  }

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    const textarea = e.currentTarget;
    const preview = previewRef.current;
    if (!preview) return;

    isScrollingSyncRef.current = true;

    const anchors = getSectionAnchors(currentDoc.content, textarea, preview);
    anchors.sort((a, b) => a.yEditor - b.yEditor);

    const currentY = textarea.scrollTop;

    let i = 0;
    for (let idx = 0; idx < anchors.length - 1; idx++) {
      if (currentY >= anchors[idx].yEditor) {
        i = idx;
      }
    }

    const a1 = anchors[i];
    const a2 = anchors[i + 1] || a1;

    const editorRange = a2.yEditor - a1.yEditor;
    const progress = editorRange > 0 ? (currentY - a1.yEditor) / editorRange : 0;
    preview.scrollTop = a1.yPreview + progress * (a2.yPreview - a1.yPreview);

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 50);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    const preview = e.currentTarget;
    const textarea = editorRef.current;
    if (!textarea) return;

    isScrollingSyncRef.current = true;

    const anchors = getSectionAnchors(currentDoc.content, textarea, preview);
    anchors.sort((a, b) => a.yPreview - b.yPreview);

    const currentY = preview.scrollTop;

    let i = 0;
    for (let idx = 0; idx < anchors.length - 1; idx++) {
      if (currentY >= anchors[idx].yPreview) {
        i = idx;
      }
    }

    const a1 = anchors[i];
    const a2 = anchors[i + 1] || a1;

    const previewRange = a2.yPreview - a1.yPreview;
    const progress = previewRange > 0 ? (currentY - a1.yPreview) / previewRange : 0;
    textarea.scrollTop = a1.yEditor + progress * (a2.yEditor - a1.yEditor);

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

    // Read saved position BEFORE any DOM focus call
    let selectionStart = 0;
    let selectionEnd = 0;

    const datasetStart = textarea.dataset.selectionStart;
    const datasetEnd = textarea.dataset.selectionEnd;

    if (datasetStart !== undefined && datasetStart !== "") {
      selectionStart = parseInt(datasetStart, 10);
      selectionEnd = datasetEnd !== undefined && datasetEnd !== "" ? parseInt(datasetEnd, 10) : selectionStart;
    } else {
      selectionStart = textarea.selectionStart ?? 0;
      selectionEnd = textarea.selectionEnd ?? 0;
    }

    if (isNaN(selectionStart)) selectionStart = 0;
    if (isNaN(selectionEnd)) selectionEnd = selectionStart;

    const value = textarea.value || "";

    // Clamp selection range within bounds
    selectionStart = Math.min(value.length, Math.max(0, selectionStart));
    selectionEnd = Math.min(value.length, Math.max(selectionStart, selectionEnd));

    const bLen = before.length;
    const aLen = after.length;
    const hasSelection = selectionStart !== selectionEnd;
    const selected = value.substring(selectionStart, selectionEnd);

    const isSelfWrapped =
      hasSelection &&
      selected.length >= bLen + aLen &&
      selected.startsWith(before) &&
      selected.endsWith(after);

    const isSurroundWrapped =
      selectionStart >= bLen &&
      selectionEnd + aLen <= value.length &&
      value.substring(selectionStart - bLen, selectionStart) === before &&
      value.substring(selectionEnd, selectionEnd + aLen) === after;

    let newValue = "";
    let newCursorStart = selectionStart;
    let newCursorEnd = selectionEnd;

    if (isSelfWrapped) {
      const unwrapped = selected.substring(bLen, selected.length - aLen);
      newValue =
        value.substring(0, selectionStart) +
        unwrapped +
        value.substring(selectionEnd);
      newCursorStart = selectionStart;
      newCursorEnd = selectionStart + unwrapped.length;
    } else if (isSurroundWrapped) {
      newValue =
        value.substring(0, selectionStart - bLen) +
        selected +
        value.substring(selectionEnd + aLen);
      newCursorStart = selectionStart - bLen;
      newCursorEnd = newCursorStart + selected.length;
    } else {
      const textToUse = hasSelection ? selected : defaultText;
      newValue =
        value.substring(0, selectionStart) +
        before +
        textToUse +
        after +
        value.substring(selectionEnd);
      newCursorStart = selectionStart + bLen;
      newCursorEnd = newCursorStart + textToUse.length;
    }

    // Save updated positions to dataset
    textarea.dataset.selectionStart = String(newCursorStart);
    textarea.dataset.selectionEnd = String(newCursorEnd);

    updateContent(newValue);

    // Re-focus and set selection range
    requestAnimationFrame(() => {
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    });
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
              <div className="flex-1 overflow-hidden">
                <MarkdownEditor
                  value={currentDoc.content}
                  onChange={updateContent}
                  onScroll={handleEditorScroll}
                  editorRef={editorRef}
                  lineNumbers={settings.lineNumbers}
                  wordWrap={settings.wordWrap}
                  fontSize={settings.fontSize}
                  syntaxTheme={getSyntaxThemeForPreset(activePreset.id, activePreset.isDark)}
                />
              </div>
              {/* Bottom Editor Status Bar (Desktop only) */}
              <div className="hidden sm:flex h-7 items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0d14] px-3">
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
              onScroll={handlePreviewScroll}
              className="h-full w-full overflow-y-auto bg-white dark:bg-[#090d16] sm:bg-neutral-100/60 sm:dark:bg-[#06080d]"
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

      {/* Floating Glassmorphism Apple Dock for Mobile Devices */}
      <AppleDock
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        currentPresetId={currentDoc.presetId}
        onSelectPreset={(id) => selectPreset(id)}
        onOpenCustomizer={() => setIsCustomThemeOpen(true)}
        documentTitle={currentDoc.title}
        documentContent={currentDoc.content}
        onOpenTocDrawer={() => setIsTocDrawerOpen(!isTocDrawerOpen)}
        onExportHtml={handleExportHtml}
        onExportPdf={handleExportPdf}
        onExportImage={handleExportImage}
      />

      {/* Lock Screen Overlay when app is locked */}
      {isLocked && <LockScreen />}
    </div>
  );
}

export default function RendermdStudio() {
  return (
    <AppLockProvider>
      <StudioContent />
    </AppLockProvider>
  );
}
