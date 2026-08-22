import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMarkdownFrontmatter } from "../src/lint/shared";

const REVERSE_PATH =
  "docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md";
const FORWARD_PATHS = [
  "docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md",
  "docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md",
  "docs/plans/PLAN-L7-576-github-execution-episode-state.md",
  "docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md",
  "docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md",
] as const;

describe("Issue #205 typed workflow identity Reverse scope", () => {
  it("Reverse #559を5件のcanonical Forward PLAN exact setへ束縛する", () => {
    const reverse = parseMarkdownFrontmatter(readFileSync(REVERSE_PATH, "utf8"));
    if (!reverse) throw new Error(`frontmatter missing: ${REVERSE_PATH}`);
    expect(reverse.status).toBe("confirmed");
    expect(reverse.completion_claim_allowed).toBe(true);

    const dependencies = reverse.dependencies as Record<string, unknown>;
    const requires = dependencies.requires;
    const references = dependencies.references;
    expect(Array.isArray(requires)).toBe(true);
    expect(Array.isArray(references)).toBe(true);
    expect(requires).toEqual([...FORWARD_PATHS]);
    expect(
      (references as unknown[]).filter(
        (value): value is string =>
          typeof value === "string" && /^docs\/plans\/PLAN-L7-(569|57[5-8])-/.test(value),
      ),
    ).toEqual([...FORWARD_PATHS]);
    for (const path of FORWARD_PATHS) {
      expect(references).toContain(path);

      const forward = parseMarkdownFrontmatter(readFileSync(path, "utf8"));
      if (!forward) throw new Error(`frontmatter missing: ${path}`);
      expect(forward.status, path).toBe("confirmed");
      expect(forward.completion_claim_allowed, path).toBe(true);
      const forwardDependencies = forward.dependencies as Record<string, unknown>;
      expect(forwardDependencies.references, path).toContain(REVERSE_PATH);
    }
  });
});
