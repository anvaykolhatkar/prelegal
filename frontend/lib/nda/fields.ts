export interface PartyDetails {
  name: string;
  title: string;
  company: string;
  /** Email or postal address for notices. */
  noticeAddress: string;
}

export interface NdaFormData {
  purpose: string;
  /** ISO date (YYYY-MM-DD), as produced by `<input type="date">`. */
  effectiveDate: string;
  mndaTermType: "expires" | "untilTerminated";
  mndaTermYears: number;
  confidentialityTermType: "years" | "perpetual";
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyDetails;
  party2: PartyDetails;
}

const emptyParty: PartyDetails = {
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
};

/** Defaults mirror the pre-selected options in the Common Paper cover page. */
export function createDefaultNdaData(): NdaFormData {
  return {
    purpose: "Evaluating whether to enter into a business relationship with the other party.",
    effectiveDate: "",
    mndaTermType: "expires",
    mndaTermYears: 1,
    confidentialityTermType: "years",
    confidentialityTermYears: 1,
    governingLaw: "",
    jurisdiction: "",
    modifications: "",
    party1: { ...emptyParty },
    party2: { ...emptyParty },
  };
}

export function todayIsoDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Formats `2026-10-15` as `October 15, 2026` without timezone drift. */
export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return "";
  const [, year, month, day] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    dateStyle: "long",
  });
}

function years(count: number): string {
  return count === 1 ? "1 year" : `${count} years`;
}

function isValidYears(count: number): boolean {
  return Number.isInteger(count) && count >= 1;
}

export function mndaTermText(data: NdaFormData): string {
  return data.mndaTermType === "expires"
    ? `Expires ${years(data.mndaTermYears)} from Effective Date.`
    : "Continues until terminated in accordance with the terms of the MNDA.";
}

export function confidentialityTermText(data: NdaFormData): string {
  return data.confidentialityTermType === "years"
    ? `${years(data.confidentialityTermYears)} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
    : "In perpetuity.";
}

/** Returns labels of required answers that are missing or invalid. */
export function missingRequiredFields(data: NdaFormData): string[] {
  const missing: string[] = [];
  const requireText = (value: string, label: string) => {
    if (!value.trim()) missing.push(label);
  };

  requireText(data.purpose, "Purpose");
  if (!formatDate(data.effectiveDate)) missing.push("Effective Date");
  if (data.mndaTermType === "expires" && !isValidYears(data.mndaTermYears)) {
    missing.push("MNDA Term (years)");
  }
  if (data.confidentialityTermType === "years" && !isValidYears(data.confidentialityTermYears)) {
    missing.push("Term of Confidentiality (years)");
  }
  requireText(data.governingLaw, "Governing Law");
  requireText(data.jurisdiction, "Jurisdiction");
  requireText(data.party1.name, "Party 1 name");
  requireText(data.party1.company, "Party 1 company");
  requireText(data.party2.name, "Party 2 name");
  requireText(data.party2.company, "Party 2 company");

  return missing;
}
