import LZString from "lz-string";
import { PresetId } from "@/types/preset";

export interface SharedDocumentPayload {
  v: number;
  t: string;
  c: string;
  p: PresetId;
}

/**
 * Encodes a document (title, content, presetId) into a URL share link.
 */
export function generateShareUrl(
  title: string,
  content: string,
  presetId: PresetId
): string {
  const payload: SharedDocumentPayload = {
    v: 1,
    t: title || "Shared Document",
    c: content || "",
    p: presetId || "minimal",
  };
  const jsonStr = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(jsonStr);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/#doc=${compressed}`;
}

/**
 * Decodes a document payload from a URL hash string.
 * Returns null if hash is invalid or missing.
 */
export function parseShareUrlHash(hash: string): SharedDocumentPayload | null {
  if (!hash) return null;
  const match = hash.match(/#doc=([A-Za-z0-9\-_%]+)/);
  if (!match || !match[1]) return null;

  try {
    const compressed = decodeURIComponent(match[1]);
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;
    const payload = JSON.parse(decompressed) as SharedDocumentPayload;
    if (payload && payload.v === 1 && typeof payload.c === "string") {
      return payload;
    }
  } catch (err) {
    console.error("Failed to parse share URL hash:", err);
  }
  return null;
}
