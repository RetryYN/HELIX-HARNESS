import { spawnSync } from "node:child_process";
import {
  cpSync,
  linkSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import {
  admitLiteConsumerCanaryArtifact,
  type LiteConsumerCanaryExpectedIdentity,
} from "../src/setup/distribution-lite-consumer-canary";
import {
  buildLiteDistributionPackage,
  loadLiteDistributionDocuments,
} from "../src/setup/distribution-lite-package";

// PLAN-L7-657-distribution-lite-consumer-canary
// PLAN-L7-658-lite-consumer-distribution-docs
// U-DISTCAN-008: Windowsではnpm生成PowerShell shimを同一Node artifactへ接続する。

const roots: string[] = [];
let cleanSourceFixture: string | null = null;

function isDistributionDocuments(
  value: unknown,
): value is LiteConsumerCanaryExpectedIdentity["distribution_documents"] {
  return (
    Array.isArray(value) &&
    value.every(
      (document) =>
        document !== null &&
        typeof document === "object" &&
        typeof document.path === "string" &&
        typeof document.source_path === "string" &&
        typeof document.digest === "string" &&
        /^sha256:[0-9a-f]{64}$/.test(document.digest) &&
        (document.classification === "first_party" ||
          document.classification === "third_party_notice"),
    )
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

afterAll(() => {
  if (cleanSourceFixture) rmSync(cleanSourceFixture, { recursive: true, force: true });
});

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function cleanCurrentSourceRoot(): string {
  if (cleanSourceFixture) return join(cleanSourceFixture, "repo");
  cleanSourceFixture = mkdtempSync(join(tmpdir(), "helix-lite-canary-clean-source-"));
  const sourceRoot = join(cleanSourceFixture, "repo");
  const clone = spawnSync("git", ["clone", "--shared", process.cwd(), sourceRoot], {
    encoding: "utf8",
  });
  if (clone.status !== 0) throw new Error(`clean canary source clone failed: ${clone.stderr}`);
  const remote = spawnSync(
    "git",
    ["remote", "set-url", "origin", "https://github.com/RetryYN/HELIX-HARNESS"],
    { cwd: sourceRoot, encoding: "utf8" },
  );
  if (remote.status !== 0) throw new Error(`clean canary source remote failed: ${remote.stderr}`);
  return sourceRoot;
}

function buildFixture() {
  const out = mkdtempSync(join(tmpdir(), "helix-lite-canary-artifact-"));
  roots.push(out);
  const externalReceipt = process.env.HELIX_LITE_CANARY_RECEIPT;
  const built = externalReceipt
    ? (() => {
        const receipt = JSON.parse(readFileSync(externalReceipt, "utf8")) as ReturnType<
          typeof buildLiteDistributionPackage
        >;
        if (!receipt.ok || !("paths" in receipt) || !receipt.output_digests) {
          throw new Error("external canary receipt invalid");
        }
        if (
          !receipt.manifest.profile ||
          !receipt.manifest.prebuilt_node_artifact ||
          !isDistributionDocuments(receipt.manifest.distribution_documents) ||
          !isStringArray(receipt.manifest.runtime_third_party_inputs)
        ) {
          throw new Error("external canary identity invalid");
        }
        const sourceRoot = dirname(externalReceipt);
        const sourcePaths = {
          tarball: join(sourceRoot, basename(receipt.paths.tarball)),
          checksum: join(sourceRoot, basename(receipt.paths.checksum)),
          manifest: join(sourceRoot, basename(receipt.paths.manifest)),
        };
        const externalAdmission = admitLiteConsumerCanaryArtifact({
          ...sourcePaths,
          expected: {
            source_repository: receipt.manifest.source_repository,
            source_head: receipt.manifest.source_head,
            requirements: receipt.manifest.requirements,
            profile: receipt.manifest.profile,
            package_version: receipt.manifest.package_version,
            distribution_repository: receipt.manifest.distribution_repository,
            artifact_set_digest: receipt.manifest.artifact_set_digest,
            prebuilt_node_artifact: receipt.manifest.prebuilt_node_artifact,
            distribution_documents: receipt.manifest.distribution_documents,
            runtime_third_party_inputs: receipt.manifest.runtime_third_party_inputs,
            output_digests: receipt.output_digests,
          },
        });
        if (!externalAdmission.ok) throw new Error("external canary artifact rejected");
        const paths = {
          tarball: join(out, basename(receipt.paths.tarball)),
          checksum: join(out, basename(receipt.paths.checksum)),
          manifest: join(out, basename(receipt.paths.manifest)),
        };
        for (const key of ["tarball", "checksum", "manifest"] as const) {
          cpSync(sourcePaths[key], paths[key]);
        }
        return { ...receipt, paths };
      })()
    : buildLiteDistributionPackage({
        repo_root: cleanCurrentSourceRoot(),
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
    external_receipt: externalReceipt !== undefined,
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
    if (process.env.CI) expect(fixture.external_receipt).toBe(true);
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
    const entrypoint = join(consumer, "node_modules", ".bin", "helix.ps1");
    const commands = [
      ["--version"],
      ["setup", "project", "--dry-run", "--json"],
      ["setup", "project", "--json"],
      ["status", "--json"],
      ["doctor", "--profile", "consumer", "--json"],
      ["codex", "--role", "se", "--task", "verify windows consumer", "--json"],
    ] as const;
    for (const argv of commands) {
      const powershell = spawnSync(
        "powershell.exe",
        ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", entrypoint, ...argv],
        { cwd: consumer, encoding: "utf8", timeout: 10_000 },
      );
      expect(powershell.status, `${argv.join(" ")}\n${powershell.stderr}`).toBe(0);
      if (argv[0] === "--version") expect(powershell.stdout.trim()).toBe("0.1.0");
      else expect(JSON.parse(powershell.stdout)).toMatchObject({ ok: true });
    }
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
