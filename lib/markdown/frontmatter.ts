export type FrontmatterValue =
  | string
  | number
  | boolean
  | unknown[]
  | Record<string, unknown>;

export interface FrontmatterField {
  key: string;
  value: FrontmatterValue;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
}

export interface FrontmatterData {
  raw: string;
  format: "yaml" | "toml" | "json";
  data: Record<string, FrontmatterValue>;
  fields: FrontmatterField[];
  isEmpty: boolean;
  title?: string;
  description?: string;
  author?: string | string[];
  date?: string;
  tags?: string[];
  categories?: string[];
  status?: string;
  draft?: boolean;
}

/**
 * Parses frontmatter metadata from a Markdown string.
 * Supports YAML (---), TOML (+++), and JSON (;;; or block) delimiters.
 */
export function extractFrontmatter(markdown: string): {
  frontmatter: FrontmatterData;
  body: string;
} {
  const emptyResult: FrontmatterData = {
    raw: "",
    format: "yaml",
    data: {},
    fields: [],
    isEmpty: true,
  };

  if (!markdown || typeof markdown !== "string") {
    return { frontmatter: emptyResult, body: markdown || "" };
  }

  const trimmedLeading = markdown.trimStart();
  const offsetIndex = markdown.length - trimmedLeading.length;

  let rawFrontmatter = "";
  let format: "yaml" | "toml" | "json" = "yaml";
  let bodyStartIndex = 0;

  // 1. YAML frontmatter delimiter --- ... ---
  if (trimmedLeading.startsWith("---")) {
    const lines = trimmedLeading.split("\n");
    const endMatchIndex = lines.findIndex(
      (line, idx) => idx > 0 && (line.trim() === "---" || line.trim() === "...")
    );

    if (endMatchIndex > 0) {
      format = "yaml";
      rawFrontmatter = lines.slice(1, endMatchIndex).join("\n");
      const afterEndPos =
        lines.slice(0, endMatchIndex + 1).join("\n").length;
      bodyStartIndex = offsetIndex + afterEndPos;
      if (markdown[bodyStartIndex] === "\n") bodyStartIndex++;
    }
  }
  // 2. TOML frontmatter delimiter +++ ... +++
  else if (trimmedLeading.startsWith("+++")) {
    const lines = trimmedLeading.split("\n");
    const endMatchIndex = lines.findIndex(
      (line, idx) => idx > 0 && line.trim() === "+++"
    );

    if (endMatchIndex > 0) {
      format = "toml";
      rawFrontmatter = lines.slice(1, endMatchIndex).join("\n");
      const afterEndPos =
        lines.slice(0, endMatchIndex + 1).join("\n").length;
      bodyStartIndex = offsetIndex + afterEndPos;
      if (markdown[bodyStartIndex] === "\n") bodyStartIndex++;
    }
  }
  // 3. JSON frontmatter delimiter ;;; ... ;;;
  else if (trimmedLeading.startsWith(";;;")) {
    const lines = trimmedLeading.split("\n");
    const endMatchIndex = lines.findIndex(
      (line, idx) => idx > 0 && line.trim() === ";;;"
    );

    if (endMatchIndex > 0) {
      format = "json";
      rawFrontmatter = lines.slice(1, endMatchIndex).join("\n");
      const afterEndPos =
        lines.slice(0, endMatchIndex + 1).join("\n").length;
      bodyStartIndex = offsetIndex + afterEndPos;
      if (markdown[bodyStartIndex] === "\n") bodyStartIndex++;
    }
  }

  if (!rawFrontmatter || bodyStartIndex === 0) {
    return { frontmatter: emptyResult, body: markdown };
  }

  const body = markdown.slice(bodyStartIndex);
  const data = parseFrontmatterContent(rawFrontmatter, format);
  const fields = buildFieldsList(data);

  const isEmpty = Object.keys(data).length === 0;

  // Extract known common frontmatter metadata
  const title = typeof data.title === "string" ? data.title : undefined;
  const description =
    typeof data.description === "string"
      ? data.description
      : typeof data.summary === "string"
      ? data.summary
      : undefined;

  const author =
    typeof data.author === "string" ||
    (Array.isArray(data.author) && data.author.every((a) => typeof a === "string"))
      ? (data.author as string | string[])
      : undefined;

  const date =
    typeof data.date === "string"
      ? data.date
      : data.date instanceof Date
      ? data.date.toISOString().split("T")[0]
      : undefined;

  const tags = Array.isArray(data.tags)
    ? data.tags.map(String)
    : typeof data.tags === "string"
    ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : undefined;

  const categories = Array.isArray(data.categories)
    ? data.categories.map(String)
    : typeof data.categories === "string"
    ? data.categories.split(",").map((c) => c.trim()).filter(Boolean)
    : undefined;

  const status = typeof data.status === "string" ? data.status : undefined;
  const draft = typeof data.draft === "boolean" ? data.draft : undefined;

  return {
    frontmatter: {
      raw: rawFrontmatter,
      format,
      data,
      fields,
      isEmpty,
      title,
      description,
      author,
      date,
      tags,
      categories,
      status,
      draft,
    },
    body,
  };
}

/**
 * Strips comments from a YAML line while strictly ignoring '#' inside single or double quotes.
 */
function stripYamlComment(line: string): string {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === "#" && !inSingle && !inDouble) {
      if (i === 0 || /\s/.test(line[i - 1])) {
        return line.slice(0, i);
      }
    }
  }

  return line;
}

interface YamlLine {
  indent: number;
  text: string;
}

/**
 * Lightweight frontmatter parser for YAML, TOML, or JSON content.
 * Handles nested objects and indentation levels.
 */
function parseFrontmatterContent(
  content: string,
  format: "yaml" | "toml" | "json"
): Record<string, FrontmatterValue> {
  if (format === "json") {
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  if (format === "toml") {
    return parseTomlContent(content);
  }

  // Parse YAML with indentation level tracking
  const rawLines = content.split("\n");
  const yamlLines: YamlLine[] = [];

  for (const rawLine of rawLines) {
    const stripped = stripYamlComment(rawLine);
    if (!stripped.trim()) continue;

    // Calculate leading spaces for indent level
    const matchIndent = stripped.match(/^(\s*)/);
    const indent = matchIndent ? matchIndent[1].length : 0;
    yamlLines.push({ indent, text: stripped.trim() });
  }

  return parseYamlObject(yamlLines, 0);
}

function parseYamlObject(
  lines: YamlLine[],
  minIndent: number
): Record<string, FrontmatterValue> {
  const result: Record<string, FrontmatterValue> = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.indent < minIndent) {
      break;
    }

    const text = line.text;
    const sepIndex = text.indexOf(":");

    if (sepIndex > 0) {
      const key = text.slice(0, sepIndex).trim();
      const valStr = text.slice(sepIndex + 1).trim();

      if (valStr) {
        if (valStr.startsWith("[") && valStr.endsWith("]")) {
          const rawItems = valStr.slice(1, -1).split(",");
          result[key] = rawItems
            .map((item) => parseValue(item.trim()))
            .filter((v) => v !== "");
        } else {
          result[key] = parseValue(valStr);
        }
        i++;
      } else {
        // Key has no value on the same line. Look ahead for indented children.
        const childLines: YamlLine[] = [];
        let j = i + 1;

        while (j < lines.length && lines[j].indent > line.indent) {
          childLines.push(lines[j]);
          j++;
        }

        if (childLines.length > 0) {
          const firstChild = childLines[0].text;
          if (firstChild.startsWith("- ")) {
            // Bulleted array
            const arr: unknown[] = [];
            for (const child of childLines) {
              if (child.text.startsWith("- ")) {
                arr.push(parseValue(child.text.slice(2).trim()));
              }
            }
            result[key] = arr;
          } else {
            // Nested object
            result[key] = parseYamlObject(childLines, childLines[0].indent);
          }
        }
        i = j;
      }
    } else {
      i++;
    }
  }

  return result;
}

function parseTomlContent(content: string): Record<string, FrontmatterValue> {
  const result: Record<string, FrontmatterValue> = {};
  const lines = content.split("\n");

  for (const rawLine of lines) {
    const stripped = stripYamlComment(rawLine).trim();
    if (!stripped) continue;

    const sepIndex = stripped.indexOf("=");
    if (sepIndex > 0) {
      const key = stripped.slice(0, sepIndex).trim();
      const valStr = stripped.slice(sepIndex + 1).trim();
      result[key] = parseValue(valStr);
    }
  }

  return result;
}

/**
 * Parses primitive values from frontmatter strings (strings, numbers, booleans, dates).
 */
function parseValue(val: string): FrontmatterValue {
  if (!val) return "";

  // Remove matching wrapping quotes
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    return val.slice(1, -1);
  }

  // Booleans
  if (val.toLowerCase() === "true") return true;
  if (val.toLowerCase() === "false") return false;

  // Numbers
  if (!isNaN(Number(val)) && val.trim() !== "") {
    return Number(val);
  }

  return val;
}

/**
 * Converts parsed key-value object into a typed list of fields.
 */
function buildFieldsList(
  data: Record<string, FrontmatterValue>
): FrontmatterField[] {
  return Object.entries(data).map(([key, value]) => {
    let type: FrontmatterField["type"] = "string";

    if (typeof value === "boolean") {
      type = "boolean";
    } else if (typeof value === "number") {
      type = "number";
    } else if (Array.isArray(value)) {
      type = "array";
    } else if (typeof value === "object" && value !== null) {
      type = "object";
    } else if (
      typeof value === "string" &&
      !isNaN(Date.parse(value)) &&
      /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      type = "date";
    }

    return { key, value, type };
  });
}
