import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  loadDistributionCapabilityArtifactCatalog,
  projectDistributionArtifacts,
} from "../src/setup/distribution-artifact-projection";
import { analyzeDistributionDependencyClosure } from "../src/setup/distribution-dependency-closure";
import { loadDistributionProfileCatalog } from "../src/setup/distribution-profile";

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

  it("U-DISTCLOSE-005: owned sourceでもexcluded capability artifactへの到達を拒否する", () => {
    const root = fixture({
      "src/consumer.ts": 'import "./resident-lane";',
      "src/resident-lane.ts": "export {};",
    });
    const result = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/consumer.ts", "src/resident-lane.ts"],
      sourcePaths: ["src/consumer.ts", "src/resident-lane.ts"],
      entrypoints: ["src/consumer.ts"],
      excludedArtifactPaths: ["src/resident-lane.ts"],
    });
    expect(result.ok).toBe(false);
    expect(result.missing_paths).toEqual([]);
    expect(result.reachable_excluded_paths).toEqual(["src/resident-lane.ts"]);
  });

  it("U-DISTCLOSE-004: current consumer_core_v1 entrypointはmissing 0／excluded reachability 0になる", () => {
    const sourcePaths = execFileSync("git", ["ls-files"], { encoding: "utf8" }).trim().split("\n");
    const profileResult = loadDistributionProfileCatalog(process.cwd());
    const profile = profileResult.catalog?.profiles.find(
      (candidate) => candidate.profile_id === "consumer_core_v1",
    );
    expect(profileResult.ok).toBe(true);
    expect(profile).toBeDefined();
    if (!profile) return;
    const projection = projectDistributionArtifacts({
      profile,
      catalog: loadDistributionCapabilityArtifactCatalog(process.cwd()),
      source_paths: sourcePaths,
    });
    expect(projection.ok).toBe(true);
    expect(projection.artifact_paths).not.toContain("src/cli.ts");
    expect(projection.artifact_paths).not.toContain("src/doctor/index.ts");
    const closure = analyzeDistributionDependencyClosure({
      repoRoot: process.cwd(),
      artifactPaths: projection.artifact_paths,
      sourcePaths,
      entrypoints: ["src/setup/distribution-consumer-entrypoint.ts"],
    });
    expect(closure).toMatchObject({
      ok: true,
      missing_paths: [],
      reachable_excluded_paths: [],
      unowned_dynamic_paths: [],
    });
  });

  // PLAN-L7-657-distribution-lite-consumer-canary — U-DISTCANARY-014
  it("U-DISTCANARY-014: Lite consumer canaryは専用entrypointへ閉じる", () => {
    const catalog = loadDistributionCapabilityArtifactCatalog(process.cwd()) as {
      capabilities?: Array<{ capability_id?: string; artifact_paths?: string[] }>;
    };
    const consumer = catalog.capabilities?.find(
      (capability) => capability.capability_id === "consumer_setup_and_status",
    );
    expect(consumer?.artifact_paths).toContain("src/setup/distribution-consumer-entrypoint.ts");
    expect(consumer?.artifact_paths).not.toContain("src/cli.ts");
  });
});
