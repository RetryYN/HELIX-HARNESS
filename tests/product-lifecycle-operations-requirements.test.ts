// PLAN-L3-71-product-lifecycle-operations — OPS-AC-001..018 authority binding
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath =
  "docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md";
const acceptancePath = "docs/test-design/helix/product-lifecycle-operations-acceptance.md";
const releaseRequirementPath =
  "docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md";
const releaseAcceptancePath =
  "docs/test-design/helix/release-module-bundle-composition-acceptance.md";
const roadmapPath = "docs/governance/release-module-bundle-rollout-roadmap.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const releaseRequirement = readFileSync(releaseRequirementPath, "utf8");
const releaseAcceptance = readFileSync(releaseAcceptancePath, "utf8");
const roadmap = readFileSync(roadmapPath, "utf8");

function uniqueIds(document: string, pattern: RegExp): string[] {
  return [...new Set(document.match(pattern) ?? [])].sort();
}

describe("製品ライフサイクル運用L3↔L10 authority", () => {
  it("OPS-AUTH-001: feature／requirement／acceptance exact setを固定する", () => {
    expect(uniqueIds(requirement, /OPS-FR-\d{3}/gu)).toEqual(
      Array.from({ length: 6 }, (_, index) => `OPS-FR-${String(index + 1).padStart(3, "0")}`),
    );
    expect(uniqueIds(requirement, /OPS-R-\d{2}/gu)).toEqual(
      Array.from({ length: 12 }, (_, index) => `OPS-R-${String(index + 1).padStart(2, "0")}`),
    );
    expect(uniqueIds(acceptance, /OPS-AC-\d{3}/gu)).toEqual(
      Array.from({ length: 18 }, (_, index) => `OPS-AC-${String(index + 1).padStart(3, "0")}`),
    );
    for (const requirementId of Array.from(
      { length: 12 },
      (_, index) => `OPS-R-${String(index + 1).padStart(2, "0")}`,
    )) {
      expect(acceptance, `${requirementId}に対応するacceptanceが必要`).toMatch(
        new RegExp("\\| `OPS-AC-\\d{3}` \\| `" + requirementId + "` \\|", "u"),
      );
    }
  });

  it("OPS-AUTH-002: ReleaseとDeployment、change classとrouteを別authorityに保つ", () => {
    expect(requirement).toContain(
      "Releaseは検証済みartifactの確定、Deploymentはそのartifactを一意なenvironmentへ反映する別の状態遷移",
    );
    expect(requirement).toContain(
      "Reverse、Recovery、Incident等のworkflow routeと上記change classを同じenumへ畳み込まない",
    );
    expect(requirement).toContain("Plan、apply、receiptを同一状態へ畳み込まない");
  });

  it("OPS-AUTH-003: lifecycle Module／BundleとWave 7をrelease計画へ接続する", () => {
    for (const moduleId of [
      "helix-deployment",
      "helix-operations",
      "helix-maintenance",
      "helix-diagnosis",
    ]) {
      expect(requirement).toContain(`\`${moduleId}\``);
      expect(releaseRequirement).toContain(`\`${moduleId}\``);
    }
    expect(requirement).toContain("`helix-lifecycle-ops` Bundle");
    expect(releaseRequirement).toContain("`helix-lifecycle-ops` Bundle");
    expect(releaseRequirement).toContain("### RLS-R-13 Release後ライフサイクル責務");
    expect(releaseAcceptance).toContain("`RLS-AC-016`");
    expect(roadmap).toContain("Wave 7");
    for (let issue = 1160; issue <= 1167; issue += 1) {
      expect(roadmap).toContain(`#${issue}`);
    }
  });

  it("OPS-AUTH-004: 提案sourceをcurrent authorityとして残さない", () => {
    expect(existsSync("HELIX本体_デプロイ_運用_保守_修正箇所特定_要求指示書_v0.1.md")).toBe(false);
  });
});
