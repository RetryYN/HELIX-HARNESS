import { createHash } from "node:crypto";
import type { DesignDeclaration, ParsedDesignDeclarationDoc } from "../schema/design-declarations";
import {
  type DocumentAgentMetadata,
  type DocumentAgentMetadataFinding,
  type DocumentAgentMetadataReport,
  type DocumentAgentScopeManifest,
  parseDocumentAgentMetadata,
} from "../schema/document-agent-metadata";

export type DeclarationRegistry = ReadonlyMap<string, DesignDeclaration>;

function stable(values: Iterable<string>): string[] {
  return [...new Set([...values].map((value) => value.normalize("NFC")))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function isCanonicalPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").some((part) => !part || part === "." || part === "..")
  );
}

function inRoot(path: string, root: string): boolean {
  return path === root || path.startsWith(`${root}/`);
}

function finding(input: {
  code: DocumentAgentMetadataFinding["code"];
  path: string;
  detail: string;
  declarationId?: string | null;
}): DocumentAgentMetadataFinding {
  return {
    code: input.code,
    path: input.path,
    detail: input.detail,
    declaration_id: input.declarationId ?? null,
    severity: "error",
  };
}

function manifestDigest(value: DocumentAgentScopeManifest): `sha256:${string}` {
  const canonical = canonicalJson(value);
  return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  throw new Error("manifest contains non-JSON value");
}

export function buildDeclarationRegistry(
  documents: ParsedDesignDeclarationDoc[],
): DeclarationRegistry {
  const registry = new Map<string, DesignDeclaration>();
  for (const declaration of documents.flatMap((document) => document.declarations)) {
    if (!registry.has(declaration.id)) registry.set(declaration.id, declaration);
  }
  return registry;
}

function expectedMetadata(
  document: ParsedDesignDeclarationDoc,
  registry: DeclarationRegistry,
  manifest: DocumentAgentScopeManifest,
): { metadata: DocumentAgentMetadata; findings: DocumentAgentMetadataFinding[]; edges: string[] } {
  const findings: DocumentAgentMetadataFinding[] = [];
  const defines = stable(document.declarations.map((declaration) => declaration.id));
  const externalPaths: string[] = [];
  const edges: string[] = [];
  for (const reference of document.references) {
    const target = registry.get(reference.to);
    if (!target) {
      findings.push(
        finding({
          code: "unknown_reference",
          path: document.path,
          detail: `unknown reference: ${reference.to}`,
          declarationId: reference.to,
        }),
      );
      continue;
    }
    if (target.sourcePath === document.path) {
      findings.push(
        finding({
          code: "cycle",
          path: document.path,
          detail: `self reference: ${reference.to}`,
          declarationId: reference.to,
        }),
      );
      continue;
    }
    externalPaths.push(target.sourcePath);
    edges.push(target.sourcePath);
  }
  const readFirst = stable(externalPaths);
  return {
    metadata: {
      defines,
      read_first: readFirst,
      done_when: {
        required_declaration_ids: defines,
        required_read_first: readFirst,
        required_pair_artifact: document.pairArtifact ?? null,
        required_gates: stable(manifest.required_gates),
      },
    },
    findings,
    edges: stable(edges),
  };
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function metadataFindings(
  path: string,
  expected: DocumentAgentMetadata,
  declared: DocumentAgentMetadata | null,
): DocumentAgentMetadataFinding[] {
  if (!declared)
    return [
      finding({ code: "metadata_invalid", path, detail: "document_agent が不正または未指定" }),
    ];
  const findings: DocumentAgentMetadataFinding[] = [];
  for (const id of expected.defines) {
    if (!declared.defines.includes(id)) {
      findings.push(
        finding({
          code: "defines_extra",
          path,
          detail: `defines missing allowlist entry: ${id}`,
          declarationId: id,
        }),
      );
    }
  }
  const missingReadFirst = expected.read_first.filter(
    (value) => !declared.read_first.includes(value),
  );
  const staleReadFirst = declared.read_first.filter(
    (value) => !expected.read_first.includes(value),
  );
  for (const value of missingReadFirst)
    findings.push(
      finding({ code: "read_first_missing", path, detail: `read_first missing: ${value}` }),
    );
  for (const value of staleReadFirst)
    findings.push(
      finding({ code: "read_first_stale", path, detail: `read_first stale: ${value}` }),
    );
  if (
    !arraysEqual(
      declared.done_when.required_declaration_ids,
      expected.done_when.required_declaration_ids,
    ) ||
    !arraysEqual(declared.done_when.required_read_first, expected.done_when.required_read_first) ||
    declared.done_when.required_pair_artifact !== expected.done_when.required_pair_artifact ||
    !arraysEqual(declared.done_when.required_gates, expected.done_when.required_gates)
  )
    findings.push(
      finding({ code: "done_when_mismatch", path, detail: "done_when が導出結果と一致しない" }),
    );
  return findings;
}

function cycleFindings(edges: ReadonlyMap<string, string[]>): DocumentAgentMetadataFinding[] {
  const seen = new Set<string>();
  const active = new Set<string>();
  const findings: DocumentAgentMetadataFinding[] = [];
  const visit = (path: string) => {
    if (active.has(path)) {
      findings.push(finding({ code: "cycle", path, detail: "external reference cycle" }));
      return;
    }
    if (seen.has(path)) return;
    seen.add(path);
    active.add(path);
    for (const next of edges.get(path) ?? []) visit(next);
    active.delete(path);
  };
  for (const path of edges.keys()) visit(path);
  return findings;
}

export function validateDocumentAgentMetadata(
  documents: ParsedDesignDeclarationDoc[],
  registry: DeclarationRegistry,
  manifest: DocumentAgentScopeManifest,
): DocumentAgentMetadataReport {
  const findings: DocumentAgentMetadataFinding[] = [];
  const paths = stable(manifest.documents);
  if (paths.length === 0 || manifest.phase !== "check")
    findings.push(
      finding({
        code: "manifest_invalid",
        path: "config/document-agent-metadata-scope.json",
        detail: "invalid Phase A manifest",
      }),
    );
  for (const path of [...manifest.include_roots, ...manifest.exclude_roots, ...paths]) {
    if (!isCanonicalPath(path))
      findings.push(
        finding({ code: "manifest_invalid", path, detail: "non-canonical manifest path" }),
      );
  }
  const byPath = new Map(documents.map((document) => [document.path.normalize("NFC"), document]));
  const declarationOwners = new Map<string, string>();
  for (const path of paths) {
    for (const declaration of byPath.get(path)?.declarations ?? []) {
      const previous = declarationOwners.get(declaration.id);
      if (previous && previous !== path) {
        findings.push(
          finding({
            code: "duplicate_id",
            path,
            detail: `declaration ID ${declaration.id} is also defined by ${previous}`,
            declarationId: declaration.id,
          }),
        );
      } else {
        declarationOwners.set(declaration.id, path);
      }
    }
  }
  const proposed: Record<string, DocumentAgentMetadata> = {};
  const edges = new Map<string, string[]>();
  for (const path of paths) {
    const document = byPath.get(path);
    if (!document) {
      findings.push(
        finding({ code: "scope_invalid", path, detail: "manifest document is unavailable" }),
      );
      continue;
    }
    if (
      !manifest.include_roots.some((root) => inRoot(path, root)) ||
      manifest.exclude_roots.some((root) => inRoot(path, root))
    ) {
      findings.push(
        finding({ code: "scope_invalid", path, detail: "document is outside canonical scope" }),
      );
      continue;
    }
    if (document.findings.some((item) => item.severity === "error"))
      findings.push(
        finding({
          code: "parse_failure",
          path,
          detail: "typed declaration parser returned errors",
        }),
      );
    const derived = expectedMetadata(document, registry, manifest);
    proposed[path] = derived.metadata;
    edges.set(
      path,
      derived.edges.filter((edge) => paths.includes(edge)),
    );
    findings.push(
      ...derived.findings,
      ...metadataFindings(
        path,
        derived.metadata,
        parseDocumentAgentMetadata(document.documentAgent),
      ),
    );
  }
  findings.push(...cycleFindings(edges));
  const deduped = findings.sort((left, right) =>
    `${left.path}:${left.code}:${left.detail}`.localeCompare(
      `${right.path}:${right.code}:${right.detail}`,
    ),
  );
  return {
    schema_version: 1,
    manifest_digest: manifestDigest(manifest),
    checked_paths: paths,
    proposed,
    findings: deduped,
    ok: deduped.length === 0,
  };
}

export const deriveDocumentAgentMetadata = validateDocumentAgentMetadata;
