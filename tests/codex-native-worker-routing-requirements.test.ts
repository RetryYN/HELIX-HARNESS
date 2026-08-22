import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
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

function generatedArtifacts(planText: string): string[] {
  const match = planText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) throw new Error("PLAN frontmatter missing");
  const frontmatter = parse(match[1]) as {
    generates?: Array<{ artifact_path?: string }>;
  };
  return (frontmatter.generates ?? []).flatMap((entry) =>
    typeof entry.artifact_path === "string" ? [entry.artifact_path] : [],
  );
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

    const oldPlan = readFileSync("docs/plans/PLAN-L3-63-codex-native-worker-routing.md", "utf8");
    const currentPlanDoc = readFileSync(
      "docs/plans/PLAN-L3-64-codex-native-worker-project-hook-authority.md",
      "utf8",
    );
    const transferMatch = currentPlanDoc.match(
      /<!-- HELIX:cnw-ownership-transfer:v1 -->\s*```json\s*([\s\S]*?)\s*```/,
    );
    expect(transferMatch?.[1]).toBeTruthy();
    const transfer = JSON.parse(transferMatch?.[1] ?? "{}") as {
      schema_version?: string;
      from_plan?: string;
      to_plan?: string;
      scope?: string;
      transferred_artifacts?: string[];
    };
    expect(transfer).toEqual({
      schema_version: "helix-cnw-ownership-transfer.v1",
      from_plan: "PLAN-L3-63-codex-native-worker-routing",
      to_plan: currentPlan,
      scope: "revision_2_artifacts_only",
      transferred_artifacts: [
        "docs/design/helix/L3-requirements/codex-native-worker-routing-requirements.md",
        "docs/test-design/helix/codex-native-worker-routing-acceptance.md",
        "requirements-ir/refinement_contracts.json",
        "requirements-ir/manifest.json",
        "docs/generated/requirements/requirement-definition.generated.md",
        "docs/governance/l3-rebaseline-g3-freeze-packet.md",
        "docs/governance/generated/outstanding-snapshot.json",
        "tests/codex-native-worker-routing-requirements.test.ts",
        "tests/l3-g3-freeze-packet-v2.test.ts",
        "tests/requirement-generated-view-db.test.ts",
      ],
    });
    const oldArtifacts = new Set(generatedArtifacts(oldPlan));
    const currentArtifacts = generatedArtifacts(currentPlanDoc);
    const coOwned = currentArtifacts.filter((artifact) => oldArtifacts.has(artifact)).sort();
    for (const artifact of coOwned) {
      expect(transfer.transferred_artifacts).toContain(artifact);
    }
    expect(coOwned).toHaveLength(10);
    expect(currentPlanDoc).toContain("partial ownership transfer");
    expect(currentPlanDoc).toContain("historical `generates`との共同正本化を拒否");

    const backlinkMatch = oldPlan.match(
      /<!-- HELIX:cnw-ownership-transfer-backlink:v1 -->\s*```json\s*([\s\S]*?)\s*```/,
    );
    expect(backlinkMatch?.[1]).toBeTruthy();
    expect(JSON.parse(backlinkMatch?.[1] ?? "{}")).toEqual({
      schema_version: "helix-cnw-ownership-transfer-backlink.v1",
      to_plan: currentPlan,
      transfer_marker: "HELIX:cnw-ownership-transfer:v1",
      scope: "revision_2_artifacts_only",
    });
  });

  it("CNW-PROJ-005: 60秒超過の既知非適合をruntime ownerへ束縛する", () => {
    const currentPlanDoc = readFileSync(
      "docs/plans/PLAN-L3-64-codex-native-worker-project-hook-authority.md",
      "utf8",
    );
    expect(currentPlanDoc).toContain("`.codex/hooks.json` SessionStart | 90秒");
    expect(currentPlanDoc).toContain("`.claude/settings.json` `claude-memory-wake` | 7230秒");
    expect(currentPlanDoc).toContain("#895のbounded hook lifecycle runtime sliceが是正を所有");
    expect(currentPlanDoc).toContain("60秒超過、期限なし、親process残留");
    expect(currentPlanDoc).toContain("terminal result消失のnegative mutation");

    const codexHooks = JSON.parse(readFileSync(".codex/hooks.json", "utf8")) as {
      hooks?: { SessionStart?: Array<{ hooks?: Array<{ timeout?: number }> }> };
    };
    const claudeSettings = JSON.parse(readFileSync(".claude/settings.json", "utf8")) as {
      hooks?: { Stop?: Array<{ hooks?: Array<{ command?: string; timeout?: number }> }> };
    };
    expect(codexHooks.hooks?.SessionStart?.[0]?.hooks?.[0]?.timeout).toBe(90);
    const memoryWake = claudeSettings.hooks?.Stop?.flatMap((entry) => entry.hooks ?? []).find(
      (hook) => hook.command?.includes("claude-memory-wake"),
    );
    expect(memoryWake?.timeout).toBe(7230);
  });
});
