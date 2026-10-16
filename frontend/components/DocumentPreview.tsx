import type { Block, Inline, NdaDocument } from "@/lib/nda/types";

function InlineContent({ content }: { content: Inline[] }) {
  return content.map((inline, index) => {
    switch (inline.kind) {
      case "text":
        return inline.bold ? <strong key={index}>{inline.text}</strong> : inline.text;
      case "link":
        return (
          <a key={index} href={inline.href} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline">
            {inline.text}
          </a>
        );
      case "term":
        return (
          <span key={index} className="underline decoration-zinc-400 decoration-dotted underline-offset-2">
            {inline.text}
          </span>
        );
      case "field":
        return (
          <mark
            key={index}
            className={`whitespace-pre-line rounded px-0.5 ${
              inline.missing ? "bg-rose-50 italic text-rose-600" : "bg-amber-100 text-zinc-900"
            }`}
          >
            {inline.text}
          </mark>
        );
    }
  });
}

const headingClass = {
  1: "mb-4 text-center text-2xl font-bold",
  2: "mb-2 mt-6 text-sm font-bold uppercase tracking-wide",
  3: "mb-1 mt-5 text-base font-bold",
} as const;

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "heading": {
      const Tag = `h${block.level}` as const;
      return <Tag className={headingClass[block.level]}>{block.text}</Tag>;
    }
    case "paragraph":
      return (
        <p className="my-2">
          <InlineContent content={block.content} />
        </p>
      );
    case "clause":
      return (
        <p className="my-3">
          {block.number}. <InlineContent content={block.content} />
        </p>
      );
    case "table":
      return (
        <table className="my-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              {block.header.map((cell, index) => (
                <th key={index} className="border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-center">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map(([label, ...values]) => (
              <tr key={label}>
                <th scope="row" className="w-1/4 border border-zinc-300 px-2 py-3 text-left font-medium">
                  {label}
                </th>
                {values.map((value, index) => (
                  <td key={index} className="border border-zinc-300 px-2 py-3 text-center">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

/** Renders the filled-in NDA as a paper-style HTML document. */
export function DocumentPreview({ nda }: { nda: NdaDocument }) {
  const renderBlocks = (blocks: Block[]) => blocks.map((block, index) => <BlockView key={index} block={block} />);
  return (
    <article className="mx-auto max-w-[8.5in] bg-white px-10 py-12 font-serif text-[15px] leading-relaxed text-zinc-900 shadow-md ring-1 ring-zinc-200">
      {renderBlocks(nda.coverPage)}
      <hr className="my-10 border-dashed border-zinc-300" />
      {renderBlocks(nda.standardTerms)}
    </article>
  );
}
