import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import {
  type RequirementRefinementRecord,
  validateRequirementRefinement,
} from "../src/requirements/requirement-refinement-authority";

const l1Path = "docs/design/helix/L1-requirements/resident-lane-orchestration-requests.md";
const l3Path = "docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md";
const l10Path = "docs/test-design/helix/resident-lane-orchestration-acceptance.md";
const l12Path = "docs/test-design/helix/resident-lane-orchestration-recognition.md";
const planPath = "docs/plans/PLAN-L3-75-resident-lane-orchestration-authority.md";

const l1 = readFileSync(l1Path, "utf8");
const l3 = readFileSync(l3Path, "utf8");
const l10 = readFileSync(l10Path, "utf8");
const l12 = readFileSync(l12Path, "utf8");
const plan = readFileSync(planPath, "utf8");

describe("resident lane requirements authority", () => {
  it("RLO-AUTH-001: L1↔L12とL3↔L10を同じPLANへ束縛する", () => {
    for (const text of [l1, l3, l10, l12]) {
      expect(text).toContain("PLAN-L3-75-resident-lane-orchestration-authority");
    }
    expect(l1).toContain(`pair_artifact: ${l12Path}`);
    expect(l12).toContain(`pair_artifact: ${l1Path}`);
    expect(l3).toContain(`pair_artifact: ${l10Path}`);
    expect(l10).toContain(`pair_artifact: ${l3Path}`);
    expect(plan).toMatch(/^status: confirmed$/m);
  });

  it("RLO-AUTH-002: BR/SR/CNとL3 exact setを欠落させない", () => {
    for (let id = 1; id <= 8; id += 1) expect(l1).toContain(`BR-${id}`);
    for (let id = 1; id <= 11; id += 1) expect(l1).toContain(`SR-${id}`);
    for (let id = 1; id <= 6; id += 1) expect(l1).toContain(`CN-${id}`);
    for (let id = 1; id <= 40; id += 1) {
      expect(l3).toContain(`RLO-FR-${String(id).padStart(3, "0")}`);
    }
    for (let id = 1; id <= 30; id += 1) {
      expect(l3).toContain(`RLO-AC-${String(id).padStart(3, "0")}`);
    }
  });

  it("RLO-AUTH-003: scope authorityとbranchを混同しない", () => {
    expect(l1).toContain("GitHub IssueまたはPLANの択一");
    expect(l1).toContain("branchは常に必須");
    expect(l3).toContain("GitHub IssueまたはPLANのexactly one");
    expect(l3).toContain("専用branchを一つ");
    expect(l3).not.toContain("Issueなしdispatchが失敗する");
  });

  it("RLO-AUTH-004: resident/native/CLIとmodel/effortを別軸にする", () => {
    for (const token of ["resident_lane", "native_subagent", "cli_worker"]) {
      expect(l3).toContain(token);
    }
    expect(l3).toContain("Solを親TL／管制、Lunaをnative worker");
    expect(l3).toContain("標準Grok、上位Kimi、下位Composer");
    expect(l3).toContain("provider_default_unbenchmarked");
    expect(l10).toContain("Terra silent fallback");
  });

  it("RLO-AUTH-005: L3承認前のruntime着手を許可しない", () => {
    expect(l3).toMatch(/^status: confirmed$/m);
    expect(l10).toMatch(/^status: confirmed$/m);
    expect(plan).toContain("runtime実装を#860/#821/#854/#1293へ分離");
    expect(plan).toContain("PO L3 approval");
  });

  it("RLO-AUTH-006: current deltaをRequirement IRへ決定的に接着する", () => {
    const canonical = loadCanonicalRequirementIrFromShards(process.cwd());
    const record = canonical.refinement_contracts.find(
      (candidate) => candidate.refinement_contract_id === "RLO-FR-001",
    ) as RequirementRefinementRecord | undefined;
    expect(record).toBeDefined();
    expect(record?.lifecycle_status).toBe("specified");
    expect(record?.supporting_requirements.map((item) => item.requirement_id)).toEqual([
      "RLO-FR-037",
      "RLO-FR-038",
      "RLO-FR-039",
      "RLO-FR-040",
    ]);
    expect(record?.acceptance_cases.map((item) => item.acceptance_id)).toEqual([
      "RLO-AC-027",
      "RLO-AC-028",
      "RLO-AC-029",
      "RLO-AC-030",
    ]);
    expect(
      validateRequirementRefinement(record, {
        repoRoot: process.cwd(),
        baselineSystemContractIds: new Set(
          canonical.system_contracts.map((contract) => contract.system_contract_id),
        ),
        currentHead: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
        planStatus: "confirmed",
      }),
    ).toEqual({ ok: true, failureCodes: [] });
  });
});
