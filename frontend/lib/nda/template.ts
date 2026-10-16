import { parseMarkdown } from "./parse";
import type { NdaTemplate } from "./types";

/**
 * Extracts the reusable parts of the Common Paper Mutual NDA templates. The
 * cover page's form-like middle section (checkboxes, signature table) is
 * generated from the user's answers instead; see `buildNdaDocument`.
 */
export function extractNdaTemplate(coverPageMarkdown: string, standardTermsMarkdown: string): NdaTemplate {
  const coverPage = parseMarkdown(coverPageMarkdown);
  const firstSection = coverPage.findIndex((block) => block.kind === "heading" && block.level === 3);
  const attribution = coverPage.at(-1);

  if (firstSection <= 0 || attribution?.kind !== "paragraph") {
    throw new Error("Unexpected Mutual NDA cover page format");
  }

  return {
    preamble: coverPage.slice(0, firstSection),
    attribution,
    standardTerms: parseMarkdown(standardTermsMarkdown),
  };
}
