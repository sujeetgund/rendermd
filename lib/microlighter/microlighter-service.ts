import { PresetId } from "@/types/preset";

export type MicroLighterTheme =
  | "github"
  | "dracula"
  | "night-owl"
  | "tokyo-night"
  | "monokai"
  | "cobalt2"
  | "solarized-light"
  | "vesper"
  | "min"
  | "vscode-plus";

/**
 * Maps rendermd Document Presets to MicroLighter themes
 */
export function getSyntaxThemeForPreset(presetId: PresetId | string, isDark = true): MicroLighterTheme {
  switch (presetId) {
    case "midnight":
      return "tokyo-night";
    case "editorial":
      return "dracula";
    case "technical":
      return "cobalt2";
    case "academic":
      return isDark ? "night-owl" : "min";
    case "github":
      return "github";
    case "minimal":
    default:
      return isDark ? "github" : "github";
  }
}

/**
 * Dynamically trigger MicroLighter syntax highlighting on a target container or element
 */
export async function highlightCodeElement(
  target: HTMLElement | Document = typeof document !== "undefined" ? document : (null as any),
  options?: { selector?: string }
): Promise<void> {
  if (typeof window === "undefined" || !target) return;
  try {
    const { highlightAll } = await import("microlighter");
    await highlightAll({
      root: target as Element | Document,
      selector: options?.selector || "pre > code",
    });
  } catch (err) {
    console.warn("MicroLighter highlight failed:", err);
  }
}
