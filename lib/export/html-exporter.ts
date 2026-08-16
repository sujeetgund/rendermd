import { DocumentPreset } from "@/types/preset";
import { generatePresetCSSString } from "@/lib/presets/generator";

interface ExportHtmlParams {
  title: string;
  markdownHtml: string;
  preset: DocumentPreset;
}

/**
 * Builds a standalone, zero-dependency HTML document with inlined CSS,
 * KaTeX CDN stylesheets, and full typography styling.
 */
export function generateStandaloneHtml({
  title,
  markdownHtml,
  preset,
}: ExportHtmlParams): string {
  const presetCss = generatePresetCSSString(preset);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  
  <!-- KaTeX CSS for Math equations -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  
  <!-- Google Fonts for Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap" rel="stylesheet">

  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: ${preset.colors.background};
      color: ${preset.colors.foreground};
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }
    
    ${presetCss}

    .document-wrapper {
      width: 100%;
      max-width: var(--md-max-width);
      padding: var(--md-padding-page);
      margin: 0 auto;
    }

    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      .document-wrapper {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      @page {
        margin: 20mm 15mm 20mm 15mm;
      }
    }
  </style>
</head>
<body>
  <main class="document-wrapper markdown-document">
    ${markdownHtml}
  </main>
</body>
</html>`;
}

/**
 * Initiates download of the standalone HTML file in the browser.
 */
export function downloadHtmlFile(
  filename: string,
  htmlContent: string
): void {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
