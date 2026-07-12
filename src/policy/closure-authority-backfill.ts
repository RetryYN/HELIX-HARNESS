import { createHash } from "node:crypto";
import type { ClosureAuthority } from "./closure-authority-registry";

type Digest = `sha256:${string}`;

export type BackfillClassification =
  | "eligible_proposal"
  | "needs_design"
  | "needs_test_citation"
  | "needs_gate_authority"
  | "human_only"
  | "invalid";

export interface BackfillBinding {
  oracle_id: string;
  parent_design: string;
  test_path: string;
}

export interface BackfillL8Row extends BackfillBinding {
  source_path: string;
  source_digest: Digest;
  parent_design_status: string;
}

export interface CollectedBackfillTest {
  test_path: string;
  full_name: string;
  status: "passed" | "failed" | "skipped" | "todo";
  source_digest: Digest;
  canonical_realpath: boolean;
  symlink: boolean;
}

export interface TypedAuthorityBlock {
  source_kind: "confirmed_design" | "plan_frontmatter";
  source_path: string;
  source_digest: Digest;
  field_pointer: string;
  status?: string;
  capabilities: readonly string[];
  gates: readonly {
    gate_id: string;
    command_id: string;
    command: string;
  }[];
}

export interface ClosureAuthorityBackfillCandidate {
  plan_id: string;
  plan_path: string;
  plan_digest: Digest;
  plan_bindings: readonly BackfillBinding[];
  l8_rows: readonly BackfillL8Row[];
  collected_tests: readonly CollectedBackfillTest[];
  design_authority?: TypedAuthorityBlock | null;
  plan_authority?: TypedAuthorityBlock | null;
}

export interface ClosureAuthorityBackfillDecision {
  plan_id: string;
  classification: BackfillClassification;
  reason: string;
  required_action: string;
  evidence_digests: Digest[];
  proposal:
    | (ClosureAuthority & {
        field_sources: {
          capabilities: TypedAuthorityBlock;
          gates: TypedAuthorityBlock;
          bindings: Array<{ plan: Digest; l8: Digest; test: Digest }>;
        };
      })
    | null;
}

export interface ClosureAuthorityBackfillBundle {
  schema_version: "closure-authority-backfill-bundle.v1";
  repository_head: string;
  registry_digest: Digest;
  review_scope_digest: Digest;
  candidate_plan_ids: string[];
  decisions: ClosureAuthorityBackfillDecision[];
  source_digests: Digest[];
  bundle_digest: Digest;
}

export interface ClosureAuthorityBackfillInput {
  repository_head: string;
  registry_digest: Digest;
  review_scope_digest: Digest;
  expected_plan_ids: readonly string[];
  candidates: readonly ClosureAuthorityBackfillCandidate[];
  gate_allowlist: Readonly<Record<string, { command_id: string; command: string }>>;
}

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const HEAD = /^[0-9a-f]{40}$/;
const CAPABILITIES = new Set([
  "local_plan_status",
  "version_activation",
  "state_cutover",
  "external_publish",
  "charter_p8",
]);
const IRREVERSIBLE = new Set([
  "version_activation",
  "state_cutover",
  "external_publish",
  "charter_p8",
]);

const sha256 = (value: string): Digest =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function exactMarker(fullName: string, planId: string, oracleId: string): boolean {
  const markers = [
    ...fullName.matchAll(/\[(PLAN-[A-Z0-9]+-[A-Za-z0-9-]+)\/(U-[A-Z0-9]+-[0-9]{3})\]/g),
  ];
  return markers.length === 1 && markers[0]?.[1] === planId && markers[0]?.[2] === oracleId;
}

function normalizedAuthority(block: TypedAuthorityBlock): string {
  return stable({ capabilities: [...block.capabilities], gates: [...block.gates] });
}

function classify(
  candidate: ClosureAuthorityBackfillCandidate,
  input: ClosureAuthorityBackfillInput,
): ClosureAuthorityBackfillDecision {
  const base = (
    classification: BackfillClassification,
    reason: string,
    required_action: string,
  ): ClosureAuthorityBackfillDecision => ({
    plan_id: candidate.plan_id,
    classification,
    reason,
    required_action,
    evidence_digests: [candidate.plan_digest],
    proposal: null,
  });
  if (!DIGEST.test(candidate.plan_digest))
    return base("invalid", "PLAN digest schema invalid", "sourceを再読込する");
  if (candidate.plan_bindings.length === 0)
    return base("needs_design", "PLAN verification binding absent", "L6/L7設計へ戻す");
  const bindingKeys = candidate.plan_bindings.map(
    (row) => `${row.oracle_id}\0${row.parent_design}\0${row.test_path}`,
  );
  if (new Set(bindingKeys).size !== bindingKeys.length)
    return base("invalid", "duplicate PLAN binding", "重複ownershipを解消する");

  const bindingSources: Array<{ plan: Digest; l8: Digest; test: Digest }> = [];
  for (const binding of candidate.plan_bindings) {
    const l8 = candidate.l8_rows.filter(
      (row) =>
        row.oracle_id === binding.oracle_id &&
        row.parent_design === binding.parent_design &&
        row.test_path === binding.test_path,
    );
    if (l8.length === 0)
      return base(
        "needs_design",
        `L8 exact row absent: ${binding.oracle_id}`,
        "L8 test-designへ戻す",
      );
    if (l8.length !== 1)
      return base(
        "invalid",
        `L8 exact row ambiguous: ${binding.oracle_id}`,
        "重複oracle ownershipを解消する",
      );
    if (l8[0]?.parent_design_status !== "confirmed")
      return base(
        "invalid",
        `parent design is not confirmed: ${binding.oracle_id}`,
        "親設計をconfirmedにする",
      );
    const tests = candidate.collected_tests.filter(
      (test) =>
        test.test_path === binding.test_path &&
        exactMarker(test.full_name, candidate.plan_id, binding.oracle_id),
    );
    if (tests.length === 0)
      return base(
        "needs_test_citation",
        `collected exact marker absent: ${binding.oracle_id}`,
        "L7 test citationを追加する",
      );
    if (
      tests.length !== 1 ||
      tests[0]?.status !== "passed" ||
      !tests[0].canonical_realpath ||
      tests[0].symlink
    )
      return base(
        "invalid",
        `test citation ambiguous or not passed: ${binding.oracle_id}`,
        "実testを一意にcollect/passする",
      );
    const l8Row = l8[0];
    const test = tests[0];
    if (!l8Row || !test || !DIGEST.test(l8Row.source_digest) || !DIGEST.test(test.source_digest))
      return base("invalid", `source digest invalid: ${binding.oracle_id}`, "sourceを再読込する");
    bindingSources.push({
      plan: candidate.plan_digest,
      l8: l8Row.source_digest,
      test: test.source_digest,
    });
  }

  const design = candidate.design_authority ?? null;
  const plan = candidate.plan_authority ?? null;
  if (design && (design.source_kind !== "confirmed_design" || design.status !== "confirmed"))
    return base("invalid", "design authority is not confirmed", "親設計をconfirmedにする");
  if (design && plan && normalizedAuthority(design) !== normalizedAuthority(plan))
    return base("invalid", "design and PLAN authority conflict", "typed authorityを一致させる");
  const authority = design ?? plan;
  if (!authority)
    return base(
      "needs_gate_authority",
      "typed authority block absent",
      "confirmed設計またはPLAN frontmatterへtyped authorityを追加する",
    );
  if (!DIGEST.test(authority.source_digest))
    return base("invalid", "authority source digest invalid", "authority sourceを再読込する");
  if (
    authority.capabilities.length === 0 ||
    authority.capabilities.some((capability) => !CAPABILITIES.has(capability))
  )
    return base("invalid", "unknown or empty capability", "typed capabilityを是正する");
  if (new Set(authority.capabilities).size !== authority.capabilities.length)
    return base("invalid", "duplicate capability", "typed capabilityを一意化する");
  for (const gate of authority.gates) {
    const allowed = input.gate_allowlist[gate.gate_id];
    if (!allowed || allowed.command_id !== gate.command_id || allowed.command !== gate.command)
      return base(
        "invalid",
        `gate allowlist mismatch: ${gate.gate_id}`,
        "canonical gate authorityへ戻す",
      );
  }
  if (authority.gates.length === 0)
    return base("needs_gate_authority", "required gate absent", "typed gate authorityを追加する");
  if (authority.capabilities.some((capability) => IRREVERSIBLE.has(capability)))
    return base("human_only", "irreversible capability", "human/action-binding approvalを維持する");

  const evidence = [
    candidate.plan_digest,
    authority.source_digest,
    ...bindingSources.flatMap((row) => [row.l8, row.test]),
  ];
  return {
    plan_id: candidate.plan_id,
    classification: "eligible_proposal",
    reason: "exact V-pair and typed reversible authority",
    required_action: "independent reviewへ送る",
    evidence_digests: [...new Set(evidence)],
    proposal: {
      plan_id: candidate.plan_id,
      source_path: candidate.plan_path,
      source_digest: candidate.plan_digest,
      capabilities: [...authority.capabilities] as ClosureAuthority["capabilities"],
      bindings: candidate.plan_bindings.map((row) => ({ ...row })),
      gates: authority.gates.map((row) => ({ ...row })),
      migration_reason: null,
      field_sources: {
        capabilities: structuredClone(authority),
        gates: structuredClone(authority),
        bindings: bindingSources,
      },
    },
  };
}

/** read-only pure policy: caller prose/green command等をauthority入力として受け取らない。 */
export function buildClosureAuthorityBackfill(
  input: ClosureAuthorityBackfillInput,
): ClosureAuthorityBackfillBundle {
  if (!HEAD.test(input.repository_head)) throw new Error("repository HEAD must be lowercase SHA-1");
  for (const digest of [input.registry_digest, input.review_scope_digest])
    if (!DIGEST.test(digest)) throw new Error("bundle binding digest invalid");
  const expected = [...input.expected_plan_ids];
  const actual = input.candidates.map((candidate) => candidate.plan_id);
  if (new Set(expected).size !== expected.length || new Set(actual).size !== actual.length)
    throw new Error("candidate census contains duplicate PLAN");
  if (
    expected.length !== actual.length ||
    expected.some((planId, index) => actual[index] !== planId)
  )
    throw new Error("candidate census missing/excess/order drift");
  const decisions = input.candidates.map((candidate) => classify(candidate, input));
  const sourceDigests = [
    ...new Set(decisions.flatMap((decision) => decision.evidence_digests)),
  ].sort();
  const body = {
    schema_version: "closure-authority-backfill-bundle.v1" as const,
    repository_head: input.repository_head,
    registry_digest: input.registry_digest,
    review_scope_digest: input.review_scope_digest,
    candidate_plan_ids: actual,
    decisions,
    source_digests: sourceDigests,
  };
  return { ...body, bundle_digest: sha256(stable(body)) };
}
