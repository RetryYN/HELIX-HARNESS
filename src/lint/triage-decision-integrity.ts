import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export const TRIAGE_DECISIONS_PATH =
  "docs/governance/system-review-triage-decisions.yaml";
export const TRIAGE_SCHEMA = "system-review-triage-decisions.v1";
export const PIN_CATALOG_DONE = {
  "unit-test-design": "docs/test-design/harness/L8-unit-test-design.md",
  "integration-test-design":
    "docs/test-design/harness/L9-integration-test-design.md",
  "acceptance-test-design":
    "docs/test-design/harness/L3-acceptance-test-design.md",
} as const;
export const PIN_SYSTEM_TODO = "system-test-design";
export const PIN_SYSTEM_LEGACY =
  "docs/test-design/harness/L9-system-test-design.md";
export const PIN_BACKLOG_VERIFIED = [
  "IMP-004",
  "IMP-013",
  "IMP-014",
  "IMP-017",
  "IMP-018",
  "IMP-019",
  "IMP-022",
  "IMP-023",
  "IMP-025",
  "IMP-026",
  "IMP-029",
  "IMP-035",
  "IMP-086",
  "IMP-088",
] as const;
export const PIN_RETAINED = { id: "IMP-118", residual: "IMP-148" } as const;
export const PIN_UNENUMERATED_COUNT = 10;
/** annexでIDが列挙されるまで空。推測した任意10件でcompletionを偽装させない独立authority pin。 */
export const PIN_ENUMERATED_IDS: readonly string[] = [];

type CatalogItem = {
  id?: string;
  status?: string;
  artifact?: string | string[];
};
type DecisionManifest = {
  schema_version?: string;
  catalog?: {
    done?: Record<string, string>;
    retained_todo?: Record<string, { excluded_legacy_artifact?: string }>;
  };
  backlog?: {
    verified_ids?: string[];
    retained_triaged?: { id?: string; residual?: string };
    unenumerated_status_claim?: {
      expected_count?: number;
      ids?: string[];
      state?: string;
    };
  };
};
export type TriageViolationKind =
  | "missing-input"
  | "invalid-schema"
  | "pinned-set-mismatch"
  | "source-status-drift"
  | "canonical-artifact-mismatch"
  | "legacy-artifact-as-canonical"
  | "artifact-not-found"
  | "residual-mismatch"
  | "residual-not-open"
  | "unresolved-count-unproved"
  | "unresolved-state-invalid"
  | "unresolved-id-invalid"
  | "unresolved-claim-at-terminal";
export type TriageViolation = {
  kind: TriageViolationKind;
  item: string;
  detail: string;
};
export type TriageInput = {
  manifest: DecisionManifest | null;
  catalogItems: CatalogItem[];
  backlogStatuses: Map<string, string>;
  artifactExists: (path: string) => boolean;
  planTerminal?: boolean;
};
export type TriageResult = {
  ok: boolean;
  completionReady: boolean;
  violations: TriageViolation[];
};

const sorted = (xs: readonly string[]) => [...xs].sort();
const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === new Set(a).size &&
  JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const artifacts = (item: CatalogItem | undefined) =>
  item === undefined
    ? []
    : Array.isArray(item.artifact)
      ? item.artifact
      : typeof item.artifact === "string"
        ? [item.artifact]
        : [];

export function analyzeTriageDecisionIntegrity(
  input: TriageInput,
): TriageResult {
  const violations: TriageViolation[] = [];
  const add = (kind: TriageViolationKind, item: string, detail: string) =>
    violations.push({ kind, item, detail });
  const m = input.manifest;
  if (!m)
    return {
      ok: false,
      completionReady: false,
      violations: [
        {
          kind: "missing-input",
          item: TRIAGE_DECISIONS_PATH,
          detail: "manifestを読めない",
        },
      ],
    };
  if (m.schema_version !== TRIAGE_SCHEMA)
    add("invalid-schema", "schema_version", `${m.schema_version ?? "missing"}`);

  const manifestDone = Object.keys(m.catalog?.done ?? {});
  if (!sameSet(manifestDone, Object.keys(PIN_CATALOG_DONE)))
    add("pinned-set-mismatch", "catalog.done", "期待3件と不一致");
  for (const [id, path] of Object.entries(PIN_CATALOG_DONE)) {
    if (m.catalog?.done?.[id] !== path)
      add("canonical-artifact-mismatch", id, "manifest artifactがpinと不一致");
    const source = input.catalogItems.find((x) => x.id === id);
    if (source?.status !== "done")
      add("source-status-drift", id, "catalog statusがdoneではない");
    if (!artifacts(source).includes(path))
      add("canonical-artifact-mismatch", id, "catalog artifactがpinと不一致");
    if (!input.artifactExists(path)) add("artifact-not-found", id, path);
  }
  const system = input.catalogItems.find((x) => x.id === PIN_SYSTEM_TODO);
  if (system?.status !== "todo")
    add("source-status-drift", PIN_SYSTEM_TODO, "system testはtodo維持が必要");
  if (artifacts(system).includes(PIN_SYSTEM_LEGACY))
    add("legacy-artifact-as-canonical", PIN_SYSTEM_TODO, PIN_SYSTEM_LEGACY);
  if (
    m.catalog?.retained_todo?.[PIN_SYSTEM_TODO]?.excluded_legacy_artifact !==
    PIN_SYSTEM_LEGACY
  )
    add(
      "canonical-artifact-mismatch",
      PIN_SYSTEM_TODO,
      "legacy除外宣言が不一致",
    );

  const verified = m.backlog?.verified_ids ?? [];
  if (!sameSet(verified, PIN_BACKLOG_VERIFIED))
    add("pinned-set-mismatch", "backlog.verified_ids", "期待14件と不一致");
  for (const id of PIN_BACKLOG_VERIFIED)
    if (input.backlogStatuses.get(id) !== "verified")
      add("source-status-drift", id, "backlog statusがverifiedではない");
  const retained = m.backlog?.retained_triaged;
  if (
    retained?.id !== PIN_RETAINED.id ||
    retained?.residual !== PIN_RETAINED.residual
  )
    add("residual-mismatch", PIN_RETAINED.id, "IMP-148残差宣言が不一致");
  if (input.backlogStatuses.get(PIN_RETAINED.id) !== "triaged")
    add("source-status-drift", PIN_RETAINED.id, "triaged維持が必要");
  const residualStatus = input.backlogStatuses.get(PIN_RETAINED.residual);
  if (!residualStatus || ["verified", "closed"].includes(residualStatus))
    add(
      "residual-not-open",
      PIN_RETAINED.residual,
      residualStatus ?? "missing",
    );

  const claim = m.backlog?.unenumerated_status_claim;
  if (claim?.expected_count !== PIN_UNENUMERATED_COUNT)
    add(
      "unresolved-count-unproved",
      "unenumerated_status_claim",
      "expected_countは10固定",
    );
  const ids = claim?.ids ?? [];
  const unique = new Set(ids);
  const enumerated =
    ids.length === PIN_UNENUMERATED_COUNT &&
    unique.size === PIN_UNENUMERATED_COUNT;
  if (ids.length > 0 && !enumerated)
    add(
      "unresolved-count-unproved",
      "unenumerated_status_claim.ids",
      "10個の一意なIDが必要",
    );
  if (!enumerated && claim?.state !== "blocked_missing_enumeration")
    add(
      "unresolved-state-invalid",
      "unenumerated_status_claim.state",
      "未列挙時はblocked固定",
    );
  if (!["blocked_missing_enumeration", "resolved"].includes(claim?.state ?? ""))
    add("unresolved-state-invalid", "unenumerated_status_claim.state", "未知state");
  for (const id of ids) {
    if (!/^IMP-\d{3}$/.test(id) || !input.backlogStatuses.has(id))
      add("unresolved-id-invalid", id, "実在するIMP IDが必要");
    if (
      PIN_BACKLOG_VERIFIED.includes(id as (typeof PIN_BACKLOG_VERIFIED)[number]) ||
      id === PIN_RETAINED.id ||
      id === PIN_RETAINED.residual
    )
      add("unresolved-id-invalid", id, "既決集合・残差IDの再利用は禁止");
  }
  const completionReady = enumerated && claim?.state === "resolved";
  if (claim?.state === "resolved") {
    if (
      PIN_ENUMERATED_IDS.length !== PIN_UNENUMERATED_COUNT ||
      !sameSet(ids, PIN_ENUMERATED_IDS)
    )
      add(
        "unresolved-count-unproved",
        "unenumerated_status_claim.ids",
        "exact authority 10件が未確定または不一致",
      );
  }
  const authorityReady =
    PIN_ENUMERATED_IDS.length === PIN_UNENUMERATED_COUNT &&
    sameSet(ids, PIN_ENUMERATED_IDS);
  if (input.planTerminal && !(completionReady && authorityReady))
    add("unresolved-claim-at-terminal", "PLAN-L7-425", "終端statusには10件の列挙完了が必要");
  return { ok: violations.length === 0, completionReady, violations };
}

function parseBacklogStatuses(markdown: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of markdown.split(/\r?\n/)) {
    const m = line.match(
      /^\| \*\*(IMP-\d{3})\*\* \|(?:[^|]*\|){4}\s*([^|]+?)\s*\|/,
    );
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

export function loadTriageDecisionIntegrityInput(
  repoRoot: string,
): TriageInput {
  const readYaml = (rel: string): unknown =>
    parseYaml(readFileSync(join(repoRoot, rel), "utf8"));
  let manifest: DecisionManifest | null = null;
  let catalogItems: CatalogItem[] = [];
  let backlogStatuses = new Map<string, string>();
  let planTerminal = false;
  try {
    manifest = readYaml(TRIAGE_DECISIONS_PATH) as DecisionManifest;
  } catch {
    manifest = null;
  }
  try {
    catalogItems =
      (readYaml("docs/design/design-catalog.yaml") as { items?: CatalogItem[] })
        .items ?? [];
  } catch {
    catalogItems = [];
  }
  try {
    backlogStatuses = parseBacklogStatuses(
      readFileSync(join(repoRoot, "docs/improvement-backlog.md"), "utf8"),
    );
  } catch {
    backlogStatuses = new Map();
  }
  try {
    const plan = readFileSync(join(repoRoot, "docs/plans/PLAN-L7-425-system-review-issue-handoff.md"), "utf8");
    planTerminal = /^status:\s*(completed|confirmed|archived)\s*$/m.test(plan);
  } catch {
    planTerminal = true;
  }
  return {
    manifest,
    catalogItems,
    backlogStatuses,
    artifactExists: (p) => existsSync(join(repoRoot, p)),
    planTerminal,
  };
}

export function triageDecisionIntegrityMessages(
  result: TriageResult,
): string[] {
  if (result.ok)
    return [
      `triage-decision-integrity - OK (completion_ready=${result.completionReady})`,
    ];
  return result.violations.map(
    (v) =>
      `triage-decision-integrity - violation: ${v.kind} ${v.item}: ${v.detail}`,
  );
}
