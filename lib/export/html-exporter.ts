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
  const cleanedHtml = cleanMarkdownHtmlForExport(markdownHtml);

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://rendermd.vercel.app";
  const displayUrl = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
    ${cleanedHtml}
    
    <footer class="export-footer">
      <span>Exported with</span>
      <a href="${escapeHtml(siteUrl)}" target="_blank" rel="noopener noreferrer" class="export-footer-link">
        <strong>rendermd</strong>
      </a>
    </footer>
  </main>
</body>
</html>`;
}

/**
 * Strips preview-only interactive controls (Copy buttons, floating toolbars, hover anchor links)
 * to output clean, self-contained HTML for static document viewing.
 */
function cleanMarkdownHtmlForExport(rawHtml: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return rawHtml;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // 1. Remove heading anchor '#' links
    doc.querySelectorAll("a[aria-hidden='true']").forEach((el) => el.remove());

    // 2. Remove preview-only interactive buttons (Copy code, Mermaid toolbar, Frontmatter action buttons)
    doc.querySelectorAll("button").forEach((el) => el.remove());

    // 3. Remove floating toolbars and empty interactive containers
    doc.querySelectorAll(".absolute.right-2\\.5, .absolute.top-2\\.5").forEach((el) => el.remove());

    // 4. Remove frontmatter header bar (the useless format badge)
    doc.querySelectorAll(".frontmatter-header-bar").forEach((el) => el.remove());

    // 5. Ensure checkbox SVG icons have explicit attributes if missing
    doc.querySelectorAll("ul.task-list li svg, input[type='checkbox'] + span svg, span > svg").forEach((svg) => {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
    });

    return doc.body.innerHTML;
  } catch {
    return rawHtml;
  }
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

