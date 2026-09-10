"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Braces,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Info,
  Lightbulb,
  AlertTriangle,
  Flame,
  Sigma,
  GitBranch,
  FileCode,
  Sparkles,
  Search,
} from "lucide-react";

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
  category: "Basic" | "Code & Media" | "Alerts" | "Math & Diagrams";
  execute: () => {
    snippet: string;
    cursorOffset: number;
    selectionLength: number;
  };
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  // Basic
  {
    id: "h1",
    title: "Heading 1",
    description: "Large section heading",
    keywords: ["h1", "heading1", "header", "title"],
    icon: <Heading1 className="h-4 w-4 text-blue-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "# Heading 1",
      cursorOffset: 2,
      selectionLength: 9,
    }),
  },
  {
    id: "h2",
    title: "Heading 2",
    description: "Medium section heading",
    keywords: ["h2", "heading2", "header", "subtitle"],
    icon: <Heading2 className="h-4 w-4 text-blue-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "## Heading 2",
      cursorOffset: 3,
      selectionLength: 9,
    }),
  },
  {
    id: "h3",
    title: "Heading 3",
    description: "Small section heading",
    keywords: ["h3", "heading3", "header", "subheading"],
    icon: <Heading3 className="h-4 w-4 text-blue-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "### Heading 3",
      cursorOffset: 4,
      selectionLength: 9,
    }),
  },
  {
    id: "bullet-list",
    title: "Bullet List",
    description: "Create a simple bulleted list",
    keywords: ["bullet", "list", "ul", "unordered"],
    icon: <List className="h-4 w-4 text-emerald-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "- List item",
      cursorOffset: 2,
      selectionLength: 9,
    }),
  },
  {
    id: "numbered-list",
    title: "Numbered List",
    description: "Create a numbered list",
    keywords: ["number", "numbered", "ol", "list"],
    icon: <ListOrdered className="h-4 w-4 text-emerald-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "1. List item",
      cursorOffset: 3,
      selectionLength: 9,
    }),
  },
  {
    id: "task-list",
    title: "Task List",
    description: "Track tasks with a checkbox",
    keywords: ["task", "todo", "checkbox", "check"],
    icon: <CheckSquare className="h-4 w-4 text-emerald-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "- [ ] Task item",
      cursorOffset: 6,
      selectionLength: 9,
    }),
  },
  {
    id: "quote",
    title: "Blockquote",
    description: "Capture a quote or block note",
    keywords: ["quote", "blockquote", "cite"],
    icon: <Quote className="h-4 w-4 text-amber-500" />,
    category: "Basic",
    execute: () => ({
      snippet: "> Quote text",
      cursorOffset: 2,
      selectionLength: 10,
    }),
  },
  {
    id: "divider",
    title: "Horizontal Rule",
    description: "Insert a horizontal divider line",
    keywords: ["hr", "divider", "line", "rule"],
    icon: <Minus className="h-4 w-4 text-neutral-400" />,
    category: "Basic",
    execute: () => ({
      snippet: "---\n",
      cursorOffset: 4,
      selectionLength: 0,
    }),
  },

  // Code & Media
  {
    id: "code-block",
    title: "Code Block",
    description: "Syntax highlighted code snippet",
    keywords: ["code", "pre", "js", "ts", "python", "snippet"],
    icon: <Braces className="h-4 w-4 text-indigo-500" />,
    category: "Code & Media",
    execute: () => ({
      snippet: "```typescript\nconst greeting = \"Hello, rendermd!\";\nconsole.log(greeting);\n```\n",
      cursorOffset: 14,
      selectionLength: 55,
    }),
  },
  {
    id: "table",
    title: "Markdown Table",
    description: "Insert a formatted data table",
    keywords: ["table", "grid", "data", "columns"],
    icon: <TableIcon className="h-4 w-4 text-cyan-500" />,
    category: "Code & Media",
    execute: () => ({
      snippet: `| Column 1 | Column 2 | Column 3 |
| :--- | :---: | ---: |
| Item A | Details | $10.00 |
| Item B | Details | $25.00 |\n`,
      cursorOffset: 2,
      selectionLength: 8,
    }),
  },
  {
    id: "link",
    title: "Link",
    description: "Add a URL hyperlink",
    keywords: ["link", "url", "href"],
    icon: <LinkIcon className="h-4 w-4 text-blue-400" />,
    category: "Code & Media",
    execute: () => ({
      snippet: "[link text](https://example.com)",
      cursorOffset: 1,
      selectionLength: 9,
    }),
  },
  {
    id: "image",
    title: "Image",
    description: "Embed an image from URL",
    keywords: ["image", "img", "photo", "picture"],
    icon: <ImageIcon className="h-4 w-4 text-purple-400" />,
    category: "Code & Media",
    execute: () => ({
      snippet: "![alt text](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe)",
      cursorOffset: 2,
      selectionLength: 8,
    }),
  },

  // Alerts
  {
    id: "alert-note",
    title: "Alert: Note",
    description: "Blue info alert callout",
    keywords: ["note", "info", "alert"],
    icon: <Info className="h-4 w-4 text-blue-500" />,
    category: "Alerts",
    execute: () => ({
      snippet: "> [!NOTE]\n> Enter note details here...\n",
      cursorOffset: 12,
      selectionLength: 25,
    }),
  },
  {
    id: "alert-tip",
    title: "Alert: Tip",
    description: "Green helpful tip callout",
    keywords: ["tip", "hint", "alert", "green"],
    icon: <Lightbulb className="h-4 w-4 text-emerald-500" />,
    category: "Alerts",
    execute: () => ({
      snippet: "> [!TIP]\n> Enter tip details here...\n",
      cursorOffset: 11,
      selectionLength: 24,
    }),
  },
  {
    id: "alert-important",
    title: "Alert: Important",
    description: "Purple key information callout",
    keywords: ["important", "key", "purple"],
    icon: <Sparkles className="h-4 w-4 text-purple-500" />,
    category: "Alerts",
    execute: () => ({
      snippet: "> [!IMPORTANT]\n> Enter key information here...\n",
      cursorOffset: 17,
      selectionLength: 27,
    }),
  },
  {
    id: "alert-warning",
    title: "Alert: Warning",
    description: "Amber warning callout",
    keywords: ["warning", "alert", "amber", "yellow"],
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    category: "Alerts",
    execute: () => ({
      snippet: "> [!WARNING]\n> Enter warning details here...\n",
      cursorOffset: 15,
      selectionLength: 27,
    }),
  },
  {
    id: "alert-caution",
    title: "Alert: Caution",
    description: "Red high-risk caution callout",
    keywords: ["caution", "danger", "red", "risk"],
    icon: <Flame className="h-4 w-4 text-red-500" />,
    category: "Alerts",
    execute: () => ({
      snippet: "> [!CAUTION]\n> Enter high-risk warning here...\n",
      cursorOffset: 15,
      selectionLength: 28,
    }),
  },

  // Math & Diagrams
  {
    id: "math",
    title: "Math Equation",
    description: "KaTeX display math equation",
    keywords: ["math", "katex", "latex", "formula", "equation"],
    icon: <Sigma className="h-4 w-4 text-emerald-500" />,
    category: "Math & Diagrams",
    execute: () => ({
      snippet: "$$\n\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}\n$$\n",
      cursorOffset: 3,
      selectionLength: 42,
    }),
  },
  {
    id: "diagram-flowchart",
    title: "Mermaid: Flowchart",
    description: "Interactive flowchart diagram",
    keywords: ["flowchart", "graph", "mermaid", "diagram"],
    icon: <GitBranch className="h-4 w-4 text-indigo-400" />,
    category: "Math & Diagrams",
    execute: () => ({
      snippet: `\`\`\`mermaid
graph TD
    A[Start] --> B{Process}
    B -->|Success| C[Finish]
    B -->|Failure| D[Retry]
\`\`\`\n`,
      cursorOffset: 12,
      selectionLength: 85,
    }),
  },
  {
    id: "diagram-sequence",
    title: "Mermaid: Sequence",
    description: "Sequence interaction diagram",
    keywords: ["sequence", "interaction", "mermaid"],
    icon: <GitBranch className="h-4 w-4 text-indigo-400" />,
    category: "Math & Diagrams",
    execute: () => ({
      snippet: `\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>Server: Request Data
    Server-->>Client: Response Data
\`\`\`\n`,
      cursorOffset: 12,
      selectionLength: 95,
    }),
  },
  {
    id: "frontmatter",
    title: "Frontmatter Metadata",
    description: "YAML document header metadata",
    keywords: ["frontmatter", "yaml", "meta", "author", "title"],
    icon: <FileCode className="h-4 w-4 text-rose-400" />,
    category: "Math & Diagrams",
    execute: () => {
      const today = new Date().toISOString().split("T")[0];
      return {
        snippet: `---\ntitle: "Document Title"\ndescription: "Brief document summary"\nauthor: "Author Name"\ndate: "${today}"\ntags: [markdown, documentation]\ndraft: false\n---\n\n`,
        cursorOffset: 13,
        selectionLength: 14,
      };
    },
  },
];

interface SlashCommandMenuProps {
  query: string;
  selectedIndex: number;
  onSelect: (command: SlashCommandItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function SlashCommandMenu({
  query,
  selectedIndex,
  onSelect,
  onClose,
  position,
}: SlashCommandMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    const cleanQ = query.toLowerCase().trim();
    if (!cleanQ) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(cleanQ) ||
        cmd.description.toLowerCase().includes(cleanQ) ||
        cmd.keywords.some((kw) => kw.toLowerCase().includes(cleanQ))
    );
  }, [query]);

  // Group commands by category
  const categories: Array<SlashCommandItem["category"]> = [
    "Basic",
    "Code & Media",
    "Alerts",
    "Math & Diagrams",
  ];

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-[9999] w-76 rounded-xl border border-neutral-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#111622]/95 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 select-none font-sans"
    >
      {/* Header Prompt */}
      <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/80 px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
        <Search className="h-3.5 w-3.5 text-neutral-400" />
        <span className="font-mono text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          /{query}
        </span>
        <span className="ml-auto font-mono text-[9px] text-neutral-400">
          ↑↓ navigate • ↵ select
        </span>
      </div>

      {/* Commands List */}
      <div className="max-h-72 overflow-y-auto p-1.5 space-y-3 scrollbar-thin">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-neutral-500">
            No matching commands found.
          </div>
        ) : (
          categories.map((category) => {
            const categoryCommands = filteredCommands.filter(
              (cmd) => cmd.category === category
            );
            if (categoryCommands.length === 0) return null;

            return (
              <div key={category} className="space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  {category}
                </div>
                {categoryCommands.map((command) => {
                  const absoluteIndex = filteredCommands.indexOf(command);
                  const isSelected = absoluteIndex === selectedIndex;

                  return (
                    <button
                      key={command.id}
                      ref={isSelected ? selectedItemRef : null}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(command);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium ring-1 ring-emerald-500/30"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200/60 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        {command.icon}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="leading-tight font-medium text-neutral-900 dark:text-neutral-100">{command.title}</div>
                        <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {command.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
}
