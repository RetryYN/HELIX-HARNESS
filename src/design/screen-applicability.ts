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
  | "HIL_SCREEN_IMPLICIT_SKIP";

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
  const snapshotId = candidate["snapshot_id"];
  const revision = candidate["revision"];
  const capabilityIds = candidate["capability_ids"];
  const phase = candidate["phase"];
  const surface = candidate["public_surface_digest"];
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
