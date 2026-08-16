import { DocumentPreset } from "@/types/preset";

export const githubPreset: DocumentPreset = {
  id: "github",
  name: "GitHub",
  description: "Faithful GitHub markdown layout with developer-focused styling, crisp tables and badges.",
  author: "rendermd",
  isDark: false,
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    headingFontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    monoFontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    bodySize: "1rem",
    lineHeight: "1.6",
    headingLineHeight: "1.3",
    headingWeight: "600",
    letterSpacing: "normal",
  },
  colors: {
    background: "#ffffff",
    foreground: "#1f2328",
    muted: "#f6f8fa",
    mutedForeground: "#656d76",
    border: "#d0d7de",
    accent: "#0969da",
    accentForeground: "#ffffff",

    heading: "#1f2328",
    link: "#0969da",
    linkHover: "#1a7f37",

    codeBackground: "#f6f8fa",
    codeForeground: "#1f2328",
    codeBorder: "#d0d7de",

    quoteBackground: "#ffffff",
    quoteBorder: "#d0d7de",
    quoteForeground: "#656d76",

    tableBorder: "#d0d7de",
    tableHeaderBackground: "#f6f8fa",
    tableRowEvenBackground: "#ffffff",
    tableRowOddBackground: "#f6f8fa",

    hrColor: "#d0d7de",
  },
  alerts: {
    noteBorder: "#0969da",
    noteBackground: "#f0f6fc",
    noteText: "#0969da",
    noteIcon: "#0969da",

    tipBorder: "#1a7f37",
    tipBackground: "#f0fdf4",
    tipText: "#1a7f37",
    tipIcon: "#1a7f37",

    importantBorder: "#8250df",
    importantBackground: "#fbf8ff",
    importantText: "#8250df",
    importantIcon: "#8250df",

    warningBorder: "#9a6700",
    warningBackground: "#fff8c5",
    warningText: "#9a6700",
    warningIcon: "#9a6700",

    cautionBorder: "#d1242f",
    cautionBackground: "#ffebe9",
    cautionText: "#d1242f",
    cautionIcon: "#d1242f",
  },
  spacing: {
    paragraph: "1rem",
    headingTop: "1.75rem",
    headingBottom: "0.75rem",
    section: "2rem",
    listSpacing: "0.35rem",
    pagePadding: "2.5rem",
    maxWidth: "860px",
    radius: "0.375rem",
  },
  mermaid: {
    theme: "neutral",
    primaryColor: "#f6f8fa",
    primaryTextColor: "#1f2328",
    primaryBorderColor: "#d0d7de",
    lineColor: "#57606a",
    secondaryColor: "#eaeef2",
    tertiaryColor: "#f6f8fa",
    background: "#ffffff",
    mainBkg: "#ffffff",
    nodeBorder: "#d0d7de",
    clusterBkg: "#f6f8fa",
    clusterBorder: "#d0d7de",
    titleColor: "#1f2328",
    edgeLabelBackground: "#ffffff",
  },
  math: {
    color: "#1f2328",
    fontSize: "1em",
    displayPadding: "1rem",
  },
};
