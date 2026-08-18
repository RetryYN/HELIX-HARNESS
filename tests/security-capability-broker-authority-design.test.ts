import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const planPath = "docs/plans/PLAN-L3-62-security-capability-broker-authority.md";
const requirementsPath =
  "docs/design/helix/L3-requirements/security-capability-broker-authority.md";
const acceptancePath = "docs/test-design/helix/security-capability-broker-acceptance.md";

const plan = readFileSync(planPath, "utf8");
const requirements = readFileSync(requirementsPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");

describe("PLAN-L3-62 capability broker authority design", () => {
  it("keeps the candidate below current authority and preserves the design-only boundary", () => {
    expect(plan).toContain("status: confirmed");
    expect(plan).toContain("completion_claim_allowed: false");
    expect(plan).toContain("requirements v1.3.12");
    expect(plan).toContain("no_code_decision: no_change");
    expect(requirements).toContain("authority_status: current_requirements_v1.3.12");
    expect(requirements).toContain("v1.3.12へPO確認済みの候補IDを昇格し");
    expect(requirements).toContain("PR admissionの未実装能力を完了扱いにはしない");
  });

  it("binds the L3 candidate and L10 acceptance design bidirectionally", () => {
    expect(plan).toContain(`pair_artifact: ${acceptancePath}`);
    expect(requirements).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${requirementsPath}`);
    for (let index = 1; index <= 10; index += 1) {
      const id = String(index).padStart(3, "0");
      expect(acceptance).toContain(`SEC-AC-CAP-${id}`);
      if (index <= 7) expect(requirements).toContain(`SEC-FR-CAP-${id}`);
    }
  });

  it("declares the design oracle and generated projections without claiming runtime safety", () => {
    for (const path of [
      planPath,
      requirementsPath,
      acceptancePath,
      "tests/security-capability-broker-authority-design.test.ts",
      "docs/design/design-catalog.yaml",
      "docs/governance/l3-rebaseline-g3-freeze-packet.md",
      "src/lint/l3-progression-reviewed-digests.ts",
      "tests/l3-g3-freeze-packet-v2.test.ts",
    ]) {
      expect(plan).toContain(`artifact_path: ${path}`);
    }
    for (const marker of [
      "physical identity",
      "execution provenance",
      "data classification",
      "sink authority",
      "runtime coverage",
      "legacy guard green",
      "fail-close",
    ]) {
      expect(`${requirements}\n${acceptance}`).toContain(marker);
    }
    const catalogDigest = createHash("sha256")
      .update(readFileSync("docs/design/design-catalog.yaml"))
      .digest("hex");
    expect(readFileSync("src/lint/l3-progression-reviewed-digests.ts", "utf8")).toContain(
      catalogDigest,
    );
  });
});
