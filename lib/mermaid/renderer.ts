import { DocumentPreset } from "@/types/preset";
import { getMermaidConfig } from "@/lib/presets/generator";

let mermaidPromise: Promise<typeof import("mermaid")["default"]> | null = null;

export function getMermaidInstance() {
  if (typeof window === "undefined") return null;
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default);
  }
  return mermaidPromise;
}

/**
 * Safely renders a Mermaid chart to an SVG string using a persistent instance.
 */
export async function renderMermaidDiagram(
  chart: string,
  preset: DocumentPreset,
  containerId?: string
): Promise<string> {
  const mermaid = await getMermaidInstance();
  if (!mermaid) {
    throw new Error("Mermaid can only run in a browser environment");
  }

  const config = getMermaidConfig(preset);
  mermaid.initialize(config);

  const uniqueId =
    containerId ||
    `mermaid-render-${Math.random().toString(36).substring(2, 9)}`;

  const { svg } = await mermaid.render(uniqueId, chart.trim());
  return svg;
}
