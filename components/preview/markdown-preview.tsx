"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { remarkAlert } from "remark-github-blockquote-alert";
import { DocumentPreset } from "@/types/preset";
import { PageSize } from "@/types/document";
import { generatePresetCSSVariables } from "@/lib/presets/generator";
import { extractFrontmatter } from "@/lib/markdown/frontmatter";
import { FrontmatterBlock } from "./frontmatter-block";
import { MermaidBlock } from "./mermaid-block";
import { CodeBlock } from "./code-block";
import { slugify } from "@/lib/markdown/toc";

interface MarkdownPreviewProps {
  content: string;
  preset: DocumentPreset;
  pageSize?: PageSize;
  showLineNumbers?: boolean;
  className?: string;
  id?: string;
}

export function MarkdownPreview({
  content,
  preset,
  pageSize = "continuous",
  showLineNumbers = false,
  className = "",
  id = "markdown-preview-root",
}: MarkdownPreviewProps) {
  const cssVariables = useMemo(() => {
    return generatePresetCSSVariables(preset);
  }, [preset]);

  const { frontmatter, body } = useMemo(() => {
    return extractFrontmatter(content);
  }, [content]);

  // Page width styling depending on PageSize
  const pageSizeClass = useMemo(() => {
    switch (pageSize) {
      case "a4":
        return "w-full sm:max-w-[794px] min-h-screen sm:min-h-[1123px] sm:shadow-lg my-0 sm:my-8 mx-auto border-0 sm:border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-sm";
      case "letter":
        return "w-full sm:max-w-[816px] min-h-screen sm:min-h-[1056px] sm:shadow-lg my-0 sm:my-8 mx-auto border-0 sm:border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-sm";
      case "continuous":
      default:
        return "w-full max-w-full sm:max-w-[var(--md-max-width)] mx-auto";
    }
  }, [pageSize]);

  return (
    <div
      id={id}
      style={cssVariables as React.CSSProperties}
      className={`markdown-document relative px-4 sm:px-[var(--md-padding-page)] py-5 sm:py-8 transition-colors duration-200 ${pageSizeClass} ${className}`}
    >
      <FrontmatterBlock frontmatter={frontmatter} preset={preset} />
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkAlert]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Heading anchors with IDs for TOC linking
          h1: ({ children, ...props }) => {
            const text = String(children);
            const slug = slugify(text);
            return (
              <h1 id={slug} className="group relative" {...props}>
                <a
                  href={`#${slug}`}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60 text-xs no-underline font-mono select-none"
                  aria-hidden="true"
                >
                  #
                </a>
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = String(children);
            const slug = slugify(text);
            return (
              <h2 id={slug} className="group relative" {...props}>
                <a
                  href={`#${slug}`}
                  className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60 text-xs no-underline font-mono select-none"
                  aria-hidden="true"
                >
                  ##
                </a>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const slug = slugify(text);
            return (
              <h3 id={slug} className="group relative" {...props}>
                <a
                  href={`#${slug}`}
                  className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60 text-xs no-underline font-mono select-none"
                  aria-hidden="true"
                >
                  ###
                </a>
                {children}
              </h3>
            );
          },
          // Custom Code and Mermaid Interceptor
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const rawCode = String(children).replace(/\n$/, "");

            // If it's a mermaid block, intercept and render interactive SVG
            if (language === "mermaid") {
              return <MermaidBlock chart={rawCode} preset={preset} />;
            }

            // If it's a fenced code block with multiple lines or language
            if (match || rawCode.includes("\n")) {
              return (
                <CodeBlock
                  code={rawCode}
                  language={language}
                  showLineNumbers={showLineNumbers}
                  presetId={preset.id}
                  isDark={preset.isDark}
                />
              );
            }

            // Inline code
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children, ...props }) => (
            <blockquote {...props}>{children}</blockquote>
          ),
          // Styled Task List Checkboxes
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <span className="inline-flex items-center align-middle mr-2 -mt-0.5 select-none" {...props}>
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border transition-all ${
                      checked
                        ? "bg-[var(--md-accent)] border-[var(--md-accent)] text-white shadow-2xs"
                        : "border-neutral-400/60 dark:border-neutral-600 bg-white/60 dark:bg-neutral-800/60"
                    }`}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3 stroke-[3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                </span>
              );
            }
            return <input type={type} {...props} />;
          },
          // Links with clean external handling
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Responsive Tables
          table: ({ children, ...props }) => (
            <div className="my-6 w-full overflow-x-auto rounded-[var(--md-radius)] border border-[var(--md-table-border)]">
              <table className="w-full text-left" {...props}>
                {children}
              </table>
            </div>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
