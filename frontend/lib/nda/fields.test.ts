import { describe, expect, it } from "vitest";
import {
  confidentialityTermText,
  createDefaultNdaData,
  formatDate,
  missingRequiredFields,
  mndaTermText,
} from "./fields";

describe("formatDate", () => {
  it("formats ISO dates as long US dates", () => {
    expect(formatDate("2026-10-15")).toBe("October 15, 2026");
    expect(formatDate("2026-01-01")).toBe("January 1, 2026");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("15/10/2026")).toBe("");
  });
});

describe("term text", () => {
  it("describes the MNDA term", () => {
    const data = createDefaultNdaData();
    expect(mndaTermText(data)).toBe("Expires 1 year from Effective Date.");
    expect(mndaTermText({ ...data, mndaTermYears: 3 })).toBe("Expires 3 years from Effective Date.");
    expect(mndaTermText({ ...data, mndaTermType: "untilTerminated" })).toBe(
      "Continues until terminated in accordance with the terms of the MNDA.",
    );
  });

  it("describes the term of confidentiality", () => {
    const data = createDefaultNdaData();
    expect(confidentialityTermText({ ...data, confidentialityTermYears: 2 })).toMatch(/^2 years from Effective Date/);
    expect(confidentialityTermText({ ...data, confidentialityTermType: "perpetual" })).toBe("In perpetuity.");
  });
});

describe("missingRequiredFields", () => {
  it("lists every required answer on a blank form", () => {
    expect(missingRequiredFields(createDefaultNdaData())).toEqual([
      "Effective Date",
      "Governing Law",
      "Jurisdiction",
      "Party 1 name",
      "Party 1 company",
      "Party 2 name",
      "Party 2 company",
    ]);
  });

  it("accepts a complete form and ignores years when not applicable", () => {
    const data = {
      ...createDefaultNdaData(),
      effectiveDate: "2026-10-15",
      mndaTermType: "untilTerminated" as const,
      mndaTermYears: Number.NaN,
      governingLaw: "Delaware",
      jurisdiction: "New Castle, DE",
      party1: { name: "Ada", title: "", company: "Acme", noticeAddress: "" },
      party2: { name: "Bob", title: "", company: "Globex", noticeAddress: "" },
    };
    expect(missingRequiredFields(data)).toEqual([]);
    expect(missingRequiredFields({ ...data, mndaTermType: "expires" })).toEqual(["MNDA Term (years)"]);
  });
});
