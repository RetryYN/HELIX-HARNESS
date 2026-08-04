import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import { requirementIrSemanticDigest } from "../src/requirements/requirement-ir-shadow";
import {
  type RequirementRefinementRecord,
  refinementSourceSetDigest,
  validateRequirementRefinement,
} from "../src/requirements/requirement-refinement-authority";

const HEAD = "a".repeat(40);
const OWNER_IDS = new Set(["HR-FR-HIL-02", "HR-FR-HIL-05", "HR-FR-HIL-06", "HR-FR-HIL-08"]);

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
  writeFileSync(join(repoRoot, requirementPath), "requirement\n", "utf8");
  writeFileSync(join(repoRoot, acceptancePath), "acceptance\n", "utf8");
  const requirement = withDigest({
    requirement_id: "MIC-R-01",
    statement: "PMはREADY taskを割り当てる",
    acceptance_ids: ["MIC-AC-001"],
  });
  const acceptance = withDigest({
    acceptance_id: "MIC-AC-001",
    requirement_ids: ["MIC-R-01"],
    polarity: "positive" as const,
    statement: "独立taskだけをexactly once割り当てる",
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
      requirement_digest: sha256("requirement\n"),
      acceptance_path: acceptancePath,
      acceptance_digest: sha256("acceptance\n"),
    },
    plan_id: "PLAN-L3-43-MIC",
    responsibility_owner: "management-integration-cell-orchestration",
    supporting_requirements: [requirement],
    acceptance_cases: [acceptance],
    downstream_issue_ids: [213],
    approval: null,
  };
  let record = withDigest(base) as RequirementRefinementRecord;
  if (status === "approved" || status === "frozen") {
    const approval = {
      authority: "PO" as const,
      decision_source: "issue:396#comment",
      decision_digest: sha256("approve"),
      source_set_digest: refinementSourceSetDigest(record),
      candidate_head: HEAD,
      approved_revision: 1,
      approved_at: "2026-08-05T00:00:00+09:00",
    };
    record = withDigest({ ...base, approval }) as RequirementRefinementRecord;
  }
  return { repoRoot, record };
}

function validate(repoRoot: string, record: unknown) {
  return validateRequirementRefinement(record, {
    repoRoot,
    baselineSystemContractIds: OWNER_IDS,
    candidateHead: HEAD,
  });
}

describe("Requirement refinement authority", () => {
  it("U-RRA-001: accepts a typed specified bundle and a HEAD-bound approved bundle", () => {
    for (const status of ["specified", "approved"] as const) {
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
          requirement_ids: ["MIC-R-02"],
          polarity: "positive" as const,
          statement: "broken",
        }),
      ],
      semantic_digest: undefined,
    });
    expect(validate(repoRoot, broken).failureCodes).toContain("REFINEMENT_TRACE_INCOMPLETE");
  });

  it("U-RRA-006: rejects approval bound to another revision or HEAD", () => {
    const { repoRoot, record } = fixture("approved");
    const approval = { ...record.approval, candidate_head: "b".repeat(40) };
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
