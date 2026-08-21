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

function frontmatter(path: string): Record<string, unknown> {
  const parsed = parseMarkdownFrontmatter(readFileSync(path, "utf8"));
  if (!parsed) throw new Error(`frontmatter missing: ${path}`);
  return parsed;
}

function stringList(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${label} must be a string array`);
  }
  return value;
}

describe("Issue #205 typed workflow identity terminal convergence", () => {
  it("5件のForward PLANを同じReverse backfillへ双方向接続する", () => {
    const reverse = frontmatter(REVERSE_PATH);
    expect(reverse.status).toBe("confirmed");
    expect(reverse.completion_claim_allowed).toBe(true);

    const reverseDependencies = reverse.dependencies as Record<string, unknown>;
    const reverseRequires = stringList(reverseDependencies.requires, "Reverse requires");
    const reverseReferences = stringList(reverseDependencies.references, "Reverse references");

    for (const path of FORWARD_PATHS) {
      expect(reverseRequires).toContain(path);
      expect(reverseReferences).toContain(path);

      const forward = frontmatter(path);
      expect(forward.status).toBe("confirmed");
      expect(forward.backfill_state).toBe("complete");
      expect(forward.completion_claim_allowed).toBe(true);

      const dependencies = forward.dependencies as Record<string, unknown>;
      expect(stringList(dependencies.requires, `${path} requires`)).toContain(REVERSE_PATH);
    }
  });
});
