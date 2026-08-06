/**
 * ScreenApplicabilityGate pure evaluator core（Issue #175 / PLAN-L7-510）。
 *
 * L6設計 docs/design/helix/L6-function-design/screen-applicability-prototype.md §0-§1 の
 * U-SAP-001〜005 を実装する。pure API は filesystem / clock / DB / browser を直接読まず、
 * versioned input と trustedNow 文字列だけを受ける。write authority は 0（transaction port /
 * store / gate write は後続スライス）。
 *
 * ScreenRuleSetV1 は L6 §2 の同名 schema に対し、deterministic 評価へ必要な
 * ui/no-ui capability 分類と detector identity を L8 テスト設計とともに具体化した拡張であり、
 * rules_digest はその分類内容から再計算した値と一致しなければならない。
 *
 * ScreenDecisionV1.capability_id は L6 §2 で単数 string のため、複数 capability の scope は
 * ソート済み capability ID をカンマ結合して詰める（planPrototypeDiscovery が split で復元する）。
 * この packing を安全にするため、capability ID 自体へのカンマ含有は
 * canonicalizeScreenScope が fail-close で禁止する。
 */
import { createHash } from "node:crypto";

export type ScreenRouteV1 = "prototype_required" | "not_applicable" | "deferred";
export type SettledScreenRouteV1 = Exclude<ScreenRouteV1, "deferred">;

export type ScreenFailureCodeV1 =
  | "HIL_SCREEN_DECISION_MISSING"
  | "HIL_SCREEN_RECEIPT_STALE"
  | "HIL_SCREEN_SKIP_EVIDENCE_MISSING"
  | "HIL_SCREEN_DEFERRED_NOT_CLOSED"
  | "HIL_SCREEN_APPLICABILITY_INVALID"
  | "HIL_SCREEN_GATE_EVIDENCE_MISSING"
  | "HIL_SCREEN_IMPLICIT_SKIP"
  | "HIL_PROTOTYPE_NOT_EXECUTABLE"
  | "HIL_PROTOTYPE_STATE_MISSING"
  | "HIL_PROTOTYPE_WALKTHROUGH_MISSING"
  | "HIL_PROTOTYPE_DELTA_MISSING"
  | "HIL_PROTOTYPE_BACKPROP_MISSING"
  | "HIL_PROTOTYPE_ARTIFACT_INCOMPLETE"
  | "HIL_WALKTHROUGH_RECEIPT_MISSING";

export interface ScreenFailureV1 {
  code: ScreenFailureCodeV1;
  evidence_digest: string;
}

export type ScreenResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly ScreenFailureV1[] };

export interface ScreenPolicyV1 {
  policy_id: string;
  revision: number;
  capability_ids: string[];
  rule_set_digest: string;
}

export interface ScreenScopeSnapshotV1 {
  snapshot_id: string;
  revision: number;
  capability_ids: string[];
  phase: "L2";
  public_surface_digest: string;
  scope_digest: string;
}

export interface ScreenRuleSetV1 {
  rule_set_id: string;
  revision: number;
  rules_digest: string;
  authority_receipt_id: string;
  ui_capability_ids: string[];
  no_ui_capability_ids: string[];
  detector_id: string;
  detector_version: string;
}

export interface ScreenDecisionV1 {
  decision_id: string;
  decision_revision: number;
  scope_digest: string;
  capability_id: string;
  phase: "L2";
  status: "current" | "stale";
  route: ScreenRouteV1;
  reason_code: string;
  evidence_digest: string;
  detector_id: string;
  detector_version: string;
  detector_result_digest: string;
  detector_provenance_digest: string;
  actor_id: string;
  rule_digest: string;
  reentry_trigger: string;
  decision_digest: string;
}

export interface NoUiReceiptV1 {
  receipt_id: string;
  decision_id: string;
  decision_revision: number;
  capability_id: string;
  capability_revision: number;
  scope_digest: string;
  rule_digest: string;
  reason_code: string;
  evidence_digest: string;
  actor_id: string;
  reentry_trigger_digest: string;
  issued_at: string;
  expires_at: string;
  receipt_digest: string;
}

export interface ScreenRequirementV1 {
  requirement_id: string;
  revision: number;
  capability_id: string;
  screen_obligation_digest: string;
  interaction_obligation_digest: string;
  state_obligation_digest: string;
  data_obligation_digest: string;
}

export interface PrototypeTaskV1 {
  task_id: string;
  capability_id: string;
  requirement_revision: number;
  obligation_digest: string;
  status: "planned" | "building" | "complete";
}

export interface ReentryPlanV1 {
  capability_id: string;
  stale_receipt_id: string;
  trigger_digest: string;
  task_id: string;
  expected_revision: number;
}

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(code: ScreenFailureCodeV1, evidence: string): ScreenResultV1<never> {
  return { ok: false, failures: [{ code, evidence_digest: sha256(evidence) }] };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** U-SAP-001: scope/capability/phase/public surface を stable sort し digest 化する。 */
export function canonicalizeScreenScope(
  raw: unknown,
  policy: ScreenPolicyV1,
): ScreenResultV1<ScreenScopeSnapshotV1> {
  if (typeof raw !== "object" || raw === null)
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `non_object_scope:${String(raw)}`);
  const candidate = raw as Record<string, unknown>;
  const snapshotId = candidate.snapshot_id;
  const revision = candidate.revision;
  const capabilityIds = candidate.capability_ids;
  const phase = candidate.phase;
  const surface = candidate.public_surface_digest;
  if (
    !isNonEmptyString(snapshotId) ||
    !Number.isInteger(revision) ||
    !Array.isArray(capabilityIds) ||
    capabilityIds.length === 0 ||
    !capabilityIds.every(isNonEmptyString)
  )
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `scope_field_missing:${String(snapshotId)}`);
  const commaIds = capabilityIds.filter((id) => id.includes(","));
  if (commaIds.length > 0)
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `capability_id_comma:${commaIds.join(";")}`);
  if (phase !== "L2")
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `scope_phase_invalid:${String(phase)}`);
  if (!isNonEmptyString(surface) || !surface.startsWith("sha256:"))
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `scope_surface_locator:${String(surface)}`);
  const known = new Set(policy.capability_ids);
  const unknown = capabilityIds.filter((id) => !known.has(id));
  if (unknown.length > 0)
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `unknown_capability:${unknown.join(",")}`);
  const sorted = [...new Set(capabilityIds)].sort();
  const scopeDigest = sha256(
    JSON.stringify({
      capability_ids: sorted,
      phase: "L2",
      public_surface_digest: surface,
      snapshot_id: snapshotId,
    }),
  );
  return {
    ok: true,
    value: {
      snapshot_id: snapshotId,
      revision: revision as number,
      capability_ids: sorted,
      phase: "L2",
      public_surface_digest: surface,
      scope_digest: scopeDigest,
    },
  };
}

/** rules_digest の正本計算。ScreenRuleSetV1 は自身の分類内容と一致する digest を持たなければならない。 */
export function computeScreenRuleSetDigest(rules: Omit<ScreenRuleSetV1, "rules_digest">): string {
  return sha256(
    JSON.stringify({
      no_ui: [...rules.no_ui_capability_ids].sort(),
      rule_set_id: rules.rule_set_id,
      revision: rules.revision,
      ui: [...rules.ui_capability_ids].sort(),
    }),
  );
}

/** U-SAP-002: UI 有無を deterministic 評価する。free-text / deferred / 二route同時選択は pass しない。 */
export function evaluateScreenApplicability(
  scope: ScreenScopeSnapshotV1,
  rules: ScreenRuleSetV1,
): ScreenResultV1<ScreenDecisionV1> {
  const expectedDigest = computeScreenRuleSetDigest(rules);
  if (rules.rules_digest !== expectedDigest)
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `rule_digest_mismatch:${rules.rule_set_id}`);
  const ui = new Set(rules.ui_capability_ids);
  const noUi = new Set(rules.no_ui_capability_ids);
  const unclassified = scope.capability_ids.filter((id) => !ui.has(id) && !noUi.has(id));
  if (unclassified.length > 0)
    return fail(
      "HIL_SCREEN_APPLICABILITY_INVALID",
      `capability_unclassified:${unclassified.join(",")}`,
    );
  const uiHits = scope.capability_ids.filter((id) => ui.has(id));
  const noUiHits = scope.capability_ids.filter((id) => noUi.has(id));
  if (uiHits.length > 0 && noUiHits.length > 0)
    return fail("HIL_SCREEN_APPLICABILITY_INVALID", `mixed_capability_scope:${scope.scope_digest}`);
  const route: SettledScreenRouteV1 = uiHits.length > 0 ? "prototype_required" : "not_applicable";
  const reasonCode = route === "prototype_required" ? "public_ui_surface" : "no_public_ui_surface";
  const detectorResultDigest = sha256(
    JSON.stringify({ route, rule_digest: rules.rules_digest, scope_digest: scope.scope_digest }),
  );
  const base = {
    scope_digest: scope.scope_digest,
    capability_id: scope.capability_ids.join(","),
    phase: "L2" as const,
    status: "current" as const,
    route,
    reason_code: reasonCode,
    evidence_digest: detectorResultDigest,
    detector_id: rules.detector_id,
    detector_version: rules.detector_version,
    detector_result_digest: detectorResultDigest,
    detector_provenance_digest: sha256(
      JSON.stringify({
        authority_receipt_id: rules.authority_receipt_id,
        rule_set_id: rules.rule_set_id,
      }),
    ),
    actor_id: rules.detector_id,
    rule_digest: rules.rules_digest,
    reentry_trigger: "scope_or_rule_digest_change",
  };
  const decisionDigest = sha256(JSON.stringify(base));
  return {
    ok: true,
    value: {
      decision_id: `screen-decision-${decisionDigest.slice(7, 19)}`,
      decision_revision: scope.revision,
      ...base,
      decision_digest: decisionDigest,
    },
  };
}

/** U-SAP-003: reason/actor/evidence/reentry/scope/rule/expiry を完全照合する。 */
export function validateNoUiReceipt(
  decision: ScreenDecisionV1,
  candidate: NoUiReceiptV1,
  trustedNow: string,
): ScreenResultV1<NoUiReceiptV1> {
  if (decision.status !== "current" || decision.route !== "not_applicable")
    return fail(
      "HIL_SCREEN_SKIP_EVIDENCE_MISSING",
      `decision_not_skippable:${decision.decision_id}`,
    );
  const evidenceFields: [string, string][] = [
    ["reason_code", candidate.reason_code],
    ["actor_id", candidate.actor_id],
    ["evidence_digest", candidate.evidence_digest],
    ["reentry_trigger_digest", candidate.reentry_trigger_digest],
    ["receipt_id", candidate.receipt_id],
    ["issued_at", candidate.issued_at],
    ["expires_at", candidate.expires_at],
  ];
  const missing = evidenceFields.filter(([, value]) => !isNonEmptyString(value));
  if (missing.length > 0)
    return fail(
      "HIL_SCREEN_SKIP_EVIDENCE_MISSING",
      `skip_field_missing:${missing.map(([name]) => name).join(",")}`,
    );
  if (
    candidate.decision_id !== decision.decision_id ||
    candidate.decision_revision !== decision.decision_revision ||
    candidate.capability_id !== decision.capability_id ||
    candidate.scope_digest !== decision.scope_digest ||
    candidate.rule_digest !== decision.rule_digest ||
    candidate.reason_code !== decision.reason_code
  )
    return fail(
      "HIL_SCREEN_SKIP_EVIDENCE_MISSING",
      `skip_identity_mismatch:${candidate.receipt_id}`,
    );
  if (trustedNow >= candidate.expires_at)
    return fail("HIL_SCREEN_RECEIPT_STALE", `skip_expired:${candidate.receipt_id}`);
  return { ok: true, value: candidate };
}

/** U-SAP-004: capability/rule/scope digest 差で stale + 再判定 task exactly-one を返す。 */
export function evaluateScreenReentry(
  prior: NoUiReceiptV1,
  current: ScreenScopeSnapshotV1,
): ScreenResultV1<ReentryPlanV1> {
  if (prior.scope_digest === current.scope_digest)
    return fail("HIL_SCREEN_RECEIPT_STALE", `reentry_not_triggered:${prior.receipt_id}`);
  const triggerDigest = sha256(
    JSON.stringify({
      from_scope_digest: prior.scope_digest,
      receipt_id: prior.receipt_id,
      to_scope_digest: current.scope_digest,
    }),
  );
  return {
    ok: true,
    value: {
      capability_id: prior.capability_id,
      stale_receipt_id: prior.receipt_id,
      trigger_digest: triggerDigest,
      task_id: `screen-reentry-${triggerDigest.slice(7, 19)}`,
      expected_revision: prior.decision_revision + 1,
    },
  };
}

/** U-SAP-005: prototype_required だけを受け、義務 digest を全保持した task 一件を生成する。 */
export function planPrototypeDiscovery(
  decision: ScreenDecisionV1,
  requirements: ScreenRequirementV1[],
): ScreenResultV1<PrototypeTaskV1> {
  if (decision.status !== "current" || decision.route !== "prototype_required")
    return fail("HIL_SCREEN_IMPLICIT_SKIP", `discovery_route_invalid:${decision.decision_id}`);
  const matched = requirements.filter((req) =>
    decision.capability_id.split(",").includes(req.capability_id),
  );
  if (matched.length === 0)
    return fail(
      "HIL_SCREEN_GATE_EVIDENCE_MISSING",
      `requirement_missing:${decision.capability_id}`,
    );
  const incomplete = matched.filter(
    (req) =>
      !isNonEmptyString(req.screen_obligation_digest) ||
      !isNonEmptyString(req.interaction_obligation_digest) ||
      !isNonEmptyString(req.state_obligation_digest) ||
      !isNonEmptyString(req.data_obligation_digest),
  );
  if (incomplete.length > 0)
    return fail(
      "HIL_SCREEN_GATE_EVIDENCE_MISSING",
      `obligation_missing:${incomplete.map((req) => req.requirement_id).join(",")}`,
    );
  const obligationDigest = sha256(
    JSON.stringify(
      matched
        .map((req) => ({
          data: req.data_obligation_digest,
          interaction: req.interaction_obligation_digest,
          requirement_id: req.requirement_id,
          revision: req.revision,
          screen: req.screen_obligation_digest,
          state: req.state_obligation_digest,
        }))
        .sort((a, b) => a.requirement_id.localeCompare(b.requirement_id)),
    ),
  );
  return {
    ok: true,
    value: {
      task_id: `prototype-task-${obligationDigest.slice(7, 19)}`,
      capability_id: matched[0]?.capability_id ?? decision.capability_id,
      requirement_revision: Math.max(...matched.map((req) => req.revision)),
      obligation_digest: obligationDigest,
      status: "planned",
    },
  };
}

// ---- slice2（PLAN-L7-511）: prototype 検証系 evaluator ----

/** L6 §0 の PrototypeStateKindV1 exact set。fixture はこの 9 状態を欠落・重複なく揃える。 */
export const PROTOTYPE_STATE_KINDS = [
  "empty",
  "loading",
  "loaded",
  "partial",
  "error",
  "permission_denied",
  "offline",
  "conflict",
  "completed",
] as const;

export type PrototypeStateKindV1 = (typeof PROTOTYPE_STATE_KINDS)[number];

export interface PrototypeStateFixtureV1 {
  state: PrototypeStateKindV1;
  fixture_id: string;
  input_digest: string;
  expected_view_digest: string;
}

export interface PrototypeManifestV1 {
  artifact_id: string;
  revision: number;
  executable_locator: string;
  content_digest: string;
  build_digest: string;
  startup_command_digest: string;
  startup_receipt_digest: string;
  manifest_digest: string;
  screen_trace_digest: string;
  interaction_trace_digest: string;
  state_trace_digest: string;
  data_trace_digest: string;
  temporary_data_boundary_digest: string;
  producer_digest: string;
}

export interface PrototypeReadyReceiptV1 {
  artifact_id: string;
  revision: number;
  manifest_digest: string;
  state_set_digest: string;
  capability_id: string;
  receipt_digest: string;
}

export interface WalkthroughInputV1 {
  actor_id: string;
  artifact_revision: number;
  observation_digest: string;
  disposition: "delta" | "no_delta";
  target_requirement_id: string | null;
}

export interface WalkthroughReceiptV1 {
  receipt_id: string;
  artifact_id: string;
  iteration: number;
  actor_id: string;
  observation_digest: string;
  delta_digest: string | null;
  rebuilt_artifact_revision: number | null;
  receipt_digest: string;
}

export interface HumanReviewV1 {
  reviewer_id: string;
  authority_receipt_id: string;
  artifact_revision: number;
  verdict: "approved" | "rejected";
  review_digest: string;
}

export interface PrototypeAgreementV1 {
  agreement_id: string;
  capability_id: string;
  artifact_revision: number;
  walkthrough_set_digest: string;
  review_digest: string;
  agreement_digest: string;
}

export interface RequirementRevisionV1 {
  requirement_id: string;
  revision: number;
  content_digest: string;
  previous_revision: number | null;
}

export interface BackpropReceiptV1 {
  receipt_id: string;
  agreement_id: string;
  from_requirement_revision: number;
  to_requirement_revision: number;
  delta_disposition_digest: string;
  receipt_digest: string;
}

/**
 * walkthrough iteration の上限。L6/L5 は「bounded iteration」を要求するが数値を規定しないため、
 * 本スライスで module 定数として明示する（後続 transaction port / store スライスで policy 化を再検討）。
 */
export const WALKTHROUGH_ITERATION_LIMIT = 16;

/** manifest_digest の正本計算。manifest は自身の内容と一致する digest を持たなければならない。 */
export function computePrototypeManifestDigest(
  manifest: Omit<PrototypeManifestV1, "manifest_digest">,
): string {
  return sha256(
    JSON.stringify({
      artifact_id: manifest.artifact_id,
      build: manifest.build_digest,
      content: manifest.content_digest,
      data_trace: manifest.data_trace_digest,
      executable_locator: manifest.executable_locator,
      interaction_trace: manifest.interaction_trace_digest,
      producer: manifest.producer_digest,
      revision: manifest.revision,
      screen_trace: manifest.screen_trace_digest,
      startup_command: manifest.startup_command_digest,
      startup_receipt: manifest.startup_receipt_digest,
      state_trace: manifest.state_trace_digest,
      temporary_data_boundary: manifest.temporary_data_boundary_digest,
    }),
  );
}

/**
 * U-SAP-006: executable/startup 証跡・4 trace・exact 9 state・digest/provenance を検査し
 * ready receipt を exactly-one 発行する。static-only は HIL_PROTOTYPE_NOT_EXECUTABLE。
 * status=complete な task への再発行は拒否する（完了済み capability への ready receipt 重複発行を
 * 防ぐ冪等性境界。PrototypeManifestV1 に capability field が無いため、task 側の整合検査が
 * receipt への capability bind の唯一の入口になる）。
 */
export function validatePrototypeArtifact(
  task: PrototypeTaskV1,
  manifest: PrototypeManifestV1,
  states: PrototypeStateFixtureV1[],
): ScreenResultV1<PrototypeReadyReceiptV1> {
  if (
    !isNonEmptyString(task.task_id) ||
    !isNonEmptyString(task.capability_id) ||
    !isNonEmptyString(task.obligation_digest) ||
    !Number.isInteger(task.requirement_revision) ||
    task.requirement_revision < 1 ||
    task.status === "complete"
  )
    return fail("HIL_PROTOTYPE_ARTIFACT_INCOMPLETE", `task_invalid:${task.task_id}`);
  if (
    !isNonEmptyString(manifest.executable_locator) ||
    manifest.executable_locator.startsWith("/") ||
    !isNonEmptyString(manifest.build_digest) ||
    !isNonEmptyString(manifest.startup_command_digest) ||
    !isNonEmptyString(manifest.startup_receipt_digest)
  )
    return fail("HIL_PROTOTYPE_NOT_EXECUTABLE", `static_only:${manifest.artifact_id}`);
  if (
    !isNonEmptyString(manifest.artifact_id) ||
    !Number.isInteger(manifest.revision) ||
    manifest.revision < 1 ||
    !isNonEmptyString(manifest.content_digest) ||
    !isNonEmptyString(manifest.screen_trace_digest) ||
    !isNonEmptyString(manifest.interaction_trace_digest) ||
    !isNonEmptyString(manifest.state_trace_digest) ||
    !isNonEmptyString(manifest.data_trace_digest) ||
    !isNonEmptyString(manifest.temporary_data_boundary_digest) ||
    !isNonEmptyString(manifest.producer_digest)
  )
    return fail("HIL_PROTOTYPE_ARTIFACT_INCOMPLETE", `manifest_field:${manifest.artifact_id}`);
  const { manifest_digest: declaredDigest, ...content } = manifest;
  if (declaredDigest !== computePrototypeManifestDigest(content))
    return fail("HIL_PROTOTYPE_ARTIFACT_INCOMPLETE", `manifest_digest:${manifest.artifact_id}`);
  const seen = new Set<string>();
  for (const fixture of states) {
    if (
      !isNonEmptyString(fixture.fixture_id) ||
      !isNonEmptyString(fixture.input_digest) ||
      !isNonEmptyString(fixture.expected_view_digest)
    )
      return fail("HIL_PROTOTYPE_STATE_MISSING", `state_fixture_field:${fixture.state}`);
    if (seen.has(fixture.state))
      return fail("HIL_PROTOTYPE_STATE_MISSING", `state_duplicated:${fixture.state}`);
    seen.add(fixture.state);
  }
  const missing = PROTOTYPE_STATE_KINDS.filter((kind) => !seen.has(kind));
  if (missing.length > 0 || seen.size !== PROTOTYPE_STATE_KINDS.length)
    return fail("HIL_PROTOTYPE_STATE_MISSING", `state_missing:${missing.join(",")}`);
  const stateSetDigest = sha256(
    JSON.stringify(
      [...states]
        .sort((a, b) => a.state.localeCompare(b.state))
        .map((fixture) => ({
          expected_view: fixture.expected_view_digest,
          fixture_id: fixture.fixture_id,
          input: fixture.input_digest,
          state: fixture.state,
        })),
    ),
  );
  const receiptDigest = sha256(
    JSON.stringify({
      artifact_id: manifest.artifact_id,
      capability_id: task.capability_id,
      manifest_digest: declaredDigest,
      revision: manifest.revision,
      state_set_digest: stateSetDigest,
      task_id: task.task_id,
    }),
  );
  return {
    ok: true,
    value: {
      artifact_id: manifest.artifact_id,
      revision: manifest.revision,
      manifest_digest: declaredDigest,
      state_set_digest: stateSetDigest,
      capability_id: task.capability_id,
      receipt_digest: receiptDigest,
    },
  };
}

function priorIterationsContiguous(artifactId: string, prior: WalkthroughReceiptV1[]): boolean {
  const sorted = [...prior].sort((a, b) => a.iteration - b.iteration);
  return sorted.every(
    (receipt, index) => receipt.artifact_id === artifactId && receipt.iteration === index + 1,
  );
}

/**
 * U-SAP-007: user actor / observation / delta|no_delta / target / rebuild / bounded iteration を
 * 検査し walkthrough receipt を発行する。同一入力の再送は決定的同値。
 */
export function recordWalkthroughIteration(
  artifact: PrototypeReadyReceiptV1,
  input: WalkthroughInputV1,
  prior: WalkthroughReceiptV1[],
): ScreenResultV1<WalkthroughReceiptV1> {
  if (
    !isNonEmptyString(artifact.artifact_id) ||
    !isNonEmptyString(artifact.receipt_digest) ||
    !isNonEmptyString(input.actor_id) ||
    !isNonEmptyString(input.observation_digest)
  )
    return fail("HIL_WALKTHROUGH_RECEIPT_MISSING", `walkthrough_field:${artifact.artifact_id}`);
  if (input.artifact_revision !== artifact.revision)
    return fail(
      "HIL_WALKTHROUGH_RECEIPT_MISSING",
      `artifact_revision_mismatch:${input.artifact_revision}`,
    );
  if (!priorIterationsContiguous(artifact.artifact_id, prior))
    return fail("HIL_WALKTHROUGH_RECEIPT_MISSING", `prior_not_contiguous:${artifact.artifact_id}`);
  const iteration = prior.length + 1;
  if (iteration > WALKTHROUGH_ITERATION_LIMIT)
    return fail("HIL_WALKTHROUGH_RECEIPT_MISSING", `iteration_limit:${iteration}`);
  if (input.disposition === "delta" && !isNonEmptyString(input.target_requirement_id))
    return fail("HIL_PROTOTYPE_DELTA_MISSING", `delta_target_missing:${artifact.artifact_id}`);
  if (input.disposition === "no_delta" && input.target_requirement_id !== null)
    return fail("HIL_PROTOTYPE_DELTA_MISSING", `no_delta_target_set:${artifact.artifact_id}`);
  const deltaDigest =
    input.disposition === "delta"
      ? sha256(
          JSON.stringify({
            artifact_id: artifact.artifact_id,
            iteration,
            observation: input.observation_digest,
            target: input.target_requirement_id,
          }),
        )
      : null;
  const receiptDigest = sha256(
    JSON.stringify({
      actor_id: input.actor_id,
      artifact_id: artifact.artifact_id,
      delta: deltaDigest,
      iteration,
      observation: input.observation_digest,
      revision: artifact.revision,
    }),
  );
  return {
    ok: true,
    value: {
      receipt_id: `walkthrough-${receiptDigest.slice(7, 19)}`,
      artifact_id: artifact.artifact_id,
      iteration,
      actor_id: input.actor_id,
      observation_digest: input.observation_digest,
      delta_digest: deltaDigest,
      rebuilt_artifact_revision: input.disposition === "delta" ? artifact.revision + 1 : null,
      receipt_digest: receiptDigest,
    },
  };
}

/**
 * U-SAP-008: latest artifact・完結 walkthrough（最終 iteration が no_delta）・approved 人 review を
 * 同 digest へ bind した agreement を exactly-one 生成する。
 */
export function evaluatePrototypeAgreement(
  artifact: PrototypeReadyReceiptV1,
  walkthrough: WalkthroughReceiptV1[],
  review: HumanReviewV1,
): ScreenResultV1<PrototypeAgreementV1> {
  if (walkthrough.length === 0)
    return fail("HIL_PROTOTYPE_WALKTHROUGH_MISSING", `walkthrough_empty:${artifact.artifact_id}`);
  if (!priorIterationsContiguous(artifact.artifact_id, walkthrough))
    return fail(
      "HIL_PROTOTYPE_WALKTHROUGH_MISSING",
      `walkthrough_not_contiguous:${artifact.artifact_id}`,
    );
  const sorted = [...walkthrough].sort((a, b) => a.iteration - b.iteration);
  const last = sorted[sorted.length - 1];
  if (last === undefined || last.delta_digest !== null)
    return fail(
      "HIL_PROTOTYPE_WALKTHROUGH_MISSING",
      `walkthrough_incomplete:${artifact.artifact_id}`,
    );
  if (
    !isNonEmptyString(review.reviewer_id) ||
    !isNonEmptyString(review.authority_receipt_id) ||
    !isNonEmptyString(review.review_digest) ||
    review.verdict !== "approved" ||
    review.artifact_revision !== artifact.revision
  )
    return fail("HIL_PROTOTYPE_WALKTHROUGH_MISSING", `review_invalid:${review.reviewer_id}`);
  const walkthroughSetDigest = sha256(
    JSON.stringify(
      sorted.map((receipt) => ({
        delta: receipt.delta_digest,
        iteration: receipt.iteration,
        observation: receipt.observation_digest,
        receipt: receipt.receipt_digest,
      })),
    ),
  );
  const agreementDigest = sha256(
    JSON.stringify({
      artifact_id: artifact.artifact_id,
      artifact_revision: artifact.revision,
      capability_id: artifact.capability_id,
      review: review.review_digest,
      walkthrough_set: walkthroughSetDigest,
    }),
  );
  return {
    ok: true,
    value: {
      agreement_id: `agreement-${agreementDigest.slice(7, 19)}`,
      capability_id: artifact.capability_id,
      artifact_revision: artifact.revision,
      walkthrough_set_digest: walkthroughSetDigest,
      review_digest: review.review_digest,
      agreement_digest: agreementDigest,
    },
  };
}

/**
 * U-SAP-009: 全 delta disposition または no_delta と revision trace を検査し backprop receipt を
 * 発行する。delta の有無は artifact_revision で判定する（初版 = 1、delta rebuild で増分するため、
 * artifact_revision > 1 は delta 発生の証跡）。
 */
export function validateRequirementsBackprop(
  agreement: PrototypeAgreementV1,
  l1Revision: RequirementRevisionV1,
): ScreenResultV1<BackpropReceiptV1> {
  if (
    !isNonEmptyString(agreement.agreement_id) ||
    !isNonEmptyString(agreement.walkthrough_set_digest) ||
    !isNonEmptyString(agreement.agreement_digest) ||
    !Number.isInteger(agreement.artifact_revision) ||
    agreement.artifact_revision < 1
  )
    return fail("HIL_PROTOTYPE_BACKPROP_MISSING", `agreement_invalid:${agreement.agreement_id}`);
  if (
    !isNonEmptyString(l1Revision.requirement_id) ||
    !isNonEmptyString(l1Revision.content_digest) ||
    !Number.isInteger(l1Revision.revision) ||
    l1Revision.revision < 1
  )
    return fail("HIL_PROTOTYPE_BACKPROP_MISSING", `revision_invalid:${l1Revision.requirement_id}`);
  const hadDelta = agreement.artifact_revision > 1;
  if (hadDelta) {
    if (
      l1Revision.previous_revision === null ||
      !Number.isInteger(l1Revision.previous_revision) ||
      l1Revision.revision !== l1Revision.previous_revision + 1
    )
      return fail(
        "HIL_PROTOTYPE_BACKPROP_MISSING",
        `delta_not_disposed:${l1Revision.requirement_id}`,
      );
  } else if (l1Revision.previous_revision !== null) {
    return fail(
      "HIL_PROTOTYPE_BACKPROP_MISSING",
      `no_delta_trace_mismatch:${l1Revision.requirement_id}`,
    );
  }
  const from = l1Revision.previous_revision ?? l1Revision.revision;
  const dispositionDigest = sha256(
    JSON.stringify({
      agreement: agreement.agreement_digest,
      content: l1Revision.content_digest,
      from,
      requirement_id: l1Revision.requirement_id,
      to: l1Revision.revision,
    }),
  );
  const receiptDigest = sha256(
    JSON.stringify({
      agreement_id: agreement.agreement_id,
      disposition: dispositionDigest,
      from,
      to: l1Revision.revision,
    }),
  );
  return {
    ok: true,
    value: {
      receipt_id: `backprop-${receiptDigest.slice(7, 19)}`,
      agreement_id: agreement.agreement_id,
      from_requirement_revision: from,
      to_requirement_revision: l1Revision.revision,
      delta_disposition_digest: dispositionDigest,
      receipt_digest: receiptDigest,
    },
  };
}
