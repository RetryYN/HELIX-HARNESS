import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { selectLiteCanaryLane } from "../src/runtime/impact-ci";
import {
  loadDistributionCapabilityArtifactCatalog,
  projectDistributionArtifacts,
} from "../src/setup/distribution-artifact-projection";
import {
  analyzeDistributionDependencyClosure,
  LITE_CANARY_COVERAGE_PATHS,
  runLiteCanaryFastCheck,
} from "../src/setup/distribution-dependency-closure";
import { loadDistributionProfileCatalog } from "../src/setup/distribution-profile";

// PLAN-L7-682-lite-canary-ci-parallelization: U-DISTCLOSE-016..017.
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
  it("U-DISTCLOSE-015: Lite dependency closure設計登録をG3 freeze digestへ伝播する", () => {
    const designCatalogPath = "docs/design/design-catalog.yaml";
    const packet = readFileSync("docs/governance/l3-rebaseline-g3-freeze-packet.md", "utf8");
    const designCatalog = readFileSync(designCatalogPath, "utf8");
    const designCatalogDigest = createHash("sha256").update(designCatalog).digest("hex");

    expect(designCatalog).toContain(
      "docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md",
    );
    expect(packet).toContain(designCatalogDigest);
  });

  it("U-DISTCLOSE-000: entrypoint欠落をfalse greenにしない", () => {
    const root = fixture({});
    const result = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: [],
      sourcePaths: [],
      entrypoints: [],
    });
    expect(result.ok).toBe(false);
    expect(result.missing_paths).toEqual(["<entrypoint>"]);
  });

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
      entrypoints: [
        "src/setup/distribution-consumer-command-composition.ts",
        "src/setup/distribution-consumer-node-adapter.ts",
      ],
    });
    expect(closure).toMatchObject({
      ok: true,
      missing_paths: [],
      reachable_excluded_paths: [],
      unowned_dynamic_paths: [],
      unsafe_paths: [],
    });
  });

  it("U-DISTCLOSE-016: selector用fast checkはprofile／manifest／closureを同一HEADで検査する", () => {
    expect(
      runLiteCanaryFastCheck({ repoRoot: process.cwd(), candidateHead: "a".repeat(40) }),
    ).toEqual(
      expect.objectContaining({
        profile_ok: true,
        manifest_ok: true,
        closure_ok: true,
        source_head: expect.stringMatching(/^[0-9a-f]{40}$/),
        candidate_head: "a".repeat(40),
        path_read_failed: false,
      }),
    );
    const result = runLiteCanaryFastCheck({
      repoRoot: process.cwd(),
      candidateHead: "a".repeat(40),
    });
    expect(result.closure_paths).toEqual(expect.arrayContaining([...LITE_CANARY_COVERAGE_PATHS]));
  });

  it("U-DISTCLOSE-017: coverage sourceの欠落をfast checkのpath read failureへ倒す", () => {
    const root = fixture({});
    const result = runLiteCanaryFastCheck({ repoRoot: root, candidateHead: "a".repeat(40) });
    expect(result.path_read_failed).toBe(true);
    expect(result.closure_ok).toBe(false);
  });

  it("U-DISTCLOSE-018: coverage pathの推移import依存もskip closureへ含める", () => {
    const fastCheck = runLiteCanaryFastCheck({
      repoRoot: process.cwd(),
      candidateHead: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    });
    expect(fastCheck.closure_ok).toBe(true);
    for (const path of [
      "src/orchestration/durable-loop-epoch-node.ts",
      "src/setup/distribution-lite-consumer-canary.ts",
    ]) {
      expect(fastCheck.closure_paths, path).toContain(path);
      expect(
        selectLiteCanaryLane({
          event_name: "pull_request",
          ref_name: "feature/issue-1002",
          changed_paths: [path],
          change_kinds: [{ status: "M", path }],
          fast_check: fastCheck,
        }),
        path,
      ).toMatchObject({
        disposition: "required",
        skip_code: null,
        reason_codes: expect.arrayContaining(["changed_path_closure_contact"]),
      });
    }
  });

  it("U-DISTCLOSE-014: traversal／symlink sourceをrepo外read前にtyped拒否する", () => {
    const root = fixture({ "src/consumer.ts": "export {};" });
    const outside = fixture({ "outside.ts": "export const secret = true;" });
    symlinkSync(join(outside, "outside.ts"), join(root, "src", "linked.ts"));
    const result = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/linked.ts", "../outside.ts"],
      sourcePaths: ["src/linked.ts", "../outside.ts"],
      entrypoints: ["src/linked.ts", "../outside.ts"],
    });
    expect(result.ok).toBe(false);
    expect(result.unsafe_paths).toEqual(["../outside.ts", "src/linked.ts"]);
  });

  it("U-DISTCLOSE-014b: repo内を指すsymlinkもsource identityとして拒否する", () => {
    const root = fixture({ "src/consumer.ts": "export {};" });
    symlinkSync(join(root, "src", "consumer.ts"), join(root, "src", "linked.ts"));
    const result = analyzeDistributionDependencyClosure({
      repoRoot: root,
      artifactPaths: ["src/linked.ts"],
      sourcePaths: ["src/linked.ts"],
      entrypoints: ["src/linked.ts"],
    });
    expect(result.ok).toBe(false);
    expect(result.unsafe_paths).toEqual(["src/linked.ts"]);
  });

  it("U-DISTCLOSE-014c: Windows absoluteとlogical traversalをOS非依存で拒否する", () => {
    const root = fixture({
      "src/consumer.ts": "export {};",
      "C:/tmp/consumer.ts": "export {};",
    });
    for (const unsafePath of ["src/../src/consumer.ts", "C:\\tmp\\consumer.ts"]) {
      const result = analyzeDistributionDependencyClosure({
        repoRoot: root,
        artifactPaths: [unsafePath],
        sourcePaths: [unsafePath],
        entrypoints: [unsafePath],
      });
      expect(result.ok, unsafePath).toBe(false);
      expect(result.unsafe_paths, unsafePath).toContain(
        unsafePath.includes("..") ? "src/consumer.ts" : unsafePath.replaceAll("\\", "/"),
      );
    }
  });
});
