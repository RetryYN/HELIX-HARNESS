import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import {
  type RequirementRefinementRecord,
  validateRequirementRefinement,
} from "../src/requirements/requirement-refinement-authority";

function loadRecord(): RequirementRefinementRecord {
  const records = JSON.parse(
    readFileSync("requirements-ir/refinement_contracts.json", "utf8"),
  ) as Record<string, RequirementRefinementRecord>;
  const record = records["CNW-FR-001"];
  if (!record) throw new Error("CNW-FR-001 missing");
  return record;
}

function validate(record: RequirementRefinementRecord) {
  const canonical = loadCanonicalRequirementIrFromShards(process.cwd());
  return validateRequirementRefinement(record, {
    repoRoot: process.cwd(),
    baselineSystemContractIds: new Set(
      canonical.system_contracts.map((contract) => contract.system_contract_id),
    ),
    currentHead: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    planStatus: "confirmed",
  });
}

describe("Codex native worker routing requirements", () => {
  it("CNW-PROJ-001: target AC exact setのrefinement authorityとsource projectionが一致する", () => {
    const record = loadRecord();
    expect(validate(record)).toEqual({ ok: true, failureCodes: [] });
    expect(record.supporting_requirements.map((item) => item.requirement_id)).toEqual([
      "CNW-R-01",
      "CNW-R-02",
      "CNW-R-03",
      "CNW-R-04",
      "CNW-R-05",
      "CNW-R-06",
      "CNW-R-07",
      "CNW-R-08",
    ]);
    expect(record.acceptance_cases.map((item) => item.acceptance_id)).toEqual([
      "CNW-AC-001",
      "CNW-AC-002",
      "CNW-AC-003",
      "CNW-AC-004",
      "CNW-AC-005",
      "CNW-AC-006",
      "CNW-AC-007",
      "CNW-AC-008",
      "CNW-AC-009",
      "CNW-AC-010",
      "CNW-AC-011",
      "CNW-AC-012",
      "CNW-AC-013",
    ]);
  });

  it("CNW-PROJ-002: requirement sourceにworker identityとauthority境界を保持する", () => {
    const requirement = readFileSync(
      "docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md",
      "utf8",
    );
    expect(requirement).toContain("`gpt-5.6-luna`、reasoning effortは`xhigh`");
    expect(requirement).toContain(
      "`gpt-5.6-terra` workerとSol subagent routeをcurrent dispatch候補から除外",
    );
    expect(requirement).toContain("closing、merge、Issue close、独立review");
    expect(requirement).toContain("`project_hook_source_stale_or_foreign`");
    expect(requirement).toContain("hook実行rootとloader／source解決root");
    expect(requirement).toContain("後続memory wake等のhook timeout");
    expect(requirement).toContain("`project_hook_lifecycle_timeout`");
    expect(requirement).toContain("既定15秒、hard ceiling 60秒");
  });

  it("CNW-PROJ-003: policy requirementのsource projection driftを拒否する", () => {
    const record = structuredClone(loadRecord());
    const policyRequirement = record.supporting_requirements[2];
    if (!policyRequirement) throw new Error("CNW-R-03 missing");
    policyRequirement.statement = policyRequirement.statement.replace(
      "arbitrary overrideは拒否",
      "arbitrary overrideは許可",
    );
    expect(validate(record).failureCodes).toContain("REFINEMENT_SOURCE_PROJECTION_DRIFT");
  });

  it("CNW-PROJ-004: revision 2のcurrent ownerをPLAN-L3-64へ一意に束縛する", () => {
    const requirement = readFileSync(
      "docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md",
      "utf8",
    );
    const acceptance = readFileSync(
      "docs/test-design/helix/codex-native-worker-routing-acceptance.md",
      "utf8",
    );
    const currentPlan = "PLAN-L3-64-codex-native-worker-project-hook-authority";
    expect(requirement).toContain(`plan: ${currentPlan}`);
    expect(acceptance).toContain(`plan: ${currentPlan}`);
    expect(loadRecord().plan_id).toBe(currentPlan);
  });
});
