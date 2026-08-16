import { DocumentPreset } from "./preset";
import { PageSize } from "./document";

export type ExportFormat = "html" | "pdf" | "png" | "svg" | "markdown" | "rich-text";

export interface HtmlExportOptions {
  title: string;
  preset: DocumentPreset;
  includeStyles: boolean;
  standalone: boolean;
  pageSize: PageSize;
}

export interface PdfExportOptions {
  title: string;
  pageSize: PageSize;
  landscape?: boolean;
}

export interface ImageExportOptions {
  format: "png" | "svg";
  scale?: number;
  quality?: number;
  backgroundColor?: string;
}
