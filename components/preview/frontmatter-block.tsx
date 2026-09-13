"use client";

import React, { useState } from "react";
import {
  Eye,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import {
  FrontmatterData,
  FrontmatterField,
  FrontmatterValue,
} from "@/lib/markdown/frontmatter";
import { DocumentPreset } from "@/types/preset";

interface FrontmatterBlockProps {
  frontmatter: FrontmatterData;
  preset?: DocumentPreset;
  className?: string;
}

export function FrontmatterBlock({
  frontmatter,
  className = "",
}: FrontmatterBlockProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (frontmatter.isEmpty || !frontmatter.fields.length) {
    return null;
  }

  const handleCopy = async () => {
    try {
      const delimiter =
        frontmatter.format === "toml"
          ? "+++"
          : frontmatter.format === "json"
          ? ";;;"
          : "---";
      const fullFrontmatterStr = `${delimiter}\n${frontmatter.raw}\n${delimiter}`;
      await navigator.clipboard.writeText(fullFrontmatterStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignore
    }
  };

  return (
    <div
      className={`frontmatter-block-root not-prose my-5 rounded-lg border border-[var(--md-border,#e5e7eb)] bg-transparent overflow-hidden ${className}`}
    >
      {/* Clean SaaS Header Bar */}
      <div className="frontmatter-header-bar flex items-center justify-between px-3.5 py-2 border-b border-[var(--md-border,#e5e7eb)]/60 bg-[var(--md-surface-subtle,rgba(0,0,0,0.015))] select-none">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--md-muted-fg,#656d76)]">
          {frontmatter.format}
        </span>

        <div className="flex items-center gap-1">
          {/* Toggle View Mode Button */}
          <button
            onClick={() => setViewMode(viewMode === "formatted" ? "raw" : "formatted")}
            className="p-1 rounded-md text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            title={viewMode === "formatted" ? "View raw code" : "View formatted table"}
          >
            {viewMode === "formatted" ? (
              <Code2 className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            title="Copy frontmatter"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            title={isCollapsed ? "Expand metadata" : "Collapse metadata"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!isCollapsed && (
        <div>
          {viewMode === "raw" ? (
            /* Raw Code View */
            <div className="p-3 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed">
              <pre className="m-0">
                <code>
                  {frontmatter.format === "toml"
                    ? "+++"
                    : frontmatter.format === "json"
                    ? ";;;"
                    : "---"}
                  {"\n"}
                  {frontmatter.raw}
                  {"\n"}
                  {frontmatter.format === "toml"
                    ? "+++"
                    : frontmatter.format === "json"
                    ? ";;;"
                    : "---"}
                </code>
              </pre>
            </div>
          ) : (
            /* Clean Table */
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <tbody>
                  {frontmatter.fields.map((field) => (
                    <tr
                      key={field.key}
                      className="border-b last:border-b-0 border-[var(--md-border,#e5e7eb)]/60 bg-transparent"
                    >
                      {/* Key Column */}
                      <td className="py-2 px-3.5 font-mono text-[11px] font-medium text-[var(--md-muted-fg,#656d76)] w-1/4 max-w-[140px] align-top select-none border-r border-[var(--md-border,#e5e7eb)]/60">
                        {field.key}
                      </td>
                      {/* Value Column */}
                      <td className="py-2 px-3.5 text-xs text-[var(--md-fg,#1f2328)] align-top leading-normal font-normal">
                        {renderFieldValue(field.value, field.type)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isHexColor(val: string): boolean {
  return /^#(?:[0-9a-fA-F]{3,4}){1,2}$/.test(val.trim());
}

function isUrl(val: string): boolean {
  return /^https?:\/\//i.test(val.trim());
}

function renderFieldValue(
  val: FrontmatterValue,
  explicitType?: FrontmatterField["type"]
): React.ReactNode {
  // Boolean
  if (typeof val === "boolean") {
    return (
      <span
        className={`font-mono text-xs font-semibold ${
          val ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
        }`}
      >
        {String(val)}
      </span>
    );
  }

  // Array / List (Fully scalable for strings, numbers, dates, objects)
  if (Array.isArray(val)) {
    return (
      <span className="text-xs font-normal text-[var(--md-fg,#1f2328)]">
        {val.map(String).join(", ")}
      </span>
    );
  }

  // String
  if (typeof val === "string") {
    const str = val.trim();

    // Hex Color Swatch
    if (isHexColor(str)) {
      return (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs">
          <span
            className="h-3 w-3 rounded-full border border-black/20 dark:border-white/20 shrink-0"
            style={{ backgroundColor: str }}
            title={str}
          />
          <span>{str}</span>
        </div>
      );
    }

    // URL link
    if (isUrl(str)) {
      return (
        <a
          href={str}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--md-accent,#10b981)] hover:underline break-all"
        >
          <span>{str}</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
        </a>
      );
    }

    return <span className="break-words">{str}</span>;
  }

  // Object / Nested YAML
  if (typeof val === "object" && val !== null) {
    return (
      <div className="rounded border border-[var(--md-border,#e5e7eb)]/50 p-2 my-0.5 overflow-x-auto">
        <table className="w-full text-left text-[11px] font-mono">
          <tbody>
            {Object.entries(val).map(([subKey, subVal]) => (
              <tr key={subKey} className="border-b last:border-b-0 border-[var(--md-border,#e5e7eb)]/40">
                <td className="py-1 pr-2 font-medium text-[var(--md-muted-fg)] w-1/3">
                  {subKey}
                </td>
                <td className="py-1 text-[var(--md-fg)]">
                  {renderFieldValue(subVal as FrontmatterValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <span>{String(val)}</span>;
}
