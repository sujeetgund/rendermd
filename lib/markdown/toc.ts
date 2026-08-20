import { TocItem } from "@/types/document";
import { extractFrontmatter } from "./frontmatter";

/**
 * Creates a URL-friendly slug from heading text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parses markdown text to extract all headings (H1-H6) for the Table of Contents.
 */
export function extractTocFromMarkdown(markdown: string): TocItem[] {
  const { body } = extractFrontmatter(markdown);
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TocItem[] = [];
  const slugCounts: Record<string, number> = {};

  let match;
  while ((match = headingRegex.exec(body)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();

    // Strip inline markdown symbols from TOC display
    const cleanText = rawText
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/\$(.*?)\$/g, "$1");

    let slug = slugify(cleanText);
    if (!slug) {
      slug = `heading-${items.length + 1}`;
    }

    if (slugCounts[slug]) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }

    items.push({
      id: slug,
      text: cleanText,
      level,
    });
  }

  return items;
}

/**
 * Calculates word, character, and reading stats.
 */
export function calculateDocumentStats(markdown: string) {
  const { body } = extractFrontmatter(markdown);
  const clean = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`.*?`/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`~>-]/g, "");

  const words = clean.trim() ? clean.trim().split(/\s+/).length : 0;
  const characters = body.length;
  const charactersNoSpaces = body.replace(/\s/g, "").length;
  const lines = body.split("\n").length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    readingTimeMinutes,
  };
}
