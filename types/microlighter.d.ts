declare module "microlighter" {
  export interface HighlightAllOptions {
    root?: Element | Document;
    selector?: string;
    languageAliases?: Record<string, string>;
  }

  export function highlightAll(options?: HighlightAllOptions): Promise<Element[]>;
}
