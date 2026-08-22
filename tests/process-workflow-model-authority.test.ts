import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const docs = [
  ["docs/process/modes/add-feature.md", "workflow_model", "ADD_FEATURE"],
  ["docs/process/modes/incident.md", "workflow_model", "INCIDENT"],
  ["docs/process/modes/recovery.md", "workflow_model", "RECOVERY"],
  ["docs/process/modes/refactor.md", "workflow_model", "REFACTOR"],
  ["docs/process/modes/research.md", "workflow_model", "RESEARCH"],
  ["docs/process/modes/retrofit.md", "workflow_model", "RETROFIT"],
  ["docs/process/modes/reverse.md", "workflow_model", "REVERSE"],
  ["docs/process/modes/version-up.md", "workflow_model", "VERSION_UP"],
  ["docs/process/modes/design-bottomup.md", "specialist_workflow", "SCREEN_DESIGN"],
] as const;

const specialistDocs = [
  ["docs/process/modes/design-bottomup.md", "specialist_workflow", "SCREEN_DESIGN"],
  ["docs/process/specialist-workflows.md", "specialist_workflow", "SCREEN_DESIGN"],
] as const;

describe("workflow model process typed authority", () => {
  it("U-WMPA-001: 全文書がrequirements-owned authorityとtyped identityを持つ", () => {
    const registry = JSON.parse(
      readFileSync(
        "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
        "utf8",
      ),
    ) as {
      requirements_version: string;
      registry_version: string;
      entities: { axis: string; id: string }[];
    };

    for (const [path, axis, id] of [...docs, ...specialistDocs]) {
      const body = readFileSync(path, "utf8");
      expect(body).toContain("docs/governance/helix-harness-requirements_v1.3.md");
      expect(body).toContain("requirements v1.3.13");
      expect(body).toContain("registry v1.1.5");
      expect(body).toContain(`axis=${axis} id=${id}`);
      expect(registry.requirements_version).toBe("1.3.13");
      expect(registry.registry_version).toBe("1.1.5");
      expect(registry.entities).toContainEqual(expect.objectContaining({ axis, id }));
    }
  });

  it("U-WMPA-002: current文書から旧定義を再出力しない", () => {
    for (const [path] of [...docs, ...specialistDocs]) {
      const body = readFileSync(path, "utf8");
      expect(body).not.toMatch(/requirements v1\.2|L0-L14|L1-L14|\bBun\b|駆動モデル/);
      expect(body).toContain("compatibility-only");
      expect(body).toContain("L1-L12");
    }
  });

  it("U-WMPA-003: workflow modelとspecialist workflowを別axisに保持する", () => {
    for (const [path, axis, id] of specialistDocs) {
      const specialist = readFileSync(path, "utf8");
      expect(specialist).toContain(`axis=${axis} id=${id}`);
      expect(specialist).not.toContain("workflow_model: DESIGN_BOTTOMUP");
    }

    for (const [path, axis, id] of docs.slice(0, -1)) {
      const body = readFileSync(path, "utf8");
      expect(body).toContain(`axis=${axis} id=${id}`);
      expect(body).not.toContain("specialist_workflow:SCREEN_DESIGN");
    }
  });

  it("U-WMPA-004: Forward再入と証跡境界を各文書へ固定する", () => {
    for (const [path] of [...docs, ...specialistDocs]) {
      const body = readFileSync(path, "utf8");
      expect(body).toContain("Forward");
      expect(body).toContain("L1-L12");
      expect(body).toContain("registry");
      expect(body).toContain("evidence");
    }
  });

  it("U-WMPA-005: PLANは同一sliceの文書とoracleを生成物として束縛する", () => {
    const plan = readFileSync(
      "docs/plans/PLAN-REVERSE-565-workflow-model-process-typed-authority.md",
      "utf8",
    );
    expect(plan).toContain("github_issue_id: 206");
    expect(plan).toContain("status: confirmed");
    expect(plan).toContain("completion_claim_allowed: false");
    expect(plan).toContain("tests/process-workflow-model-authority.test.ts");
    for (const [path] of docs) expect(plan).toContain(path);
    for (const [path] of specialistDocs) expect(plan).toContain(path);
  });
});
