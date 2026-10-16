import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown } from "./parse";

describe("parseInline", () => {
  it("parses bold text, cover page terms and links", () => {
    expect(
      parseInline(
        'the **Purpose** of <span class="coverpage_link">Effective Date</span> under [CC BY 4.0](https://example.com).',
      ),
    ).toEqual([
      { kind: "text", text: "the " },
      { kind: "text", text: "Purpose", bold: true },
      { kind: "text", text: " of " },
      { kind: "term", text: "Effective Date" },
      { kind: "text", text: " under " },
      { kind: "link", text: "CC BY 4.0", href: "https://example.com" },
      { kind: "text", text: "." },
    ]);
  });

  it("returns plain text unchanged", () => {
    expect(parseInline("No markup here.")).toEqual([{ kind: "text", text: "No markup here." }]);
  });
});

describe("parseMarkdown", () => {
  it("parses headings, numbered clauses and paragraphs", () => {
    const blocks = parseMarkdown(
      ["# Standard Terms", "", "1. **Introduction**. Some text.", "", "### Effective Date", "A paragraph", "spanning lines."].join(
        "\r\n",
      ),
    );

    expect(blocks).toEqual([
      { kind: "heading", level: 1, text: "Standard Terms" },
      {
        kind: "clause",
        number: "1",
        content: [
          { kind: "text", text: "Introduction", bold: true },
          { kind: "text", text: ". Some text." },
        ],
      },
      { kind: "heading", level: 3, text: "Effective Date" },
      { kind: "paragraph", content: [{ kind: "text", text: "A paragraph spanning lines." }] },
    ]);
  });
});
