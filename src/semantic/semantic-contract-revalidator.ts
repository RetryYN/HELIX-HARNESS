/**
 * semantic contract 層 — Node 実行境界 revalidator（PLAN-L7-524、Issue #230 slice1）。
 *
 * L6設計 docs/design/helix/L6-function-design/semantic-contract-revalidator.md §0-§2 を正本とする。
 * ADR-010 の分離原則により、本 module は Python 意味コアの**意味を再実装しない**。
 * 行うのは schema / digest / provenance / contract 束縛の形式再検証だけであり、
 * payload は opaque JSON として扱う（意味判定重複 0）。
 * filesystem / clock / DB を読まない pure API であり、write authority を持たない。
 */
import { createHash } from "node:crypto";

export type PscFailureCodeV1 =
  | "PSC_SCHEMA_INVALID"
  | "PSC_DIGEST_MISMATCH"
  | "PSC_PROVENANCE_INVALID"
  | "PSC_CONTRACT_UNBOUND"
  | "PSC_CAS_CONFLICT"
  | "PSC_OPERATION_CONFLICT"
  | "PSC_COMMIT_FAULT";

export interface PscFailureV1 {
  code: PscFailureCodeV1;
  evidence_digest: string;
}

export type PscResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly PscFailureV1[] };

export interface SidecarDescriptorV1 {
  schema_version: "psc-sidecar.v1";
  document_path: string;
  document_digest: string;
  contract_id: string;
  contract_version: number;
  payload_schema_digest: string;
  sidecar_digest: string;
}

export interface SemanticProvenanceV1 {
  worker_id: string;
  worker_version: string;
  contract_digest: string;
}

export interface SemanticResultEnvelopeV1 {
  schema_version: "psc-semantic-result.v1";
  contract_id: string;
  contract_version: number;
  payload_schema_digest: string;
  source_digest: string;
  payload: unknown;
  payload_digest: string;
  provenance: SemanticProvenanceV1;
  envelope_digest: string;
}

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const CONTRACT_ID_PATTERN = /^PSC-[a-z0-9][a-z0-9-]*$/;
const WORKER_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const WORKER_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const SIDECAR_KEYS = [
  "schema_version",
  "document_path",
  "document_digest",
  "contract_id",
  "contract_version",
  "payload_schema_digest",
  "sidecar_digest",
] as const;

const ENVELOPE_KEYS = [
  "schema_version",
  "contract_id",
  "contract_version",
  "payload_schema_digest",
  "source_digest",
  "payload",
  "payload_digest",
  "provenance",
  "envelope_digest",
] as const;

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: PscFailureCodeV1, evidence: string): PscFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** key 昇順の canonical JSON（object key 挿入順に依存しない決定的直列化）。 */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
}

/** payload など任意 JSON の canonical digest。 */
export function computeCanonicalJsonDigest(value: unknown): string {
  return sha256(canonicalJson(value));
}

/** sidecar_digest = sidecar_digest 自身を除く canonical field 列の digest。 */
export function computeSidecarDigest(raw: Record<string, unknown>): string {
  const canonical: Record<string, unknown> = {};
  for (const key of SIDECAR_KEYS) {
    if (key === "sidecar_digest") continue;
    canonical[key] = raw[key];
  }
  return computeCanonicalJsonDigest(canonical);
}

/** envelope_digest = envelope_digest 自身を除く canonical field 列の digest。 */
export function computeEnvelopeDigest(raw: Record<string, unknown>): string {
  const canonical: Record<string, unknown> = {};
  for (const key of ENVELOPE_KEYS) {
    if (key === "envelope_digest") continue;
    canonical[key] = raw[key];
  }
  return computeCanonicalJsonDigest(canonical);
}

const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;

/**
 * repo 相対で外へ出ない path だけを許可する。生文字列の `..`/絶対 path/バックスラッシュに加え、
 * percent-encode 経由の traversal（`%2e%2e` / `..%2f` / `%252e%252e` 等）も allowlist で遮断する
 * （consumer 側が decode したときに初めて外へ出る encode-then-decode バイパスを入口で断つ）。
 */
function isContainedRelativePath(path: string): boolean {
  if (path.length === 0 || path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path)) return false;
  if (path.includes("\\")) return false;
  const segments = path.split("/");
  if (segments.includes("..") || segments.includes("")) return false;
  // segment の許容文字を英数字と `.` `_` `-` に限定する。`%` を含む表現は decode 後に
  // 別の path 構造へ化けうるため、decode 結果を待たずに拒否する。
  return segments.every((segment) => segment !== "." && SAFE_PATH_SEGMENT.test(segment));
}

/** U-PSC-001: sidecar 記述子の strict schema・path 検査・digest 再計算一致。 */
export function canonicalizeSidecarDescriptor(raw: unknown): PscResultV1<SidecarDescriptorV1> {
  if (!isRecord(raw)) return { ok: false, failures: [fail("PSC_SCHEMA_INVALID", "sidecar:type")] };
  const found: PscFailureV1[] = [];
  for (const key of Object.keys(raw)) {
    if (!(SIDECAR_KEYS as readonly string[]).includes(key)) {
      found.push(fail("PSC_SCHEMA_INVALID", `sidecar:unknown-key:${key}`));
    }
  }
  if (raw.schema_version !== "psc-sidecar.v1") {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:schema_version"));
  }
  const { document_path, document_digest, contract_id, contract_version, payload_schema_digest } =
    raw;
  if (typeof document_path !== "string" || !isContainedRelativePath(document_path)) {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:document_path"));
  }
  if (typeof document_digest !== "string" || !DIGEST_PATTERN.test(document_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:document_digest"));
  }
  if (typeof contract_id !== "string" || !CONTRACT_ID_PATTERN.test(contract_id)) {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:contract_id"));
  }
  if (
    typeof contract_version !== "number" ||
    !Number.isInteger(contract_version) ||
    contract_version < 1
  ) {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:contract_version"));
  }
  if (typeof payload_schema_digest !== "string" || !DIGEST_PATTERN.test(payload_schema_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:payload_schema_digest"));
  }
  if (typeof raw.sidecar_digest !== "string" || !DIGEST_PATTERN.test(raw.sidecar_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", "sidecar:sidecar_digest"));
  }
  if (found.length > 0) return { ok: false, failures: found };

  // 宣言 digest を信用せず、canonical field 列から再計算して一致を要求する
  // （masked mutation = field 書換 + digest 据え置きの検出）。
  const recomputed = computeSidecarDigest(raw);
  if (recomputed !== raw.sidecar_digest) {
    return { ok: false, failures: [fail("PSC_DIGEST_MISMATCH", "sidecar:digest")] };
  }
  return {
    ok: true,
    value: {
      schema_version: "psc-sidecar.v1",
      document_path: document_path as string,
      document_digest: document_digest as string,
      contract_id: contract_id as string,
      contract_version: contract_version as number,
      payload_schema_digest: payload_schema_digest as string,
      sidecar_digest: recomputed,
    },
  };
}

function validateProvenance(raw: unknown, found: PscFailureV1[]): SemanticProvenanceV1 | null {
  if (!isRecord(raw)) {
    found.push(fail("PSC_PROVENANCE_INVALID", "provenance:type"));
    return null;
  }
  const { worker_id, worker_version, contract_digest } = raw;
  let ok = true;
  if (typeof worker_id !== "string" || !WORKER_ID_PATTERN.test(worker_id)) {
    found.push(fail("PSC_PROVENANCE_INVALID", "provenance:worker_id"));
    ok = false;
  }
  if (typeof worker_version !== "string" || !WORKER_VERSION_PATTERN.test(worker_version)) {
    found.push(fail("PSC_PROVENANCE_INVALID", "provenance:worker_version"));
    ok = false;
  }
  if (typeof contract_digest !== "string" || !DIGEST_PATTERN.test(contract_digest)) {
    found.push(fail("PSC_PROVENANCE_INVALID", "provenance:contract_digest"));
    ok = false;
  }
  if (!ok) return null;
  return {
    worker_id: worker_id as string,
    worker_version: worker_version as string,
    contract_digest: contract_digest as string,
  };
}

/**
 * U-PSC-002: semantic result envelope の形式再検証。payload は opaque として扱い、
 * 意味を解釈しない（canonical bytes の digest 一致のみ検査する）。
 */
export function revalidateSemanticEnvelope(
  raw: unknown,
  sidecar: SidecarDescriptorV1,
): PscResultV1<SemanticResultEnvelopeV1> {
  if (!isRecord(raw)) return { ok: false, failures: [fail("PSC_SCHEMA_INVALID", "envelope:type")] };
  const found: PscFailureV1[] = [];
  for (const key of Object.keys(raw)) {
    if (!(ENVELOPE_KEYS as readonly string[]).includes(key)) {
      found.push(fail("PSC_SCHEMA_INVALID", `envelope:unknown-key:${key}`));
    }
  }
  if (raw.schema_version !== "psc-semantic-result.v1") {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:schema_version"));
  }
  if (typeof raw.contract_id !== "string" || !CONTRACT_ID_PATTERN.test(raw.contract_id)) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:contract_id"));
  }
  if (
    typeof raw.contract_version !== "number" ||
    !Number.isInteger(raw.contract_version) ||
    raw.contract_version < 1
  ) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:contract_version"));
  }
  if (
    typeof raw.payload_schema_digest !== "string" ||
    !DIGEST_PATTERN.test(raw.payload_schema_digest)
  ) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:payload_schema_digest"));
  }
  if (typeof raw.source_digest !== "string" || !DIGEST_PATTERN.test(raw.source_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:source_digest"));
  }
  if (raw.payload === undefined) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:payload-missing"));
  }
  if (typeof raw.payload_digest !== "string" || !DIGEST_PATTERN.test(raw.payload_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:payload_digest"));
  }
  if (typeof raw.envelope_digest !== "string" || !DIGEST_PATTERN.test(raw.envelope_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", "envelope:envelope_digest"));
  }
  if (found.length > 0) return { ok: false, failures: found };

  const provenance = validateProvenance(raw.provenance, found);

  // digest 再計算（payload / envelope とも宣言値を信用しない）。
  if (computeCanonicalJsonDigest(raw.payload) !== raw.payload_digest) {
    found.push(fail("PSC_DIGEST_MISMATCH", "envelope:payload_digest"));
  }
  if (computeEnvelopeDigest(raw) !== raw.envelope_digest) {
    found.push(fail("PSC_DIGEST_MISMATCH", "envelope:envelope_digest"));
  }

  // sidecar との contract 束縛（exact 一致）。
  if (
    raw.contract_id !== sidecar.contract_id ||
    raw.contract_version !== sidecar.contract_version ||
    raw.payload_schema_digest !== sidecar.payload_schema_digest
  ) {
    found.push(fail("PSC_CONTRACT_UNBOUND", `envelope:binding:${String(raw.contract_id)}`));
  }
  if (found.length > 0 || provenance === null) {
    return { ok: false, failures: found };
  }
  // caller の後続 mutation が検証結果へ波及しないよう payload を deep-copy する。
  const payloadCopy = JSON.parse(canonicalJson(raw.payload)) as unknown;
  return {
    ok: true,
    value: {
      schema_version: "psc-semantic-result.v1",
      contract_id: raw.contract_id as string,
      contract_version: raw.contract_version as number,
      payload_schema_digest: raw.payload_schema_digest as string,
      source_digest: raw.source_digest as string,
      payload: payloadCopy,
      payload_digest: raw.payload_digest as string,
      provenance: { ...provenance },
      envelope_digest: raw.envelope_digest as string,
    },
  };
}
