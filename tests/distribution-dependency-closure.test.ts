import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { analyzeDistributionDependencyClosure } from "../src/setup/distribution-dependency-closure";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "helix-lite-closure-"));
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content, "utf8");
  }
  return root;
}

describe("PLAN-L7-653-distribution-lite-dependency-closure: Lite consumer dependency closure", () => {
  it("U-DISTCLOSE-001: exact static import closureが揃う場合だけgreen", () => {
    const root = fixture({
      "src/consumer.ts": 'export { value } from "./value";',
      "src/value.ts": "export const value = 1;",
    });
    const result = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/value.ts", "src/consumer.ts"],
      sourcePaths: ["src/consumer.ts", "src/value.ts"],
      entrypoints: ["src/consumer.ts"],
    });
    expect(result.ok).toBe(true);
    expect(result.visited_paths).toEqual(["src/consumer.ts", "src/value.ts"]);
  });

  it("U-DISTCLOSE-002: sourceに存在してもartifact ownership外のimportをfail-close", () => {
    const root = fixture({
      "src/consumer.ts": 'import "./excluded";',
      "src/excluded.ts": "export {};",
    });
    const result = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/consumer.ts"],
      sourcePaths: ["src/consumer.ts", "src/excluded.ts"],
      entrypoints: ["src/consumer.ts"],
    });
    expect(result.ok).toBe(false);
    expect(result.missing_paths).toEqual(["src/excluded.ts"]);
  });

  it("U-DISTCLOSE-003: dynamic importはexact asset ownershipも要求する", () => {
    const root = fixture({
      "src/consumer.ts": 'export const load = () => import("./adapter");',
      "src/adapter.ts": "export {};",
    });
    const blocked = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/consumer.ts", "src/adapter.ts"],
      sourcePaths: ["src/consumer.ts", "src/adapter.ts"],
      entrypoints: ["src/consumer.ts"],
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.unowned_dynamic_paths).toEqual(["src/adapter.ts"]);

    const admitted = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/consumer.ts", "src/adapter.ts"],
      sourcePaths: ["src/consumer.ts", "src/adapter.ts"],
      entrypoints: ["src/consumer.ts"],
      dynamicAssetPaths: ["src/adapter.ts"],
    });
    expect(admitted.ok).toBe(true);
  });

  it.todo(
    "U-DISTCLOSE-004: current consumer_core_v1 entrypointはmissing 0／excluded reachability 0になる",
  );
});
