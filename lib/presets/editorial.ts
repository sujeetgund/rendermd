import { DocumentPreset } from "@/types/preset";

export const editorialPreset: DocumentPreset = {
  id: "editorial",
  name: "Editorial",
  description: "Magazine and longform publication design with rich typography and warm terracotta accents.",
  author: "rendermd",
  isDark: false,
  typography: {
    fontFamily:
      '"Newsreader", "Charter", "Georgia", serif',
    headingFontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    monoFontFamily:
      '"JetBrains Mono", "Courier New", monospace',
    bodySize: "1.0625rem",
    lineHeight: "1.85",
    headingLineHeight: "1.2",
    headingWeight: "700",
    letterSpacing: "-0.015em",
  },
  colors: {
    background: "#fdfbf7",
    foreground: "#292524",
    muted: "#f5efe6",
    mutedForeground: "#78716c",
    border: "#e7ded2",
    accent: "#c2410c",
    accentForeground: "#ffffff",

    heading: "#1c1917",
    link: "#c2410c",
    linkHover: "#9a3412",

    codeBackground: "#f5eee4",
    codeForeground: "#44403c",
    codeBorder: "#e2d6c6",

    quoteBackground: "#fcf6ed",
    quoteBorder: "#c2410c",
    quoteForeground: "#57534e",

    tableBorder: "#dfd5c7",
    tableHeaderBackground: "#f2e8da",
    tableRowEvenBackground: "#fdfbf7",
    tableRowOddBackground: "#f7efe4",

    hrColor: "#dfd5c7",
  },
  alerts: {
    noteBorder: "#0284c7",
    noteBackground: "#f0f9ff",
    noteText: "#075985",
    noteIcon: "#0284c7",

    tipBorder: "#15803d",
    tipBackground: "#f0fdf4",
    tipText: "#166534",
    tipIcon: "#15803d",

    importantBorder: "#c2410c",
    importantBackground: "#fff7ed",
    importantText: "#9a3412",
    importantIcon: "#c2410c",

    warningBorder: "#d97706",
    warningBackground: "#fffbeb",
    warningText: "#92400e",
    warningIcon: "#d97706",

    cautionBorder: "#b91c1c",
    cautionBackground: "#fef2f2",
    cautionText: "#991b1b",
    cautionIcon: "#b91c1c",
  },
  spacing: {
    paragraph: "1.35rem",
    headingTop: "2.5rem",
    headingBottom: "1rem",
    section: "3rem",
    listSpacing: "0.5rem",
    pagePadding: "3.5rem",
    maxWidth: "780px",
    radius: "0.5rem",
  },
  mermaid: {
    theme: "base",
    primaryColor: "#faebd7",
    primaryTextColor: "#292524",
    primaryBorderColor: "#c2410c",
    lineColor: "#78716c",
    secondaryColor: "#f3d9b8",
    tertiaryColor: "#fdfbf7",
    background: "#fdfbf7",
    mainBkg: "#fdfbf7",
    nodeBorder: "#c2410c",
    clusterBkg: "#f7efe4",
    clusterBorder: "#dfd5c7",
    titleColor: "#1c1917",
    edgeLabelBackground: "#fdfbf7",
  },
  math: {
    color: "#1c1917",
    fontSize: "1.1em",
    displayPadding: "1.5rem",
  },
};
