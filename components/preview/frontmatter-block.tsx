"use client";

import React, { useState } from "react";
import {
  FileCode,
  Tag,
  User,
  Calendar,
  Eye,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  ExternalLink,
  Palette,
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

  if (frontmatter.isEmpty) {
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

  // Known primary keys handled in top header section
  const primaryKeys = new Set([
    "title",
    "description",
    "summary",
    "author",
    "date",
    "tags",
    "categories",
    "status",
    "draft",
  ]);

  // Secondary custom key-value fields
  const secondaryFields = frontmatter.fields.filter(
    (field) => !primaryKeys.has(field.key.toLowerCase())
  );

  return (
    <div
      className={`frontmatter-block-root not-prose my-6 rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-surface-subtle)]/70 backdrop-blur-xs overflow-hidden transition-all duration-200 shadow-sm ${className}`}
    >
      {/* Top Action & Format Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--md-border)] bg-black/5 dark:bg-white/5 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium tracking-wide uppercase bg-[var(--md-accent)]/15 text-[var(--md-accent)] border border-[var(--md-accent)]/30">
            <FileCode className="h-3.5 w-3.5" />
            <span>{frontmatter.format} frontmatter</span>
          </div>

          {frontmatter.title && (
            <span className="hidden sm:inline-block text-xs text-[var(--md-text-muted)] truncate max-w-[200px] font-medium">
              {frontmatter.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Formatted vs Raw View Toggle */}
          <div className="flex items-center rounded-md border border-[var(--md-border)] bg-background/60 p-0.5 text-xs">
            <button
              onClick={() => setViewMode("formatted")}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                viewMode === "formatted"
                  ? "bg-[var(--md-accent)] text-white font-medium"
                  : "text-[var(--md-text-muted)] hover:text-foreground"
              }`}
              title="Formatted Metadata View"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden xs:inline">Formatted</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                viewMode === "raw"
                  ? "bg-[var(--md-accent)] text-white font-medium"
                  : "text-[var(--md-text-muted)] hover:text-foreground"
              }`}
              title="Raw Frontmatter Syntax"
            >
              <Code2 className="h-3 w-3" />
              <span className="hidden xs:inline">Raw</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--md-border)] bg-background/60 text-[var(--md-text-muted)] hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
            title="Copy frontmatter"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--md-border)] bg-background/60 text-[var(--md-text-muted)] hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors"
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

      {/* Main Metadata Content Body */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {viewMode === "raw" ? (
            /* Raw Code View */
            <div className="relative">
              <pre className="p-3.5 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto border border-neutral-800 leading-relaxed">
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
            /* Formatted View */
            <div className="space-y-4">
              {/* Document Header Section: Title & Summary */}
              {(frontmatter.title || frontmatter.description) && (
                <div className="border-b border-[var(--md-border)]/60 pb-3.5 space-y-1">
                  {frontmatter.title && (
                    <h2 className="text-xl font-bold tracking-tight text-foreground font-[var(--md-font-heading)]">
                      {frontmatter.title}
                    </h2>
                  )}
                  {frontmatter.description && (
                    <p className="text-sm text-[var(--md-text-muted)] leading-relaxed font-[var(--md-font-body)]">
                      {frontmatter.description}
                    </p>
                  )}
                </div>
              )}

              {/* Primary Key Badges & Metadata Section */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
                {/* Author */}
                {frontmatter.author && (
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <User className="h-3.5 w-3.5 text-[var(--md-accent)] shrink-0" />
                    <span className="text-[var(--md-text-muted)]">Author:</span>
                    <span>
                      {Array.isArray(frontmatter.author)
                        ? frontmatter.author.join(", ")
                        : frontmatter.author}
                    </span>
                  </div>
                )}

                {/* Date */}
                {frontmatter.date && (
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-[var(--md-accent)] shrink-0" />
                    <span className="text-[var(--md-text-muted)]">Date:</span>
                    <span>{frontmatter.date}</span>
                  </div>
                )}

                {/* Status / Draft */}
                {(frontmatter.status || frontmatter.draft !== undefined) && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Activity className="h-3.5 w-3.5 text-[var(--md-accent)] shrink-0" />
                    <span className="text-[var(--md-text-muted)]">Status:</span>
                    {frontmatter.draft !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          frontmatter.draft
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            frontmatter.draft ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                        {frontmatter.draft ? "Draft" : "Published"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--md-accent)]/15 text-[var(--md-accent)] border border-[var(--md-accent)]/30">
                        {frontmatter.status}
                      </span>
                    )}
                  </div>
                )}

                {/* Tags & Categories */}
                {((frontmatter.tags && frontmatter.tags.length > 0) ||
                  (frontmatter.categories && frontmatter.categories.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[var(--md-accent)] shrink-0" />
                    <span className="text-[var(--md-text-muted)] font-medium">
                      Tags:
                    </span>
                    {[...(frontmatter.tags || []), ...(frontmatter.categories || [])].map(
                      (tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-background border border-[var(--md-border)] text-foreground shadow-2xs hover:border-[var(--md-accent)] transition-colors"
                        >
                          #{tag}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Custom / Secondary Frontmatter Fields Grid */}
              {secondaryFields.length > 0 && (
                <div className="pt-3 border-t border-[var(--md-border)]/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--md-text-muted)] uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Additional Metadata</span>
                  </div>

                  <div className="space-y-3">
                    {/* Render scalar / simple fields first */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {secondaryFields
                        .filter((field) => field.type !== "object")
                        .map((field) => (
                          <div
                            key={field.key}
                            className="flex flex-col p-2 rounded-md bg-background/60 border border-[var(--md-border)]/70 text-xs overflow-hidden"
                          >
                            <span className="font-mono text-[10px] text-[var(--md-text-muted)] uppercase tracking-wider truncate">
                              {field.key}
                            </span>
                            <div className="font-medium text-foreground mt-0.5 truncate flex items-center gap-1.5">
                              {renderFieldValue(field.value, field.type)}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Render nested object fields (e.g. colors, typography, theme) as dedicated sub-cards */}
                    {secondaryFields
                      .filter((field) => field.type === "object")
                      .map((field) => (
                        <div
                          key={field.key}
                          className="rounded-lg border border-[var(--md-border)] bg-background/50 p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2 border-b border-[var(--md-border)]/60 pb-2">
                            {field.key.toLowerCase().includes("color") ? (
                              <Palette className="h-3.5 w-3.5 text-[var(--md-accent)]" />
                            ) : (
                              <Layers className="h-3.5 w-3.5 text-[var(--md-accent)]" />
                            )}
                            <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wide">
                              {field.key}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(
                              (field.value as Record<string, FrontmatterValue>) || {}
                            ).map(([subKey, subVal]) => (
                              <div
                                key={subKey}
                                className="flex flex-col p-2 rounded bg-background border border-[var(--md-border)]/60 text-xs overflow-hidden"
                              >
                                <span className="font-mono text-[10px] text-[var(--md-text-muted)] uppercase tracking-wider truncate">
                                  {subKey}
                                </span>
                                <div className="font-medium text-foreground mt-0.5 truncate flex items-center gap-1.5">
                                  {renderFieldValue(subVal)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
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
  if (typeof val === "boolean") {
    return (
      <span
        className={`inline-block font-mono text-[11px] font-bold ${
          val ? "text-emerald-500" : "text-rose-500"
        }`}
      >
        {String(val)}
      </span>
    );
  }

  if (Array.isArray(val)) {
    return (
      <div className="flex flex-wrap gap-1">
        {val.map((item, i) => (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-foreground"
          >
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof val === "string") {
    const str = val.trim();

    // Hex Color Preview Swatch
    if (isHexColor(str)) {
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span
            className="h-3.5 w-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-2xs shrink-0"
            style={{ backgroundColor: str }}
            title={str}
          />
          <span className="truncate">{str}</span>
        </div>
      );
    }

    // URL clickable link
    if (isUrl(str)) {
      return (
        <a
          href={str}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--md-accent)] hover:underline truncate"
        >
          <span className="truncate">{str}</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
        </a>
      );
    }

    return <span className="truncate">{str}</span>;
  }

  if (typeof val === "object" && val !== null) {
    return (
      <span className="font-mono text-[11px] text-[var(--md-text-muted)] truncate">
        {JSON.stringify(val)}
      </span>
    );
  }

  return <span className="truncate">{String(val)}</span>;
}
