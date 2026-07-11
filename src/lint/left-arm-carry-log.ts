/**
 * PLAN-L7-430: L7 の三点レビューで見つかった左腕矛盾を、差し戻し先の
 * add-design PLAN・V-pair delta・gate 再通過 evidence まで結合する純粋 detector。
 * global gate ledger の現在値は再通過証拠として扱わない。
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import { leftArmCarrySchema } from "../schema/frontmatter";

export const LEFT_ARM_CARRY_SCHEMA = "left-arm-carry.v1";
export const LEFT_ARM_CARRY_ENFORCEMENT_DATE = "2026-07-12";
/** enforcement導入時のterminal L7 impl/add-impl集合を固定するsorted ID fingerprint。 */
export const LEFT_ARM_CARRY_LEGACY_FINGERPRINT =
  "sha256:d7b91a6a0cc3390b58fc8dbeb3def0559c6d1e750d7e363c15ceb3d62fe9c2b8";

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
  /** loaderがraw entryを捨てずcardinalityを保持したままparse失敗を伝える。 */
  schema_invalid?: boolean;
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
  /** production loaderのstrict schema parse失敗。raw cardinalityはentriesで別途保持する。 */
  schema_invalid?: boolean;
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
  /** production loaderだけtrue。凍結legacy集合の欠落もfail-closeする。 */
  legacyBaselineRequired?: boolean;
}

type UnknownRecord = Record<string, unknown>;

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

function isEnforced(plan: LeftArmCarryPlan, input: LeftArmCarryLogInput): boolean {
  if (!new Set(["impl", "add-impl"]).has(plan.kind) || plan.layer !== "L7") return false;
  if (!TERMINAL.has(plan.status)) return false;
  return !(plan.legacy_pinned && input.legacyBaselineRequired === true);
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
  return new RegExp(`^(?:helix gate ${escaped}|bun (?:run )?src/cli\\.ts gate ${escaped})$`).test(
    command.trim().replace(/\s+/g, " "),
  );
}

function addViolation(
  ...[violations, planId, kind, detail, carryId]: [
    LeftArmCarryViolation[],
    string,
    LeftArmCarryViolationKind,
    string,
    string?,
  ]
): void {
  violations.push({ kind, plan_id: planId, ...(carryId ? { carry_id: carryId } : {}), detail });
}

interface CarryValidationContext {
  plan: LeftArmCarryPlan;
  input: LeftArmCarryLogInput;
  byId: ReadonlyMap<string, LeftArmCarryPlan>;
  violations: LeftArmCarryViolation[];
  globalCarryIds: Set<string>;
  globalArtifacts: Set<string>;
  globalFindingEvidence: Set<string>;
}

function validateDecision(context: CarryValidationContext): void {
  const { plan, input, byId, violations, globalCarryIds, globalArtifacts, globalFindingEvidence } =
    context;
  const decision = plan.left_arm_carry;
  if (!decision) {
    if (isEnforced(plan, input))
      addViolation(violations, plan.plan_id, "missing-carry-decision", "terminal L7 PLAN");
    return;
  }
  if (decision.schema_version !== LEFT_ARM_CARRY_SCHEMA) {
    addViolation(violations, plan.plan_id, "invalid-carry-schema", decision.schema_version);
  }
  if (decision.schema_invalid)
    addViolation(violations, plan.plan_id, "invalid-carry-schema", "strict schema parse failed");
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

  for (const entry of decision.entries) {
    const carryId = entry.carry_id;
    if (entry.schema_invalid)
      addViolation(violations, plan.plan_id, "invalid-carry-schema", carryId, carryId);
    if (globalCarryIds.has(carryId))
      addViolation(violations, plan.plan_id, "duplicate-carry-id", carryId, carryId);
    globalCarryIds.add(carryId);
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
    if (globalFindingEvidence.has(entry.finding_evidence.path))
      addViolation(
        violations,
        plan.plan_id,
        "duplicate-affected-artifact",
        "finding evidence再利用",
        carryId,
      );
    globalFindingEvidence.add(entry.finding_evidence.path);

    const localArtifacts = new Set<string>();
    for (const artifact of entry.affected_artifacts) {
      if (
        !isCanonicalPath(artifact) ||
        !artifact.startsWith(`docs/design/harness/${expected?.layer ?? "invalid"}`)
      )
        addViolation(violations, plan.plan_id, "invalid-affected-artifact", artifact, carryId);
      if (localArtifacts.has(artifact) || globalArtifacts.has(artifact))
        addViolation(violations, plan.plan_id, "duplicate-affected-artifact", artifact, carryId);
      localArtifacts.add(artifact);
      globalArtifacts.add(artifact);
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
      const repassReview = resolution.review_evidence.find(
        (candidate) =>
          TECHNICAL_APPROVAL.has(candidate.verdict.toLowerCase()) &&
          candidate.green_commands?.some(
            (command) =>
              command.command === entry.gate_repass.command &&
              command.completed_at === entry.gate_repass.completed_at &&
              command.evidence_path === entry.gate_repass.evidence_path &&
              command.output_digest === entry.gate_repass.output_digest &&
              command.exit_code === entry.gate_repass.exit_code,
          ),
      );
      if (!repassReview) {
        addViolation(
          violations,
          plan.plan_id,
          "gate-repass-not-bound-to-resolution-review",
          entry.resolution_plan_id,
          carryId,
        );
      } else if (
        !repassReview.tests_green_at ||
        entry.gate_repass.completed_at > repassReview.tests_green_at ||
        repassReview.tests_green_at > repassReview.reviewed_at
      ) {
        addViolation(
          violations,
          plan.plan_id,
          "invalid-event-order",
          "resolution repass > tests_green > review",
          carryId,
        );
      }
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
  const byId = new Map<string, LeftArmCarryPlan>();
  const counts = new Map<string, number>();
  for (const plan of input.plans) {
    counts.set(plan.plan_id, (counts.get(plan.plan_id) ?? 0) + 1);
    if (!byId.has(plan.plan_id)) byId.set(plan.plan_id, plan);
    if (plan.legacy_pinned && input.legacyBaselineRequired !== true)
      addViolation(violations, plan.plan_id, "legacy-baseline-drift", "legacy pin spoof");
  }
  for (const [planId, count] of counts) {
    if (count !== 1)
      addViolation(violations, planId, "legacy-baseline-drift", `duplicate plan_id count=${count}`);
  }
  if (input.legacyBaselineRequired) {
    const pinned = input.plans
      .filter((plan) => plan.legacy_pinned)
      .map((plan) => plan.plan_id)
      .sort();
    const fingerprint = `sha256:${createHash("sha256").update(pinned.join("\n"), "utf8").digest("hex")}`;
    if (fingerprint !== LEFT_ARM_CARRY_LEGACY_FINGERPRINT)
      addViolation(
        violations,
        "legacy-baseline",
        "legacy-baseline-drift",
        `actual=${fingerprint}, count=${pinned.length}`,
      );
  }
  const globalCarryIds = new Set<string>();
  const globalArtifacts = new Set<string>();
  const globalFindingEvidence = new Set<string>();
  for (const plan of input.plans)
    validateDecision({
      plan,
      input,
      byId,
      violations,
      globalCarryIds,
      globalArtifacts,
      globalFindingEvidence,
    });
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

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  const record = asRecord(value);
  if (!record) return value;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, canonicalize(record[key])]),
  );
}

/** review_binding作成側とloaderが共有するreview entry semantic digest。 */
export function computeCarryReviewSemanticDigest(review: unknown): string {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonicalize(review)), "utf8")
    .digest("hex")}`;
}

function sha256File(path: string): string {
  return `sha256:${createHash("sha256").update(readFileSync(path)).digest("hex")}`;
}

function normalizeGreenCommands(value: unknown): CarryReviewEntry["green_commands"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const command = asRecord(raw);
    if (!command) return [];
    return [
      {
        command: textValue(command.command),
        ...(typeof command.completed_at === "string" ? { completed_at: command.completed_at } : {}),
        exit_code: typeof command.exit_code === "number" ? command.exit_code : -1,
        evidence_path: textValue(command.evidence_path),
        output_digest: textValue(command.output_digest),
      },
    ];
  });
}

function normalizeReviews(value: unknown): CarryReviewEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const review = asRecord(raw);
    if (!review) return [];
    return [
      {
        reviewer: textValue(review.reviewer),
        reviewed_at: textValue(review.reviewed_at),
        ...(typeof review.tests_green_at === "string"
          ? { tests_green_at: review.tests_green_at }
          : {}),
        verdict: textValue(review.verdict),
        semantic_digest: computeCarryReviewSemanticDigest(review),
        green_commands: normalizeGreenCommands(review.green_commands),
      },
    ];
  });
}

function normalizeCarryEntry(value: unknown): LeftArmCarryEntry | null {
  const entry = asRecord(value);
  const findingEvidence = asRecord(entry?.finding_evidence);
  const target = asRecord(entry?.pushback_target);
  const repass = asRecord(entry?.gate_repass);
  if (!entry || !findingEvidence || !target || !repass) return null;
  return {
    carry_id: textValue(entry.carry_id),
    finding_kind: textValue(entry.finding_kind),
    summary: textValue(entry.summary),
    detected_at: textValue(entry.detected_at),
    finding_evidence: {
      path: textValue(findingEvidence.path),
      digest: textValue(findingEvidence.digest),
    },
    pushback_target: { layer: textValue(target.layer), gate: textValue(target.gate) },
    affected_artifacts: stringList(entry.affected_artifacts),
    resolution_plan_id: textValue(entry.resolution_plan_id),
    gate_repass: {
      gate: textValue(target.gate),
      command: textValue(repass.command),
      completed_at: textValue(repass.completed_at),
      exit_code: typeof repass.exit_code === "number" ? repass.exit_code : -1,
      evidence_path: textValue(repass.evidence_path),
      output_digest: textValue(repass.output_digest),
    },
    resolved:
      repass.exit_code === 0 &&
      typeof repass.completed_at === "string" &&
      repass.completed_at.length > 0,
  };
}

function malformedCarryEntry(): LeftArmCarryEntry {
  return {
    carry_id: "",
    finding_kind: "",
    summary: "",
    detected_at: "",
    finding_evidence: { path: "", digest: "" },
    pushback_target: { layer: "", gate: "" },
    affected_artifacts: [],
    resolution_plan_id: "",
    gate_repass: {
      gate: "",
      command: "",
      completed_at: "",
      exit_code: -1,
      evidence_path: "",
      output_digest: "",
    },
    resolved: false,
    schema_invalid: true,
  };
}

function normalizeCarry(value: unknown): LeftArmCarryDecision | undefined {
  const carry = asRecord(value);
  const binding = asRecord(carry?.review_binding);
  if (!carry || !binding) return undefined;
  const schemaInvalid = !leftArmCarrySchema.safeParse(value).success;
  const rawEntries = Array.isArray(carry.entries) ? carry.entries : [];
  return {
    schema_version: textValue(carry.schema_version),
    decision: textValue(carry.decision),
    assessed_at: textValue(carry.assessed_at),
    review_binding: {
      reviewer: textValue(binding.reviewer),
      reviewed_at: textValue(binding.reviewed_at),
      evidence_digest: textValue(binding.evidence_digest),
    },
    entries: rawEntries.map((entry) => normalizeCarryEntry(entry) ?? malformedCarryEntry()),
    ...(schemaInvalid ? { schema_invalid: true } : {}),
  };
}

function normalizePlanRef(value: string): string {
  const name = basename(value).replace(/\.md$/, "");
  return name.startsWith("PLAN-") ? name : value;
}

function normalizePlan(raw: UnknownRecord): LeftArmCarryPlan {
  const dependencies = asRecord(raw.dependencies);
  const generates = Array.isArray(raw.generates) ? raw.generates : [];
  const planId = textValue(raw.plan_id);
  return {
    plan_id: planId,
    kind: textValue(raw.kind),
    layer: textValue(raw.layer),
    status: textValue(raw.status),
    created: textValue(raw.created),
    ...(typeof raw.updated === "string" ? { updated: raw.updated } : {}),
    dependencies_requires: stringList(dependencies?.requires).map(normalizePlanRef),
    generates: generates.flatMap((item) => {
      const record = asRecord(item);
      return record && typeof record.artifact_path === "string" ? [record.artifact_path] : [];
    }),
    review_evidence: normalizeReviews(raw.review_evidence),
    ...(raw.left_arm_carry !== undefined
      ? { left_arm_carry: normalizeCarry(raw.left_arm_carry) }
      : {}),
  };
}

function frontmatter(text: string): UnknownRecord | null {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const parsed = parseYaml(match[1]);
  return asRecord(parsed);
}

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) files.push(...walkFiles(path));
    else files.push(path);
  }
  return files;
}

function malformedPlan(file: string): LeftArmCarryPlan {
  return {
    plan_id: `MALFORMED:${basename(file)}`,
    kind: "impl",
    layer: "L7",
    status: "completed",
    created: "9999-12-31",
    dependencies_requires: [],
    generates: [],
    review_evidence: [],
  };
}

/** docs/plansのproduction loader。parse/read不能をsynthetic enforced PLANへ変換してfail-closeする。 */
export function loadLeftArmCarryLogInput(repoRoot: string): LeftArmCarryLogInput {
  const plansRoot = join(repoRoot, "docs", "plans");
  const plans: LeftArmCarryPlan[] = [];
  for (const file of walkFiles(plansRoot).filter((path) => path.endsWith(".md"))) {
    try {
      const parsed = frontmatter(readFileSync(file, "utf8"));
      if (parsed) plans.push(normalizePlan(parsed));
      else if (/PLAN-L7-|PLAN-L6-|PLAN-L5-|PLAN-L4-/.test(basename(file)))
        plans.push(malformedPlan(file));
    } catch {
      plans.push(malformedPlan(file));
    }
  }
  for (const plan of plans) {
    if (
      new Set(["impl", "add-impl"]).has(plan.kind) &&
      plan.layer === "L7" &&
      TERMINAL.has(plan.status) &&
      plan.left_arm_carry === undefined
    ) {
      plan.legacy_pinned = true;
    }
  }

  const referenced = new Set<string>();
  for (const plan of plans) {
    for (const path of plan.generates) referenced.add(path);
    for (const entry of plan.left_arm_carry?.entries ?? []) {
      referenced.add(entry.finding_evidence.path);
      referenced.add(entry.gate_repass.evidence_path);
      for (const path of entry.affected_artifacts) referenced.add(path);
    }
  }
  const fileDigests = new Map<string, string>();
  for (const path of referenced) {
    if (!isCanonicalPath(path)) continue;
    const absolute = join(repoRoot, path);
    try {
      if (statSync(absolute).isFile()) fileDigests.set(path, sha256File(absolute));
    } catch {
      // analyzerがmissing evidenceとしてfail-closeする。
    }
  }
  const testDesignRoot = join(repoRoot, "docs", "test-design");
  const testDesignArtifacts = new Set(
    walkFiles(testDesignRoot).map((path) => relative(repoRoot, path).replaceAll("\\", "/")),
  );
  return { plans, fileDigests, testDesignArtifacts, legacyBaselineRequired: true };
}
