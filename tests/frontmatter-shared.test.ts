import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadPlanDocs, markdownFrontmatter, parseMarkdownFrontmatter } from "../src/lint/shared";

describe("frontmatter 単一正本 (PLAN-L7-433 Q1)", () => {
  it("U-FMSH-001: LF/CRLF を同じ mapping として抽出する", () => {
    const lf = "---\nplan_id: PLAN-L7-433-quality-sweep4-improvements\nstatus: draft\n---\nbody\n";
    const crlf = lf.replaceAll("\n", "\r\n");
    expect(markdownFrontmatter(crlf)).toBe(markdownFrontmatter(lf));
    expect(parseMarkdownFrontmatter(crlf)).toEqual(parseMarkdownFrontmatter(lf));
  });

  it("U-FMSH-002: delimiter欠落・途中delimiter・sequenceをfail-closeする", () => {
    expect(markdownFrontmatter("plan_id: X\n---\n")).toBeNull();
    expect(markdownFrontmatter("body\n---\nplan_id: X\n---\n")).toBeNull();
    expect(parseMarkdownFrontmatter("---\n- one\n- two\n---\n")).toBeNull();
  });

  it("U-FMSH-003: production extractor の定義は shared の1箇所だけ", () => {
    const productionFiles = [
      "src/lint/shared.ts",
      "src/assets/catalog.ts",
      "src/doctor/index.ts",
      "src/plan/lint.ts",
      "src/lint/branch-kind.ts",
      "src/lint/plan-descent.ts",
      "src/lint/plan-entry-routing.ts",
      "src/lint/skill-assignment.ts",
      "src/state-db/projection-writer.ts",
    ];
    const definitions = productionFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return [...source.matchAll(/(?:function|const)\s+markdownFrontmatter\b/g)].map(() => path);
    });
    expect(definitions).toEqual(["src/lint/shared.ts"]);
  });
});

describe("PLAN snapshot loader (PLAN-L7-433 Q3)", () => {
  it("U-PLDOC-001: PLAN-*.mdだけを安定順で一度のsnapshotとして読む", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-plan-docs-"));
    try {
      const dir = join(root, "docs", "plans");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "PLAN-Z.md"), "z");
      writeFileSync(join(dir, "PLAN-A.md"), "a");
      writeFileSync(join(dir, "README.md"), "ignore");
      writeFileSync(join(dir, "PLAN-B.txt"), "ignore");
      expect(loadPlanDocs(root)).toEqual([
        { file: "PLAN-A.md", content: "a" },
        { file: "PLAN-Z.md", content: "z" },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
