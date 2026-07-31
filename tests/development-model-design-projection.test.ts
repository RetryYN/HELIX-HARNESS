import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = {
  l4: readFileSync("docs/design/harness/L4-basic-design/function.md", "utf8"),
  pillar: readFileSync("docs/design/helix/L4-basic-design/pillar-basic-design.md", "utf8"),
  l6: readFileSync("docs/design/harness/L6-function-design/function-spec.md", "utf8"),
  rightArm: readFileSync("docs/process/forward/L08-L14-verification-phase.md", "utf8"),
  plan: readFileSync("docs/plans/PLAN-L4-56-development-model-design-projection.md", "utf8"),
} as const;

const styles = ["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"];

describe("AUTH-SURFACE-DESIGN-001", () => {
  it("projects the exact development style set into every current design boundary", () => {
    for (const [name, text] of Object.entries(files).filter(([name]) => name !== "plan")) {
      for (const style of styles) expect(text, `${name}:${style}`).toContain(style);
    }
  });

  it("keeps case-driven and specialist axes separate", () => {
    for (const text of [files.l4, files.pillar, files.l6, files.rightArm]) {
      expect(text).toMatch(/case[-_ ]driven/i);
      expect(text).toMatch(/specialist/i);
      expect(text).toMatch(/Design HARNESS/);
    }
    expect(files.l4).toContain("Discovery／PoCはScrumのphase、variant、内包要素ではない");
    expect(files.l4).toContain("S0 hypothesis → S1 experiment plan → S2 poc → S3 verify → S4 decide");
    expect(files.rightArm).toContain("Production ScrumのSprint Reviewにおけるinspect/adapt");
    expect(files.rightArm).not.toContain("inspect/adapt | S3 / S4");
  });

  it("defines typed L6 projection without inferring style from kind or route", () => {
    expect(files.l6).toContain("interface WorkflowAxisProjection");
    expect(files.l6).toContain("projectWorkflowAxes");
    expect(files.l6).toMatch(/`kind`.*development styleを推定しない/);
    expect(files.l6).not.toContain("Discovery/Scrum mode docs");
    expect(files.l6).toContain("routeProductionScrumSlice");
    expect(files.l6).toContain("Scrum sliceの完了へDiscovery／PoCのS4 decisionやReverse fullbackを無条件要求しない");
    expect(files.l6).toContain("analyzeWorkflowAxisDbRegistration");
    expect(files.l6).toContain("旧混在10種の存在をcurrent green条件にしない");
    expect(files.l6).toContain("Scrum GuideはProduction Scrum sliceのinspect/adapt matrixにだけ接続し");
    expect(files.l6).toContain("Discovery／PoC S4の必須sourceにしない");
    expect(files.l6).toContain("compatibility input alias: `routeScrumFullback`");
    expect(files.l6).not.toContain("| FR-L1-23 | `routeScrumFullback` |");
    expect(files.l6).not.toContain("必須 drive model 10 種");
  });

  it("keeps legacy names compatibility-only and current L1-L12 authoritative", () => {
    expect(files.l4).toContain("compatibility parserだけ");
    expect(files.pillar).toContain("旧L0-L14はcompatibility projectionへ隔離");
    expect(files.rightArm).toContain("compatibility layer／旧routeのgreenだけでcurrent L1〜L12 failureを相殺しない");
  });

  it("pins the atomic changed-path set", () => {
    const generated = [...files.plan.matchAll(/artifact_path:\s*([^,}\n]+)/g)].map((match) =>
      match[1]!.trim(),
    );
    expect(generated).toEqual([
      "docs/plans/PLAN-L4-56-development-model-design-projection.md",
      "docs/design/harness/L4-basic-design/function.md",
      "docs/design/helix/L4-basic-design/pillar-basic-design.md",
      "docs/design/harness/L6-function-design/function-spec.md",
      "docs/process/forward/L08-L14-verification-phase.md",
      "tests/development-model-design-projection.test.ts",
      "tests/l12-hybrid-recognition.test.ts",
      "tests/vmodel-pair.test.ts",
    ]);
  });
});
