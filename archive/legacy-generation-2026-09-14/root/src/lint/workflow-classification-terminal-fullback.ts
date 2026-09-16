import { createHash } from "node:crypto";
import {
  WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_AUTHORITY_PATH,
  type WorkflowClassificationTerminalFullbackAuthority,
} from "../schema/workflow-classification-terminal-fullback-authority.js";

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
    terminalFullback: {
      sourcePath: string;
      authorityVersion: string;
      requirementsVersion: string;
      sourceDigest: Digest | string;
      forwardSliceIds: string[];
      consumerNames: string[];
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
    readAfter: {
      source: "main-read-after" | string;
      observedHeadSha: string | null;
      requirementsVersion: string | null;
      registryVersion: string | null;
      registrySourceDigest: Digest | string | null;
      database: {
        projectionDigest: Digest | string | null;
        replayProjectionDigest: Digest | string | null;
        checkpointDigest: Digest | string | null;
        replayCheckpointDigest: Digest | string | null;
      };
      doctor: {
        legacyIdentityEmitted: {
          currentOutput: boolean;
          database: boolean;
          generatedDocs: boolean;
        };
      };
      measurementDigest: Digest | string | null;
    };
  };
  dependencyIssues: Array<{ number: number; state: "open" | "closed" }>;
}

export type WorkflowClassificationTerminalFullbackFailureCode =
  | "issue_identity_mismatch"
  | "forward_slice_missing"
  | "forward_slice_set_mismatch"
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
  | "typed_identity_consumer_set_mismatch"
  | "legacy_identity_reemitted"
  | "current_main_measurement_missing"
  | "current_main_measurement_mismatch"
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

export type WorkflowClassificationTerminalFullbackAuthoritySnapshot =
  WorkflowClassificationTerminalFullbackEvidence["authority"]["terminalFullback"];

export function terminalFullbackAuthoritySnapshot(
  authority: WorkflowClassificationTerminalFullbackAuthority,
): WorkflowClassificationTerminalFullbackAuthoritySnapshot {
  return {
    sourcePath: WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_AUTHORITY_PATH,
    authorityVersion: authority.authority_version,
    requirementsVersion: authority.requirements_version,
    sourceDigest: authority.authority.source_digest,
    forwardSliceIds: authority.forward_slices.map((slice) => slice.plan_id),
    consumerNames: authority.consumers.map((consumer) => consumer.name),
  };
}

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
  finding: WorkflowClassificationTerminalFullbackFinding,
): void {
  findings.push(finding);
}

function auditForwardSlices(
  slices: WorkflowClassificationTerminalFullbackEvidence["forwardSlices"],
  authority: WorkflowClassificationTerminalFullbackAuthoritySnapshot,
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  if (slices.length === 0) {
    add(findings, {
      code: "forward_slice_missing",
      subject: "Forward slices",
      detail: "at least one Forward slice receipt is required",
    });
    return;
  }
  const actualIds = slices.map((slice) => slice.sliceId);
  const expectedIds = authority.forwardSliceIds;
  const actualSet = [...new Set(actualIds)].sort();
  const expectedSet = [...new Set(expectedIds)].sort();
  if (
    actualIds.length !== actualSet.length ||
    expectedIds.length !== expectedSet.length ||
    JSON.stringify(actualSet) !== JSON.stringify(expectedSet)
  ) {
    add(findings, {
      code: "forward_slice_set_mismatch",
      subject: "Forward slices",
      detail: `Forward slice set must exactly match requirements-owned authority (${expectedSet.join(",")})`,
    });
  }
  for (const slice of slices) {
    const subject = slice.sliceId;
    if (!slice.merged) {
      add(findings, {
        code: "forward_not_merged",
        subject,
        detail: "Forward slice PR is not merged",
      });
    }
    if (!isSha(slice.headSha)) {
      add(findings, {
        code: "forward_head_missing",
        subject,
        detail: "merged PR HEAD is missing or malformed",
      });
      continue;
    }
    if (!isPositiveInteger(slice.ciRunId)) {
      add(findings, {
        code: "forward_ci_missing",
        subject,
        detail: "required CI run is missing",
      });
    } else if (slice.ciConclusion !== "success" || slice.ciHeadSha !== slice.headSha) {
      add(findings, {
        code: "forward_ci_mismatch",
        subject,
        detail: "required CI must be successful and bound to the merged PR HEAD",
      });
    }
    if (slice.reviewVerdict === null) {
      add(findings, {
        code: "forward_review_missing",
        subject,
        detail: "independent review receipt is missing",
      });
    } else if (
      slice.reviewVerdict !== "approve" ||
      slice.reviewHeadSha !== slice.headSha ||
      slice.reviewCiRunId !== slice.ciRunId ||
      !isDigest(slice.reviewReceiptDigest)
    ) {
      add(findings, {
        code: "forward_review_mismatch",
        subject,
        detail: "independent review must approve the same HEAD and CI generation",
      });
    }
    if (
      !slice.dbConverged ||
      !isDigest(slice.dbProjectionDigest) ||
      slice.dbProjectionDigest !== slice.dbReplayProjectionDigest ||
      !isDigest(slice.checkpointDigest) ||
      slice.checkpointDigest !== slice.replayCheckpointDigest
    ) {
      add(findings, {
        code: "forward_db_not_converged",
        subject,
        detail: "DB projection and checkpoint replay must converge byte-for-byte",
      });
    }
  }
}

function auditAuthority(
  evidence: WorkflowClassificationTerminalFullbackEvidence,
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  const { requirements, registry, catalog, terminalFullback, consumers } = evidence.authority;
  if (
    terminalFullback.sourcePath !== WORKFLOW_CLASSIFICATION_TERMINAL_FULLBACK_AUTHORITY_PATH ||
    !isDigest(terminalFullback.sourceDigest) ||
    terminalFullback.requirementsVersion !== requirements.version ||
    terminalFullback.forwardSliceIds.length === 0 ||
    terminalFullback.consumerNames.length === 0
  ) {
    add(findings, {
      code: "typed_identity_consumer_set_mismatch",
      subject: "terminal fullback authority",
      detail:
        "terminal fullback must carry the requirements-owned authority path, digest, and non-empty exact sets",
    });
  }
  if (
    requirements.version !== registry.requirementsVersion ||
    requirements.sourceDigest !== registry.requirementsSourceDigest ||
    !isDigest(requirements.sourceDigest) ||
    !isDigest(registry.sourceDigest)
  ) {
    add(findings, {
      code: "typed_identity_requirements_mismatch",
      subject: "requirements->registry",
      detail:
        "registry requirements version and source digest must match the requirements authority",
    });
  }
  if (
    catalog.registryVersion !== registry.version ||
    catalog.requirementsVersion !== registry.requirementsVersion ||
    catalog.registrySourceDigest !== registry.sourceDigest ||
    catalog.requirementsSourceDigest !== registry.requirementsSourceDigest ||
    !isDigest(catalog.registrySourceDigest) ||
    !isDigest(catalog.requirementsSourceDigest)
  ) {
    add(findings, {
      code: "typed_identity_catalog_mismatch",
      subject: "registry->catalog",
      detail: "generated catalog identity must match the requirements-owned registry",
    });
  }
  const actualConsumerNames = consumers.map((consumer) => consumer.name);
  const expectedConsumerNames = terminalFullback.consumerNames;
  if (
    actualConsumerNames.length !== new Set(actualConsumerNames).size ||
    expectedConsumerNames.length !== new Set(expectedConsumerNames).size ||
    JSON.stringify([...new Set(actualConsumerNames)].sort()) !==
      JSON.stringify([...new Set(expectedConsumerNames)].sort())
  ) {
    add(findings, {
      code: "typed_identity_consumer_set_mismatch",
      subject: "routing consumers",
      detail: `consumer set must exactly match requirements-owned authority (${[...new Set(expectedConsumerNames)].sort().join(",")})`,
    });
  }
  for (const consumer of consumers) {
    if (
      consumer.registryVersion !== registry.version ||
      consumer.registrySourceDigest !== registry.sourceDigest ||
      !isDigest(consumer.registrySourceDigest) ||
      consumer.targetAxis.trim().length === 0 ||
      consumer.targetId.trim().length === 0
    ) {
      add(findings, {
        code: "typed_identity_consumer_mismatch",
        subject: consumer.name,
        detail: "consumer must carry the current registry identity and typed target",
      });
    }
    if (consumer.legacyIdentityEmitted) {
      add(findings, {
        code: "legacy_identity_reemitted",
        subject: consumer.name,
        detail: "consumer emitted a legacy mode/model/route identity",
      });
    }
  }
}

function auditCurrentMain(
  evidence: WorkflowClassificationTerminalFullbackEvidence,
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  const current = evidence.currentMain;
  const readAfter = current.readAfter;
  if (
    readAfter.source !== "main-read-after" ||
    !isDigest(readAfter.measurementDigest) ||
    !isSha(current.mainHeadSha) ||
    !isSha(readAfter.observedHeadSha)
  ) {
    add(findings, {
      code: "current_main_read_after_missing",
      subject: "current-main",
      detail: "current-main HEAD and measured read-after observation are required",
    });
    add(findings, {
      code: "current_main_measurement_missing",
      subject: "current-main",
      detail:
        "current-main must carry a measured read-after source, digest, HEAD, and observed HEAD",
    });
    return;
  }
  const measurement = { ...readAfter, measurementDigest: null };
  if (digest(measurement) !== readAfter.measurementDigest) {
    add(findings, {
      code: "current_main_measurement_mismatch",
      subject: "current-main",
      detail: "current-main measurement digest does not match its measured DB/doctor payload",
    });
  }
  if (current.mainHeadSha !== readAfter.observedHeadSha) {
    add(findings, {
      code: "current_main_head_mismatch",
      subject: "current-main",
      detail: "read-after observation is bound to an old or different main HEAD",
    });
  }
  if (
    readAfter.requirementsVersion !== evidence.authority.registry.requirementsVersion ||
    readAfter.registryVersion !== evidence.authority.registry.version ||
    readAfter.registrySourceDigest !== evidence.authority.registry.sourceDigest ||
    !isDigest(readAfter.registrySourceDigest)
  ) {
    add(findings, {
      code: "current_main_authority_mismatch",
      subject: "current-main",
      detail: "current-main authority identity differs from the requirements-owned registry",
    });
  }
  const database = readAfter.database;
  if (
    !isDigest(database.projectionDigest) ||
    database.projectionDigest !== database.replayProjectionDigest ||
    !isDigest(database.checkpointDigest) ||
    database.checkpointDigest !== database.replayCheckpointDigest
  ) {
    add(findings, {
      code: "current_main_db_not_converged",
      subject: "current-main",
      detail: "current-main DB projection/read-after has not converged",
    });
  }
  const legacyIdentityEmitted = readAfter.doctor.legacyIdentityEmitted;
  if (
    legacyIdentityEmitted.currentOutput ||
    legacyIdentityEmitted.database ||
    legacyIdentityEmitted.generatedDocs
  ) {
    add(findings, {
      code: "legacy_identity_reemitted",
      subject: "current-main",
      detail: "legacy identity reappeared in current output, DB, or generated docs",
    });
  }
}

function auditDependencies(
  dependencies: WorkflowClassificationTerminalFullbackEvidence["dependencyIssues"],
  findings: WorkflowClassificationTerminalFullbackFinding[],
): void {
  const states = new Map(dependencies.map((dependency) => [dependency.number, dependency.state]));
  if (states.size !== dependencies.length) {
    add(findings, {
      code: "dependency_state_mismatch",
      subject: "dependency issues",
      detail: "dependency issue state must be declared exactly once",
    });
  }
  for (const issueNumber of EXPECTED_DEPENDENCY_ISSUES) {
    if (states.get(issueNumber) !== "open") {
      add(findings, {
        code: "dependency_state_mismatch",
        subject: `#${issueNumber}`,
        detail: `#${issueNumber} must remain open until #694 terminal evidence is accepted`,
      });
    }
  }
}

export function auditWorkflowClassificationTerminalFullback(
  evidence: WorkflowClassificationTerminalFullbackEvidence,
): WorkflowClassificationTerminalFullbackReport {
  const findings: WorkflowClassificationTerminalFullbackFinding[] = [];
  if (evidence.issueNumber !== 694) {
    add(findings, {
      code: "issue_identity_mismatch",
      subject: "issueNumber",
      detail: "terminal fullback evidence is scoped to Issue #694",
    });
  }
  auditForwardSlices(evidence.forwardSlices, evidence.authority.terminalFullback, findings);
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
      terminalFullback: {
        sourcePath: "",
        authorityVersion: "",
        requirementsVersion: "",
        sourceDigest: "",
        forwardSliceIds: [],
        consumerNames: [],
      },
      consumers: [],
    },
    forwardSlices: [],
    currentMain: {
      mainHeadSha: null,
      readAfter: {
        source: "",
        observedHeadSha: null,
        requirementsVersion: null,
        registryVersion: null,
        registrySourceDigest: null,
        database: {
          projectionDigest: null,
          replayProjectionDigest: null,
          checkpointDigest: null,
          replayCheckpointDigest: null,
        },
        doctor: {
          legacyIdentityEmitted: {
            currentOutput: false,
            database: false,
            generatedDocs: false,
          },
        },
        measurementDigest: null,
      },
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
