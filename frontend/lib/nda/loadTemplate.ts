import { readFileSync } from "node:fs";
import path from "node:path";
import { extractNdaTemplate } from "./template";
import type { NdaTemplate } from "./types";

/** The repository's shared `templates/` directory, next to `frontend/`. */
const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

/** Reads the Mutual NDA templates from disk. Server-only; runs at build time. */
export function loadNdaTemplate(): NdaTemplate {
  const read = (fileName: string) => readFileSync(path.join(TEMPLATES_DIR, fileName), "utf8");
  return extractNdaTemplate(read("Mutual-NDA-coverpage.md"), read("Mutual-NDA.md"));
}
