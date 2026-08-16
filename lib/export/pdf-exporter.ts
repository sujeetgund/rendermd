import { DocumentPreset } from "@/types/preset";
import { PageSize } from "@/types/document";
import { generatePresetCSSString } from "@/lib/presets/generator";

interface ExportPdfParams {
  title: string;
  markdownElement: HTMLElement;
  preset: DocumentPreset;
  pageSize: PageSize;
}

/**
 * Triggers clean PDF generation via an isolated print frame.
 * This guarantees the exact document styling is rendered without any editor UI or scrollbars.
 */
export function exportToPdfPrint({
  title,
  markdownElement,
  preset,
  pageSize,
}: ExportPdfParams): void {
  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";

  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow?.document;
  if (!frameDoc) return;

  const presetCss = generatePresetCSSString(preset);
  const htmlContent = markdownElement.innerHTML;

  const pageCss = pageSize === "a4"
    ? "@page { size: A4; margin: 15mm; }"
    : pageSize === "letter"
    ? "@page { size: letter; margin: 15mm; }"
    : "@page { margin: 15mm; }";

  frameDoc.open();
  frameDoc.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap" rel="stylesheet">
  <style>
    ${pageCss}
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    ${presetCss}
    .markdown-document {
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 !important;
      background-color: transparent !important;
    }
    /* Hide floating toolbars during print */
    .group button, .opacity-0 {
      display: none !important;
    }
  </style>
</head>
<body>
  <div class="markdown-document">
    ${htmlContent}
  </div>
</body>
</html>`);
  frameDoc.close();

  // Allow fonts & styles to load in iframe before triggering print
  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();

    // Clean up frame after printing
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  }, 500);
}
