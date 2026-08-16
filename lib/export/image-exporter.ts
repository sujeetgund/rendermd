import { toPng, toSvg } from "html-to-image";
import { toast } from "sonner";

interface ExportImageParams {
  element: HTMLElement;
  filename: string;
  format: "png" | "svg";
  backgroundColor?: string;
}

/**
 * Captures an HTML element as a crisp PNG or SVG image and downloads it.
 */
export async function exportElementAsImage({
  element,
  filename,
  format,
  backgroundColor = "#ffffff",
}: ExportImageParams): Promise<void> {
  try {
    const toastId = toast.loading(`Generating high-res ${format.toUpperCase()}...`);

    let dataUrl: string;
    if (format === "svg") {
      dataUrl = await toSvg(element, {
        backgroundColor,
        filter: (node: HTMLElement) => {
          return !node.classList?.contains("no-export");
        },
      });
    } else {
      dataUrl = await toPng(element, {
        backgroundColor,
        pixelRatio: 2, // High resolution retina scale
        filter: (node: HTMLElement) => {
          return !node.classList?.contains("no-export");
        },
      });
    }

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.dismiss(toastId);
    toast.success(`${format.toUpperCase()} exported successfully`);
  } catch (error) {
    console.error("Image export error:", error);
    toast.error(`Failed to export ${format.toUpperCase()}`);
  }
}
