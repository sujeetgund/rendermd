export interface TypographyTokens {
  fontFamily: string;
  headingFontFamily: string;
  monoFontFamily: string;
  bodySize: string; // e.g. "1rem" or "1.0625rem"
  lineHeight: string; // e.g. "1.75"
  headingLineHeight: string; // e.g. "1.3"
  headingWeight: string; // e.g. "600" or "700"
  letterSpacing: string; // e.g. "-0.015em"
}

export interface ColorTokens {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  accent: string;
  accentForeground: string;

  heading: string;
  link: string;
  linkHover: string;

  codeBackground: string;
  codeForeground: string;
  codeBorder: string;

  quoteBackground: string;
  quoteBorder: string;
  quoteForeground: string;

  tableBorder: string;
  tableHeaderBackground: string;
  tableRowEvenBackground: string;
  tableRowOddBackground: string;

  hrColor: string;
}

export interface AlertColorTokens {
  noteBorder: string;
  noteBackground: string;
  noteText: string;
  noteIcon: string;

  tipBorder: string;
  tipBackground: string;
  tipText: string;
  tipIcon: string;

  importantBorder: string;
  importantBackground: string;
  importantText: string;
  importantIcon: string;

  warningBorder: string;
  warningBackground: string;
  warningText: string;
  warningIcon: string;

  cautionBorder: string;
  cautionBackground: string;
  cautionText: string;
  cautionIcon: string;
}

export interface SpacingTokens {
  paragraph: string; // margin-bottom
  headingTop: string;
  headingBottom: string;
  section: string;
  listSpacing: string;
  pagePadding: string;
  maxWidth: string; // e.g. "768px" or "840px"
  radius: string; // e.g. "0.5rem"
}

export interface MermaidTokens {
  theme: "base" | "neutral" | "dark" | "default" | "forest";
  primaryColor: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  lineColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  background: string;
  mainBkg: string;
  nodeBorder: string;
  clusterBkg: string;
  clusterBorder: string;
  titleColor: string;
  edgeLabelBackground: string;
}

export interface MathTokens {
  color: string;
  fontSize: string;
  displayPadding: string;
}

export interface DocumentPreset {
  id: string;
  name: string;
  description: string;
  author?: string;
  isDark: boolean;
  typography: TypographyTokens;
  colors: ColorTokens;
  alerts: AlertColorTokens;
  spacing: SpacingTokens;
  mermaid: MermaidTokens;
  math: MathTokens;
}

export type PresetId =
  | "minimal"
  | "github"
  | "academic"
  | "technical"
  | "midnight"
  | "editorial"
  | "custom";
