import { describe, expect, it } from "vitest";
import { buildNdaDocument } from "./document";
import { createDefaultNdaData } from "./fields";
import { loadNdaTemplate } from "./loadTemplate";
import type { Block, Inline } from "./types";

const template = loadNdaTemplate();

const textOf = (content: Inline[]) => content.map((inline) => inline.text).join("");

function findClause(blocks: Block[], number: string) {
  const clause = blocks.find((block) => block.kind === "clause" && block.number === number);
  if (clause?.kind !== "clause") throw new Error(`Clause ${number} not found`);
  return clause;
}

describe("loadNdaTemplate", () => {
  it("extracts the preamble, attribution and all 11 standard terms", () => {
    expect(template.preamble[0]).toEqual({ kind: "heading", level: 1, text: "Mutual Non-Disclosure Agreement" });
    expect(template.attribution.kind).toBe("paragraph");
    expect(template.standardTerms.filter((block) => block.kind === "clause")).toHaveLength(11);
  });
});

describe("buildNdaDocument", () => {
  const data = {
    ...createDefaultNdaData(),
    effectiveDate: "2026-10-15",
    governingLaw: "Delaware",
    jurisdiction: "New Castle, DE",
    party1: { name: "Ada Lovelace", title: "CEO", company: "Acme Inc.", noticeAddress: "ada@acme.test" },
    party2: { name: "Bob Smith", title: "CTO", company: "Globex LLC", noticeAddress: "bob@globex.test" },
  };

  it("fills the cover page with the user's answers", () => {
    const { coverPage } = buildNdaDocument(template, data);
    const fields = coverPage.flatMap((block) =>
      block.kind === "paragraph" ? block.content.filter((inline) => inline.kind === "field").map((f) => f.text) : [],
    );

    expect(fields).toEqual([
      data.purpose,
      "October 15, 2026",
      "Expires 1 year from Effective Date.",
      expect.stringMatching(/^1 year from Effective Date/),
      "Delaware",
      "New Castle, DE",
    ]);
    expect(coverPage).toContainEqual(
      expect.objectContaining({
        kind: "table",
        rows: expect.arrayContaining([["Company", "Acme Inc.", "Globex LLC"]]),
      }),
    );
    expect(coverPage.at(-1)).toBe(template.attribution);
  });

  it("substitutes governing law and jurisdiction into the standard terms", () => {
    const { standardTerms } = buildNdaDocument(template, data);
    const clause = textOf(findClause(standardTerms, "9").content);

    expect(clause).toContain("the laws of the State of Delaware");
    expect(clause).toContain("courts located in New Castle, DE");
    expect(clause).toContain("provisions of such Governing Law");
    expect(clause).toContain("jurisdiction of such Jurisdiction");
  });

  it("keeps other cover page references as defined terms", () => {
    const { standardTerms } = buildNdaDocument(template, data);
    expect(findClause(standardTerms, "2").content).toContainEqual({ kind: "term", text: "Purpose" });
  });

  it("marks unanswered fields as missing placeholders", () => {
    const { standardTerms } = buildNdaDocument(template, createDefaultNdaData());
    expect(findClause(standardTerms, "9").content).toContainEqual({
      kind: "field",
      text: "[Governing Law]",
      missing: true,
    });
  });
});
