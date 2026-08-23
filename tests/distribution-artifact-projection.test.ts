import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  loadDistributionCapabilityArtifactCatalog,
  projectDistributionArtifacts,
} from "../src/setup/distribution-artifact-projection";
import type { DistributionProfile } from "../src/setup/distribution-profile";
import { loadDistributionProfileCatalog } from "../src/setup/distribution-profile";

// PLAN-L7-652-distribution-lite-artifact-projection — U-DISTART-001..004/U-DISTART-006
const profile = {
  profile_id: "consumer_core_v1",
  profile_version: "1.0.0",
  display_name: "HELIX-HARNESS-LITE",
  source_authority: {
    repository: "HELIX-HARNESS",
    refinement_contract_id: "DIST-LITE-FR-001",
    refinement_semantic_digest: `sha256:${"1".repeat(64)}`,
  },
  distribution_repository: "RetryYN/HELIX-HARNESS-DevOS",
  capability_allowlist: ["quality_gates", "consumer_setup_and_status"],
  capability_exclusions: ["resident_multi_runtime_lanes"],
  promotion_policy: { mode: "versioned_receipt_only", manual_edit_allowed: false },
  profile_digest: `sha256:${"2".repeat(64)}`,
} satisfies DistributionProfile;

function catalog(overrides: Record<string, unknown> = {}): unknown {
  return {
    schema_version: "helix-distribution-capability-artifact-catalog.v1",
    capabilities: [
      {
        capability_id: "quality_gates",
        disposition: "consumer_safe",
        artifact_paths: ["src/doctor.ts", "tests/doctor.test.ts"],
      },
      {
        capability_id: "consumer_setup_and_status",
        disposition: "consumer_safe",
        artifact_paths: ["src/setup/index.ts"],
      },
      {
        capability_id: "resident_multi_runtime_lanes",
        disposition: "excluded",
        artifact_paths: [],
      },
    ],
    ...overrides,
  };
}

const sourcePaths = ["src/doctor.ts", "tests/doctor.test.ts", "src/setup/index.ts"];

describe("Lite capability-to-artifact projection", () => {
  it("U-DISTART-001: allowlist capabilityを決定的なexact artifact setへ投影する", () => {
    const first = projectDistributionArtifacts({
      profile,
      catalog: catalog(),
      source_paths: sourcePaths,
    });
    const second = projectDistributionArtifacts({
      profile,
      catalog: catalog(),
      source_paths: [...sourcePaths].reverse(),
    });
    expect(first).toMatchObject({
      ok: true,
      artifact_paths: ["src/doctor.ts", "src/setup/index.ts", "tests/doctor.test.ts"],
      failures: [],
    });
    expect(second.artifact_set_digest).toBe(first.artifact_set_digest);
  });

  it("U-DISTART-002: unknown／missing／excluded capabilityをfail-closeする", () => {
    const unknown = { ...profile, capability_allowlist: ["unknown_capability"] };
    expect(
      projectDistributionArtifacts({
        profile: unknown,
        catalog: catalog(),
        source_paths: sourcePaths,
      }).failures,
    ).toContain("capability_unknown");

    const missing = structuredClone(catalog()) as { capabilities: Array<Record<string, unknown>> };
    missing.capabilities[0].artifact_paths = [];
    expect(
      projectDistributionArtifacts({ profile, catalog: missing, source_paths: sourcePaths })
        .failures,
    ).toContain("capability_missing_artifacts");

    const excluded = { ...profile, capability_allowlist: ["resident_multi_runtime_lanes"] };
    expect(
      projectDistributionArtifacts({
        profile: excluded,
        catalog: catalog(),
        source_paths: sourcePaths,
      }).failures,
    ).toContain("excluded_capability_selected");
  });

  it("U-DISTART-003: duplicate／absolute／development state／credential pathを拒否する", () => {
    const invalid = structuredClone(catalog()) as { capabilities: Array<Record<string, unknown>> };
    invalid.capabilities[0].artifact_paths = [
      "src/setup/index.ts",
      "/tmp/escape",
      "foo/../../bar",
      ".helix/memory/harness.jsonl",
      "fixtures/credentials/token.json",
    ];
    expect(
      projectDistributionArtifacts({
        profile,
        catalog: invalid,
        source_paths: [
          ...sourcePaths,
          "/tmp/escape",
          "../bar",
          ".helix/memory/harness.jsonl",
          "fixtures/credentials/token.json",
        ],
      }).failures,
    ).toEqual(
      expect.arrayContaining([
        "artifact_path_duplicate",
        "artifact_path_absolute",
        "artifact_path_forbidden",
      ]),
    );
  });

  it("U-DISTART-003a: Linux上でもWindows absolute pathを独立して拒否する", () => {
    const windowsAbsolute = structuredClone(catalog()) as {
      capabilities: Array<Record<string, unknown>>;
    };
    windowsAbsolute.capabilities[0].artifact_paths = ["C:\\temp\\escape"];
    expect(
      projectDistributionArtifacts({
        profile,
        catalog: windowsAbsolute,
        source_paths: [...sourcePaths, "C:/temp/escape"],
      }).failures,
    ).toEqual(["artifact_path_absolute"]);
  });

  it("U-DISTART-003b: 拡張子付きcredential filenameを各入力で独立して拒否する", () => {
    for (const forbiddenPath of [
      "fixtures/token.json",
      "fixtures/private-key.pem",
      ".env.production",
    ]) {
      const credentialFile = structuredClone(catalog()) as {
        capabilities: Array<Record<string, unknown>>;
      };
      credentialFile.capabilities[0].artifact_paths = [forbiddenPath];
      expect(
        projectDistributionArtifacts({
          profile,
          catalog: credentialFile,
          source_paths: [...sourcePaths, forbiddenPath],
        }).failures,
      ).toEqual(["artifact_path_forbidden"]);
    }
  });

  it("U-DISTART-003c: 非選択capabilityを含むcatalog全entry間のpath重複を拒否する", () => {
    const crossCapabilityDuplicate = structuredClone(catalog()) as {
      capabilities: Array<Record<string, unknown>>;
    };
    crossCapabilityDuplicate.capabilities[2].artifact_paths = ["src/doctor.ts"];
    expect(
      projectDistributionArtifacts({
        profile,
        catalog: crossCapabilityDuplicate,
        source_paths: sourcePaths,
      }).failures,
    ).toContain("artifact_path_duplicate");
  });

  it("U-DISTART-004: catalog不正とsource欠落を別failureで拒否する", () => {
    expect(
      projectDistributionArtifacts({ profile, catalog: {}, source_paths: sourcePaths }).failures,
    ).toContain("catalog_invalid");
    expect(
      projectDistributionArtifacts({ profile, catalog: catalog(), source_paths: ["src/doctor.ts"] })
        .failures,
    ).toContain("artifact_source_missing");
  });

  it("U-DISTART-006: current consumer_core_v1の全capabilityをtracked sourceへ解決する", () => {
    const currentProfile = loadDistributionProfileCatalog(process.cwd()).catalog?.profiles[0];
    expect(currentProfile).toBeDefined();
    const currentCatalog = loadDistributionCapabilityArtifactCatalog(process.cwd());
    const catalogPaths = (
      currentCatalog as { capabilities: Array<{ artifact_paths: string[] }> }
    ).capabilities.flatMap((entry) => entry.artifact_paths);
    expect(catalogPaths.every((path) => existsSync(path))).toBe(true);
    const result = projectDistributionArtifacts({
      profile: currentProfile as DistributionProfile,
      catalog: currentCatalog,
      source_paths: catalogPaths,
    });
    expect(result).toMatchObject({ ok: true, failures: [], profile_id: "consumer_core_v1" });
    expect(result.artifact_paths.length).toBeGreaterThan(40);
  });
});
