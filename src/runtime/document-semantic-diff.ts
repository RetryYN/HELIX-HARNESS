import { parseCanonicalDocumentStructure } from "../export/document-export";
import { parseDesignDeclarationDoc } from "../schema/design-declarations";
import { canonicalJson, sha256Digest } from "./digest";

export interface DocumentSnapshotInput {
  path: string;
  content: string;
}

export interface SemanticDocumentSnapshot {
  path: string;
  digest: string;
  declarationIds: string[];
  sectionDigests: Record<string, string>;
  historyLines: string[];
}

export interface DocumentSemanticFinding {
  code: "invalid_path" | "duplicate_path" | "parse_failure" | "unrecorded_change";
  path: string;
  severity: "error" | "warning";
  detail: string;
}

export interface SemanticDocumentDelta {
  added_documents: string[];
  removed_documents: string[];
  added_ids: string[];
  removed_ids: string[];
  changed_sections: Array<{ path: string; section: string }>;
  history_added: Array<{ path: string; line: string }>;
  findings: DocumentSemanticFinding[];
  ok: boolean;
}

function canonicalPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.split("/").some((p) => !p || p === "." || p === "..")
  );
}

function stable(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function buildSemanticDocumentSnapshot(input: DocumentSnapshotInput[]): {
  documents: SemanticDocumentSnapshot[];
  findings: DocumentSemanticFinding[];
  ok: boolean;
} {
  const findings: DocumentSemanticFinding[] = [];
  const paths = new Set<string>();
  const documents: SemanticDocumentSnapshot[] = [];
  for (const item of input) {
    if (!canonicalPath(item.path)) {
      findings.push({
        code: "invalid_path",
        path: item.path,
        severity: "error",
        detail: "canonical relative path is required",
      });
      continue;
    }
    if (paths.has(item.path)) {
      findings.push({
        code: "duplicate_path",
        path: item.path,
        severity: "error",
        detail: "duplicate snapshot path",
      });
      continue;
    }
    paths.add(item.path);
    const parsed = parseDesignDeclarationDoc(item.path, item.content);
    if (parsed.findings.some((finding) => finding.severity === "error")) {
      findings.push({
        code: "parse_failure",
        path: item.path,
        severity: "error",
        detail: "typed declaration parse failed",
      });
    }
    const projection = parseCanonicalDocumentStructure({
      family: "design",
      sourcePath: item.path,
      content: item.content,
    });
    documents.push({
      path: item.path,
      digest: sha256Digest(item.content.replace(/\r\n/g, "\n").normalize("NFC")),
      declarationIds: stable(parsed.declarations.map((declaration) => declaration.id)),
      sectionDigests: Object.fromEntries(
        projection.sections.map((section) => [
          section.anchor,
          sha256Digest(section.text.replace(/\r\n/g, "\n").normalize("NFC")),
        ]),
      ),
      historyLines: item.content
        .split(/\r?\n/)
        .filter((line) => /改版|revision|version history/i.test(line))
        .map((line) => line.trim()),
    });
  }
  documents.sort((a, b) => a.path.localeCompare(b.path));
  return { documents, findings, ok: !findings.some((finding) => finding.severity === "error") };
}

export function diffSemanticDocuments(
  base: SemanticDocumentSnapshot[],
  current: SemanticDocumentSnapshot[],
): SemanticDocumentDelta {
  const before = new Map(base.map((document) => [document.path, document]));
  const after = new Map(current.map((document) => [document.path, document]));
  const addedDocuments = stable([...after.keys()].filter((path) => !before.has(path)));
  const removedDocuments = stable([...before.keys()].filter((path) => !after.has(path)));
  const findings: DocumentSemanticFinding[] = [];
  const addedIds: string[] = [];
  const removedIds: string[] = [];
  const changedSections: Array<{ path: string; section: string }> = [];
  const historyAdded: Array<{ path: string; line: string }> = [];
  for (const path of stable([...after.keys()].filter((key) => before.has(key)))) {
    const left = before.get(path);
    const right = after.get(path);
    if (!left || !right) continue;
    addedIds.push(...right.declarationIds.filter((id) => !left.declarationIds.includes(id)));
    removedIds.push(...left.declarationIds.filter((id) => !right.declarationIds.includes(id)));
    for (const section of stable(
      new Set([...Object.keys(left.sectionDigests), ...Object.keys(right.sectionDigests)]),
    )) {
      if (left.sectionDigests[section] !== right.sectionDigests[section])
        changedSections.push({ path, section });
    }
    const addedHistory = right.historyLines.filter((line) => !left.historyLines.includes(line));
    historyAdded.push(...addedHistory.map((line) => ({ path, line })));
    if (left.digest !== right.digest && addedHistory.length === 0)
      findings.push({
        code: "unrecorded_change",
        path,
        severity: "warning",
        detail: "content changed without revision history",
      });
  }
  return {
    added_documents: addedDocuments,
    removed_documents: removedDocuments,
    added_ids: stable(addedIds),
    removed_ids: stable(removedIds),
    changed_sections: changedSections.sort((a, b) =>
      `${a.path}:${a.section}`.localeCompare(`${b.path}:${b.section}`),
    ),
    history_added: historyAdded.sort((a, b) =>
      `${a.path}:${a.line}`.localeCompare(`${b.path}:${b.line}`),
    ),
    findings,
    ok: !findings.some((finding) => finding.severity === "error"),
  };
}

export function semanticSnapshotDigest(documents: SemanticDocumentSnapshot[]): string {
  return sha256Digest(canonicalJson([...documents].sort((a, b) => a.path.localeCompare(b.path))));
}
