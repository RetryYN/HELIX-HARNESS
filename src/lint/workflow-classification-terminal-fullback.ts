import { createHash } from "node:crypto";

export const WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_SCHEMA =
  "helix-workflow-classification-terminal-fullback.v1" as const;

type Digest = `sha256:${string}`;

export interface WorkflowClassificationTerminalFullbackEvidence {
  issueNumber: number;
  authority: {
    requirements: {
      version: string;
      sourceDigest: Digest | string;
    };
    registry: {
      version: string;
      requirementsVersion: string;
      sourceDigest: Digest | string;
      requirementsSourceDigest: Digest | string;
    };
    catalog: {
      registryVersion: string;
      requirementsVersion: string;
      registrySourceDigest: Digest | string;
      requirementsSourceDigest: Digest | string;
    };
    consumers: Array<{
      name: string;
      registryVersion: string;
      registrySourceDigest: Digest | string;
      targetAxis: string;
      targetId: string;
      legacyIdentityEmitted: boolean;
    }>;
  };
  forwardSlices: Array<{
    sliceId: string;
    merged: boolean;
    headSha: string | null;
    ciRunId: number | null;
    ciHeadSha: string | null;
    ciConclusion: "success" | "failure" | "cancelled" | "pending" | null;
    reviewHeadSha: string | null;
    reviewCiRunId: number | null;
    reviewVerdict: "approve" | "block" | null;
    reviewReceiptDigest: Digest | string | null;
    dbProjectionDigest: Digest | string | null;
    dbReplayProjectionDigest: Digest | string | null;
    checkpointDigest: Digest | string | null;
    replayCheckpointDigest: Digest | string | null;
    dbConverged: boolean;
  }>;
  currentMain: {
    mainHeadSha: string | null;
    observedHeadSha: string | null;
    requirementsVersion: string | null;
    registryVersion: string | null;
    registrySourceDigest: Digest | string | null;
    legacyIdentityEmitted: {
      currentOutput: boolean;
      database: boolean;
      generatedDocs: boolean;
    };
    databaseConverged: boolean;
  };
  dependencyIssues: Array<{ number: number; state: "open" | "closed" }>;
}

export type WorkflowClassificationTerminalFullbackFailureCode =
  | "issue_identity_mismatch"
  | "forward_slice_missing"
  | "forward_not_merged"
  | "forward_head_missing"
  | "forward_ci_missing"
  | "forward_ci_mismatch"
  | "forward_review_missing"
  | "forward_review_mismatch"
  | "forward_db_not_converged"
  | "current_main_read_after_missing"
  | "current_main_head_mismatch"
  | "current_main_authority_mismatch"
  | "current_main_db_not_converged"
  | "typed_identity_requirements_mismatch"
  | "typed_identity_catalog_mismatch"
  | "typed_identity_consumer_mismatch"
  | "legacy_identity_reemitted"
  | "dependency_state_mismatch";

export interface WorkflowClassificationTerminalFullbackFinding {
  code: WorkflowClassificationTerminalFullbackFailureCode;
  subject: string;
  detail: string;
}

export interface WorkflowClassificationTerminalFullbackReport {
  schema_version: typeof WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_SCHEMA;
  ok: boolean;
  completionClaimAllowed: boolean;
  issueNumber: number;
  forwardSliceCount: number;
  findings: WorkflowClassificationTerminalFullbackFinding[];
  evidenceDigest: Digest;
}

const SHA_40 = /^[0-9a-f]{40}$/u;
const SHA256 = /^sha256:[0-9a-f]{64}$/u;
const EXPECTED_DEPENDENCY_ISSUES = [204, 635, 188] as const;

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stable(entry)]),
    );
  }
  return value;
}

function digest(value: unknown): Digest {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex")}`;
}

function isSha(value: string | null): value is string {
  return value !== null && SHA_40.test(value);
}

function isDigest(value: string | null): value is Digest {
  return value !== null && SHA256.test(value);
}

function isPositiveInteger(value: number | null): value is number {
  return value !== null && Number.isSafeInteger(value) && value > 0;
}

function add(
  findings: WorkflowClassificationTerminalFullbackFinding[],
  code: WorkflowClassificationTerminalFullbackFailureCode,
  subject: string,
  detail: string,
): void {
  findings.push({ code, subject, detail });
}

function auditForwardSlices(
  slices: WorkflowClassificationTerminalFullbackEvidence["forwardSlices"],
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  if (slices.length === 0) {
    add(
      findings,
      "forward_slice_missing",
      "Forward slices",
      "at least one Forward slice receipt is required",
    );
    return;
  }
  for (const slice of slices) {
    const subject = slice.sliceId;
    if (!slice.merged) {
      add(findings, "forward_not_merged", subject, "Forward slice PR is not merged");
    }
    if (!isSha(slice.headSha)) {
      add(findings, "forward_head_missing", subject, "merged PR HEAD is missing or malformed");
      continue;
    }
    if (!isPositiveInteger(slice.ciRunId)) {
      add(findings, "forward_ci_missing", subject, "required CI run is missing");
    } else if (slice.ciConclusion !== "success" || slice.ciHeadSha !== slice.headSha) {
      add(
        findings,
        "forward_ci_mismatch",
        subject,
        "required CI must be successful and bound to the merged PR HEAD",
      );
    }
    if (slice.reviewVerdict === null) {
      add(findings, "forward_review_missing", subject, "independent review receipt is missing");
    } else if (
      slice.reviewVerdict !== "approve" ||
      slice.reviewHeadSha !== slice.headSha ||
      slice.reviewCiRunId !== slice.ciRunId ||
      !isDigest(slice.reviewReceiptDigest)
    ) {
      add(
        findings,
        "forward_review_mismatch",
        subject,
        "independent review must approve the same HEAD and CI generation",
      );
    }
    if (
      !slice.dbConverged ||
      !isDigest(slice.dbProjectionDigest) ||
      slice.dbProjectionDigest !== slice.dbReplayProjectionDigest ||
      !isDigest(slice.checkpointDigest) ||
      slice.checkpointDigest !== slice.replayCheckpointDigest
    ) {
      add(
        findings,
        "forward_db_not_converged",
        subject,
        "DB projection and checkpoint replay must converge byte-for-byte",
      );
    }
  }
}

function auditAuthority(
  evidence: WorkflowClassificationTerminalFullbackEvidence,
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  const { requirements, registry, catalog, consumers } = evidence.authority;
  if (
    requirements.version !== registry.requirementsVersion ||
    requirements.sourceDigest !== registry.requirementsSourceDigest ||
    !isDigest(requirements.sourceDigest) ||
    !isDigest(registry.sourceDigest)
  ) {
    add(
      findings,
      "typed_identity_requirements_mismatch",
      "requirements->registry",
      "registry requirements version and source digest must match the requirements authority",
    );
  }
  if (
    catalog.registryVersion !== registry.version ||
    catalog.requirementsVersion !== registry.requirementsVersion ||
    catalog.registrySourceDigest !== registry.sourceDigest ||
    catalog.requirementsSourceDigest !== registry.requirementsSourceDigest ||
    !isDigest(catalog.registrySourceDigest) ||
    !isDigest(catalog.requirementsSourceDigest)
  ) {
    add(
      findings,
      "typed_identity_catalog_mismatch",
      "registry->catalog",
      "generated catalog identity must match the requirements-owned registry",
    );
  }
  for (const consumer of consumers) {
    if (
      consumer.registryVersion !== registry.version ||
      consumer.registrySourceDigest !== registry.sourceDigest ||
      !isDigest(consumer.registrySourceDigest) ||
      consumer.targetAxis.trim().length === 0 ||
      consumer.targetId.trim().length === 0
    ) {
      add(
        findings,
        "typed_identity_consumer_mismatch",
        consumer.name,
        "consumer must carry the current registry identity and typed target",
      );
    }
    if (consumer.legacyIdentityEmitted) {
      add(
        findings,
        "legacy_identity_reemitted",
        consumer.name,
        "consumer emitted a legacy mode/model/route identity",
      );
    }
  }
}

function auditCurrentMain(
  evidence: WorkflowClassificationTerminalFullbackEvidence,
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  const current = evidence.currentMain;
  if (!isSha(current.mainHeadSha) || !isSha(current.observedHeadSha)) {
    add(
      findings,
      "current_main_read_after_missing",
      "current-main",
      "current-main HEAD and read-after observation are required",
    );
  } else if (current.mainHeadSha !== current.observedHeadSha) {
    add(
      findings,
      "current_main_head_mismatch",
      "current-main",
      "read-after observation is bound to an old or different main HEAD",
    );
  }
  if (
    current.requirementsVersion !== evidence.authority.registry.requirementsVersion ||
    current.registryVersion !== evidence.authority.registry.version ||
    current.registrySourceDigest !== evidence.authority.registry.sourceDigest ||
    !isDigest(current.registrySourceDigest)
  ) {
    add(
      findings,
      "current_main_authority_mismatch",
      "current-main",
      "current-main authority identity differs from the requirements-owned registry",
    );
  }
  if (!current.databaseConverged) {
    add(
      findings,
      "current_main_db_not_converged",
      "current-main",
      "current-main DB projection/read-after has not converged",
    );
  }
  if (
    current.legacyIdentityEmitted.currentOutput ||
    current.legacyIdentityEmitted.database ||
    current.legacyIdentityEmitted.generatedDocs
  ) {
    add(
      findings,
      "legacy_identity_reemitted",
      "current-main",
      "legacy identity reappeared in current output, DB, or generated docs",
    );
  }
}

function auditDependencies(
  dependencies: WorkflowClassificationTerminalFullbackEvidence["dependencyIssues"],
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  const states = new Map(dependencies.map((dependency) => [dependency.number, dependency.state]));
  if (states.size !== dependencies.length) {
    add(
      findings,
      "dependency_state_mismatch",
      "dependency issues",
      "dependency issue state must be declared exactly once",
    );
  }
  for (const issueNumber of EXPECTED_DEPENDENCY_ISSUES) {
    if (states.get(issueNumber) !== "open") {
      add(
        findings,
        "dependency_state_mismatch",
        `#${issueNumber}`,
        `#${issueNumber} must remain open until #694 terminal evidence is accepted`,
      );
    }
  }
}

export function auditWorkflowClassificationTerminalFullback(
  evidence: WorkflowClassificationTerminalFullbackEvidence,
): WorkflowClassificationTerminalFullbackReport {
  const findings: WorkflowClassificationTerminalFullbackFinding[] = [];
  if (evidence.issueNumber !== 694) {
    add(
      findings,
      "issue_identity_mismatch",
      "issueNumber",
      "terminal fullback evidence is scoped to Issue #694",
    );
  }
  auditForwardSlices(evidence.forwardSlices, findings);
  auditAuthority(evidence, findings);
  auditCurrentMain(evidence, findings);
  auditDependencies(evidence.dependencyIssues, findings);
  return {
    schema_version: WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_SCHEMA,
    ok: findings.length === 0,
    completionClaimAllowed: findings.length === 0,
    issueNumber: evidence.issueNumber,
    forwardSliceCount: evidence.forwardSlices.length,
    findings,
    evidenceDigest: digest(evidence),
  };
}

/**
 * Doctor wiring health check. Live GitHub evidence is intentionally not read here;
 * the fullback audit accepts only an injected, normalized evidence snapshot. This
 * check proves that the oracle still rejects an empty snapshot before a future
 * read-only adapter supplies the live snapshot.
 */
export function checkWorkflowClassificationTerminalFullbackOracle(): {
  messages: string[];
  ok: boolean;
} {
  const report = auditWorkflowClassificationTerminalFullback({
    issueNumber: 694,
    authority: {
      requirements: { version: "", sourceDigest: "" },
      registry: {
        version: "",
        requirementsVersion: "",
        sourceDigest: "",
        requirementsSourceDigest: "",
      },
      catalog: {
        registryVersion: "",
        requirementsVersion: "",
        registrySourceDigest: "",
        requirementsSourceDigest: "",
      },
      consumers: [],
    },
    forwardSlices: [],
    currentMain: {
      mainHeadSha: null,
      observedHeadSha: null,
      requirementsVersion: null,
      registryVersion: null,
      registrySourceDigest: null,
      legacyIdentityEmitted: {
        currentOutput: false,
        database: false,
        generatedDocs: false,
      },
      databaseConverged: false,
    },
    dependencyIssues: [],
  });
  const expectedFailureCodes = [
    "forward_slice_missing",
    "current_main_read_after_missing",
    "dependency_state_mismatch",
  ] as const;
  const failClosed = expectedFailureCodes.every((code) =>
    report.findings.some((finding) => finding.code === code),
  );
  return failClosed
    ? {
        messages: [
          "workflow-classification-terminal-fullback - OK (oracle fail-close wired; live evidence pending)",
        ],
        ok: true,
      }
    : {
        messages: [
          "workflow-classification-terminal-fullback - violation: empty evidence did not fail-close",
        ],
        ok: false,
      };
}
