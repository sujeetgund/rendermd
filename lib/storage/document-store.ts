import { MarkdownDocument, StudioSettings } from "@/types/document";
import { DocumentPreset } from "@/types/preset";
import { INITIAL_DOCUMENTS } from "@/lib/markdown/samples";
import { minimalPreset } from "@/lib/presets/minimal";

const STORAGE_KEYS = {
  DOCUMENTS: "rendermd_documents_v1",
  ACTIVE_DOC_ID: "rendermd_active_doc_id_v1",
  SETTINGS: "rendermd_settings_v1",
  CUSTOM_PRESET: "rendermd_custom_preset_v1",
};

const DEFAULT_SETTINGS: StudioSettings = {
  syncScroll: true,
  lineNumbers: false,
  wordWrap: true,
  fontSize: 14,
  pageSize: "continuous",
  appTheme: "dark",
};

export function loadStoredDocuments(): MarkdownDocument[] {
  if (typeof window === "undefined") return INITIAL_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOCUMENTS;
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function saveStoredDocuments(docs: MarkdownDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (err) {
    console.error("Failed to save documents to localStorage:", err);
  }
}

export function getStoredActiveDocId(defaultId: string): string {
  if (typeof window === "undefined") return defaultId;
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID) || defaultId;
  } catch {
    return defaultId;
  }
}

export function saveStoredActiveDocId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
  } catch (err) {
    console.error("Failed to save active doc id:", err);
  }
}

export function loadStoredSettings(): StudioSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: StudioSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
}

export function loadStoredCustomPreset(): DocumentPreset {
  if (typeof window === "undefined") {
    return { ...minimalPreset, id: "custom", name: "Custom Theme" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESET);
    if (!raw) {
      return { ...minimalPreset, id: "custom", name: "Custom Theme" };
    }
    return JSON.parse(raw);
  } catch {
    return { ...minimalPreset, id: "custom", name: "Custom Theme" };
  }
}

export function saveStoredCustomPreset(preset: DocumentPreset): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESET, JSON.stringify(preset));
  } catch (err) {
    console.error("Failed to save custom preset:", err);
  }
}
