import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath =
  "docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md";
const acceptancePath = "docs/test-design/helix/release-module-bundle-composition-acceptance.md";
const roadmapPath = "docs/governance/release-module-bundle-rollout-roadmap.md";
const planPath = "docs/plans/PLAN-L3-68-release-module-bundle-composition.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const roadmap = readFileSync(roadmapPath, "utf8");
const plan = readFileSync(planPath, "utf8");

describe("Release Module／Bundle composition requirements authority", () => {
  it("L3とL10を同じPLANとpairへ束縛する", () => {
    expect(requirement).toContain("plan: PLAN-L3-68-release-module-bundle-composition");
    expect(acceptance).toContain("plan: PLAN-L3-68-release-module-bundle-composition");
    expect(requirement).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${requirementPath}`);
    expect(plan).toMatch(/^status: confirmed$/m);
    expect(plan).toContain("completion_claim_allowed: false");
  });

  it("supporting requirementとacceptanceのexact setを閉じる", () => {
    expect(requirement.match(/^### RLS-R-\d{2}/gm)).toHaveLength(12);
    expect(acceptance.match(/\| `RLS-AC-\d{3}`/g)).toHaveLength(15);
  });

  it("初期ModuleとBundleをexact setで保持する", () => {
    for (const moduleId of [
      "helix-core",
      "helix-requirements",
      "helix-design",
      "helix-workflow",
      "helix-verification",
      "helix-ci",
      "helix-reverse-recovery",
      "helix-refactoring",
      "helix-context-memory",
      "helix-agent-runtime",
      "helix-github-ops",
    ]) {
      expect(requirement).toContain(`\`${moduleId}\``);
    }
    for (const bundleId of [
      "helix-requirements",
      "helix-design",
      "helix-dynamic-ci",
      "helix-quality",
      "helix-refactoring",
      "helix-autonomous-dev",
      "helix-lite",
      "helix-full",
    ]) {
      expect(requirement).toContain(`\`${bundleId}\``);
    }
  });

  it("axisとrepository authorityを混同しない", () => {
    expect(requirement).toContain(
      "capability family、workflow identity、route、drive、execution mode",
    );
    expect(requirement).toContain("Release Moduleは同一repository内");
    expect(requirement).toContain("DevOSで意味契約を");
    expect(acceptance).toContain("route／mode／drive enumへの吸収を拒否");
  });

  it("static verificationをtrusted executionより先に固定する", () => {
    expect(requirement).toContain("信頼実行前のstatic検証");
    expect(requirement).toContain("未信頼artifactはcode実行前");
    expect(acceptance).toContain("static検査後だけtrusted consumerを起動");
  });

  it("Legacy Liteをfrozen baselineから段階移行する", () => {
    expect(requirement).toContain("`frozen_baseline`");
    expect(requirement).toContain("1 stable cycle併存");
    expect(acceptance).toContain("先行削除、旧profile継ぎ足し、green相殺を拒否");
  });

  it("RLS-01から13をIssueへ漏れなく割り当てる", () => {
    for (let issue = 1074; issue <= 1086; issue += 1) {
      expect(roadmap).toContain(`#${issue}`);
      expect(plan).toContain(`issue:${issue}`);
    }
  });
});
