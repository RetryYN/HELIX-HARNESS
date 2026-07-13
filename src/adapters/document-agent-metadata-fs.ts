import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  buildDeclarationRegistry,
  validateDocumentAgentMetadata,
} from "../lint/document-agent-metadata";
import {
  type DocumentAgentMetadataReport,
  type DocumentAgentScopeManifest,
  parseDocumentAgentScopeManifest,
} from "../schema/document-agent-metadata";
import { parseDesignDeclarationDoc } from "../vmodel/design-declarations";

export const DOCUMENT_AGENT_METADATA_MANIFEST = "config/document-agent-metadata-scope.json";

function canonicalPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").some((part) => !part || part === "." || part === "..")
  );
}

function collectMarkdown(repoRoot: string, root: string, paths: string[]): void {
  if (!canonicalPath(root)) throw new Error(`invalid document-agent root: ${root}`);
  const absoluteRoot = resolve(repoRoot, root);
  if (!absoluteRoot.startsWith(`${resolve(repoRoot)}/`) || !existsSync(absoluteRoot)) return;
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const absolute = join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      collectMarkdown(repoRoot, relative(repoRoot, absolute).split("\\").join("/"), paths);
    } else if (entry.isFile() && entry.name.endsWith(".md") && statSync(absolute).isFile()) {
      paths.push(relative(repoRoot, absolute).split("\\").join("/"));
    }
  }
}

export function loadDocumentAgentMetadataManifest(repoRoot: string): DocumentAgentScopeManifest {
  const path = join(repoRoot, DOCUMENT_AGENT_METADATA_MANIFEST);
  const parsed = parseDocumentAgentScopeManifest(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed) throw new Error("document-agent metadata manifest is invalid");
  return parsed;
}

export function loadDocumentAgentMetadataReport(repoRoot: string): DocumentAgentMetadataReport {
  const manifest = loadDocumentAgentMetadataManifest(repoRoot);
  const paths: string[] = [];
  for (const root of manifest.include_roots) collectMarkdown(repoRoot, root, paths);
  const documents = [...new Set(paths)]
    .sort((left, right) => left.localeCompare(right))
    .map((path) => ({ path, content: readFileSync(join(repoRoot, path), "utf8") }))
    .map(({ path, content }) => parseDesignDeclarationDoc(path, content));
  return validateDocumentAgentMetadata(documents, buildDeclarationRegistry(documents), manifest);
}
