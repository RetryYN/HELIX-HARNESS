import { spawnSync } from "node:child_process";
import {
  linkSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { admitLiteConsumerCanaryArtifact } from "../src/setup/distribution-lite-consumer-canary";
import {
  buildLiteDistributionPackage,
  loadLiteDistributionDocuments,
} from "../src/setup/distribution-lite-package";

// PLAN-L7-657-distribution-lite-consumer-canary
// PLAN-L7-658-lite-consumer-distribution-docs
// U-DISTCAN-008: Windowsではnpm生成PowerShell shimを同一Node artifactへ接続する。

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
        source_repository: built.manifest.source_repository,
        source_head: built.manifest.source_head,
        requirements: built.manifest.requirements,
        profile: built.manifest.profile,
        package_version: built.manifest.package_version,
        distribution_repository: built.manifest.distribution_repository,
        artifact_set_digest: built.manifest.artifact_set_digest,
        prebuilt_node_artifact: built.manifest.prebuilt_node_artifact,
        distribution_documents: loadLiteDistributionDocuments(process.cwd()) ?? [],
        runtime_third_party_inputs: [],
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

  it("U-DISTDOC-006: document provenanceがreceiptと不一致なら拒否する", () => {
    const fixture = buildFixture();
    const expected = {
      ...fixture.input.expected,
      distribution_documents: fixture.input.expected.distribution_documents.map(
        (document, index) =>
          index === 0 ? { ...document, digest: `sha256:${"0".repeat(64)}` } : document,
      ),
    };
    expect(admitLiteConsumerCanaryArtifact({ ...fixture.input, expected })).toMatchObject({
      ok: false,
      failures: expect.arrayContaining(["manifest_identity_mismatch"]),
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

  it("U-DISTCAN-005: symlink／hardlink artifactをbytes read前に拒否する", () => {
    const linked = buildFixture();
    const physicalTarball = `${linked.input.tarball}.physical`;
    renameSync(linked.input.tarball, physicalTarball);
    symlinkSync(physicalTarball, linked.input.tarball);
    expect(admitLiteConsumerCanaryArtifact(linked.input)).toEqual({
      ok: false,
      failures: ["artifact_path_unsafe"],
    });

    const hardlinked = buildFixture();
    const hardlink = `${hardlinked.input.tarball}.hardlink`;
    linkSync(hardlinked.input.tarball, hardlink);
    expect(admitLiteConsumerCanaryArtifact({ ...hardlinked.input, tarball: hardlink })).toEqual({
      ok: false,
      failures: ["artifact_path_unsafe"],
    });
  });

  it("U-DISTCAN-006: fresh processでLinux consumer E2Eを検証する", () => {
    const fixture = buildFixture();
    expect(admitLiteConsumerCanaryArtifact(fixture.input).ok).toBe(true);
    const consumer = mkdtempSync(join(tmpdir(), "helix-lite-canary-consumer-"));
    roots.push(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      `${JSON.stringify({
        name: "lite-canary-consumer",
        private: true,
        scripts: {
          build:
            "node -e \"require('node:fs').mkdirSync('dist',{recursive:true});require('node:fs').writeFileSync('dist/consumer-build.txt','consumer-build-ok\\n')\"",
        },
      })}\n`,
      "utf8",
    );
    const install = spawnSync("npm", ["install", "--ignore-scripts", fixture.input.tarball], {
      cwd: consumer,
      encoding: "utf8",
      timeout: 60_000,
    });
    expect(install.status, install.stderr).toBe(0);
    const build = spawnSync("npm", ["run", "build"], {
      cwd: consumer,
      encoding: "utf8",
      timeout: 30_000,
    });
    expect(build.status, build.stderr).toBe(0);
    expect(readFileSync(join(consumer, "dist", "consumer-build.txt"), "utf8")).toBe(
      "consumer-build-ok\n",
    );
    const executable = join(
      consumer,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "helix.cmd" : "helix",
    );
    const commands = [
      ["setup", "project", "--dry-run", "--json"],
      ["setup", "project", "--json"],
      ["setup", "project", "--json"],
      ["status", "--json"],
      ["doctor", "--profile", "consumer", "--json"],
      ["codex", "--role", "se", "--task", "verify consumer", "--json"],
      ["completion", "decision-packet", "--json"],
      ["completion", "review-bundle", "--json"],
    ] as const;
    for (const argv of commands) {
      const run = spawnSync(executable, argv, { cwd: consumer, encoding: "utf8", timeout: 10_000 });
      expect(run.status, `${argv.join(" ")}\n${run.stderr}`).toBe(0);
      expect(JSON.parse(run.stdout)).toMatchObject({ ok: true });
    }
    const secondSetup = spawnSync(executable, ["setup", "project", "--json"], {
      cwd: consumer,
      encoding: "utf8",
      timeout: 10_000,
    });
    expect(JSON.parse(secondSetup.stdout)).toMatchObject({ ok: true, idempotent: true });
    const generatedCiInstall = spawnSync("npm", ["ci", "--ignore-scripts"], {
      cwd: consumer,
      encoding: "utf8",
      timeout: 60_000,
    });
    expect(generatedCiInstall.status, generatedCiInstall.stderr).toBe(0);
    const generatedCiDoctor = spawnSync(
      join(consumer, "node_modules", ".bin", process.platform === "win32" ? "helix.cmd" : "helix"),
      ["doctor", "--profile", "consumer", "--json"],
      { cwd: consumer, encoding: "utf8", timeout: 10_000 },
    );
    expect(generatedCiDoctor.status, generatedCiDoctor.stderr).toBe(0);
    expect(JSON.parse(generatedCiDoctor.stdout)).toMatchObject({ ok: true, failures: [] });
  });

  it("U-DISTCAN-008: 同一tarballのnpm PowerShell shimを起動する", () => {
    if (process.platform !== "win32") return;
    const fixture = buildFixture();
    const consumer = mkdtempSync(join(tmpdir(), "helix-lite-windows-consumer-"));
    roots.push(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      `${JSON.stringify({ name: "lite-windows-consumer", private: true })}\n`,
    );
    const install = spawnSync("npm", ["install", "--ignore-scripts", fixture.input.tarball], {
      cwd: consumer,
      encoding: "utf8",
      timeout: 60_000,
    });
    expect(install.status, install.stderr).toBe(0);
    const powershell = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        join(consumer, "node_modules", ".bin", "helix.ps1"),
        "--version",
      ],
      { cwd: consumer, encoding: "utf8", timeout: 10_000 },
    );
    expect(powershell.status, powershell.stderr).toBe(0);
    expect(powershell.stdout.trim()).toBe("0.1.0");
  });

  it("U-DISTCAN-010: development state／PLAN／credential pathをartifactへ混入させない", () => {
    const fixture = buildFixture();
    const forbidden = [
      /^\.helix(?:\/|$)/,
      /^docs\/plans(?:\/|$)/,
      /(?:^|\/)harness\.db$/,
      /(?:^|\/)(?:credential|credentials|secrets?)(?:\/|\.|$)/i,
      /^\/|^[A-Za-z]:[\\/]/,
    ];
    for (const path of fixture.built.manifest.artifact_paths) {
      expect(
        forbidden.some((pattern) => pattern.test(path)),
        path,
      ).toBe(false);
    }
    expect(fixture.built.manifest.artifact_paths).not.toContain("src/cli.ts");
    expect(fixture.built.manifest.artifact_paths).not.toContain("src/runtime/resident-lane.ts");
    expect(fixture.built.manifest.artifact_paths).not.toContain(
      "src/workflow/routing-allocation.ts",
    );
  });
});
