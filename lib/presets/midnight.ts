import { DocumentPreset } from "@/types/preset";

export const midnightPreset: DocumentPreset = {
  id: "midnight",
  name: "Midnight",
  description: "Sleek dark theme with radiant violet/indigo accents and high-contrast dark diagram styling.",
  author: "rendermd",
  isDark: true,
  typography: {
    fontFamily:
      '"Geist", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
    headingFontFamily:
      '"Geist", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
    monoFontFamily:
      '"JetBrains Mono", "Geist Mono", monospace',
    bodySize: "1rem",
    lineHeight: "1.75",
    headingLineHeight: "1.3",
    headingWeight: "600",
    letterSpacing: "-0.012em",
  },
  colors: {
    background: "#090d16",
    foreground: "#e2e8f0",
    muted: "#131b2e",
    mutedForeground: "#94a3b8",
    border: "#1e293b",
    accent: "#818cf8",
    accentForeground: "#090d16",

    heading: "#f8fafc",
    link: "#a5b4fc",
    linkHover: "#c7d2fe",

    codeBackground: "#0f172a",
    codeForeground: "#e2e8f0",
    codeBorder: "#1e293b",

    quoteBackground: "#0f172a",
    quoteBorder: "#6366f1",
    quoteForeground: "#cbd5e1",

    tableBorder: "#1e293b",
    tableHeaderBackground: "#131b2e",
    tableRowEvenBackground: "#090d16",
    tableRowOddBackground: "#0e1526",

    hrColor: "#1e293b",
  },
  alerts: {
    noteBorder: "#38bdf8",
    noteBackground: "rgba(56, 189, 248, 0.1)",
    noteText: "#7dd3fc",
    noteIcon: "#38bdf8",

    tipBorder: "#34d399",
    tipBackground: "rgba(52, 211, 153, 0.1)",
    tipText: "#6ee7b7",
    tipIcon: "#34d399",

    importantBorder: "#a78bfa",
    importantBackground: "rgba(167, 139, 250, 0.1)",
    importantText: "#c4b5fd",
    importantIcon: "#a78bfa",

    warningBorder: "#fbbf24",
    warningBackground: "rgba(251, 191, 36, 0.1)",
    warningText: "#fde68a",
    warningIcon: "#fbbf24",

    cautionBorder: "#f87171",
    cautionBackground: "rgba(248, 113, 113, 0.1)",
    cautionText: "#fca5a5",
    cautionIcon: "#f87171",
  },
  spacing: {
    paragraph: "1.125rem",
    headingTop: "1.875rem",
    headingBottom: "0.75rem",
    section: "2.25rem",
    listSpacing: "0.35rem",
    pagePadding: "3rem",
    maxWidth: "820px",
    radius: "0.5rem",
  },
  mermaid: {
    theme: "dark",
    primaryColor: "#1e1b4b",
    primaryTextColor: "#e0e7ff",
    primaryBorderColor: "#6366f1",
    lineColor: "#818cf8",
    secondaryColor: "#312e81",
    tertiaryColor: "#1e293b",
    background: "#090d16",
    mainBkg: "#0f172a",
    nodeBorder: "#6366f1",
    clusterBkg: "#131b2e",
    clusterBorder: "#312e81",
    titleColor: "#f8fafc",
    edgeLabelBackground: "#090d16",
  },
  math: {
    color: "#f8fafc",
    fontSize: "1.05em",
    displayPadding: "1.25rem",
  },
};
