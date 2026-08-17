import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const designPath = "docs/design/helix/L3-requirements/security-capability-broker-authority.md";
const acceptancePath = "docs/test-design/helix/security-capability-broker-acceptance.md";
const planPath = "docs/plans/PLAN-L3-62-security-capability-broker-authority.md";

const read = (path: string) => readFileSync(path, "utf8");

describe("security capability broker authority design", () => {
  it("L3候補、L10受入、PLANがdraftのまま双方向に束縛される", () => {
    const design = read(designPath);
    const acceptance = read(acceptancePath);
    const plan = read(planPath);

    expect(design).toContain("status: draft");
    expect(design).toContain("authority_status: proposed_pending_l3_confirmation");
    expect(design).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${designPath}`);
    expect(plan).toContain("status: draft");
    expect(plan).toContain("completion_claim_allowed: false");
    expect(plan).toContain("github_issue_id: 679");
    expect(plan).toContain(`pair_artifact: ${acceptancePath}`);
    expect(plan).toContain(designPath);
  });

  it("安全判定の独立軸とfail-closeの受入IDを欠落させない", () => {
    const design = read(designPath);
    const acceptance = read(acceptancePath);
    const requiredAxes = [
      "operation_capability",
      "target_identity",
      "execution_provenance",
      "data_classification",
      "sink_authority",
      "impact_profile",
      "approval_binding",
      "postcondition / rollback / expiry",
    ];
    for (const axis of requiredAxes) expect(design).toContain(axis);

    for (let i = 1; i <= 7; i += 1) {
      expect(design).toContain(`SEC-FR-CAP-00${i}`);
      expect(acceptance).toContain(`SEC-AC-CAP-00${i}`);
    }
    expect(acceptance).toContain("legacy guard green");
    expect(acceptance).toContain("sandbox unavailable");
    expect(acceptance).toContain("値を出さない");
  });

  it("L3確認前にcurrent requirementsを自己昇格させない", () => {
    const design = read(designPath);
    const plan = read(planPath);
    expect(design).not.toContain("status: confirmed");
    expect(plan).not.toContain("status: confirmed");
    expect(design).toContain("v1.3.11の現行正本を");
    expect(design).toContain("この文書だけで変更しない");
    expect(plan).toContain("L3の人間確認前にrequirements v1.3.11");
  });

  it("既存guardのgreenだけで安全authorityへ昇格させない", () => {
    const design = read(designPath);
    const acceptance = read(acceptancePath);
    const plan = read(planPath);

    expect(design).toContain("runtime、doctor、DB、PR admissionの意味authorityへ昇格させない");
    expect(design).toContain("current guardのgreenは、未実装のphysical identity");
    expect(acceptance).toContain("legacy/別scannerのgreenで相殺せず");
    expect(plan).toContain("no_code_decision: no_change");
    expect(plan).toContain("runtime、doctor、DB、GitHub settings、credential、sandboxを変更しない");
  });
});
