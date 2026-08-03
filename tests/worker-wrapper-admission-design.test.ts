import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeDesignRealityBinding } from "../src/lint/design-reality-binding";

const planPath = "docs/plans/PLAN-L4-61-worker-wrapper-admission.md";
const designPath = "docs/design/helix/L4-basic-design/worker-wrapper-admission.md";
const systemPath = "docs/test-design/helix/L9-worker-wrapper-admission-system-test-design.md";
const plan = readFileSync(planPath, "utf8");
const design = readFileSync(designPath, "utf8");
const systemTest = readFileSync(systemPath, "utf8");

describe("WCC-FR-02 worker wrapper admission L4/L9 pair", () => {
  it("U-WWA-DESIGN-001: behaviorとownerを原子契約へ固定する", () => {
    for (const artifact of [plan, design, systemTest]) {
      expect(artifact).toContain("WCC-FR-02");
      expect(artifact).toContain("worker-wrapper-admission");
    }
    expect(plan).toContain("github_issue_id: 225");
    expect(plan).toContain("change_slice: atomic");
  });

  it("U-WWA-DESIGN-002: existing adapterを再利用してraw routeを分離する", () => {
    for (const token of [
      "`AdapterPlanBuilder`",
      "`ProviderInvocation`",
      "`RuntimeCliEntrypoint`",
      "`TeamAdapterRunner`",
      "`WrapperRouteAdmission`",
      '"direct_provider_cli"',
    ]) {
      expect(design).toContain(token);
    }
    expect(design).toContain("scorecard handoff 0");
    expect(design).toContain("caller supplied JSONとして受け取らない");
    expect(design).toContain("WrapperLaunchCapability");
    expect(design).toContain("provider、command、args、stdin");
    expect(design).toContain("`stdin`を`buildProviderInvocation`の入力fieldとは扱わない");
  });

  it("U-WWA-DESIGN-003: L9正負oracleを6件exactに定義する", () => {
    for (let index = 1; index <= 6; index += 1) {
      expect(systemTest).toContain(`ST-WWA-${String(index).padStart(3, "0")}`);
    }
    expect(systemTest).toContain("raw callerがrouteを再ラベルできるmutantはRed");
    expect(systemTest).toContain("handoff count=0");
  });

  it("U-WWA-DESIGN-004: 後続責務と新基盤を混載しない", () => {
    expect(design).toContain("`WCC-FR-03/04`");
    expect(design).toContain("`WCC-FR-05/06`");
    expect(design).toContain("`WCC-FR-07/08`");
    expect(design).toContain("`WCC-FR-09`");
    expect(plan).toContain("新service、DB table、workflow、benchmark runnerを追加しない");
    expect(plan).toContain("WWA-SCOPE-001");
    expect(plan).toContain("responsibility_change: none");
  });

  it("U-WWA-DESIGN-005: exact HEADの実在adapterとCLI commandへ束縛する", () => {
    expect(analyzeDesignRealityBinding(process.cwd(), [designPath])).toMatchObject({
      ok: true,
      checked: 1,
      findings: [],
    });
    expect(design).toContain('"asset_id": "team-wrapper-command"');
    expect(design).toContain('"resource_name": "team"');
    expect(design).toContain("誤昇格");
  });
});
