import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadApprovalMaterial } from "../src/requirements/requirement-authority-gate";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import { requirementIrSemanticDigest } from "../src/requirements/requirement-ir-shadow";
import {
  type RequirementRefinementRecord,
  refinementApprovalDecisionDigest,
  refinementApprovalSubjectDigest,
  refinementDownstreamIssueSnapshotDigest,
  refinementSourceSetDigest,
  validateRequirementRefinement,
} from "../src/requirements/requirement-refinement-authority";

const HEAD = "a".repeat(40);
const CURRENT_HEAD = "b".repeat(40);
const OWNER_IDS = new Set(["HR-FR-HIL-02", "HR-FR-HIL-05", "HR-FR-HIL-06", "HR-FR-HIL-08"]);
const REQUIREMENT_SOURCE = `#### MIC-R-01 PMによる割当

PMはREADY taskを割り当てる

## 次
`;
const ACCEPTANCE_SOURCE =
  "| `MIC-AC-001` | `MIC-R-01` | 独立taskを投入する | 独立taskだけをexactly once割り当てる | 重複割当を拒否する |\n";

function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function withDigest<T extends Record<string, unknown>>(value: T): T & { semantic_digest: string } {
  return { ...value, semantic_digest: requirementIrSemanticDigest(value) };
}

function fixture(status: RequirementRefinementRecord["lifecycle_status"] = "specified") {
  const repoRoot = mkdtempSync(join(tmpdir(), "helix-refinement-"));
  const requirementPath = "docs/design/helix/L3-requirements/mic.md";
  const acceptancePath = "docs/test-design/helix/mic.md";
  mkdirSync(join(repoRoot, "docs/design/helix/L3-requirements"), { recursive: true });
  mkdirSync(join(repoRoot, "docs/test-design/helix"), { recursive: true });
  writeFileSync(join(repoRoot, requirementPath), REQUIREMENT_SOURCE, "utf8");
  writeFileSync(join(repoRoot, acceptancePath), ACCEPTANCE_SOURCE, "utf8");
  const requirement = withDigest({
    requirement_id: "MIC-R-01",
    source_projection: "markdown_h4_v1" as const,
    statement: "PMによる割当\n\nPMはREADY taskを割り当てる",
    acceptance_ids: ["MIC-AC-001"],
  });
  const acceptance = withDigest({
    acceptance_id: "MIC-AC-001",
    source_projection: "markdown_table_v1" as const,
    requirement_ids: ["MIC-R-01"],
    polarity: "boundary" as const,
    statement:
      "入力／操作: 独立taskを投入する\n合格条件: 独立taskだけをexactly once割り当てる\nnegative mutation: 重複割当を拒否する",
  });
  const base = {
    schema_version: "helix-requirement-refinement.v1" as const,
    refinement_contract_id: "MIC-FR-001",
    revision: 1,
    lifecycle_status: status,
    primary_system_contract_id: "HR-FR-HIL-08",
    related_system_contract_ids: ["HR-FR-HIL-02", "HR-FR-HIL-05", "HR-FR-HIL-06"],
    source: {
      requirement_path: requirementPath,
      requirement_digest: sha256(REQUIREMENT_SOURCE),
      acceptance_path: acceptancePath,
      acceptance_digest: sha256(ACCEPTANCE_SOURCE),
    },
    plan_id: "PLAN-L3-43-MIC",
    responsibility_owner: "management-integration-cell-orchestration",
    supporting_requirements: [requirement],
    acceptance_cases: [acceptance],
    downstream_issue_ids: [],
    acceptance_owners: [
      {
        issue_id: 92,
        owner_kind: "parent_acceptance" as const,
        acceptance_ids: ["MIC-AC-001"],
      },
    ],
    approval: null,
  };
  let record = withDigest(base) as RequirementRefinementRecord;
  if (status === "approved" || status === "frozen") {
    const snapshotPayload = {
      observed_at: "2026-08-05T00:00:00+09:00",
      issues: [{ number: 92, state: "open" as const }],
    };
    const decisionPayload = {
      authority: "PO" as const,
      decision_source: "issue:396#comment",
      subject_digest: refinementApprovalSubjectDigest(record),
      source_set_digest: refinementSourceSetDigest(record),
      candidate_head: HEAD,
      approved_revision: 1,
      target_lifecycle: status,
      downstream_issue_snapshot: {
        ...snapshotPayload,
        snapshot_digest: refinementDownstreamIssueSnapshotDigest(snapshotPayload),
      },
      approved_at: "2026-08-05T00:00:00+09:00",
    };
    const approval = {
      ...decisionPayload,
      decision_digest: refinementApprovalDecisionDigest(decisionPayload),
    };
    record = withDigest({ ...base, approval }) as RequirementRefinementRecord;
  }
  return { repoRoot, record };
}

function validate(repoRoot: string, record: unknown) {
  return validateRequirementRefinement(record, {
    repoRoot,
    baselineSystemContractIds: OWNER_IDS,
    currentHead: CURRENT_HEAD,
    planStatus: "confirmed",
    approvalMaterial:
      record &&
      typeof record === "object" &&
      "approval" in record &&
      (record as RequirementRefinementRecord).approval
        ? {
            candidateHead: HEAD,
            isAncestor: true,
            refinementContractId: "MIC-FR-001",
            revision: 1,
            lifecycleStatus: "specified" as const,
            approvalAbsent: true,
            subjectDigest: refinementApprovalSubjectDigest(record as RequirementRefinementRecord),
          }
        : undefined,
  });
}

describe("Requirement refinement authority", () => {
  it("U-RRA-001: accepts specified and two-phase material-HEAD-bound approved bundles", () => {
    for (const status of ["specified", "approved", "frozen"] as const) {
      const { repoRoot, record } = fixture(status);
      expect(validate(repoRoot, record)).toEqual({ ok: true, failureCodes: [] });
    }
  });

  it("U-RRA-003/004: rejects orphan owners and stale source bytes", () => {
    const { repoRoot, record } = fixture();
    expect(
      validate(repoRoot, { ...record, primary_system_contract_id: "HR-FR-HIL-99" }).failureCodes,
    ).toContain("REFINEMENT_OWNER_ORPHAN");
    writeFileSync(join(repoRoot, record.source.requirement_path), "drift\n", "utf8");
    expect(validate(repoRoot, record).failureCodes).toContain("REFINEMENT_SOURCE_STALE");
  });

  it("U-RRA-004b: rejects JSON clauses that do not project from the exact L3/L10 source", () => {
    const { repoRoot, record } = fixture();
    const mutatedRequirement = withDigest({
      ...record.supporting_requirements[0],
      statement: "sourceには存在しない意味",
      semantic_digest: undefined,
    });
    const broken = withDigest({
      ...record,
      supporting_requirements: [mutatedRequirement],
      semantic_digest: undefined,
    });
    expect(validate(repoRoot, broken).failureCodes).toContain("REFINEMENT_SOURCE_PROJECTION_DRIFT");
  });

  it("U-RRA-002: rejects a missing refinement shard entry", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-refinement-root-"));
    cpSync("requirements-ir", join(repoRoot, "requirements-ir"), { recursive: true });
    const manifestPath = join(repoRoot, "requirements-ir/manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      shards: Array<{ kind: string }>;
    };
    manifest.shards = manifest.shards.filter((entry) => entry.kind !== "refinement_contracts");
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    expect(() => loadCanonicalRequirementIrFromShards(repoRoot)).toThrow(
      "canonical requirement IR manifest shard set is not exact",
    );
  });

  it("U-RRA-007: rejects baseline digest drift independently from the current root", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-refinement-baseline-"));
    cpSync("requirements-ir", join(repoRoot, "requirements-ir"), { recursive: true });
    const manifestPath = join(repoRoot, "requirements-ir/manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      baseline_root_digest: string;
    };
    manifest.baseline_root_digest = sha256("drift");
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    expect(() => loadCanonicalRequirementIrFromShards(repoRoot)).toThrow(
      "canonical requirement baseline digest mismatch",
    );
  });

  it("U-RRA-005: rejects non-reciprocal R to AC coverage", () => {
    const { repoRoot, record } = fixture();
    const broken = withDigest({
      ...record,
      acceptance_cases: [
        withDigest({
          acceptance_id: "MIC-AC-001",
          source_projection: "markdown_table_v1" as const,
          requirement_ids: ["MIC-R-02"],
          polarity: "positive" as const,
          statement: "broken",
        }),
      ],
      semantic_digest: undefined,
    });
    expect(validate(repoRoot, broken).failureCodes).toContain("REFINEMENT_TRACE_INCOMPLETE");
  });

  it("U-RRA-005b: rejects missing, duplicate, or non-terminal acceptance ownership", () => {
    const { repoRoot, record } = fixture();
    for (const acceptanceOwners of [
      [
        {
          issue_id: 92,
          owner_kind: "parent_acceptance" as const,
          acceptance_ids: ["MIC-AC-999"],
        },
      ],
      [
        ...record.acceptance_owners,
        {
          issue_id: 93,
          owner_kind: "parent_acceptance" as const,
          acceptance_ids: ["MIC-AC-001"],
        },
      ],
      [
        {
          issue_id: 213,
          owner_kind: "implementation" as const,
          acceptance_ids: ["MIC-AC-001"],
        },
      ],
    ]) {
      const broken = withDigest({
        ...record,
        acceptance_owners: acceptanceOwners,
        semantic_digest: undefined,
      });
      expect(validate(repoRoot, broken).failureCodes).toContain("REFINEMENT_DOWNSTREAM_INCOMPLETE");
    }
  });

  it("U-RRA-006: rejects self-referential, unreachable, or drifted approval material", () => {
    const { repoRoot, record } = fixture("approved");
    expect(
      validateRequirementRefinement(record, {
        repoRoot,
        baselineSystemContractIds: OWNER_IDS,
        currentHead: HEAD,
        planStatus: "confirmed",
        approvalMaterial: {
          candidateHead: HEAD,
          isAncestor: true,
          refinementContractId: record.refinement_contract_id,
          revision: record.revision,
          lifecycleStatus: "specified",
          approvalAbsent: true,
          subjectDigest: refinementApprovalSubjectDigest(record),
        },
      }).failureCodes,
    ).toContain("REFINEMENT_APPROVAL_MISSING");
    expect(
      validateRequirementRefinement(record, {
        repoRoot,
        baselineSystemContractIds: OWNER_IDS,
        currentHead: CURRENT_HEAD,
        planStatus: "confirmed",
        approvalMaterial: {
          candidateHead: HEAD,
          isAncestor: false,
          refinementContractId: record.refinement_contract_id,
          revision: record.revision,
          lifecycleStatus: "specified",
          approvalAbsent: true,
          subjectDigest: refinementApprovalSubjectDigest(record),
        },
      }).failureCodes,
    ).toContain("REFINEMENT_APPROVAL_MISSING");
    const drifted = withDigest({
      ...record,
      acceptance_owners: [
        {
          issue_id: 999,
          owner_kind: "parent_acceptance" as const,
          acceptance_ids: ["MIC-AC-001"],
        },
      ],
      semantic_digest: undefined,
    });
    expect(validate(repoRoot, drifted).failureCodes).toContain("REFINEMENT_APPROVAL_MISSING");
  });

  it("U-RRA-006b: resolves a specified ancestor H0 without requiring H0 to equal receipt H1", () => {
    const { repoRoot, record: specified } = fixture("specified");
    mkdirSync(join(repoRoot, "requirements-ir"), { recursive: true });
    writeFileSync(
      join(repoRoot, "requirements-ir/refinement_contracts.json"),
      `${JSON.stringify({ [specified.refinement_contract_id]: specified }, null, 2)}\n`,
      "utf8",
    );
    execFileSync("git", ["init", "-q"], { cwd: repoRoot });
    execFileSync("git", ["config", "user.email", "helix-test@example.invalid"], { cwd: repoRoot });
    execFileSync("git", ["config", "user.name", "HELIX Test"], { cwd: repoRoot });
    execFileSync("git", ["add", "requirements-ir/refinement_contracts.json"], { cwd: repoRoot });
    execFileSync("git", ["commit", "-qm", "specified material"], { cwd: repoRoot });
    const materialHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const decisionPayload = {
      authority: "PO" as const,
      decision_source: "issue:396#comment",
      subject_digest: refinementApprovalSubjectDigest(specified),
      source_set_digest: refinementSourceSetDigest(specified),
      candidate_head: materialHead,
      approved_revision: specified.revision,
      target_lifecycle: "frozen" as const,
      downstream_issue_snapshot: {
        observed_at: "2026-08-05T00:00:00+09:00",
        issues: [{ number: 92, state: "open" as const }],
        snapshot_digest: refinementDownstreamIssueSnapshotDigest({
          observed_at: "2026-08-05T00:00:00+09:00",
          issues: [{ number: 92, state: "open" as const }],
        }),
      },
      approved_at: "2026-08-05T00:00:00+09:00",
    };
    const frozen = withDigest({
      ...specified,
      lifecycle_status: "frozen" as const,
      approval: {
        ...decisionPayload,
        decision_digest: refinementApprovalDecisionDigest(decisionPayload),
      },
      semantic_digest: undefined,
    }) as RequirementRefinementRecord;
    writeFileSync(
      join(repoRoot, "requirements-ir/refinement_contracts.json"),
      `${JSON.stringify({ [frozen.refinement_contract_id]: frozen }, null, 2)}\n`,
      "utf8",
    );
    execFileSync("git", ["add", "requirements-ir/refinement_contracts.json"], { cwd: repoRoot });
    execFileSync("git", ["commit", "-qm", "freeze receipt"], { cwd: repoRoot });
    const receiptHead = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    expect(receiptHead).not.toBe(materialHead);
    expect(loadApprovalMaterial(repoRoot, receiptHead, frozen)).toMatchObject({
      candidateHead: materialHead,
      isAncestor: true,
      lifecycleStatus: "specified",
      approvalAbsent: true,
      subjectDigest: refinementApprovalSubjectDigest(frozen),
    });
  });

  it("U-RRA-006c: rejects frozen admission without confirmed PLAN and exact open Issue graph", () => {
    const { repoRoot, record } = fixture("frozen");
    const material = {
      candidateHead: HEAD,
      isAncestor: true,
      refinementContractId: record.refinement_contract_id,
      revision: record.revision,
      lifecycleStatus: "specified" as const,
      approvalAbsent: true,
      subjectDigest: refinementApprovalSubjectDigest(record),
    };
    expect(
      validateRequirementRefinement(record, {
        repoRoot,
        baselineSystemContractIds: OWNER_IDS,
        currentHead: CURRENT_HEAD,
        planStatus: "draft",
        approvalMaterial: material,
      }).failureCodes,
    ).toContain("REFINEMENT_APPROVAL_MISSING");

    const snapshotPayload = {
      observed_at: "2026-08-05T00:00:00+09:00",
      issues: [{ number: 214, state: "open" as const }],
    };
    const approvalWithoutDecision = {
      ...record.approval,
      downstream_issue_snapshot: {
        ...snapshotPayload,
        snapshot_digest: refinementDownstreamIssueSnapshotDigest(snapshotPayload),
      },
    } as NonNullable<RequirementRefinementRecord["approval"]>;
    const { decision_digest: _decisionDigest, ...decisionPayload } = approvalWithoutDecision;
    const approval = {
      ...decisionPayload,
      decision_digest: refinementApprovalDecisionDigest(decisionPayload),
    };
    const broken = withDigest({ ...record, approval, semantic_digest: undefined });
    expect(validate(repoRoot, broken).failureCodes).toContain("REFINEMENT_APPROVAL_MISSING");
  });

  it("U-RRA-009: rejects semantic digest mutation", () => {
    const { repoRoot, record } = fixture();
    expect(
      validate(repoRoot, { ...record, semantic_digest: sha256("mutant") }).failureCodes,
    ).toContain("REFINEMENT_SCHEMA_INVALID");
  });
});
