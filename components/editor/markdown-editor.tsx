"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  onScroll,
  editorRef,
  lineNumbers = false,
  wordWrap = true,
  fontSize = 14,
}: MarkdownEditorProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = editorRef || localRef;

  // Handle Tab, Auto-indentation, and Smart Brackets
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // Handle Tab key
    if (e.key === "Tab") {
      e.preventDefault();
      const tabChar = "  "; // 2 spaces
      const newValue =
        value.substring(0, selectionStart) +
        tabChar +
        value.substring(selectionEnd);

      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + tabChar.length;
      }, 0);
      return;
    }

    // Auto close brackets and quotes
    const pairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      "`": "`",
      '"': '"',
      "*": "*",
      $: "$",
    };

    if (pairs[e.key] && selectionStart === selectionEnd) {
      const closeChar = pairs[e.key];
      // If typing next to the same closing quote, skip
      if (value[selectionStart] === closeChar && e.key === closeChar) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        return;
      }

      e.preventDefault();
      const newValue =
        value.substring(0, selectionStart) +
        e.key +
        closeChar +
        value.substring(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }

    // Smart wrapping when text is selected
    if (pairs[e.key] && selectionStart !== selectionEnd) {
      e.preventDefault();
      const selected = value.substring(selectionStart, selectionEnd);
      const closeChar = pairs[e.key];
      const newValue =
        value.substring(0, selectionStart) +
        e.key +
        selected +
        closeChar +
        value.substring(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = selectionStart + 1;
        textarea.selectionEnd = selectionEnd + 1;
      }, 0);
      return;
    }

    // Hotkeys: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+K (Link)
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        wrapSelection("**", "**");
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        wrapSelection("*", "*");
      } else if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        wrapSelection("[", "](url)");
      }
    }
  };

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.substring(selectionStart, selectionEnd) || "text";
    const newValue =
      value.substring(0, selectionStart) +
      before +
      selected +
      after +
      value.substring(selectionEnd);

    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectionStart + before.length;
      textarea.selectionEnd = selectionStart + before.length + selected.length;
    }, 0);
  };

  // Drag and Drop support for .md files
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (
          file.name.endsWith(".md") ||
          file.name.endsWith(".markdown") ||
          file.name.endsWith(".txt")
        ) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
              onChange(content);
              toast.success(`Imported ${file.name}`);
            }
          };
          reader.readAsText(file);
        } else {
          toast.error("Please drop a Markdown (.md) or text (.txt) file");
        }
      }
    },
    [onChange]
  );

  const lines = value.split("\n");

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative flex h-full w-full overflow-hidden bg-white dark:bg-[#0c1017] font-mono text-neutral-900 dark:text-neutral-200"
    >
      {/* Line Numbers Bar */}
      {lineNumbers && (
        <div
          className="select-none py-4 px-3 text-right font-mono text-xs opacity-30 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0d14] shrink-0 overflow-hidden"
          aria-hidden="true"
          style={{ width: `${Math.max(3, String(lines.length).length + 1) * 0.85}rem` }}
        >
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Editor Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={onScroll}
        spellCheck={false}
        placeholder="Type or paste your Markdown here..."
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: "1.6",
        }}
        className={`h-full w-full resize-none border-none bg-transparent p-5 font-mono outline-hidden focus:outline-hidden transition-colors ${
          wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
        }`}
      />
    </div>
  );
}
