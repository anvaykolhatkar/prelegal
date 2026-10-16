"use client";

import type { ReactNode } from "react";
import type { NdaFormData, PartyDetails } from "@/lib/nda/fields";

interface NdaFormProps {
  data: NdaFormData;
  onChange: (update: Partial<NdaFormData>) => void;
}

const inputBaseClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:bg-zinc-100 disabled:text-zinc-400";
const inputClass = `w-full ${inputBaseClass}`;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      {children}
      {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

function TextInput({
  label,
  hint,
  value,
  placeholder,
  required,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={required ? `${label} *` : label} hint={hint}>
      <input
        type="text"
        className={inputClass}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

/** A radio choice between a "N years" option and a fixed alternative. */
function TermChoice({
  name,
  legend,
  isYears,
  yearsCount,
  yearsLabel,
  alternativeLabel,
  onChange,
}: {
  name: string;
  legend: string;
  isYears: boolean;
  yearsCount: number;
  yearsLabel: string;
  alternativeLabel: string;
  onChange: (update: { isYears?: boolean; yearsCount?: number }) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-zinc-800">{legend}</legend>
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="radio"
          name={name}
          aria-label="Fixed number of years"
          checked={isYears}
          onChange={() => onChange({ isYears: true })}
        />
        <input
          type="number"
          min={1}
          step={1}
          aria-label={`${legend} in years`}
          className={`${inputBaseClass} w-20`}
          value={Number.isNaN(yearsCount) ? "" : yearsCount}
          disabled={!isYears}
          onChange={(event) => onChange({ yearsCount: event.target.valueAsNumber })}
        />
        {yearsLabel}
      </label>
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input type="radio" name={name} checked={!isYears} onChange={() => onChange({ isYears: false })} />
        {alternativeLabel}
      </label>
    </fieldset>
  );
}

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: PartyDetails;
  onChange: (party: PartyDetails) => void;
}) {
  const update = (key: keyof PartyDetails) => (value: string) => onChange({ ...party, [key]: value });
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
      <TextInput label="Company" value={party.company} required onChange={update("company")} />
      <TextInput label="Signer name" value={party.name} required onChange={update("name")} />
      <TextInput label="Title" value={party.title} onChange={update("title")} />
      <TextInput
        label="Notice address"
        hint="Use either an email or a postal address."
        value={party.noticeAddress}
        onChange={update("noticeAddress")}
      />
    </section>
  );
}

export function NdaForm({ data, onChange }: NdaFormProps) {
  return (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Agreement</h3>
        <Field label="Purpose *" hint="How Confidential Information may be used.">
          <textarea
            className={inputClass}
            rows={3}
            value={data.purpose}
            required
            onChange={(event) => onChange({ purpose: event.target.value })}
          />
        </Field>
        <Field label="Effective date *">
          <input
            type="date"
            className={inputClass}
            value={data.effectiveDate}
            required
            onChange={(event) => onChange({ effectiveDate: event.target.value })}
          />
        </Field>
        <TermChoice
          name="mndaTerm"
          legend="MNDA term"
          isYears={data.mndaTermType === "expires"}
          yearsCount={data.mndaTermYears}
          yearsLabel="year(s) from the Effective Date"
          alternativeLabel="Continues until terminated"
          onChange={({ isYears, yearsCount }) =>
            onChange({
              ...(isYears !== undefined && { mndaTermType: isYears ? "expires" : "untilTerminated" }),
              ...(yearsCount !== undefined && { mndaTermYears: yearsCount }),
            })
          }
        />
        <TermChoice
          name="confidentialityTerm"
          legend="Term of confidentiality"
          isYears={data.confidentialityTermType === "years"}
          yearsCount={data.confidentialityTermYears}
          yearsLabel="year(s) from the Effective Date"
          alternativeLabel="In perpetuity"
          onChange={({ isYears, yearsCount }) =>
            onChange({
              ...(isYears !== undefined && { confidentialityTermType: isYears ? "years" : "perpetual" }),
              ...(yearsCount !== undefined && { confidentialityTermYears: yearsCount }),
            })
          }
        />
        <TextInput
          label="Governing law (state)"
          value={data.governingLaw}
          placeholder="Delaware"
          required
          onChange={(governingLaw) => onChange({ governingLaw })}
        />
        <TextInput
          label="Jurisdiction"
          hint="City or county and state."
          value={data.jurisdiction}
          placeholder="New Castle, DE"
          required
          onChange={(jurisdiction) => onChange({ jurisdiction })}
        />
        <Field label="MNDA modifications" hint="Optional changes to the Standard Terms.">
          <textarea
            className={inputClass}
            rows={2}
            value={data.modifications}
            onChange={(event) => onChange({ modifications: event.target.value })}
          />
        </Field>
      </section>

      <PartyFields title="Party 1" party={data.party1} onChange={(party1) => onChange({ party1 })} />
      <PartyFields title="Party 2" party={data.party2} onChange={(party2) => onChange({ party2 })} />
    </form>
  );
}
