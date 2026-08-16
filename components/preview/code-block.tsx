"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Prism from "prismjs";

// Load common Prism languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-yaml";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "text",
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState(code);

  const cleanLang = (language || "text").toLowerCase().replace(/^language-/, "");

  useEffect(() => {
    try {
      const grammar = Prism.languages[cleanLang] || Prism.languages.text;
      if (grammar) {
        const html = Prism.highlight(code, grammar, cleanLang);
        setHighlightedCode(html);
      } else {
        setHighlightedCode(escapeHtml(code));
      }
    } catch {
      setHighlightedCode(escapeHtml(code));
    }
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
    <div className="group relative my-5 overflow-hidden rounded-[var(--md-radius)] border border-[var(--md-code-border)] bg-[var(--md-code-bg)] text-xs font-mono transition-all">
      {/* Top Header Bar with Language Badge and Copy Button */}
      <div className="flex items-center justify-between border-b border-[var(--md-code-border)]/50 bg-[var(--md-code-bg)] px-3 py-1.5 text-[var(--md-muted-fg)]">
        <span className="font-semibold uppercase tracking-wider text-[10px] opacity-75">
          {cleanLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-[var(--md-muted-fg)] transition-colors hover:bg-[var(--md-muted)] hover:text-[var(--md-fg)]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
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
      <div className="flex overflow-x-auto p-3 text-[var(--md-code-fg)] leading-relaxed">
        {showLineNumbers && (
          <div
            className="select-none pr-3 text-right font-mono opacity-30 border-r border-[var(--md-code-border)]/50 mr-3 shrink-0"
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre className="flex-1 overflow-x-auto bg-transparent p-0 m-0 font-mono">
          <code
            className={`language-${cleanLang} block`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
