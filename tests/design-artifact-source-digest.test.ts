import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDesignArtifactSourceDigest,
  DESIGN_ARTIFACT_SOURCE_DIGEST_SCHEMA_VERSION,
  type DesignArtifactSourceDigestBaseline,
  type DesignArtifactSourceDigestBaselineEntry,
  INITIAL_DESIGN_ARTIFACT_SOURCE_DIGEST_BASELINE,
} from "../src/lint/design-artifact-source-digest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";

const MARKER = "<!-- HELIX:design-reality-binding:v1 -->";

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-design-artifact-digest-"));
  mkdirSync(join(root, "docs/design/helix/L6-function-design"), { recursive: true });
  mkdirSync(join(root, "src/runtime"), { recursive: true });
  mkdirSync(join(root, "config"), { recursive: true });
  return root;
}

function baseline(
  entries: DesignArtifactSourceDigestBaselineEntry[],
): DesignArtifactSourceDigestBaseline {
  const sorted = [...entries].sort((left, right) =>
    `${left.design_path}\u0000${left.artifact_path}\u0000${left.pinned_digest}`.localeCompare(
      `${right.design_path}\u0000${right.artifact_path}\u0000${right.pinned_digest}`,
    ),
  );
  return {
    schema_version: DESIGN_ARTIFACT_SOURCE_DIGEST_SCHEMA_VERSION,
    entries: sorted,
    baseline_digest: sha256Digest(canonicalJson(sorted)),
  };
}

function writeDesign(
  root: string,
  designPath: string,
  artifactPath: string,
  pinnedDigest: string,
  currentAuthority = true,
): void {
  const designAbsolute = join(root, designPath);
  const artifactAbsolute = join(root, artifactPath);
  mkdirSync(join(designAbsolute, ".."), { recursive: true });
  mkdirSync(join(artifactAbsolute, ".."), { recursive: true });
  writeFileSync(
    designAbsolute,
    `${MARKER}\n\`\`\`json\n${JSON.stringify(
      {
        schema_version: "helix-design-reality-binding.v1",
        assets: [
          {
            asset_id: "fixture-asset",
            classification: "existing_runtime",
            artifact_path: artifactPath,
            resource_kind: "typescript_export",
            resource_name: "fixtureProbe",
            source_digest: pinnedDigest,
            current_authority: currentAuthority,
          },
        ],
        declared_failure_codes: [],
        failure_reachability: [],
      },
      null,
      2,
    )}\n\`\`\`\n`,
  );
  writeFileSync(
    join(root, artifactPath),
    'export function fixtureProbe(): string { return "ok"; }\n',
  );
}

describe("design artifact source digest gate", () => {
  it("U-DASD-001: current authority pinと実ファイルdigest一致を受理する", () => {
    const root = fixtureRoot();
    try {
      const artifact = 'export function fixtureProbe(): string { return "ok"; }\n';
      writeDesign(
        root,
        "docs/design/helix/L6-function-design/fixture.md",
        "src/runtime/fixture.ts",
        sha256Digest(artifact),
      );
      const result = analyzeDesignArtifactSourceDigest(root, {
        designFiles: ["docs/design/helix/L6-function-design/fixture.md"],
        baseline: baseline([]),
      });
      expect(result).toMatchObject({
        ok: true,
        pins_checked: 1,
        stale_count: 0,
        baseline_debt: 0,
        new_stale_count: 0,
        findings: [],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DASD-002: baseline外のdigest driftをfail-closeする", () => {
    const root = fixtureRoot();
    try {
      writeDesign(
        root,
        "docs/design/helix/L6-function-design/fixture.md",
        "src/runtime/fixture.ts",
        `sha256:${"0".repeat(64)}`,
      );
      const result = analyzeDesignArtifactSourceDigest(root, {
        designFiles: ["docs/design/helix/L6-function-design/fixture.md"],
        baseline: baseline([]),
      });
      expect(result.ok).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({ reason: "design_artifact_source_digest_drift" }),
      );
      expect(result.new_stale_count).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DASD-003: 既知baseline debtは可視化しつつ新規failureにしない", () => {
    const root = fixtureRoot();
    try {
      const known = INITIAL_DESIGN_ARTIFACT_SOURCE_DIGEST_BASELINE[1];
      writeDesign(root, known.design_path, known.artifact_path, known.pinned_digest);
      const result = analyzeDesignArtifactSourceDigest(root, {
        designFiles: [known.design_path],
        baseline: baseline([known]),
      });
      expect(result).toMatchObject({ ok: true, pins_checked: 1, stale_count: 1, baseline_debt: 1 });
      expect(result.new_stale_count).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DASD-004: pin先欠落をbaselineに関係なく拒否する", () => {
    const root = fixtureRoot();
    try {
      const designPath = "docs/design/helix/L6-function-design/fixture.md";
      const artifactPath = "src/runtime/missing.ts";
      const designAbsolute = join(root, designPath);
      writeFileSync(
        designAbsolute,
        `${MARKER}\n\`\`\`json\n${JSON.stringify({
          schema_version: "helix-design-reality-binding.v1",
          assets: [
            {
              asset_id: "missing",
              classification: "existing_runtime",
              artifact_path: artifactPath,
              resource_kind: "typescript_export",
              resource_name: "missing",
              source_digest: `sha256:${"1".repeat(64)}`,
              current_authority: true,
            },
          ],
          declared_failure_codes: [],
          failure_reachability: [],
        })}\n\`\`\`\n`,
      );
      const result = analyzeDesignArtifactSourceDigest(root, {
        designFiles: [designPath],
        baseline: baseline([]),
      });
      expect(result.ok).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({ reason: "design_artifact_path_missing", detail: artifactPath }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DASD-005: current_authority=falseはhistorical projectionとして対象外にする", () => {
    const root = fixtureRoot();
    try {
      writeDesign(
        root,
        "docs/design/helix/L6-function-design/fixture.md",
        "src/runtime/fixture.ts",
        `sha256:${"0".repeat(64)}`,
        false,
      );
      const result = analyzeDesignArtifactSourceDigest(root, {
        designFiles: ["docs/design/helix/L6-function-design/fixture.md"],
        baseline: baseline([]),
      });
      expect(result).toMatchObject({ ok: true, pins_checked: 0, stale_count: 0, findings: [] });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DASD-006: baselineへの新規fingerprint追加を拒否する", () => {
    const root = fixtureRoot();
    try {
      const entry: DesignArtifactSourceDigestBaselineEntry = {
        design_path: "docs/design/helix/L6-function-design/new.md",
        artifact_path: "src/runtime/new.ts",
        pinned_digest: `sha256:${"2".repeat(64)}`,
      };
      const result = analyzeDesignArtifactSourceDigest(root, {
        designFiles: [],
        baseline: baseline([entry]),
      });
      expect(result.ok).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({ reason: "baseline_expanded" }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
