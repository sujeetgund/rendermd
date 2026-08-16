import { DocumentPreset } from "@/types/preset";

export const academicPreset: DocumentPreset = {
  id: "academic",
  name: "Academic",
  description: "Formal paper aesthetic with serif typography, refined margins, and publication-ready equations.",
  author: "rendermd",
  isDark: false,
  typography: {
    fontFamily:
      '"Newsreader", "Charter", "Georgia", "Cambria", "Times New Roman", Times, serif',
    headingFontFamily:
      '"Newsreader", "Charter", "Georgia", "Cambria", "Times New Roman", Times, serif',
    monoFontFamily:
      '"JetBrains Mono", "Courier New", Courier, monospace',
    bodySize: "1.0625rem",
    lineHeight: "1.8",
    headingLineHeight: "1.3",
    headingWeight: "700",
    letterSpacing: "0",
  },
  colors: {
    background: "#fcfbf9",
    foreground: "#2c2a29",
    muted: "#f4f1ea",
    mutedForeground: "#78716c",
    border: "#e7e2d9",
    accent: "#8b263e",
    accentForeground: "#ffffff",

    heading: "#1c1917",
    link: "#8b263e",
    linkHover: "#5c1828",

    codeBackground: "#f4f0e8",
    codeForeground: "#292524",
    codeBorder: "#e2dcce",

    quoteBackground: "#f9f7f2",
    quoteBorder: "#8b263e",
    quoteForeground: "#57534e",

    tableBorder: "#d6cfc4",
    tableHeaderBackground: "#f2ece1",
    tableRowEvenBackground: "#fcfbf9",
    tableRowOddBackground: "#f7f4ee",

    hrColor: "#d6cfc4",
  },
  alerts: {
    noteBorder: "#2563eb",
    noteBackground: "#f0f4ff",
    noteText: "#1e3a8a",
    noteIcon: "#2563eb",

    tipBorder: "#059669",
    tipBackground: "#f0fdf4",
    tipText: "#064e3b",
    tipIcon: "#059669",

    importantBorder: "#8b263e",
    importantBackground: "#fdf2f4",
    importantText: "#5c1828",
    importantIcon: "#8b263e",

    warningBorder: "#d97706",
    warningBackground: "#fffbeb",
    warningText: "#78350f",
    warningIcon: "#d97706",

    cautionBorder: "#dc2626",
    cautionBackground: "#fef2f2",
    cautionText: "#7f1d1d",
    cautionIcon: "#dc2626",
  },
  spacing: {
    paragraph: "1.25rem",
    headingTop: "2.25rem",
    headingBottom: "0.85rem",
    section: "2.75rem",
    listSpacing: "0.45rem",
    pagePadding: "3.5rem",
    maxWidth: "760px",
    radius: "0.25rem",
  },
  mermaid: {
    theme: "base",
    primaryColor: "#f4ede2",
    primaryTextColor: "#2c2a29",
    primaryBorderColor: "#8b263e",
    lineColor: "#78716c",
    secondaryColor: "#e6ded1",
    tertiaryColor: "#fbf8f3",
    background: "#fcfbf9",
    mainBkg: "#fbf8f3",
    nodeBorder: "#a8a29e",
    clusterBkg: "#f4efe6",
    clusterBorder: "#d6cfc4",
    titleColor: "#1c1917",
    edgeLabelBackground: "#fcfbf9",
  },
  math: {
    color: "#1c1917",
    fontSize: "1.1em",
    displayPadding: "1.5rem",
  },
};
