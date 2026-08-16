import { DocumentPreset } from "@/types/preset";

export const minimalPreset: DocumentPreset = {
  id: "minimal",
  name: "Minimal",
  description: "Clean, spacious typography inspired by modern Apple and Craft aesthetics.",
  author: "rendermd",
  isDark: false,
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    headingFontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    monoFontFamily:
      'ui-monospace, "SF Mono", "Menlo", "Monaco", "Consolas", monospace',
    bodySize: "1rem",
    lineHeight: "1.75",
    headingLineHeight: "1.25",
    headingWeight: "600",
    letterSpacing: "-0.011em",
  },
  colors: {
    background: "#ffffff",
    foreground: "#1f2328",
    muted: "#f6f8fa",
    mutedForeground: "#656d76",
    border: "#e5e7eb",
    accent: "#0969da",
    accentForeground: "#ffffff",

    heading: "#0f172a",
    link: "#2563eb",
    linkHover: "#1d4ed8",

    codeBackground: "#f8fafc",
    codeForeground: "#0f172a",
    codeBorder: "#e2e8f0",

    quoteBackground: "#f8fafc",
    quoteBorder: "#cbd5e1",
    quoteForeground: "#475569",

    tableBorder: "#e2e8f0",
    tableHeaderBackground: "#f8fafc",
    tableRowEvenBackground: "#ffffff",
    tableRowOddBackground: "#f8fafc",

    hrColor: "#e2e8f0",
  },
  alerts: {
    noteBorder: "#3b82f6",
    noteBackground: "#eff6ff",
    noteText: "#1e40af",
    noteIcon: "#3b82f6",

    tipBorder: "#10b981",
    tipBackground: "#ecfdf5",
    tipText: "#065f46",
    tipIcon: "#10b981",

    importantBorder: "#8b5cf6",
    importantBackground: "#f5f3ff",
    importantText: "#5b21b6",
    importantIcon: "#8b5cf6",

    warningBorder: "#f59e0b",
    warningBackground: "#fffbeb",
    warningText: "#92400e",
    warningIcon: "#f59e0b",

    cautionBorder: "#ef4444",
    cautionBackground: "#fef2f2",
    cautionText: "#991b1b",
    cautionIcon: "#ef4444",
  },
  spacing: {
    paragraph: "1.25rem",
    headingTop: "2rem",
    headingBottom: "0.75rem",
    section: "2.5rem",
    listSpacing: "0.5rem",
    pagePadding: "3rem",
    maxWidth: "800px",
    radius: "0.5rem",
  },
  mermaid: {
    theme: "base",
    primaryColor: "#f1f5f9",
    primaryTextColor: "#1e293b",
    primaryBorderColor: "#cbd5e1",
    lineColor: "#64748b",
    secondaryColor: "#e2e8f0",
    tertiaryColor: "#f8fafc",
    background: "#ffffff",
    mainBkg: "#f8fafc",
    nodeBorder: "#94a3b8",
    clusterBkg: "#f8fafc",
    clusterBorder: "#e2e8f0",
    titleColor: "#0f172a",
    edgeLabelBackground: "#ffffff",
  },
  math: {
    color: "#0f172a",
    fontSize: "1.05em",
    displayPadding: "1.25rem",
  },
};
