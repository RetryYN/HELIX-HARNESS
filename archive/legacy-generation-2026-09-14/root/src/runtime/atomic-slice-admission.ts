import { isAtomicContractId } from "../schema/atomic-contract-id";
import { sha256Digest } from "./digest";

export type AdmissionDisposition = "admitted" | "split_required" | "recovery_required";
export type ModelingDecision =
  | "aggregate"
  | "domain_service"
  | "value_object"
  | "pure_function"
  | "none";
export type NoCodeDecision = "no_change" | "delete" | "configure" | "reuse" | "modify" | "add_code";
export type CurrentBlockerConcern = "security" | "data_loss" | "correctness" | "authority_drift";
export type FailureCode =
  | "invalid_intent"
  | "no_code_order_violation"
  | "current_blocker_deferred"
  | "binding_mismatch"
  | "unknown_responsibility"
  | "multiple_behaviors"
  | "multiple_responsibilities"
  | "companion_mismatch"
  | "path_set_mismatch"
  | "scope_expansion_unauthorized"
  | "stale_snapshot";

export interface AtomicSliceSnapshot {
  issueId: number;
  baseHead: string;
  candidateHead: string;
  manifestDigest: `sha256:${string}`;
  behaviorContractIds: readonly string[];
  responsibilityOwners: readonly string[];
  modelOwnerIds: readonly string[];
  expectedPaths: readonly string[];
  actualPaths: readonly string[];
  requiredCompanionPaths: readonly string[];
  actualCompanionPaths: readonly string[];
  modelingDecision: ModelingDecision;
  noCodeDecision: {
    selected: NoCodeDecision;
    evaluatedInOrder: readonly NoCodeDecision[];
    rejectedOptionEvidenceDigests: readonly `sha256:${string}`[];
  };
  blockerClassifications: readonly {
    concern: CurrentBlockerConcern;
    disposition: "current_blocker" | "successor_improvement";
  }[];
}

export interface ScopeExpansionReceipt {
  originalManifestDigest: `sha256:${string}`;
  candidateHead: string;
  reviewerRuntime: string;
  authorRuntime: string;
  reasonCode: string;
  addedPaths: readonly string[];
  receiptDigest: `sha256:${string}`;
}

export interface AtomicSliceDecision {
  disposition: AdmissionDisposition;
  candidateHead: string;
  behaviorContractId: string | null;
  responsibilityOwner: string | null;
  acceptedPaths: readonly string[];
  rejectedPaths: readonly string[];
  failureCodes: readonly FailureCode[];
  decisionDigest: `sha256:${string}`;
}

export type CanonicalizeAtomicSliceResult =
  | { ok: true; value: AtomicSliceSnapshot }
  | { ok: false; failureCodes: readonly FailureCode[] };

export interface DesignCandidateMetrics {
  id: string;
  oraclePassRate: number;
  candidateAdmissionP95Ms: number;
  newComponentCount: number;
  newStateCount: number;
  newPersistenceSurfaceCount: number;
  productionLocDelta: number;
}

export type DesignCandidateSelection =
  | { ok: true; selectedId: string; rankedIds: readonly string[] }
  | {
      ok: false;
      failureCode: "design_candidate_unqualified" | "design_candidate_ambiguous";
      rejectedIds: readonly string[];
    };

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const HEAD = /^[0-9a-f]{40}$/;
const OWNER = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const PATH =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)(?!.*\0)[\p{L}\p{N}_.@+ -]+(?:\/[\p{L}\p{N}_.@+ -]+)*$/u;
const NO_CODE_ORDER: readonly NoCodeDecision[] = [
  "no_change",
  "delete",
  "configure",
  "reuse",
  "modify",
  "add_code",
];
const FAILURE_ORDER: readonly FailureCode[] = [
  "invalid_intent",
  "stale_snapshot",
  "no_code_order_violation",
  "current_blocker_deferred",
  "binding_mismatch",
  "unknown_responsibility",
  "scope_expansion_unauthorized",
  "multiple_behaviors",
  "multiple_responsibilities",
  "companion_mismatch",
  "path_set_mismatch",
];

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => compare(left, right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: unknown): `sha256:${string}` {
  return sha256Digest(canonical(value));
}

function compare(left: string, right: string): number {
  return Buffer.from(left, "utf8").compare(Buffer.from(right, "utf8"));
}

function sortedUnique(values: readonly string[]): string[] | null {
  const normalized = values.map((value) => value.trim());
  if (normalized.some((value) => !value) || new Set(normalized).size !== normalized.length) {
    return null;
  }
  return normalized.sort(compare);
}

function canonicalPaths(values: readonly string[]): string[] | null {
  const normalized = sortedUnique(values);
  if (
    !normalized ||
    normalized.some(
      (path) => !PATH.test(path) || path.split("/").some((segment) => segment === "."),
    )
  ) {
    return null;
  }
  return normalized;
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function difference(left: readonly string[], right: readonly string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

function orderedFailures(failures: Iterable<FailureCode>): FailureCode[] {
  const found = new Set(failures);
  return FAILURE_ORDER.filter((code) => found.has(code));
}

function validNoCodeDecision(snapshot: AtomicSliceSnapshot): boolean {
  const selectedIndex = NO_CODE_ORDER.indexOf(snapshot.noCodeDecision.selected);
  if (selectedIndex < 0) return false;
  const expectedOrder = NO_CODE_ORDER.slice(0, selectedIndex + 1);
  if (!sameSet(snapshot.noCodeDecision.evaluatedInOrder, expectedOrder)) return false;
  const evidence = snapshot.noCodeDecision.rejectedOptionEvidenceDigests;
  return (
    evidence.length === selectedIndex &&
    new Set(evidence).size === evidence.length &&
    evidence.every((entry) => DIGEST.test(entry))
  );
}

export function canonicalizeAtomicSliceSnapshot(
  input: AtomicSliceSnapshot,
): CanonicalizeAtomicSliceResult {
  const behaviorContractIds = sortedUnique(input.behaviorContractIds);
  const responsibilityOwners = sortedUnique(input.responsibilityOwners);
  const modelOwnerIds = sortedUnique(input.modelOwnerIds);
  const expectedPaths = canonicalPaths(input.expectedPaths);
  const actualPaths = canonicalPaths(input.actualPaths);
  const requiredCompanionPaths = canonicalPaths(input.requiredCompanionPaths);
  const actualCompanionPaths = canonicalPaths(input.actualCompanionPaths);
  const evaluatedInOrder = sortedUnique(input.noCodeDecision.evaluatedInOrder);
  const evidence = sortedUnique(input.noCodeDecision.rejectedOptionEvidenceDigests);
  const blockerKeys = input.blockerClassifications.map(
    (entry) => `${entry.concern}:${entry.disposition}`,
  );
  if (
    !Number.isSafeInteger(input.issueId) ||
    input.issueId <= 0 ||
    !HEAD.test(input.baseHead) ||
    !HEAD.test(input.candidateHead) ||
    !DIGEST.test(input.manifestDigest) ||
    !behaviorContractIds ||
    !responsibilityOwners ||
    !modelOwnerIds ||
    !expectedPaths ||
    !actualPaths ||
    !requiredCompanionPaths ||
    !actualCompanionPaths ||
    !evaluatedInOrder ||
    !evidence ||
    new Set(blockerKeys).size !== blockerKeys.length
  ) {
    return { ok: false, failureCodes: ["invalid_intent"] };
  }
  return {
    ok: true,
    value: {
      ...input,
      behaviorContractIds,
      responsibilityOwners,
      modelOwnerIds,
      expectedPaths,
      actualPaths,
      requiredCompanionPaths,
      actualCompanionPaths,
      noCodeDecision: {
        ...input.noCodeDecision,
        // semantic order is validated separately; canonicalization must not hide a skipped option.
        evaluatedInOrder: [...input.noCodeDecision.evaluatedInOrder],
        rejectedOptionEvidenceDigests: [...input.noCodeDecision.rejectedOptionEvidenceDigests],
      },
      blockerClassifications: [...input.blockerClassifications].sort((left, right) =>
        compare(`${left.concern}:${left.disposition}`, `${right.concern}:${right.disposition}`),
      ),
    },
  };
}

function validateScopeExpansion(
  snapshot: AtomicSliceSnapshot,
  receipt: ScopeExpansionReceipt | null,
  addedPaths: readonly string[],
): FailureCode[] {
  if (addedPaths.length === 0) return [];
  if (!receipt) return ["scope_expansion_unauthorized"];
  const receiptPaths = canonicalPaths(receipt.addedPaths);
  const stale =
    receipt.candidateHead !== snapshot.candidateHead ||
    receipt.originalManifestDigest !== snapshot.manifestDigest;
  const invalid =
    stale ||
    !HEAD.test(receipt.candidateHead) ||
    !DIGEST.test(receipt.originalManifestDigest) ||
    !DIGEST.test(receipt.receiptDigest) ||
    !receiptPaths ||
    receipt.authorRuntime.trim().length === 0 ||
    receipt.reviewerRuntime.trim().length === 0 ||
    receipt.authorRuntime.trim() === receipt.reviewerRuntime.trim() ||
    receipt.reasonCode.trim().length < 12 ||
    !sameSet(receiptPaths, addedPaths);
  return orderedFailures([
    ...(stale ? (["stale_snapshot"] as const) : []),
    ...(invalid ? (["scope_expansion_unauthorized"] as const) : []),
  ]);
}

export function evaluateAtomicSlice(
  input: AtomicSliceSnapshot,
  receipt: ScopeExpansionReceipt | null,
): AtomicSliceDecision {
  const canonicalized = canonicalizeAtomicSliceSnapshot(input);
  if (!canonicalized.ok) {
    const body = {
      disposition: "recovery_required" as const,
      candidateHead: HEAD.test(input.candidateHead) ? input.candidateHead : "",
      behaviorContractId: null,
      responsibilityOwner: null,
      acceptedPaths: [] as string[],
      rejectedPaths: [] as string[],
      failureCodes: [...canonicalized.failureCodes],
    };
    return { ...body, decisionDigest: digest({ schemaVersion: "helix-atomic-slice.v1", ...body }) };
  }
  const snapshot = canonicalized.value;
  const failures = new Set<FailureCode>();
  if (!validNoCodeDecision(snapshot)) failures.add("no_code_order_violation");
  if (snapshot.blockerClassifications.some((entry) => entry.disposition !== "current_blocker")) {
    failures.add("current_blocker_deferred");
  }
  if (snapshot.behaviorContractIds.length === 0) failures.add("binding_mismatch");
  if (snapshot.behaviorContractIds.length > 1) failures.add("multiple_behaviors");
  if (snapshot.responsibilityOwners.length === 0 || snapshot.modelOwnerIds.length === 0) {
    failures.add("unknown_responsibility");
  }
  if (snapshot.responsibilityOwners.length > 1 || snapshot.modelOwnerIds.length > 1) {
    failures.add("multiple_responsibilities");
  }
  if (
    snapshot.responsibilityOwners.some((owner) => !OWNER.test(owner)) ||
    snapshot.modelOwnerIds.some((owner) => !OWNER.test(owner))
  ) {
    failures.add("unknown_responsibility");
  }
  if (snapshot.behaviorContractIds.some((contract) => !isAtomicContractId(contract))) {
    failures.add("binding_mismatch");
  }
  if (!sameSet(snapshot.requiredCompanionPaths, snapshot.actualCompanionPaths)) {
    failures.add("companion_mismatch");
  }
  const missingPaths = difference(snapshot.expectedPaths, snapshot.actualPaths);
  const addedPaths = difference(snapshot.actualPaths, snapshot.expectedPaths);
  if (missingPaths.length > 0) failures.add("path_set_mismatch");
  for (const code of validateScopeExpansion(snapshot, receipt, addedPaths)) failures.add(code);

  const failureCodes = orderedFailures(failures);
  const recoveryFailures = new Set<FailureCode>([
    "invalid_intent",
    "stale_snapshot",
    "no_code_order_violation",
    "current_blocker_deferred",
    "binding_mismatch",
    "unknown_responsibility",
    "scope_expansion_unauthorized",
    "companion_mismatch",
    "path_set_mismatch",
  ]);
  const disposition: AdmissionDisposition = failureCodes.some((code) => recoveryFailures.has(code))
    ? "recovery_required"
    : failureCodes.some(
          (code) => code === "multiple_behaviors" || code === "multiple_responsibilities",
        )
      ? "split_required"
      : "admitted";
  const rejectedPaths =
    disposition === "admitted" ? [] : difference(snapshot.actualPaths, snapshot.expectedPaths);
  const body = {
    disposition,
    candidateHead: snapshot.candidateHead,
    behaviorContractId:
      snapshot.behaviorContractIds.length === 1 ? (snapshot.behaviorContractIds[0] ?? null) : null,
    responsibilityOwner:
      snapshot.responsibilityOwners.length === 1
        ? (snapshot.responsibilityOwners[0] ?? null)
        : null,
    acceptedPaths: disposition === "admitted" ? snapshot.actualPaths : snapshot.expectedPaths,
    rejectedPaths,
    failureCodes,
  };
  return { ...body, decisionDigest: digest({ schemaVersion: "helix-atomic-slice.v1", ...body }) };
}

export function selectAtomicSliceDesignCandidate(
  candidates: readonly DesignCandidateMetrics[],
): DesignCandidateSelection {
  const ids = candidates.map((candidate) => candidate.id.trim());
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    return { ok: false, failureCode: "design_candidate_ambiguous", rejectedIds: ids.sort(compare) };
  }
  const qualified = candidates.filter((candidate) => {
    const metrics = [
      candidate.candidateAdmissionP95Ms,
      candidate.newComponentCount,
      candidate.newStateCount,
      candidate.newPersistenceSurfaceCount,
      candidate.productionLocDelta,
    ];
    return (
      candidate.oraclePassRate === 1 &&
      metrics.every((metric) => Number.isFinite(metric) && metric >= 0)
    );
  });
  if (qualified.length === 0) {
    return {
      ok: false,
      failureCode: "design_candidate_unqualified",
      rejectedIds: ids.sort(compare),
    };
  }
  const bestP95 = Math.min(
    ...qualified.map(({ candidateAdmissionP95Ms }) => candidateAdmissionP95Ms),
  );
  const nonRegressing = qualified.filter(
    ({ candidateAdmissionP95Ms }) => candidateAdmissionP95Ms === bestP95,
  );
  const ranked = [...nonRegressing].sort((left, right) => {
    const leftTuple = [
      left.newComponentCount,
      left.newStateCount,
      left.newPersistenceSurfaceCount,
      left.productionLocDelta,
      left.candidateAdmissionP95Ms,
    ];
    const rightTuple = [
      right.newComponentCount,
      right.newStateCount,
      right.newPersistenceSurfaceCount,
      right.productionLocDelta,
      right.candidateAdmissionP95Ms,
    ];
    for (let index = 0; index < leftTuple.length; index += 1) {
      const delta = (leftTuple[index] ?? 0) - (rightTuple[index] ?? 0);
      if (delta !== 0) return delta;
    }
    return compare(left.id, right.id);
  });
  return { ok: true, selectedId: ranked[0]?.id ?? "", rankedIds: ranked.map(({ id }) => id) };
}
