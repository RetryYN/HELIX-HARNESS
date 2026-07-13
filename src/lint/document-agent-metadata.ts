import { canonicalJson, sha256Digest } from "../runtime/digest";
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

function finding(
  code: DocumentAgentMetadataFinding["code"],
  path: string,
  detail: string,
  declarationId: string | null = null,
): DocumentAgentMetadataFinding {
  return { code, path, detail, declaration_id: declarationId, severity: "error" };
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
        finding(
          "unknown_reference",
          document.path,
          `unknown reference: ${reference.to}`,
          reference.to,
        ),
      );
      continue;
    }
    if (target.sourcePath === document.path) {
      findings.push(
        finding("cycle", document.path, `self reference: ${reference.to}`, reference.to),
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
  if (!declared) return [finding("metadata_invalid", path, "document_agent が不正または未指定")];
  const findings: DocumentAgentMetadataFinding[] = [];
  for (const id of expected.defines) {
    if (!declared.defines.includes(id)) {
      findings.push(finding("defines_extra", path, `defines missing allowlist entry: ${id}`, id));
    }
  }
  const missingReadFirst = expected.read_first.filter(
    (value) => !declared.read_first.includes(value),
  );
  const staleReadFirst = declared.read_first.filter(
    (value) => !expected.read_first.includes(value),
  );
  for (const value of missingReadFirst)
    findings.push(finding("read_first_missing", path, `read_first missing: ${value}`));
  for (const value of staleReadFirst)
    findings.push(finding("read_first_stale", path, `read_first stale: ${value}`));
  if (
    !arraysEqual(
      declared.done_when.required_declaration_ids,
      expected.done_when.required_declaration_ids,
    ) ||
    !arraysEqual(declared.done_when.required_read_first, expected.done_when.required_read_first) ||
    declared.done_when.required_pair_artifact !== expected.done_when.required_pair_artifact ||
    !arraysEqual(declared.done_when.required_gates, expected.done_when.required_gates)
  )
    findings.push(finding("done_when_mismatch", path, "done_when が導出結果と一致しない"));
  return findings;
}

function cycleFindings(edges: ReadonlyMap<string, string[]>): DocumentAgentMetadataFinding[] {
  const seen = new Set<string>();
  const active = new Set<string>();
  const findings: DocumentAgentMetadataFinding[] = [];
  const visit = (path: string) => {
    if (active.has(path)) {
      findings.push(finding("cycle", path, "external reference cycle"));
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
  const declarationOwners = new Map<string, string>();
  for (const document of documents) {
    for (const declaration of document.declarations) {
      const previous = declarationOwners.get(declaration.id);
      if (previous && previous !== document.path) {
        findings.push(
          finding(
            "duplicate_id",
            document.path,
            `declaration ID ${declaration.id} is also defined by ${previous}`,
            declaration.id,
          ),
        );
      } else {
        declarationOwners.set(declaration.id, document.path);
      }
    }
  }
  const paths = stable(manifest.documents);
  if (paths.length === 0 || manifest.phase !== "check")
    findings.push(
      finding(
        "manifest_invalid",
        "config/document-agent-metadata-scope.json",
        "invalid Phase A manifest",
      ),
    );
  for (const path of [...manifest.include_roots, ...manifest.exclude_roots, ...paths]) {
    if (!isCanonicalPath(path))
      findings.push(finding("manifest_invalid", path, "non-canonical manifest path"));
  }
  const byPath = new Map(documents.map((document) => [document.path.normalize("NFC"), document]));
  const proposed: Record<string, DocumentAgentMetadata> = {};
  const edges = new Map<string, string[]>();
  for (const path of paths) {
    const document = byPath.get(path);
    if (!document) {
      findings.push(finding("scope_invalid", path, "manifest document is unavailable"));
      continue;
    }
    if (
      !manifest.include_roots.some((root) => inRoot(path, root)) ||
      manifest.exclude_roots.some((root) => inRoot(path, root))
    ) {
      findings.push(finding("scope_invalid", path, "document is outside canonical scope"));
      continue;
    }
    if (document.findings.some((item) => item.severity === "error"))
      findings.push(finding("parse_failure", path, "typed declaration parser returned errors"));
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
    manifest_digest: sha256Digest(canonicalJson(manifest)),
    checked_paths: paths,
    proposed,
    findings: deduped,
    ok: deduped.length === 0,
  };
}

export const deriveDocumentAgentMetadata = validateDocumentAgentMetadata;
