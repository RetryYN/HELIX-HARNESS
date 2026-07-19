import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertCanonicalReuseAllowed,
  CANONICAL_REUSE_AUTHORITY_PATH,
  CANONICAL_REUSE_BLOCKED_PATHS,
} from "../src/lint/canonical-reuse-authority";
import { lintPlanGate } from "../src/plan/lint";

describe("downstream canonical reuse authority", () => {
  it("fail-closes every known active old-authority PLAN/test-design", () => {
    expect(new Set(CANONICAL_REUSE_BLOCKED_PATHS).size).toBe(CANONICAL_REUSE_BLOCKED_PATHS.length);
    for (const path of CANONICAL_REUSE_BLOCKED_PATHS) {
      expect(existsSync(path), path).toBe(true);
      expect(() => assertCanonicalReuseAllowed(path), path).toThrow(/authority delta/);
    }
    expect(() =>
      assertCanonicalReuseAllowed(`/workspace/HELIX-HARNESS/${CANONICAL_REUSE_BLOCKED_PATHS[0]}`),
    ).toThrow(/authority delta/);
    expect(() => assertCanonicalReuseAllowed("docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md")).not.toThrow();
  });

  it("pins the only release mapping to L1-L12 and the hybrid runtime", () => {
    const authority = readFileSync(CANONICAL_REUSE_AUTHORITY_PATH, "utf8");
    for (const mapping of ["L1↔L12", "L2↔L11", "L3↔L10", "G12 evidence component"]) {
      expect(authority).toContain(mapping);
    }
    expect(authority).toContain("Python semantic core + TypeScript/Node transactional boundary");
    expect(authority).toContain("単なるstatus=confirmed/completed、旧テストgreen、marker追記だけでは解除しない");
  });

  it("blocks targeted PLAN lint before an old active PLAN can be reused", () => {
    const result = lintPlanGate({
      gate: "governance",
      path: "docs/plans/PLAN-L3-00-master.md",
    });
    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("canonical reuse blocked pending authority delta");
  });
});
