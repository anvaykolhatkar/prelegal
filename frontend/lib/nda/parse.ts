import type { Block, Inline } from "./types";

const INLINE_PATTERN =
  /\*\*(.+?)\*\*|<span class="coverpage_link">(.+?)<\/span>|\[([^\]]+)\]\(([^)\s]+)\)/g;
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/;
const CLAUSE_PATTERN = /^(\d+)\.\s+(.*)$/;

/** Parses the inline Markdown used by the Common Paper templates. */
export function parseInline(source: string): Inline[] {
  const result: Inline[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(INLINE_PATTERN)) {
    if (match.index > lastIndex) {
      result.push({ kind: "text", text: source.slice(lastIndex, match.index) });
    }
    const [, bold, term, linkText, href] = match;
    if (bold !== undefined) {
      result.push({ kind: "text", text: bold, bold: true });
    } else if (term !== undefined) {
      result.push({ kind: "term", text: term });
    } else {
      result.push({ kind: "link", text: linkText, href });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    result.push({ kind: "text", text: source.slice(lastIndex) });
  }
  return result;
}

/**
 * Parses template Markdown into blocks: `#`–`###` headings, numbered clauses
 * and paragraphs (consecutive non-blank lines are joined).
 */
export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ");
    paragraph = [];
    const clause = CLAUSE_PATTERN.exec(text);
    blocks.push(
      clause
        ? { kind: "clause", number: clause[1], content: parseInline(clause[2]) }
        : { kind: "paragraph", content: parseInline(text) },
    );
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = HEADING_PATTERN.exec(line);
    if (!line) {
      flushParagraph();
    } else if (heading) {
      flushParagraph();
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();

  return blocks;
}
