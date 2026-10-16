import { NdaCreator } from "@/components/NdaCreator";
import { loadNdaTemplate } from "@/lib/nda/loadTemplate";

export default function Home() {
  const template = loadNdaTemplate();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Prelegal</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Mutual NDA Creator</h1>
        <p className="mt-1 max-w-2xl text-zinc-600">
          Fill in the key details and the Common Paper Mutual Non-Disclosure Agreement updates as you type. Download
          the completed agreement as a PDF when you&apos;re ready.
        </p>
      </header>
      <NdaCreator template={template} />
    </div>
  );
}
