# Prelegal frontend

A Next.js app for drafting a Common Paper **Mutual Non-Disclosure Agreement** (PL-6).
Fill in the key details, watch the agreement update as you type, then download the
completed agreement as a PDF.

## Getting started

Requires Node.js 24.

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest unit tests
npm run lint
npm run build
```

## How it works

The agreement text comes straight from the repository's shared `../templates/` directory,
so those Markdown files remain the single source of truth.

1. **Load (build time).** `app/page.tsx` is a server component that calls
   `lib/nda/loadTemplate.ts` to read `Mutual-NDA-coverpage.md` and `Mutual-NDA.md`. The page
   is prerendered as static content.
2. **Parse.** `lib/nda/parse.ts` turns the Markdown into a small document model
   (`lib/nda/types.ts`): headings, numbered clauses and paragraphs made of text, bold, links,
   cover page term references and user-supplied fields.
3. **Fill (in the browser).** `lib/nda/document.ts` combines the template with the form
   answers (`lib/nda/fields.ts`). The cover page's title, introduction and attribution come
   from the template; its form-like sections and signature table are generated from the
   answers. In the Standard Terms, the first reference to *Governing Law* and *Jurisdiction*
   is replaced with the user's values, and the other references stay as defined terms.
4. **Render.** The same document is rendered twice: `components/DocumentPreview.tsx` for the
   live HTML preview, and `components/NdaPdf.tsx` for the PDF download via
   [`@react-pdf/renderer`](https://react-pdf.org/). The PDF library is loaded only when the
   user clicks **Download PDF**.

## License

The agreement templates are © Common Paper, Inc. and licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The attribution is kept in both the
preview and the generated PDF.
