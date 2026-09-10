"use client";

import React, { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  SlashCommandMenu,
  SLASH_COMMANDS,
  SlashCommandItem,
} from "@/components/editor/slash-command-menu";
import { getTextareaCaretCoordinates } from "@/lib/textarea-caret";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  syntaxTheme?: string;
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
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Slash Command Palette State
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [slashPosition, setSlashPosition] = useState({ top: 120, left: 100 });
  const [slashTriggerIndex, setSlashTriggerIndex] = useState<number | null>(null);

  // Sync scroll between line numbers bar and textarea
  const handleScrollCombined = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (onScroll) {
      onScroll(e);
    }
  };

  // Save active cursor position to dataset on selection/click/keyup
  const saveSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.dataset.selectionStart = String(textarea.selectionStart);
      textarea.dataset.selectionEnd = String(textarea.selectionEnd);
    }
  }, [textareaRef]);

  // Execute selected Slash Command without pruning text after caret
  const executeSlashCommand = useCallback(
    (command: SlashCommandItem) => {
      const textarea = textareaRef.current;
      if (!textarea || slashTriggerIndex === null) return;

      const text = textarea.value;
      const { snippet, cursorOffset, selectionLength } = command.execute();

      // Calculate end index of typed '/query' text precisely
      const endOfSlashQuery = Math.min(
        text.length,
        slashTriggerIndex + 1 + slashQuery.length
      );

      // Preserve everything before '/' and everything after '/query'
      const before = text.substring(0, slashTriggerIndex);
      const after = text.substring(endOfSlashQuery);

      const newValue = before + snippet + after;
      onChange(newValue);

      setIsSlashMenuOpen(false);
      setSlashTriggerIndex(null);
      setSlashQuery("");

      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newStart = slashTriggerIndex + cursorOffset;
          const newEnd = newStart + selectionLength;
          textarea.setSelectionRange(newStart, newEnd);
          textarea.dataset.selectionStart = String(newStart);
          textarea.dataset.selectionEnd = String(newEnd);
        }
      }, 0);
    },
    [textareaRef, slashTriggerIndex, slashQuery, onChange]
  );

  // Filter commands by query
  const getFilteredCommands = useCallback(() => {
    const cleanQ = slashQuery.toLowerCase().trim();
    if (!cleanQ) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(cleanQ) ||
        cmd.description.toLowerCase().includes(cleanQ) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(cleanQ))
      );
    });
  }, [slashQuery]);

  // Handle Keyboard Navigation & Hotkeys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;

    // Slash Menu Navigation when open
    if (isSlashMenuOpen) {
      const filtered = getFilteredCommands();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashSelectedIndex((prev) =>
          filtered.length > 0 ? (prev + 1) % filtered.length : 0
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashSelectedIndex((prev) =>
          filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0
        );
        return;
      }

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filtered.length > 0 && slashSelectedIndex < filtered.length) {
          executeSlashCommand(filtered[slashSelectedIndex]);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsSlashMenuOpen(false);
        setSlashTriggerIndex(null);
        setSlashQuery("");
        return;
      }
    }

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveSelection();
    const textarea = e.target;
    const newValue = textarea.value;
    const cursor = textarea.selectionStart;
    onChange(newValue);

    const lastChar = newValue[cursor - 1];
    const prevChar = newValue[cursor - 2];

    // Trigger Slash Menu if '/' is typed at start of line or after whitespace
    if (lastChar === "/" && (!prevChar || /\s/.test(prevChar))) {
      const coords = getTextareaCaretCoordinates(textarea, cursor - 1);
      setIsSlashMenuOpen(true);
      setSlashQuery("");
      setSlashSelectedIndex(0);
      setSlashTriggerIndex(cursor - 1);
      setSlashPosition({ top: coords.top, left: coords.left });
    } else if (isSlashMenuOpen && slashTriggerIndex !== null) {
      if (cursor <= slashTriggerIndex) {
        // Backspaced past slash
        setIsSlashMenuOpen(false);
        setSlashTriggerIndex(null);
        setSlashQuery("");
      } else {
        const currentQuery = newValue.substring(slashTriggerIndex + 1, cursor);
        if (currentQuery.includes(" ") || currentQuery.includes("\n")) {
          // Space or newline closes slash menu
          setIsSlashMenuOpen(false);
          setSlashTriggerIndex(null);
          setSlashQuery("");
        } else {
          const coords = getTextareaCaretCoordinates(textarea, slashTriggerIndex);
          setSlashQuery(currentQuery);
          setSlashSelectedIndex(0);
          setSlashPosition({ top: coords.top, left: coords.left });
        }
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
          ref={lineNumbersRef}
          className="select-none py-5 px-3 text-right font-mono text-xs opacity-30 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0d14] shrink-0 overflow-hidden"
          aria-hidden="true"
          style={{
            width: `${Math.max(3, String(lines.length).length + 1) * 0.85}rem`,
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}

      {/* Lightweight Native Textarea Workspace */}
      <div className="relative flex-1 h-full w-full overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onKeyUp={saveSelection}
          onClick={saveSelection}
          onMouseUp={saveSelection}
          onPointerUp={saveSelection}
          onFocus={saveSelection}
          onSelect={saveSelection}
          onScroll={handleScrollCombined}
          spellCheck={false}
          placeholder="Type '/' for commands or start writing your Markdown here..."
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
            caretColor: "#10b981",
          }}
          className={`h-full w-full resize-none border-none bg-transparent p-5 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-0 selection:bg-emerald-500/20 selection:text-emerald-950 dark:selection:text-emerald-100 transition-colors ${
            wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
          }`}
        />

        {/* Floating Notion-Style '/' Slash Command Palette */}
        {isSlashMenuOpen && (
          <SlashCommandMenu
            query={slashQuery}
            selectedIndex={slashSelectedIndex}
            onSelect={executeSlashCommand}
            onClose={() => {
              setIsSlashMenuOpen(false);
              setSlashTriggerIndex(null);
              setSlashQuery("");
            }}
            position={slashPosition}
          />
        )}
      </div>
    </div>
  );
}
