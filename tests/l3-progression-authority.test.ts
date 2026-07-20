import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  L3_PROGRESSION_AUTHORITY_MARKER,
  L3_PROGRESSION_BLOCKER_PATHS,
  verifyL3ProgressionAuthority,
} from "../src/lint/l3-progression-authority";
import { L3_PROGRESSION_REVIEWED_DIGESTS } from "../src/lint/l3-progression-reviewed-digests";

const AUTHORITY_PATH = "docs/governance/l3-progression-authority-rebaseline-2026-07-19.md";

describe("L3 progression authority rebaseline", () => {
  it("binds all 58 blocking inputs to one L12/hybrid authority", () => {
    expect(L3_PROGRESSION_BLOCKER_PATHS).toHaveLength(58);
    expect(new Set(L3_PROGRESSION_BLOCKER_PATHS).size).toBe(58);
    for (const path of L3_PROGRESSION_BLOCKER_PATHS) {
      const body = readFileSync(path, "utf8");
      expect(body, path).toContain(L3_PROGRESSION_AUTHORITY_MARKER);
      expect(body, path).toContain(AUTHORITY_PATH);
    }
    expect(Object.keys(L3_PROGRESSION_REVIEWED_DIGESTS).sort()).toEqual(
      [...L3_PROGRESSION_BLOCKER_PATHS].sort(),
    );
    expect(verifyL3ProgressionAuthority()).toEqual([]);
  });

  it("pins the L3 entry contract to canonical pairs and the hybrid runtime boundary", () => {
    const authority = readFileSync(AUTHORITY_PATH, "utf8");
    for (const pair of ["L1↔L12", "L2↔L11", "L3↔L10", "L4↔L9", "L5↔L8", "L6↔L7"]) {
      expect(authority).toContain(pair);
    }
    expect(authority).toContain("Python semantic core + TypeScript/Node transactional boundary");
    expect(authority).toContain(
      "Bunはhistorical evidenceとnegative detector vocabularyにだけ隔離し、active、fallback、rollbackのauthorityへ再昇格させない",
    );
  });

  it("adds canonical metadata to every legacy physical L0-L3 frontmatter artifact", () => {
    for (const path of L3_PROGRESSION_BLOCKER_PATHS) {
      const body = readFileSync(path, "utf8");
      if (!body.startsWith("---\n")) continue;
      const expected = /\/L0-|PLAN-L0-/.test(path)
        ? ["L1", "L12", "L0"]
        : /\/L1-|PLAN-L1-/.test(path)
          ? ["L2", "L11", "L1"]
          : /\/L2-|PLAN-L2-/.test(path)
            ? ["L2", "L11", "L2"]
            : /\/L3-|PLAN-L3-/.test(path)
              ? ["L3", "L10", "L3"]
              : null;
      expect(expected, `unclassified frontmatter path: ${path}`).not.toBeNull();
      const closing = body.indexOf("\n---\n", 4);
      expect(closing, path).toBeGreaterThan(0);
      const frontmatter = parse(body.slice(4, closing)) as Record<string, unknown>;
      expect(frontmatter.canonical_layer, path).toBe(expected![0]);
      expect(frontmatter.canonical_pair, path).toBe(expected![1]);
      expect(frontmatter.legacy_physical_layer, path).toBe(expected![2]);
    }
  });
});
