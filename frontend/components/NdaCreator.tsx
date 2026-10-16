"use client";

import { useState, useSyncExternalStore } from "react";
import { DocumentPreview } from "@/components/DocumentPreview";
import { NdaForm } from "@/components/NdaForm";
import { buildNdaDocument } from "@/lib/nda/document";
import { createDefaultNdaData, missingRequiredFields, todayIsoDate, type NdaFormData } from "@/lib/nda/fields";
import type { NdaDocument, NdaTemplate } from "@/lib/nda/types";

const subscribeToNothing = () => () => {};

function fileNameFor(data: NdaFormData): string {
  const slug = (value: string) => value.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const parties = [data.party1.company, data.party2.company].map(slug).filter(Boolean);
  return ["Mutual-NDA", ...parties].join("-") + ".pdf";
}

/** Generates the PDF in the browser; react-pdf is loaded only when needed. */
async function downloadPdf(nda: NdaDocument, fileName: string) {
  const [{ pdf }, { NdaPdf }] = await Promise.all([import("@react-pdf/renderer"), import("@/components/NdaPdf")]);
  const blob = await pdf(<NdaPdf nda={nda} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function NdaCreator({ template }: { template: NdaTemplate }) {
  const [answers, setAnswers] = useState(createDefaultNdaData);
  const [dateChosen, setDateChosen] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");

  // Until the user picks a date, the Effective Date is the visitor's today.
  // The server snapshot is empty so the prerendered HTML doesn't bake in the
  // build date.
  const today = useSyncExternalStore(subscribeToNothing, todayIsoDate, () => "");
  const data = dateChosen ? answers : { ...answers, effectiveDate: today };

  const nda = buildNdaDocument(template, data);
  const missing = missingRequiredFields(data);

  const handleChange = (update: Partial<NdaFormData>) => {
    if ("effectiveDate" in update) setDateChosen(true);
    setAnswers((current) => ({ ...current, ...update }));
  };

  const handleDownload = async () => {
    setStatus("generating");
    try {
      await downloadPdf(nda, fileNameFor(data));
      setStatus("idle");
    } catch (error) {
      console.error("Failed to generate the NDA PDF", error);
      setStatus("error");
    }
  };

  return (
    <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
        <NdaForm data={data} onChange={handleChange} />

        <div className="space-y-2 border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={handleDownload}
            disabled={missing.length > 0 || status === "generating"}
            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
          >
            {status === "generating" ? "Generating PDF…" : "Download PDF"}
          </button>
          {missing.length > 0 && (
            <p className="text-xs text-zinc-600">Still needed: {missing.join(", ")}.</p>
          )}
          {status === "error" && (
            <p role="alert" className="text-xs text-rose-600">
              Something went wrong generating the PDF. Please try again.
            </p>
          )}
        </div>
      </aside>

      <section aria-label="Document preview" className="min-w-0">
        <DocumentPreview nda={nda} />
      </section>
    </div>
  );
}
