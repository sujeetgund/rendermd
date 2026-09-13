"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Prism from "prismjs";

// Import popular Prism language grammars for instant syntax highlighting
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markdown";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  presetId?: string;
  isDark?: boolean;
}

export function CodeBlock({
  code,
  language = "text",
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || "text").toLowerCase().replace(/^language-/, "");

  const highlightedCode = useMemo(() => {
    let lang = cleanLang;
    if (lang === "ts") lang = "typescript";
    if (lang === "js") lang = "javascript";
    if (lang === "py") lang = "python";
    if (lang === "sh" || lang === "zsh" || lang === "powershell") lang = "bash";
    if (lang === "yml") lang = "yaml";
    if (lang === "html" || lang === "xml" || lang === "svg") lang = "markup";
    if (lang === "md") lang = "markdown";

    const grammar =
      Prism.languages[lang] ||
      Prism.languages.typescript ||
      Prism.languages.javascript ||
      Prism.languages.clike;

    if (grammar) {
      try {
        return Prism.highlight(code, grammar, lang);
      } catch {
        return code;
      }
    }
    return code;
  }, [code, cleanLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const lines = code.split("\n");

  return (
    <div
      style={{
        backgroundColor: "var(--md-code-bg, rgba(0, 0, 0, 0.04))",
        color: "var(--md-code-fg, inherit)",
        borderColor: "var(--md-code-border, rgba(0, 0, 0, 0.08))",
      }}
      className="code-block-wrapper group relative my-5 overflow-hidden rounded-[var(--md-radius)] border text-xs font-mono transition-all"
    >
      {/* Header Bar with Language Badge and Copy Button */}
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.06)",
          borderBottomColor: "var(--md-code-border, rgba(0, 0, 0, 0.08))",
        }}
        className="code-block-header flex items-center justify-between border-b px-3 py-1.5 opacity-90"
      >
        <span className="code-block-lang font-semibold uppercase tracking-wider text-[10px] opacity-75">
          {cleanLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium opacity-80 hover:opacity-100 transition-opacity"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="code-block-body flex overflow-x-auto p-3 leading-relaxed">
        {showLineNumbers && (
          <div
            className="code-line-numbers select-none pr-3 text-right font-mono opacity-30 border-r border-neutral-500/20 mr-3 shrink-0"
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre
          style={{ backgroundColor: "transparent" }}
          className="code-pre flex-1 overflow-x-auto p-0 m-0 font-mono"
        >
          <code
            className={`language-${cleanLang} block whitespace-pre`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}
