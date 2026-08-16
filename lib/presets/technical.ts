import { DocumentPreset } from "@/types/preset";

export const technicalPreset: DocumentPreset = {
  id: "technical",
  name: "Technical",
  description: "Dense, monospace accents, cyan highlights, designed for RFCs, architectures, and API specs.",
  author: "rendermd",
  isDark: false,
  typography: {
    fontFamily:
      '"Geist", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
    headingFontFamily:
      '"JetBrains Mono", "Geist Mono", "Fira Code", monospace',
    monoFontFamily:
      '"JetBrains Mono", "Geist Mono", "Fira Code", monospace',
    bodySize: "0.9375rem",
    lineHeight: "1.65",
    headingLineHeight: "1.35",
    headingWeight: "600",
    letterSpacing: "-0.01em",
  },
  colors: {
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#cbd5e1",
    accent: "#0284c7",
    accentForeground: "#ffffff",

    heading: "#0369a1",
    link: "#0284c7",
    linkHover: "#0369a1",

    codeBackground: "#0f172a",
    codeForeground: "#38bdf8",
    codeBorder: "#1e293b",

    quoteBackground: "#f0f9ff",
    quoteBorder: "#0284c7",
    quoteForeground: "#0369a1",

    tableBorder: "#cbd5e1",
    tableHeaderBackground: "#f8fafc",
    tableRowEvenBackground: "#ffffff",
    tableRowOddBackground: "#f1f5f9",

    hrColor: "#94a3b8",
  },
  alerts: {
    noteBorder: "#0284c7",
    noteBackground: "#f0f9ff",
    noteText: "#0369a1",
    noteIcon: "#0284c7",

    tipBorder: "#059669",
    tipBackground: "#ecfdf5",
    tipText: "#047857",
    tipIcon: "#059669",

    importantBorder: "#7c3aed",
    importantBackground: "#f5f3ff",
    importantText: "#6d28d9",
    importantIcon: "#7c3aed",

    warningBorder: "#d97706",
    warningBackground: "#fffbeb",
    warningText: "#b45309",
    warningIcon: "#d97706",

    cautionBorder: "#e11d48",
    cautionBackground: "#fff1f2",
    cautionText: "#be123c",
    cautionIcon: "#e11d48",
  },
  spacing: {
    paragraph: "0.875rem",
    headingTop: "1.5rem",
    headingBottom: "0.5rem",
    section: "1.75rem",
    listSpacing: "0.25rem",
    pagePadding: "2.25rem",
    maxWidth: "880px",
    radius: "0.25rem",
  },
  mermaid: {
    theme: "base",
    primaryColor: "#e0f2fe",
    primaryTextColor: "#0369a1",
    primaryBorderColor: "#0284c7",
    lineColor: "#0284c7",
    secondaryColor: "#bae6fd",
    tertiaryColor: "#f0f9ff",
    background: "#ffffff",
    mainBkg: "#f8fafc",
    nodeBorder: "#0284c7",
    clusterBkg: "#f0f9ff",
    clusterBorder: "#38bdf8",
    titleColor: "#0369a1",
    edgeLabelBackground: "#ffffff",
  },
  math: {
    color: "#0369a1",
    fontSize: "1em",
    displayPadding: "1rem",
  },
};
