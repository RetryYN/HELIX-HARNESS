/**
 * semantic contract 層 — intake receipt（PLAN-L7-526、Issue #230 slice4、VDH-FR-001）。
 *
 * L6設計 docs/design/helix/L6-function-design/semantic-contract-revalidator.md §4 を正本とする。
 * source filename / digest / inventory / 添付中間物との差異 / atom disposition を
 * 1 つの決定的 receipt へ固定する pure API。filesystem / clock / DB を読まず、
 * write authority を持たない（永続化は §3 の transaction consumer が担う）。
 */
import { createHash } from "node:crypto";
import {
  computeCanonicalJsonDigest,
  isContainedRelativePath,
  type PscFailureV1,
  type PscResultV1,
} from "./semantic-contract-revalidator";

/**
 * 差異 1 件ごとの裁定。
 * - `canonical_only_expected`: canonical にのみ存在し、それが期待どおり（中間物側の欠落は既知）。
 * - `not_promoted`: intermediate にのみ存在し、正本へ昇格させない（中間物固有の残渣）。
 * - `superseded`: 同一 path の内容差異で、canonical 側が中間物版を置き換えた（改訂の反映）。
 * - `duplicate`: 別 path に同一内容が既に存在し、当該 entry は重複として扱う。
 */
export type IntakeDivergenceRulingV1 =
  | "canonical_only_expected"
  | "not_promoted"
  | "superseded"
  | "duplicate";

export type AtomDecisionV1 = "adopt" | "defer" | "reject";

export interface IntakeEntryV1 {
  path: string;
  /** entry 内容の sha256（同一 path で中身がすり替わる差異を検出するために必須）。 */
  digest: string;
}

export interface IntakeSourceDescriptorV1 {
  filename: string;
  source_digest: string;
  entry_count: number;
  entries: readonly IntakeEntryV1[];
  inventory_digest: string;
}

export interface IntakeDivergenceRulingEntryV1 {
  entry_path: string;
  ruling: IntakeDivergenceRulingV1;
}

export interface AtomDispositionV1 {
  atom_id: string;
  decision: AtomDecisionV1;
  rationale: string;
}

export interface IntakeReceiptInputV1 {
  schema_version: "psc-intake-receipt.v1";
  canonical_source: IntakeSourceDescriptorV1;
  intermediate_source?: IntakeSourceDescriptorV1;
  divergence_rulings: readonly IntakeDivergenceRulingEntryV1[];
  atom_dispositions: readonly AtomDispositionV1[];
  atom_ids: readonly string[];
}

export type IntakeDivergenceSideV1 = "canonical_only" | "intermediate_only" | "content_mismatch";

export interface IntakeDivergenceV1 {
  entry_path: string;
  side: IntakeDivergenceSideV1;
  ruling: IntakeDivergenceRulingV1;
}

export interface IntakeReceiptV1 {
  schema_version: "psc-intake-receipt.v1";
  canonical_filename: string;
  canonical_source_digest: string;
  canonical_entry_count: number;
  canonical_inventory_digest: string;
  intermediate_source_digest: string | null;
  divergences: readonly IntakeDivergenceV1[];
  atom_dispositions: readonly AtomDispositionV1[];
  receipt_digest: string;
}

const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ATOM_ID_PATTERN = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
const RULINGS: ReadonlySet<string> = new Set([
  "canonical_only_expected",
  "not_promoted",
  "superseded",
  "duplicate",
]);
const DECISIONS: ReadonlySet<string> = new Set(["adopt", "defer", "reject"]);

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: PscFailureV1["code"], evidence: string): PscFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * inventory_digest = entries を path 昇順へ正規化した canonical digest（宣言順に依存しない）。
 * path だけでなく entry digest も含めるため、同一 path で内容がすり替わった inventory は
 * 別 digest になる。
 */
export function computeInventoryDigest(entries: readonly IntakeEntryV1[]): string {
  return computeCanonicalJsonDigest(
    [...entries]
      .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      .map((entry) => [entry.path, entry.digest]),
  );
}

function validateSource(
  label: string,
  source: unknown,
  found: PscFailureV1[],
): IntakeSourceDescriptorV1 | null {
  if (!isRecord(source)) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:type`));
    return null;
  }
  const { filename, source_digest, entry_count, entries, inventory_digest } = source;
  let ok = true;
  if (typeof filename !== "string" || filename.length === 0) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:filename`));
    ok = false;
  }
  if (typeof source_digest !== "string" || !DIGEST_PATTERN.test(source_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:source_digest`));
    ok = false;
  }
  if (
    !Array.isArray(entries) ||
    entries.some(
      (entry) =>
        !isRecord(entry) ||
        typeof entry.path !== "string" ||
        typeof entry.digest !== "string" ||
        !DIGEST_PATTERN.test(entry.digest),
    )
  ) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:entries`));
    return null;
  }
  const entryList = entries as IntakeEntryV1[];
  if (typeof entry_count !== "number" || entry_count !== entryList.length) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:entry_count`));
    ok = false;
  }
  if (new Set(entryList.map((entry) => entry.path)).size !== entryList.length) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:duplicate-entry`));
    ok = false;
  }
  for (const entry of entryList) {
    if (!isContainedRelativePath(entry.path)) {
      found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:entry-path:${entry.path}`));
      ok = false;
    }
  }
  if (typeof inventory_digest !== "string" || !DIGEST_PATTERN.test(inventory_digest)) {
    found.push(fail("PSC_SCHEMA_INVALID", `intake:${label}:inventory_digest`));
    ok = false;
  }
  if (!ok) return null;
  // 宣言 inventory_digest を信用せず、正規化 entries から再計算して一致を要求する。
  if (computeInventoryDigest(entryList) !== inventory_digest) {
    found.push(fail("PSC_DIGEST_MISMATCH", `intake:${label}:inventory_digest`));
    return null;
  }
  return {
    filename: filename as string,
    source_digest: source_digest as string,
    entry_count: entryList.length,
    entries: entryList.map((entry) => ({ ...entry })),
    inventory_digest: inventory_digest as string,
  };
}

/** U-PSC-005: intake を決定的 receipt へ固定し、差異と disposition の未裁定を fail-close する。 */
export function buildIntakeReceipt(raw: unknown): PscResultV1<IntakeReceiptV1> {
  if (!isRecord(raw) || raw.schema_version !== "psc-intake-receipt.v1") {
    return { ok: false, failures: [fail("PSC_SCHEMA_INVALID", "intake:schema")] };
  }
  const found: PscFailureV1[] = [];
  const canonical = validateSource("canonical", raw.canonical_source, found);
  const intermediate =
    raw.intermediate_source === undefined
      ? null
      : validateSource("intermediate", raw.intermediate_source, found);

  const rulingsRaw = raw.divergence_rulings;
  if (!Array.isArray(rulingsRaw)) {
    found.push(fail("PSC_SCHEMA_INVALID", "intake:divergence_rulings"));
  }
  const rulingIndex = new Map<string, IntakeDivergenceRulingV1>();
  for (const entry of Array.isArray(rulingsRaw) ? rulingsRaw : []) {
    if (
      !isRecord(entry) ||
      typeof entry.entry_path !== "string" ||
      !RULINGS.has(String(entry.ruling))
    ) {
      found.push(fail("PSC_SCHEMA_INVALID", `intake:ruling:${JSON.stringify(entry)}`));
      continue;
    }
    rulingIndex.set(entry.entry_path, entry.ruling as IntakeDivergenceRulingV1);
  }

  const dispositionsRaw = raw.atom_dispositions;
  const atomIdsRaw = raw.atom_ids;
  if (!Array.isArray(dispositionsRaw) || !Array.isArray(atomIdsRaw)) {
    found.push(fail("PSC_SCHEMA_INVALID", "intake:atom_dispositions"));
  }
  const dispositionIndex = new Map<string, AtomDispositionV1>();
  for (const entry of Array.isArray(dispositionsRaw) ? dispositionsRaw : []) {
    if (
      !isRecord(entry) ||
      typeof entry.atom_id !== "string" ||
      !ATOM_ID_PATTERN.test(entry.atom_id) ||
      !DECISIONS.has(String(entry.decision)) ||
      typeof entry.rationale !== "string" ||
      entry.rationale.trim().length === 0
    ) {
      found.push(fail("PSC_SCHEMA_INVALID", `intake:disposition:${JSON.stringify(entry)}`));
      continue;
    }
    dispositionIndex.set(entry.atom_id, {
      atom_id: entry.atom_id,
      decision: entry.decision as AtomDecisionV1,
      rationale: entry.rationale,
    });
  }
  if (found.length > 0 || canonical === null) return { ok: false, failures: found };

  // 添付中間物は常に非正本。canonical と同一 source_digest を名乗る入力は昇格の企図として拒否する。
  if (intermediate !== null && intermediate.source_digest === canonical.source_digest) {
    found.push(
      fail("PSC_INTAKE_UNRESOLVED", `intake:intermediate-promotion:${intermediate.filename}`),
    );
  }

  // 差異は canonical のみ / intermediate のみを全列挙し、各件の裁定を要求する。
  const divergences: IntakeDivergenceV1[] = [];
  if (intermediate !== null) {
    const intermediateIndex = new Map(intermediate.entries.map((entry) => [entry.path, entry]));
    const canonicalIndex = new Map(canonical.entries.map((entry) => [entry.path, entry]));
    const pending: { entry_path: string; side: IntakeDivergenceSideV1 }[] = [];
    const sortPaths = (paths: readonly string[]) => [...paths].sort();
    for (const path of sortPaths([...canonicalIndex.keys()])) {
      const counterpart = intermediateIndex.get(path);
      if (counterpart === undefined) {
        pending.push({ entry_path: path, side: "canonical_only" });
        continue;
      }
      // 同一 path で内容がすり替わっている差異（byte-level）も全列挙して裁定を要求する。
      if (counterpart.digest !== canonicalIndex.get(path)?.digest) {
        pending.push({ entry_path: path, side: "content_mismatch" });
      }
    }
    for (const path of sortPaths([...intermediateIndex.keys()])) {
      if (!canonicalIndex.has(path)) pending.push({ entry_path: path, side: "intermediate_only" });
    }
    for (const item of pending) {
      const ruling = rulingIndex.get(item.entry_path);
      if (ruling === undefined) {
        found.push(fail("PSC_INTAKE_UNRESOLVED", `intake:divergence:${item.entry_path}`));
        continue;
      }
      divergences.push({ ...item, ruling });
    }
  }

  // atom は全件が disposition を持つ必要がある（裁定漏れを許さない）。
  const atomIds = [...(atomIdsRaw as string[])].sort();
  const dispositions: AtomDispositionV1[] = [];
  for (const atomId of atomIds) {
    const disposition = dispositionIndex.get(atomId);
    if (disposition === undefined) {
      found.push(fail("PSC_INTAKE_UNRESOLVED", `intake:atom:${atomId}`));
      continue;
    }
    dispositions.push(disposition);
  }
  if (found.length > 0) return { ok: false, failures: found };

  const receipt_digest = computeCanonicalJsonDigest({
    atom_dispositions: dispositions,
    canonical_entry_count: canonical.entry_count,
    canonical_filename: canonical.filename,
    canonical_inventory_digest: canonical.inventory_digest,
    canonical_source_digest: canonical.source_digest,
    divergences,
    intermediate_source_digest: intermediate?.source_digest ?? null,
  });
  return {
    ok: true,
    value: {
      schema_version: "psc-intake-receipt.v1",
      canonical_filename: canonical.filename,
      canonical_source_digest: canonical.source_digest,
      canonical_entry_count: canonical.entry_count,
      canonical_inventory_digest: canonical.inventory_digest,
      intermediate_source_digest: intermediate?.source_digest ?? null,
      divergences,
      atom_dispositions: dispositions,
      receipt_digest,
    },
  };
}
