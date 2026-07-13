import { isRecord } from "../shared/value-guards";

export interface DocumentAgentScopeManifest {
  schema_version: 1;
  include_roots: string[];
  exclude_roots: string[];
  documents: string[];
  required_gates: string[];
  phase: "check" | "apply";
}

export interface DocumentAgentDoneWhen {
  required_declaration_ids: string[];
  required_read_first: string[];
  required_pair_artifact: string | null;
  required_gates: string[];
}

export interface DocumentAgentMetadata {
  defines: string[];
  read_first: string[];
  done_when: DocumentAgentDoneWhen;
}

export type DocumentAgentMetadataFindingCode =
  | "manifest_invalid"
  | "scope_invalid"
  | "parse_failure"
  | "duplicate_id"
  | "metadata_invalid"
  | "unknown_reference"
  | "cycle"
  | "defines_extra"
  | "read_first_missing"
  | "read_first_stale"
  | "done_when_mismatch";

export interface DocumentAgentMetadataFinding {
  code: DocumentAgentMetadataFindingCode;
  path: string;
  declaration_id: string | null;
  severity: "error" | "warning";
  detail: string;
}

export interface DocumentAgentMetadataReport {
  schema_version: 1;
  manifest_digest: string;
  checked_paths: string[];
  proposed: Record<string, DocumentAgentMetadata>;
  findings: DocumentAgentMetadataFinding[];
  ok: boolean;
}

function strings(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value.map((item) => item.normalize("NFC")).sort()
    : null;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

export function parseDocumentAgentScopeManifest(value: unknown): DocumentAgentScopeManifest | null {
  if (
    !isRecord(value) ||
    value.schema_version !== 1 ||
    (value.phase !== "check" && value.phase !== "apply")
  )
    return null;
  if (
    !hasOnlyKeys(value, [
      "schema_version",
      "include_roots",
      "exclude_roots",
      "documents",
      "required_gates",
      "phase",
    ])
  )
    return null;
  const includeRoots = strings(value.include_roots);
  const excludeRoots = strings(value.exclude_roots);
  const documents = strings(value.documents);
  const requiredGates = strings(value.required_gates);
  if (!includeRoots || !excludeRoots || !documents || !requiredGates || documents.length === 0)
    return null;
  return {
    schema_version: 1,
    include_roots: includeRoots,
    exclude_roots: excludeRoots,
    documents,
    required_gates: requiredGates,
    phase: value.phase,
  };
}

export function parseDocumentAgentMetadata(value: unknown): DocumentAgentMetadata | null {
  if (!isRecord(value)) return null;
  if (!hasOnlyKeys(value, ["defines", "read_first", "done_when"])) return null;
  const defines = strings(value.defines);
  const readFirst = strings(value.read_first);
  const doneWhen = value.done_when;
  if (
    !defines ||
    !readFirst ||
    !isRecord(doneWhen) ||
    !hasOnlyKeys(doneWhen, [
      "required_declaration_ids",
      "required_read_first",
      "required_pair_artifact",
      "required_gates",
    ])
  )
    return null;
  const requiredIds = strings(doneWhen.required_declaration_ids);
  const requiredReadFirst = strings(doneWhen.required_read_first);
  const requiredGates = strings(doneWhen.required_gates);
  const requiredPair = doneWhen.required_pair_artifact;
  if (
    !requiredIds ||
    !requiredReadFirst ||
    !requiredGates ||
    (requiredPair !== null && typeof requiredPair !== "string")
  )
    return null;
  return {
    defines,
    read_first: readFirst,
    done_when: {
      required_declaration_ids: requiredIds,
      required_read_first: requiredReadFirst,
      required_pair_artifact: requiredPair === null ? null : requiredPair.normalize("NFC"),
      required_gates: requiredGates,
    },
  };
}
