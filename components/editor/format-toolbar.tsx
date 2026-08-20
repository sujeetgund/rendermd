"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Sigma,
  GitBranch,
  Info,
  ChevronDown,
  FileCode,
} from "lucide-react";
import { AlertType } from "@/components/preview/alert-block";

interface FormatToolbarProps {
  onInsert: (before: string, after?: string, defaultText?: string) => void;
}

export function FormatToolbar({ onInsert }: FormatToolbarProps) {
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showMermaidMenu, setShowMermaidMenu] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setShowAlertMenu(false);
      }
      if (mermaidRef.current && !mermaidRef.current.contains(event.target as Node)) {
        setShowMermaidMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const insertAlert = (type: AlertType) => {
    onInsert(`> [!${type}]\n> `, "", "Enter important alert text here");
    setShowAlertMenu(false);
  };

  const insertMermaid = (type: string) => {
    let snippet = "";
    switch (type) {
      case "flowchart":
        snippet = `\`\`\`mermaid
graph TD
    A[Start] --> B{Process}
    B -->|Success| C[Finish]
    B -->|Failure| D[Retry]
\`\`\`\n`;
        break;
      case "sequence":
        snippet = `\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>Server: Request Data
    Server-->>Client: Response Data
\`\`\`\n`;
        break;
      case "class":
        snippet = `\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal : +int age
    Animal : +gender
    Animal: +isMammal()
    Duck : +String beakColor
    Duck: +swim()
    Duck: +quack()
\`\`\`\n`;
        break;
      case "git":
        snippet = `\`\`\`mermaid
gitGraph
    commit
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit
\`\`\`\n`;
        break;
      case "mindmap":
        snippet = `\`\`\`mermaid
mindmap
  root((rendermd))
    Markdown
      GFM
      Alerts
    Diagrams
      Mermaid
      Flowcharts
    Math
      KaTeX
\`\`\`\n`;
        break;
      default:
        snippet = `\`\`\`mermaid
graph TD
    A --> B
\`\`\`\n`;
    }
    onInsert(snippet, "");
    setShowMermaidMenu(false);
  };

  const insertTable = () => {
    const tableSnippet = `
| Column 1 | Column 2 | Column 3 |
| :--- | :---: | ---: |
| Item 1 | Details | $10.00 |
| Item 2 | Details | $25.00 |
\n`;
    onInsert(tableSnippet, "");
  };

  return (
    <div className="relative z-30 flex flex-wrap items-center gap-0.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-[#0f141d]/90 px-3 py-1.5 backdrop-blur-xs text-neutral-700 dark:text-neutral-300 shrink-0 select-none overflow-visible">
      {/* Headings */}
      <button
        onClick={() => onInsert("# ", "", "Heading 1")}
        title="Heading 1"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("## ", "", "Heading 2")}
        title="Heading 2"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("### ", "", "Heading 3")}
        title="Heading 3"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-[1px] shrink-0 bg-neutral-300 dark:bg-neutral-700" />

      {/* Typography Modifiers */}
      <button
        onClick={() => onInsert("**", "**", "bold text")}
        title="Bold (Ctrl+B)"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("*", "*", "italic text")}
        title="Italic (Ctrl+I)"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("~~", "~~", "strikethrough text")}
        title="Strikethrough"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-[1px] shrink-0 bg-neutral-300 dark:bg-neutral-700" />

      {/* Code and Quotes */}
      <button
        onClick={() => onInsert("`", "`", "code")}
        title="Inline Code"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Code className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("```typescript\n", "\n```", "// Code goes here")}
        title="Code Block"
        className="flex h-7 px-1.5 shrink-0 items-center justify-center gap-1 rounded text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <span>{`{ }`}</span>
      </button>
      <button
        onClick={() => onInsert("> ", "", "quote text")}
        title="Quote"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Quote className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-[1px] shrink-0 bg-neutral-300 dark:bg-neutral-700" />

      {/* Lists & Tasks */}
      <button
        onClick={() => onInsert("- ", "", "List item")}
        title="Bullet List"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("1. ", "", "First item")}
        title="Numbered List"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("- [ ] ", "", "Todo task")}
        title="Task List"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <CheckSquare className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-[1px] shrink-0 bg-neutral-300 dark:bg-neutral-700" />

      {/* Links, Images, Tables */}
      <button
        onClick={() => onInsert("[", "](https://example.com)", "link title")}
        title="Insert Link"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onInsert("![", "](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe)", "Image description")}
        title="Insert Image"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <ImageIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={insertTable}
        title="Insert Table"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <TableIcon className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-[1px] shrink-0 bg-neutral-300 dark:bg-neutral-700" />

      {/* GitHub Alerts Dropdown */}
      <div ref={alertRef} className="relative shrink-0">
        <button
          onClick={() => {
            setShowAlertMenu(!showAlertMenu);
            setShowMermaidMenu(false);
          }}
          className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <Info className="h-3.5 w-3.5 text-blue-500" />
          <span>Alert</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {showAlertMenu && (
          <div className="absolute left-0 top-9 z-50 w-40 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => insertAlert("NOTE")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              <span>[!NOTE]</span>
            </button>
            <button
              onClick={() => insertAlert("TIP")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/50"
            >
              <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              <span>[!TIP]</span>
            </button>
            <button
              onClick={() => insertAlert("IMPORTANT")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
            >
              <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
              <span>[!IMPORTANT]</span>
            </button>
            <button
              onClick={() => insertAlert("WARNING")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span>[!WARNING]</span>
            </button>
            <button
              onClick={() => insertAlert("CAUTION")}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-left font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span>[!CAUTION]</span>
            </button>
          </div>
        )}
      </div>

      {/* KaTeX Math Equations */}
      <button
        onClick={() => onInsert("$$ \n", "\n $$", "E = mc^2")}
        title="KaTeX Display Equation"
        className="flex h-7 shrink-0 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <Sigma className="h-3.5 w-3.5 text-emerald-500" />
        <span>Math</span>
      </button>

      {/* Mermaid Diagram Templates */}
      <div ref={mermaidRef} className="relative shrink-0">
        <button
          onClick={() => {
            setShowMermaidMenu(!showMermaidMenu);
            setShowAlertMenu(false);
          }}
          className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
        >
          <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
          <span>Diagram</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {showMermaidMenu && (
          <div className="absolute left-0 top-9 z-50 w-44 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => insertMermaid("flowchart")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>Flowchart</span>
            </button>
            <button
              onClick={() => insertMermaid("sequence")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>Sequence Diagram</span>
            </button>
            <button
              onClick={() => insertMermaid("class")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>Class Diagram</span>
            </button>
            <button
              onClick={() => insertMermaid("git")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>Git Graph</span>
            </button>
            <button
              onClick={() => insertMermaid("mindmap")}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span>Mindmap</span>
            </button>
          </div>
        )}
      </div>

      {/* Frontmatter Metadata Button */}
      <button
        onClick={() =>
          onInsert(
            `---\ntitle: "Document Title"\ndescription: "Brief summary or abstract of the document"\nauthor: "Your Name"\ndate: "${new Date().toISOString().split("T")[0]}"\ntags: [markdown, frontmatter, document]\ndraft: false\n---\n\n`,
            ""
          )
        }
        title="Insert Frontmatter Metadata"
        className="flex h-7 shrink-0 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <FileCode className="h-3.5 w-3.5 text-rose-500" />
        <span>Frontmatter</span>
      </button>
    </div>
  );
}
