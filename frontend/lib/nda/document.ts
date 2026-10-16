import {
  confidentialityTermText,
  formatDate,
  mndaTermText,
  type NdaFormData,
} from "./fields";
import type { Block, Inline, NdaDocument, NdaTemplate } from "./types";

const SIGNING_STATEMENT =
  "By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.";

function field(value: string, placeholder: string): Inline {
  const text = value.trim();
  return text ? { kind: "field", text } : { kind: "field", text: `[${placeholder}]`, missing: true };
}

function section(title: string, ...paragraphs: Inline[][]): Block[] {
  return [
    { kind: "heading", level: 3, text: title },
    ...paragraphs.map((content): Block => ({ kind: "paragraph", content })),
  ];
}

function buildCoverPage(template: NdaTemplate, data: NdaFormData): Block[] {
  const { party1, party2 } = data;
  return [
    ...template.preamble,
    ...section("Purpose", [field(data.purpose, "Purpose")]),
    ...section("Effective Date", [field(formatDate(data.effectiveDate), "Effective Date")]),
    ...section("MNDA Term", [field(mndaTermText(data), "MNDA Term")]),
    ...section("Term of Confidentiality", [field(confidentialityTermText(data), "Term of Confidentiality")]),
    ...section(
      "Governing Law & Jurisdiction",
      [{ kind: "text", text: "Governing Law: " }, field(data.governingLaw, "Governing Law")],
      [{ kind: "text", text: "Jurisdiction: " }, field(data.jurisdiction, "Jurisdiction")],
    ),
    ...section(
      "MNDA Modifications",
      data.modifications.trim() ? [field(data.modifications, "")] : [{ kind: "text", text: "None." }],
    ),
    { kind: "paragraph", content: [{ kind: "text", text: SIGNING_STATEMENT }] },
    {
      kind: "table",
      header: ["", "PARTY 1", "PARTY 2"],
      rows: [
        ["Signature", "", ""],
        ["Print Name", party1.name, party2.name],
        ["Title", party1.title, party2.title],
        ["Company", party1.company, party2.company],
        ["Notice Address", party1.noticeAddress, party2.noticeAddress],
        ["Date", "", ""],
      ],
    },
    template.attribution,
  ];
}

/**
 * Fills the first reference to Governing Law and Jurisdiction in the Standard
 * Terms ("the laws of the State of Delaware"). Later references ("such
 * Governing Law") and all other cover page terms (Purpose, Effective Date, …)
 * stay as defined terms pointing back to the cover page.
 */
function fillStandardTerms(blocks: Block[], data: NdaFormData): Block[] {
  const pending = new Map([
    ["Governing Law", data.governingLaw],
    ["Jurisdiction", data.jurisdiction],
  ]);

  const fill = (inline: Inline): Inline => {
    if (inline.kind !== "term" || !pending.has(inline.text)) return inline;
    const value = pending.get(inline.text)!;
    pending.delete(inline.text);
    return field(value, inline.text);
  };

  return blocks.map((block) =>
    block.kind === "paragraph" || block.kind === "clause" ? { ...block, content: block.content.map(fill) } : block,
  );
}

export function buildNdaDocument(template: NdaTemplate, data: NdaFormData): NdaDocument {
  return {
    coverPage: buildCoverPage(template, data),
    standardTerms: fillStandardTerms(template.standardTerms, data),
  };
}
