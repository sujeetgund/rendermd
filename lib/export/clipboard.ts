import { toast } from "sonner";

/**
 * Copies plain markdown text to clipboard.
 */
export async function copyMarkdownToClipboard(markdown: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(markdown);
    toast.success("Markdown copied to clipboard");
  } catch {
    toast.error("Failed to copy Markdown");
  }
}

/**
 * Copies formatted rich text (HTML) to clipboard so it can be pasted into
 * Google Docs, Microsoft Word, Apple Notes, or Notion with styles preserved.
 */
export async function copyRichTextToClipboard(element: HTMLElement): Promise<void> {
  try {
    const html = element.innerHTML;
    const text = element.innerText;

    const blobHtml = new Blob([html], { type: "text/html" });
    const blobText = new Blob([text], { type: "text/plain" });

    const clipboardItem = new ClipboardItem({
      "text/html": blobHtml,
      "text/plain": blobText,
    });

    await navigator.clipboard.write([clipboardItem]);
    toast.success("Formatted Rich Text copied to clipboard");
  } catch {
    // Fallback to plain text copy
    try {
      await navigator.clipboard.writeText(element.innerText);
      toast.info("Rich text unsupported, copied plain text to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }
}
