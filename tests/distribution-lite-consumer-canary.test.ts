import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { admitLiteConsumerCanaryArtifact } from "../src/setup/distribution-lite-consumer-canary";
import { buildLiteDistributionPackage } from "../src/setup/distribution-lite-package";

// PLAN-L7-657-distribution-lite-consumer-canary

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function buildFixture() {
  const out = mkdtempSync(join(tmpdir(), "helix-lite-canary-artifact-"));
  roots.push(out);
  const built = buildLiteDistributionPackage({
    repo_root: process.cwd(),
    out_dir: out,
    profile_id: "consumer_core_v1",
  });
  expect(built.ok).toBe(true);
  if (!built.ok || !("output_digests" in built) || !built.output_digests) {
    throw new Error("fixture build failed");
  }
  if (!built.manifest.profile) throw new Error("fixture profile identity missing");
  if (!built.manifest.prebuilt_node_artifact) {
    throw new Error("fixture prebuilt Node artifact identity missing");
  }
  return {
    built,
    input: {
      ...built.paths,
      expected: {
        source_head: built.manifest.source_head,
        requirements: built.manifest.requirements,
        profile: built.manifest.profile,
        package_version: built.manifest.package_version,
        distribution_repository: built.manifest.distribution_repository,
        artifact_set_digest: built.manifest.artifact_set_digest,
        prebuilt_node_artifact: built.manifest.prebuilt_node_artifact,
        output_digests: built.output_digests,
      },
    },
  };
}

describe("PLAN-L7-657: Lite clean consumer canary admission", () => {
  it("U-DISTCAN-001: builder receiptと三成果物を同一identityへ束縛する", () => {
    const fixture = buildFixture();
    expect(admitLiteConsumerCanaryArtifact(fixture.input)).toMatchObject({
      ok: true,
      source_head: fixture.built.manifest.source_head,
      profile_id: "consumer_core_v1",
      tarball_digest: fixture.built.manifest.tarball_digest,
      artifact_paths: fixture.built.manifest.artifact_paths,
    });
  });

  it("U-DISTCAN-002: artifact 1 byte差替えを展開前に拒否する", () => {
    const fixture = buildFixture();
    writeFileSync(
      fixture.input.tarball,
      Buffer.concat([readFileSync(fixture.input.tarball), Buffer.from([0])]),
    );
    expect(admitLiteConsumerCanaryArtifact(fixture.input)).toMatchObject({
      ok: false,
      failures: expect.arrayContaining(["artifact_digest_mismatch"]),
    });
  });

  it("U-DISTCAN-003: checksum driftを独立failureとして拒否する", () => {
    const fixture = buildFixture();
    const forged = { ...fixture.input.expected };
    writeFileSync(fixture.input.checksum, `${"0".repeat(64)}  fake.tar.gz\n`, "utf8");
    forged.output_digests = {
      ...forged.output_digests,
      checksum: `sha256:${"0".repeat(64)}`,
    };
    const result = admitLiteConsumerCanaryArtifact({ ...fixture.input, expected: forged });
    expect(result).toMatchObject({
      ok: false,
      failures: expect.arrayContaining(["artifact_digest_mismatch", "checksum_invalid"]),
    });
  });

  it("U-DISTCAN-004: 別HEAD／別profile receiptをfail-closeする", () => {
    const fixture = buildFixture();
    for (const expected of [
      { ...fixture.input.expected, source_head: "f".repeat(40) },
      {
        ...fixture.input.expected,
        profile: { ...fixture.input.expected.profile, id: "forged_profile" },
      },
    ]) {
      expect(admitLiteConsumerCanaryArtifact({ ...fixture.input, expected })).toMatchObject({
        ok: false,
        failures: expect.arrayContaining(["manifest_identity_mismatch"]),
      });
    }
  });
});
