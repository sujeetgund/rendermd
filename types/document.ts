import { PresetId, DocumentPreset } from "./preset";

export interface MarkdownDocument {
  id: string;
  title: string;
  content: string;
  presetId: PresetId;
  customPreset?: DocumentPreset;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = "split" | "editor" | "preview" | "zen";

export type PageSize = "continuous" | "a4" | "letter";

export interface StudioSettings {
  syncScroll: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number; // in px
  pageSize: PageSize;
  appTheme: "light" | "dark" | "system";
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  readingTimeMinutes: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}
