/**
 * PLAN-L7-430: L7 の三点レビューで見つかった左腕矛盾を、差し戻し先の
 * add-design PLAN・V-pair delta・gate 再通過 evidence まで結合する純粋 detector。
 * global gate ledger の現在値は再通過証拠として扱わない。
 */

export const LEFT_ARM_CARRY_SCHEMA = "left-arm-carry.v1";
export const LEFT_ARM_CARRY_ENFORCEMENT_DATE = "2026-07-12";

export type LeftArmFindingKind =
  | "signature_mismatch"
  | "api_contract_drift"
  | "architecture_violation";

export const LEFT_ARM_PUSHBACK_MAP: Record<
  LeftArmFindingKind,
  { layer: "L6" | "L5" | "L4"; gate: "G6" | "G5" | "G4" }
> = {
  signature_mismatch: { layer: "L6", gate: "G6" },
  api_contract_drift: { layer: "L5", gate: "G5" },
  architecture_violation: { layer: "L4", gate: "G4" },
};

export interface CarryFileEvidence {
  path: string;
  digest: string;
}

export interface LeftArmCarryEntry {
  carry_id: string;
  finding_kind: string;
  summary: string;
  detected_at: string;
  finding_evidence: CarryFileEvidence;
  pushback_target: { layer: string; gate: string };
  affected_artifacts: string[];
  resolution_plan_id: string;
  gate_repass: {
    gate: string;
    command: string;
    completed_at: string;
    exit_code: number;
    evidence_path: string;
    output_digest: string;
  };
  resolved?: boolean;
}

export interface LeftArmCarryDecision {
  schema_version: string;
  decision: "no_pushback" | "pushback_resolved" | string;
  assessed_at: string;
  review_binding: {
    reviewer: string;
    reviewed_at: string;
    evidence_digest: string;
  };
  entries: LeftArmCarryEntry[];
}

export interface CarryReviewEntry {
  reviewer: string;
  reviewed_at: string;
  tests_green_at?: string;
  verdict: string;
  semantic_digest: string;
  green_commands?: Array<{
    gate?: string;
    command: string;
    completed_at?: string;
    exit_code: number;
    evidence_path: string;
    output_digest: string;
  }>;
}

export interface LeftArmCarryPlan {
  plan_id: string;
  kind: string;
  layer: string;
  status: string;
  created: string;
  updated?: string;
  dependencies_requires: string[];
  generates: string[];
  review_evidence: CarryReviewEntry[];
  left_arm_carry?: LeftArmCarryDecision;
  /** enforcement 導入時に凍結した legacy PLAN だけ true。日付の backdate では設定できない。 */
  legacy_pinned?: boolean;
}

export interface LeftArmCarryLogInput {
  plans: LeftArmCarryPlan[];
  /** repo-relative path -> sha256 digest。path 不在は evidence/artifact 不在。 */
  fileDigests: ReadonlyMap<string, string>;
  /** 現行 test-design artifact の集合。resolution PLAN は最低1件を generates する。 */
  testDesignArtifacts: ReadonlySet<string>;
}

export type LeftArmCarryViolationKind =
  | "missing-carry-decision"
  | "invalid-carry-schema"
  | "decision-entry-mismatch"
  | "duplicate-carry-id"
  | "invalid-finding-kind"
  | "trivial-finding-summary"
  | "invalid-pushback-mapping"
  | "finding-evidence-missing"
  | "finding-evidence-digest-mismatch"
  | "invalid-affected-artifact"
  | "duplicate-affected-artifact"
  | "resolution-plan-missing"
  | "resolution-plan-layer-mismatch"
  | "resolution-plan-not-terminal"
  | "resolution-plan-review-missing"
  | "resolution-plan-not-required"
  | "resolution-artifact-unbound"
  | "vpair-delta-missing"
  | "gate-repass-missing"
  | "gate-repass-command-mismatch"
  | "gate-repass-nonzero"
  | "gate-evidence-missing"
  | "gate-evidence-digest-mismatch"
  | "gate-repass-not-bound-to-resolution-review"
  | "invalid-event-order"
  | "carry-review-binding-missing"
  | "carry-review-digest-mismatch"
  | "unresolved-carry-at-terminal"
  | "legacy-baseline-drift";

export interface LeftArmCarryViolation {
  kind: LeftArmCarryViolationKind;
  plan_id: string;
  carry_id?: string;
  detail: string;
}

export interface LeftArmCarryLogResult {
  ok: boolean;
  checked: number;
  violations: LeftArmCarryViolation[];
}

const TERMINAL = new Set(["confirmed", "completed", "accepted"]);
const TECHNICAL_APPROVAL = new Set(["approve", "approve_after_fixes", "pass"]);
const DESIGN_KINDS = new Set(["design", "add-design"]);
const DIGEST = /^sha256:[a-f0-9]{64}$/;

function isCanonicalPath(path: string): boolean {
  return (
    path === path.normalize("NFC") &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    path.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}

function isEnforced(plan: LeftArmCarryPlan): boolean {
  if (!new Set(["impl", "add-impl"]).has(plan.kind) || plan.layer !== "L7") return false;
  if (!TERMINAL.has(plan.status)) return false;
  if (plan.legacy_pinned) return false;
  const date = plan.updated ?? plan.created;
  return !date || date >= LEFT_ARM_CARRY_ENFORCEMENT_DATE;
}

function matchingReview(
  decision: LeftArmCarryDecision,
  reviews: CarryReviewEntry[],
): CarryReviewEntry | undefined {
  return reviews.find(
    (review) =>
      review.reviewer === decision.review_binding.reviewer &&
      review.reviewed_at === decision.review_binding.reviewed_at,
  );
}

function gateCommandMatches(gate: string, command: string): boolean {
  const escaped = gate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)(?:--gate\\s+${escaped}|gate\\s+${escaped})(?:\\s|$)`).test(command);
}

function addViolation(
  violations: LeftArmCarryViolation[],
  planId: string,
  kind: LeftArmCarryViolationKind,
  detail: string,
  carryId?: string,
): void {
  violations.push({ kind, plan_id: planId, ...(carryId ? { carry_id: carryId } : {}), detail });
}

function validateDecision(
  plan: LeftArmCarryPlan,
  input: LeftArmCarryLogInput,
  byId: ReadonlyMap<string, LeftArmCarryPlan>,
  violations: LeftArmCarryViolation[],
): void {
  const decision = plan.left_arm_carry;
  if (!decision) {
    if (isEnforced(plan))
      addViolation(violations, plan.plan_id, "missing-carry-decision", "terminal L7 PLAN");
    return;
  }
  if (decision.schema_version !== LEFT_ARM_CARRY_SCHEMA) {
    addViolation(violations, plan.plan_id, "invalid-carry-schema", decision.schema_version);
  }
  const noPushback = decision.decision === "no_pushback";
  const resolved = decision.decision === "pushback_resolved";
  if (
    (!noPushback && !resolved) ||
    (noPushback && decision.entries.length !== 0) ||
    (resolved && decision.entries.length === 0)
  ) {
    addViolation(violations, plan.plan_id, "decision-entry-mismatch", decision.decision);
  }

  const review = matchingReview(decision, plan.review_evidence);
  if (!review || !TECHNICAL_APPROVAL.has(review.verdict.toLowerCase())) {
    addViolation(
      violations,
      plan.plan_id,
      "carry-review-binding-missing",
      "technical approval不在",
    );
  } else {
    if (
      review.semantic_digest !== decision.review_binding.evidence_digest ||
      !DIGEST.test(decision.review_binding.evidence_digest)
    ) {
      addViolation(
        violations,
        plan.plan_id,
        "carry-review-digest-mismatch",
        "semantic digest不一致",
      );
    }
    if (decision.assessed_at > review.reviewed_at) {
      addViolation(violations, plan.plan_id, "invalid-event-order", "assessed_at > reviewed_at");
    }
  }

  const carryIds = new Set<string>();
  const usedArtifacts = new Set<string>();
  const usedFindingEvidence = new Set<string>();
  for (const entry of decision.entries) {
    const carryId = entry.carry_id;
    if (carryIds.has(carryId))
      addViolation(violations, plan.plan_id, "duplicate-carry-id", carryId, carryId);
    carryIds.add(carryId);
    const expected = LEFT_ARM_PUSHBACK_MAP[entry.finding_kind as LeftArmFindingKind];
    if (!expected) {
      addViolation(violations, plan.plan_id, "invalid-finding-kind", entry.finding_kind, carryId);
    } else if (
      entry.pushback_target.layer !== expected.layer ||
      entry.pushback_target.gate !== expected.gate ||
      entry.gate_repass.gate !== expected.gate
    ) {
      addViolation(
        violations,
        plan.plan_id,
        "invalid-pushback-mapping",
        entry.finding_kind,
        carryId,
      );
    }
    if (entry.summary.trim().length < 10)
      addViolation(violations, plan.plan_id, "trivial-finding-summary", entry.summary, carryId);

    const findingDigest = input.fileDigests.get(entry.finding_evidence.path);
    if (!isCanonicalPath(entry.finding_evidence.path) || !findingDigest) {
      addViolation(
        violations,
        plan.plan_id,
        "finding-evidence-missing",
        entry.finding_evidence.path,
        carryId,
      );
    } else if (
      findingDigest !== entry.finding_evidence.digest ||
      !DIGEST.test(entry.finding_evidence.digest)
    ) {
      addViolation(
        violations,
        plan.plan_id,
        "finding-evidence-digest-mismatch",
        entry.finding_evidence.path,
        carryId,
      );
    }
    if (usedFindingEvidence.has(entry.finding_evidence.path))
      addViolation(
        violations,
        plan.plan_id,
        "duplicate-affected-artifact",
        "finding evidence再利用",
        carryId,
      );
    usedFindingEvidence.add(entry.finding_evidence.path);

    const localArtifacts = new Set<string>();
    for (const artifact of entry.affected_artifacts) {
      if (
        !isCanonicalPath(artifact) ||
        !artifact.startsWith(`docs/design/harness/${expected?.layer ?? "invalid"}`)
      )
        addViolation(violations, plan.plan_id, "invalid-affected-artifact", artifact, carryId);
      if (localArtifacts.has(artifact) || usedArtifacts.has(artifact))
        addViolation(violations, plan.plan_id, "duplicate-affected-artifact", artifact, carryId);
      localArtifacts.add(artifact);
      usedArtifacts.add(artifact);
    }
    if (entry.affected_artifacts.length === 0)
      addViolation(violations, plan.plan_id, "invalid-affected-artifact", "empty", carryId);

    const resolution = byId.get(entry.resolution_plan_id);
    if (!resolution) {
      addViolation(
        violations,
        plan.plan_id,
        "resolution-plan-missing",
        entry.resolution_plan_id,
        carryId,
      );
    } else {
      if (!expected || resolution.layer !== expected.layer || !DESIGN_KINDS.has(resolution.kind))
        addViolation(
          violations,
          plan.plan_id,
          "resolution-plan-layer-mismatch",
          entry.resolution_plan_id,
          carryId,
        );
      if (!TERMINAL.has(resolution.status))
        addViolation(
          violations,
          plan.plan_id,
          "resolution-plan-not-terminal",
          resolution.status,
          carryId,
        );
      if (
        !resolution.review_evidence.some((candidate) =>
          TECHNICAL_APPROVAL.has(candidate.verdict.toLowerCase()),
        )
      )
        addViolation(
          violations,
          plan.plan_id,
          "resolution-plan-review-missing",
          entry.resolution_plan_id,
          carryId,
        );
      for (const artifact of entry.affected_artifacts) {
        if (!resolution.generates.includes(artifact))
          addViolation(violations, plan.plan_id, "resolution-artifact-unbound", artifact, carryId);
      }
      if (!resolution.generates.some((artifact) => input.testDesignArtifacts.has(artifact)))
        addViolation(
          violations,
          plan.plan_id,
          "vpair-delta-missing",
          entry.resolution_plan_id,
          carryId,
        );
      const repassBound = resolution.review_evidence.some((candidate) =>
        candidate.green_commands?.some(
          (command) =>
            command.command === entry.gate_repass.command &&
            command.completed_at === entry.gate_repass.completed_at &&
            command.evidence_path === entry.gate_repass.evidence_path &&
            command.output_digest === entry.gate_repass.output_digest &&
            command.exit_code === entry.gate_repass.exit_code,
        ),
      );
      if (!repassBound)
        addViolation(
          violations,
          plan.plan_id,
          "gate-repass-not-bound-to-resolution-review",
          entry.resolution_plan_id,
          carryId,
        );
    }
    if (!plan.dependencies_requires.includes(entry.resolution_plan_id))
      addViolation(
        violations,
        plan.plan_id,
        "resolution-plan-not-required",
        entry.resolution_plan_id,
        carryId,
      );

    if (!entry.gate_repass.command || !entry.gate_repass.completed_at)
      addViolation(violations, plan.plan_id, "gate-repass-missing", carryId, carryId);
    if (expected && !gateCommandMatches(expected.gate, entry.gate_repass.command))
      addViolation(
        violations,
        plan.plan_id,
        "gate-repass-command-mismatch",
        entry.gate_repass.command,
        carryId,
      );
    if (entry.gate_repass.exit_code !== 0)
      addViolation(
        violations,
        plan.plan_id,
        "gate-repass-nonzero",
        String(entry.gate_repass.exit_code),
        carryId,
      );
    const gateDigest = input.fileDigests.get(entry.gate_repass.evidence_path);
    if (!isCanonicalPath(entry.gate_repass.evidence_path) || !gateDigest) {
      addViolation(
        violations,
        plan.plan_id,
        "gate-evidence-missing",
        entry.gate_repass.evidence_path,
        carryId,
      );
    } else if (
      gateDigest !== entry.gate_repass.output_digest ||
      !DIGEST.test(entry.gate_repass.output_digest)
    ) {
      addViolation(
        violations,
        plan.plan_id,
        "gate-evidence-digest-mismatch",
        entry.gate_repass.evidence_path,
        carryId,
      );
    }
    if (
      entry.detected_at >= entry.gate_repass.completed_at ||
      (review?.tests_green_at !== undefined &&
        entry.gate_repass.completed_at > review.tests_green_at) ||
      (review !== undefined && entry.gate_repass.completed_at > review.reviewed_at)
    ) {
      addViolation(violations, plan.plan_id, "invalid-event-order", carryId, carryId);
    }
    if (TERMINAL.has(plan.status) && entry.resolved !== true)
      addViolation(violations, plan.plan_id, "unresolved-carry-at-terminal", carryId, carryId);
  }
}

export function analyzeLeftArmCarryLog(input: LeftArmCarryLogInput): LeftArmCarryLogResult {
  const violations: LeftArmCarryViolation[] = [];
  const byId = new Map(input.plans.map((plan) => [plan.plan_id, plan]));
  for (const plan of input.plans) validateDecision(plan, input, byId, violations);
  const checked = input.plans.filter(
    (plan) => plan.kind === "impl" || plan.kind === "add-impl",
  ).length;
  return { ok: violations.length === 0, checked, violations };
}

export function leftArmCarryLogMessages(result: LeftArmCarryLogResult): string[] {
  if (result.ok)
    return [`left-arm-carry-log — OK (L7 PLAN checked=${result.checked}, unresolved carry 0)`];
  const sample = result.violations
    .slice(0, 5)
    .map((violation) => `${violation.plan_id}:${violation.carry_id ?? "plan"}:${violation.kind}`)
    .join(", ");
  return [
    `left-arm-carry-log — violation ${result.violations.length} 件 (${sample}): 左腕差し戻しを対象gate再通過まで解消せよ`,
  ];
}
