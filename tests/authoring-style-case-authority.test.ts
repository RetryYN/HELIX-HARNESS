import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import { markdownFrontmatter } from "../src/lint/shared";

const skillPaths = [
  "docs/skills/poc.md",
  "docs/skills/design-tailoring.md",
  "docs/skills/api-and-interface-design.md",
  "docs/skills/documentation-and-adrs.md",
  "docs/skills/spec-driven-development.md",
  "docs/skills/acceptance-criteria-thinking.md",
  "docs/skills/research.md",
  "docs/skills/estimation.md",
] as const;
const templatePath = "docs/templates/plan/poc/template.md";
const planPath = "docs/plans/PLAN-L3-44-authoring-style-case-authority.md";

const skillTexts = skillPaths.map((path) => [path, readFileSync(path, "utf8")] as const);
const template = readFileSync(templatePath, "utf8");
const plan = readFileSync(planPath, "utf8");

const expectedStyles = ["FULL_L1_L12_V", "PRODUCTION_SCRUM", "V_DESIGN_SCRUM_IMPLEMENTATION"];

describe("authoring style / case-driven authority", () => {
  it("AUTH-AUTHOR-U-001: every scoped skill declares the exact current style set and separate case models", () => {
    for (const [path, text] of skillTexts) {
      const frontmatter = markdownFrontmatter(text);
      expect(frontmatter, path).not.toBeNull();
      const metadata = parseYaml(frontmatter ?? "") as {
        applies_to?: {
          development_styles?: string[];
          case_driven_models?: string[];
        };
      };
      expect(metadata.applies_to?.development_styles, path).toEqual(expectedStyles);
      expect(metadata.applies_to?.case_driven_models, path).toEqual(["Discovery", "PoC"]);
    }
  });

  it("AUTH-AUTHOR-U-002: current prose does not generate old Scrum-contained PoC guidance", () => {
    const current = [...skillTexts.map(([, text]) => text), template].join("\n");
    for (const legacy of [
      ["Scrum", "S2"].join(" "),
      ["Scrum", "S3"].join(" "),
      ["Discovery", "(Scrum)"].join(" "),
      ["Discovery", "Scrum"].join(" "),
      ["S0", "backlog"].join(" "),
      ["S1", "plan"].join(" "),
      ["PLAN", "SCRUM"].join("-"),
    ]) {
      expect(current).not.toContain(legacy);
    }
  });

  it("AUTH-AUTHOR-U-003: PoC guidance emits the case-driven sequence and connects S4 to any selected style", () => {
    const poc = skillTexts.find(([path]) => path === "docs/skills/poc.md")?.[1] ?? "";
    expect(poc).toContain("S0 hypothesis");
    expect(poc).toContain("S1 experiment plan");
    expect(poc).toContain("S2 poc");
    expect(poc).toContain("S3 verify");
    expect(poc).toContain("S4 decide");
    for (const style of expectedStyles) {
      expect(poc).toContain(style);
      expect(template).toContain(style);
    }
    expect(poc).toContain("PoC自体をdevelopment styleへ読み替えない");
  });

  it("AUTH-AUTHOR-U-004: PoC template does not emit Scrum-owned fields or Bun commands", () => {
    expect(template).not.toMatch(/^scrum_type:/m);
    expect(template.toLowerCase()).not.toContain("bun ");
    expect(template).toContain(
      "S0 hypothesis → S1 experiment plan → S2 poc → S3 verify → S4 decide",
    );
  });

  it("AUTH-AUTHOR-U-005: PLAN binds the exact contract and scope", () => {
    expect(plan).toContain("behavior_contract_id: AUTH-SURFACE-AUTHORING-001");
    expect(plan).toContain("responsibility_owner: development-model-authoring-surface");
    for (const path of [...skillPaths, templatePath]) {
      expect(plan).toContain(`artifact_path: ${path}`);
    }
  });
});
