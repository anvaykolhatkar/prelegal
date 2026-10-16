/**
 * A small, renderer-agnostic document model. Templates are parsed into it once,
 * filled with the user's answers, and then rendered both as the HTML preview
 * and as the downloadable PDF.
 */

export type Inline =
  | { kind: "text"; text: string; bold?: boolean }
  | { kind: "link"; text: string; href: string }
  /** A reference to a term defined on the cover page, e.g. "Purpose". */
  | { kind: "term"; text: string }
  /** A value supplied by the user; `missing` marks an unanswered placeholder. */
  | { kind: "field"; text: string; missing?: boolean };

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; content: Inline[] }
  | { kind: "clause"; number: string; content: Inline[] }
  /** The first cell of each row is its label; the remaining cells are values. */
  | { kind: "table"; header: string[]; rows: string[][] };

export interface NdaTemplate {
  /** Cover page title and introduction, taken verbatim from the template. */
  preamble: Block[];
  /** The cover page's CC BY 4.0 attribution line. */
  attribution: Block;
  standardTerms: Block[];
}

export interface NdaDocument {
  coverPage: Block[];
  standardTerms: Block[];
}
