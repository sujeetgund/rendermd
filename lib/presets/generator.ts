import { DocumentPreset } from "@/types/preset";

/**
 * Generates an object of CSS variables for a given DocumentPreset.
 * These variables are bound to the `.markdown-document` container.
 */
export function generatePresetCSSVariables(
  preset: DocumentPreset
): Record<string, string> {
  return {
    "--md-font-family": preset.typography.fontFamily,
    "--md-heading-font-family": preset.typography.headingFontFamily,
    "--md-mono-font-family": preset.typography.monoFontFamily,
    "--md-body-size": preset.typography.bodySize,
    "--md-line-height": preset.typography.lineHeight,
    "--md-heading-line-height": preset.typography.headingLineHeight,
    "--md-heading-weight": preset.typography.headingWeight,
    "--md-letter-spacing": preset.typography.letterSpacing,

    "--md-bg": preset.colors.background,
    "--md-fg": preset.colors.foreground,
    "--md-muted": preset.colors.muted,
    "--md-muted-fg": preset.colors.mutedForeground,
    "--md-border": preset.colors.border,
    "--md-accent": preset.colors.accent,
    "--md-accent-fg": preset.colors.accentForeground,

    "--md-heading": preset.colors.heading,
    "--md-link": preset.colors.link,
    "--md-link-hover": preset.colors.linkHover,

    "--md-code-bg": preset.colors.codeBackground,
    "--md-code-fg": preset.colors.codeForeground,
    "--md-code-border": preset.colors.codeBorder,

    "--md-quote-bg": preset.colors.quoteBackground,
    "--md-quote-border": preset.colors.quoteBorder,
    "--md-quote-fg": preset.colors.quoteForeground,

    "--md-table-border": preset.colors.tableBorder,
    "--md-table-header-bg": preset.colors.tableHeaderBackground,
    "--md-table-row-even-bg": preset.colors.tableRowEvenBackground,
    "--md-table-row-odd-bg": preset.colors.tableRowOddBackground,

    "--md-hr": preset.colors.hrColor,

    // Alert Callouts
    "--md-alert-note-border": preset.alerts.noteBorder,
    "--md-alert-note-bg": preset.alerts.noteBackground,
    "--md-alert-note-fg": preset.alerts.noteText,
    "--md-alert-note-icon": preset.alerts.noteIcon,

    "--md-alert-tip-border": preset.alerts.tipBorder,
    "--md-alert-tip-bg": preset.alerts.tipBackground,
    "--md-alert-tip-fg": preset.alerts.tipText,
    "--md-alert-tip-icon": preset.alerts.tipIcon,

    "--md-alert-important-border": preset.alerts.importantBorder,
    "--md-alert-important-bg": preset.alerts.importantBackground,
    "--md-alert-important-fg": preset.alerts.importantText,
    "--md-alert-important-icon": preset.alerts.importantIcon,

    "--md-alert-warning-border": preset.alerts.warningBorder,
    "--md-alert-warning-bg": preset.alerts.warningBackground,
    "--md-alert-warning-fg": preset.alerts.warningText,
    "--md-alert-warning-icon": preset.alerts.warningIcon,

    "--md-alert-caution-border": preset.alerts.cautionBorder,
    "--md-alert-caution-bg": preset.alerts.cautionBackground,
    "--md-alert-caution-fg": preset.alerts.cautionText,
    "--md-alert-caution-icon": preset.alerts.cautionIcon,

    // Spacing
    "--md-spacing-paragraph": preset.spacing.paragraph,
    "--md-spacing-heading-top": preset.spacing.headingTop,
    "--md-spacing-heading-bottom": preset.spacing.headingBottom,
    "--md-spacing-section": preset.spacing.section,
    "--md-spacing-list": preset.spacing.listSpacing,
    "--md-padding-page": preset.spacing.pagePadding,
    "--md-max-width": preset.spacing.maxWidth,
    "--md-radius": preset.spacing.radius,

    // Math
    "--md-math-color": preset.math.color,
    "--md-math-font-size": preset.math.fontSize,
    "--md-math-display-padding": preset.math.displayPadding,
  };
}

/**
 * Returns a standalone CSS string with preset variables and base markdown rules.
 * Used for independent HTML exports and PDF generation.
 */
export function generatePresetCSSString(preset: DocumentPreset): string {
  const vars = generatePresetCSSVariables(preset);
  const varDeclarations = Object.entries(vars)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join("\n");

  return `
:root, .markdown-document {
${varDeclarations}
}

.markdown-document {
  font-family: var(--md-font-family);
  font-size: var(--md-body-size);
  line-height: var(--md-line-height);
  letter-spacing: var(--md-letter-spacing);
  color: var(--md-fg);
  background-color: var(--md-bg);
  box-sizing: border-box;
}

.markdown-document * {
  box-sizing: border-box;
}

.markdown-document h1,
.markdown-document h2,
.markdown-document h3,
.markdown-document h4,
.markdown-document h5,
.markdown-document h6 {
  font-family: var(--md-heading-font-family);
  font-weight: var(--md-heading-weight);
  line-height: var(--md-heading-line-height);
  color: var(--md-heading);
  margin-top: var(--md-spacing-heading-top);
  margin-bottom: var(--md-spacing-heading-bottom);
  scroll-margin-top: 5rem;
}

.markdown-document h1 { font-size: 2.25em; border-bottom: 1px solid var(--md-border); padding-bottom: 0.3em; }
.markdown-document h2 { font-size: 1.65em; border-bottom: 1px solid var(--md-border); padding-bottom: 0.25em; }
.markdown-document h3 { font-size: 1.35em; }
.markdown-document h4 { font-size: 1.15em; }
.markdown-document h5 { font-size: 1em; }
.markdown-document h6 { font-size: 0.875em; opacity: 0.85; }

.markdown-document p {
  margin-top: 0;
  margin-bottom: var(--md-spacing-paragraph);
}

.markdown-document a {
  color: var(--md-link);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
  transition: color 0.15s ease;
}
.markdown-document a:hover {
  color: var(--md-link-hover);
}

.markdown-document strong {
  font-weight: 600;
  color: var(--md-heading);
}

.markdown-document hr {
  border: none;
  border-top: 1px solid var(--md-hr);
  margin: var(--md-spacing-section) 0;
}

.markdown-document blockquote {
  margin: 1.25rem 0;
  padding: 0.75rem 1.25rem;
  border-left: 4px solid var(--md-quote-border);
  background-color: var(--md-quote-bg);
  color: var(--md-quote-fg);
  border-radius: 0 var(--md-radius) var(--md-radius) 0;
}

.markdown-document blockquote p:last-child {
  margin-bottom: 0;
}

.markdown-document ul,
.markdown-document ol {
  margin: 0 0 var(--md-spacing-paragraph) 0;
  padding-left: 1.75rem;
}

.markdown-document li {
  margin-bottom: var(--md-spacing-list);
}

.markdown-document li > ul,
.markdown-document li > ol {
  margin-top: var(--md-spacing-list);
  margin-bottom: 0;
}

/* Task Lists & Checkbox Styling */
.markdown-document ul.contains-task-list,
.markdown-document ul.task-list,
.markdown-document li.task-list-item {
  list-style: none !important;
  list-style-type: none !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
}

.markdown-document li.task-list-item::marker,
.markdown-document ul.contains-task-list > li::marker {
  content: "" !important;
  display: none !important;
}

.markdown-document li.task-list-item,
.markdown-document ul.contains-task-list li {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  margin-bottom: var(--md-spacing-list) !important;
  list-style: none !important;
}

/* Checkbox Outer Wrapper */
.markdown-document .task-checkbox-wrapper,
.markdown-document input[type="checkbox"] + span,
.markdown-document li > span:first-child {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  vertical-align: middle !important;
  margin-right: 0.4rem !important;
  flex-shrink: 0 !important;
}

/* Native fallback input[type="checkbox"] */
.markdown-document input[type="checkbox"] {
  width: 1rem !important;
  height: 1rem !important;
  margin-right: 0.4rem !important;
  accent-color: var(--md-accent) !important;
  cursor: default !important;
}

/* Custom Checkbox Box */
.markdown-document .task-checkbox-box {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
  border-radius: 4px !important;
  border: 1.5px solid var(--md-border) !important;
  background-color: rgba(255, 255, 255, 0.05) !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
  transition: all 0.15s ease !important;
}

/* Checked Box State */
.markdown-document .task-checkbox-checked,
.markdown-document .task-checkbox-box:has(svg) {
  background-color: var(--md-accent) !important;
  border-color: var(--md-accent) !important;
  color: #ffffff !important;
}

/* Checkmark Icon SVG */
.markdown-document .task-checkbox-icon,
.markdown-document .task-checkbox-box svg {
  width: 11px !important;
  height: 11px !important;
  min-width: 11px !important;
  min-height: 11px !important;
  stroke: #ffffff !important;
  stroke-width: 3px !important;
  fill: none !important;
  display: block !important;
}

.markdown-document code:not(pre code) {
  font-family: var(--md-mono-font-family);
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  border-radius: var(--md-radius);
  background-color: var(--md-code-bg);
  color: var(--md-code-fg);
  border: 1px solid var(--md-code-border);
}

.markdown-document .code-block-wrapper {
  margin: 1.25rem 0;
  border-radius: var(--md-radius);
  background-color: var(--md-code-bg);
  border: 1px solid var(--md-code-border);
  overflow: hidden;
}

.markdown-document .code-block-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0.4rem 0.75rem !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  border-bottom: 1px solid var(--md-code-border) !important;
  font-family: var(--md-mono-font-family) !important;
  font-size: 0.75rem !important;
}

.markdown-document .code-block-body {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  padding: 0.75rem 1rem !important;
  overflow-x: auto !important;
  line-height: 1.5 !important;
}

.markdown-document .code-line-numbers {
  display: flex !important;
  flex-direction: column !important;
  text-align: right !important;
  padding-right: 0.75rem !important;
  margin-right: 0.75rem !important;
  border-right: 1px solid var(--md-code-border) !important;
  color: var(--md-muted-fg) !important;
  opacity: 0.4 !important;
  font-family: var(--md-mono-font-family) !important;
  font-size: 0.8125rem !important;
  line-height: 1.5 !important;
  user-select: none !important;
  flex-shrink: 0 !important;
}

.markdown-document pre,
.markdown-document .code-pre {
  flex: 1 1 0% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  overflow-x: auto !important;
}

.markdown-document pre code,
.markdown-document .code-pre code {
  display: block !important;
  font-family: var(--md-mono-font-family) !important;
  font-size: 0.85rem !important;
  line-height: 1.5 !important;
  white-space: pre !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

/* Prism Syntax Highlighting Tokens */
.markdown-document .token.comment,
.markdown-document .token.prolog,
.markdown-document .token.doctype,
.markdown-document .token.cdata {
  color: #8b949e;
  font-style: italic;
}
.markdown-document .token.namespace { opacity: 0.7; }
.markdown-document .token.string,
.markdown-document .token.attr-value { color: #a5d6ff; }
.markdown-document .token.punctuation { color: #c9d1d9; }
.markdown-document .token.operator { color: #ff7b72; }
.markdown-document .token.keyword { color: #ff7b72; font-weight: 600; }
.markdown-document .token.function,
.markdown-document .token.class-name { color: #d2a8ff; }
.markdown-document .token.boolean,
.markdown-document .token.number,
.markdown-document .token.constant,
.markdown-document .token.property,
.markdown-document .token.symbol { color: #79c0ff; }
.markdown-document .token.tag,
.markdown-document .token.selector,
.markdown-document .token.attr-name { color: #7ee787; }
.markdown-document .token.variable,
.markdown-document .token.regex,
.markdown-document .token.important { color: #ffa657; }

.markdown-document table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95em;
  display: block;
  overflow-x: auto;
}

.markdown-document table th,
.markdown-document table td {
  padding: 0.65rem 1rem;
  border: 1px solid var(--md-table-border);
}

.markdown-document table th {
  background-color: var(--md-table-header-bg);
  font-weight: 600;
  color: var(--md-heading);
}

.markdown-document table tr:nth-child(even) td {
  background-color: var(--md-table-row-even-bg);
}

.markdown-document table tr:nth-child(odd) td {
  background-color: var(--md-table-row-odd-bg);
}

.markdown-document img {
  max-width: 100%;
  height: auto;
  border-radius: var(--md-radius);
  margin: 1.25rem 0;
  display: block;
}

/* Math (KaTeX) styling */
.markdown-document .katex {
  color: var(--md-math-color);
  font-size: var(--md-math-font-size);
}

.markdown-document .katex-display {
  padding: var(--md-math-display-padding) 0;
  margin: 0.5rem 0;
  overflow-x: auto;
  overflow-y: hidden;
}

/* GitHub Alerts / Callout Boxes */
.markdown-document .markdown-alert,
.markdown-document blockquote.markdown-alert {
  margin: 1.25rem 0;
  padding: 0.85rem 1.15rem;
  border-left: 4px solid var(--md-border);
  border-radius: 0 var(--md-radius) var(--md-radius) 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  background-color: var(--md-quote-bg);
}

.markdown-document .markdown-alert > :last-child {
  margin-bottom: 0 !important;
}

.markdown-document .markdown-alert p {
  margin-top: 0.35rem;
  margin-bottom: 0.35rem;
}

.markdown-document .markdown-alert .markdown-alert-title {
  display: flex !important;
  align-items: center !important;
  gap: 0.4rem;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  margin-top: 0 !important;
  margin-bottom: 0.35rem !important;
  line-height: 1.3 !important;
}

.markdown-document .markdown-alert .markdown-alert-title svg,
.markdown-document .markdown-alert .markdown-alert-title svg.octicon {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
  margin-right: 0.35rem;
  fill: currentColor;
  stroke: currentColor;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: text-bottom;
}

.markdown-document .markdown-alert.markdown-alert-note {
  border-left-color: var(--md-alert-note-border) !important;
  background-color: var(--md-alert-note-bg) !important;
  color: var(--md-alert-note-fg) !important;
}
.markdown-document .markdown-alert.markdown-alert-note .markdown-alert-title {
  color: var(--md-alert-note-fg) !important;
}

.markdown-document .markdown-alert.markdown-alert-tip {
  border-left-color: var(--md-alert-tip-border) !important;
  background-color: var(--md-alert-tip-bg) !important;
  color: var(--md-alert-tip-fg) !important;
}
.markdown-document .markdown-alert.markdown-alert-tip .markdown-alert-title {
  color: var(--md-alert-tip-fg) !important;
}

.markdown-document .markdown-alert.markdown-alert-important {
  border-left-color: var(--md-alert-important-border) !important;
  background-color: var(--md-alert-important-bg) !important;
  color: var(--md-alert-important-fg) !important;
}
.markdown-document .markdown-alert.markdown-alert-important .markdown-alert-title {
  color: var(--md-alert-important-fg) !important;
}

.markdown-document .markdown-alert.markdown-alert-warning {
  border-left-color: var(--md-alert-warning-border) !important;
  background-color: var(--md-alert-warning-bg) !important;
  color: var(--md-alert-warning-fg) !important;
}
.markdown-document .markdown-alert.markdown-alert-warning .markdown-alert-title {
  color: var(--md-alert-warning-fg) !important;
}

.markdown-document .markdown-alert.markdown-alert-caution {
  border-left-color: var(--md-alert-caution-border) !important;
  background-color: var(--md-alert-caution-bg) !important;
  color: var(--md-alert-caution-fg) !important;
}
.markdown-document .markdown-alert.markdown-alert-caution .markdown-alert-title {
  color: var(--md-alert-caution-fg) !important;
}

/* Footnotes */
.markdown-document section[data-footnotes="true"],
.markdown-document .footnotes {
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--md-border);
  font-size: 0.875em;
}

.markdown-document section[data-footnotes="true"] h2#footnote-label,
.markdown-document .footnotes h2 {
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: none;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--md-muted-fg);
}

.markdown-document section[data-footnotes="true"] ol,
.markdown-document .footnotes ol {
  padding-left: 1.5rem;
  list-style-type: decimal;
}

.markdown-document section[data-footnotes="true"] li,
.markdown-document .footnotes li {
  margin-bottom: 0.5rem;
  color: var(--md-muted-fg);
}

.markdown-document sup a {
  text-decoration: none;
  font-weight: 600;
  color: var(--md-accent);
}

/* Mermaid SVG container & sequence diagram styling */
.markdown-document .mermaid-svg-wrapper,
.markdown-document .mermaid-svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
  padding: 1.25rem;
  background-color: var(--md-bg);
  border: 1px solid var(--md-border);
  border-radius: var(--md-radius);
  overflow-x: auto;
}

.markdown-document .mermaid-svg-wrapper svg,
.markdown-document .mermaid-svg-container svg {
  max-width: 100%;
  height: auto;
  font-family: var(--md-font-family) !important;
}

.markdown-document .mermaid-svg-wrapper svg text,
.markdown-document .mermaid-svg-container svg text {
  font-family: var(--md-font-family) !important;
}

/* Standalone Export Footer Branding */
.markdown-document .export-footer {
  margin-top: 3.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--md-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--md-muted-fg);
  font-family: var(--md-font-family);
  opacity: 0.75;
  transition: opacity 0.15s ease;
}

.markdown-document .export-footer:hover {
  opacity: 1;
}

.markdown-document .export-footer a.export-footer-link {
  color: var(--md-accent);
  text-decoration: none;
  font-weight: 500;
}

.markdown-document .export-footer a.export-footer-link:hover {
  text-decoration: underline;
  color: var(--md-link-hover);
}

@media print {
  .markdown-document .export-footer {
    border-top-color: #e5e7eb !important;
    color: #6b7280 !important;
  }
}
`;
}

/**
 * Generates Mermaid initialization configuration matching the preset.
 */
export function getMermaidConfig(preset: DocumentPreset) {
  const m = preset.mermaid;
  return {
    startOnLoad: false,
    securityLevel: "loose" as const,
    theme: m.theme,
    themeVariables: {
      primaryColor: m.primaryColor,
      primaryTextColor: m.primaryTextColor,
      primaryBorderColor: m.primaryBorderColor,
      lineColor: m.lineColor,
      secondaryColor: m.secondaryColor,
      tertiaryColor: m.tertiaryColor,
      background: m.background,
      mainBkg: m.mainBkg,
      nodeBorder: m.nodeBorder,
      clusterBkg: m.clusterBkg,
      clusterBorder: m.clusterBorder,
      titleColor: m.titleColor,
      edgeLabelBackground: m.edgeLabelBackground,
      fontFamily: preset.typography.fontFamily,
      fontSize: "14px",
    },
    flowchart: {
      htmlLabels: true,
      curve: "basis" as const,
      padding: 15,
    },
    sequence: {
      actorFontSize: 14,
      noteFontSize: 13,
      messageFontSize: 13,
    },
  };
}
