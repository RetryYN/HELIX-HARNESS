import { spawnSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildLiteDistributionPackage,
  resolveLiteRequirementsIdentity,
} from "../src/setup/distribution-lite-package";
import {
  createDeterministicDistributionPackage,
  type DistributionPackageIdentity,
} from "../src/setup/distribution-package-builder";
import { canonicalJson, sha256Digest } from "../src/shared/canonical-digest";
import { ensureCliBundle } from "./tools/cli-bundle";

// PLAN-L7-656-distribution-lite-profile-bound-package
// U-DISTPKG-001 U-DISTPKG-002 U-DISTPKG-003 U-DISTPKG-004
// U-DISTPKG-005 U-DISTPKG-006 U-DISTPKG-007

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-lite-package-"));
  roots.push(root);
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "src", "entry.ts"), "export const value = 1;\n", "utf8");
  return root;
}

const identity: DistributionPackageIdentity = {
  source_head: "a".repeat(40),
  requirements: { version: "1.3.13", root_digest: `sha256:${"b".repeat(64)}` },
  profile: {
    id: "consumer_core_v1",
    version: "1.0.0",
    digest: `sha256:${"c".repeat(64)}`,
  },
  package_version: "0.1.0",
  distribution_repository: "RetryYN/HELIX-HARNESS-DevOS",
  artifact_set_digest: sha256Digest(canonicalJson(["src/entry.ts"])),
};

describe("PLAN-L7-656: Lite profile-bound deterministic package", () => {
  it("U-DISTPKG-001: profile未指定ではarchive write前に拒否する", () => {
    const sourceRoot = fixture();
    const outDir = join(sourceRoot, "out");
    const missing = buildLiteDistributionPackage({
      repo_root: sourceRoot,
      out_dir: outDir,
      profile_id: null,
    });
    expect(missing).toMatchObject({ ok: false, failures: ["profile_required"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-002: artifact gate redではarchive write前に拒否する", () => {
    const sourceRoot = fixture();
    const outDir = join(sourceRoot, "out");
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity: { ...identity, artifact_set_digest: `sha256:${"0".repeat(64)}` },
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_set_digest_mismatch"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-003: manifestをsource／requirements／profile／package／artifact identityへ束縛する", () => {
    const sourceRoot = fixture();
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out"),
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    expect(result.ok).toBe(true);
    expect(result.manifest).toMatchObject(identity);
    expect(result.manifest.tarball_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result.manifest.checksum).toBe("lite.tar.gz.sha256");
  });

  it("U-DISTPKG-004: 独立2 buildのtarball／manifest／checksum digestが一致する", () => {
    const sourceRoot = fixture();
    const first = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out-a"),
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    const second = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out-b"),
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    expect(second.output_digests).toEqual(first.output_digests);
  });

  it("U-DISTPKG-005: 1 byte mutationはtarball digestを変える", () => {
    const sourceRoot = fixture();
    const first = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out-a"),
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    writeFileSync(join(sourceRoot, "src", "entry.ts"), "export const value = 2;\n", "utf8");
    const mutated = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out-c"),
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    expect(mutated.manifest.tarball_digest).not.toBe(first.manifest.tarball_digest);
  });

  it("U-DISTPKG-006: Full commandとLite commandが同じdeterministic tar coreを呼ぶ", () => {
    const cli = readFileSync("src/cli.ts", "utf8");
    const lite = readFileSync("src/setup/distribution-lite-package.ts", "utf8");
    expect(cli).toContain("createDeterministicDistributionPackage({");
    expect(lite).toContain("createDeterministicDistributionPackage({");
    expect(cli).not.toContain('"--pax-option=delete=atime,delete=ctime"');
    expect(lite).not.toContain('"--pax-option=delete=atime,delete=ctime"');
  });

  it("U-DISTPKG-007: current consumer_core_v1を独立2 buildして同一identityへ束縛する", () => {
    const outA = mkdtempSync(join(tmpdir(), "helix-lite-current-a-"));
    const outB = mkdtempSync(join(tmpdir(), "helix-lite-current-b-"));
    roots.push(outA, outB);
    const first = buildLiteDistributionPackage({
      repo_root: process.cwd(),
      out_dir: outA,
      profile_id: "consumer_core_v1",
    });
    const second = buildLiteDistributionPackage({
      repo_root: process.cwd(),
      out_dir: outB,
      profile_id: "consumer_core_v1",
    });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok || !("output_digests" in first) || !("output_digests" in second)) {
      return;
    }
    expect(second.output_digests).toEqual(first.output_digests);
    expect(first.manifest).toMatchObject({
      requirements: { version: "1.3.13" },
      profile: { id: "consumer_core_v1", version: "1.0.0" },
      package_version: "0.1.0",
      distribution_repository: "RetryYN/HELIX-HARNESS-DevOS",
    });
  });

  it("U-DISTPKG-009: source symlinkからrepo外bytesをarchiveへ混入させずwrite 0で拒否する", () => {
    const sourceRoot = fixture();
    const outside = fixture();
    writeFileSync(join(outside, "secret.txt"), "external bytes\n", "utf8");
    symlinkSync(join(outside, "secret.txt"), join(sourceRoot, "src", "linked.ts"));
    const outDir = join(sourceRoot, "out");
    const paths = ["src/linked.ts"];
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: paths,
      identity: { ...identity, artifact_set_digest: sha256Digest(canonicalJson(paths)) },
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_source_unsafe"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-009b: source root内を指すsymlinkもartifact identityとして拒否する", () => {
    const sourceRoot = fixture();
    symlinkSync(join(sourceRoot, "src", "entry.ts"), join(sourceRoot, "src", "linked.ts"));
    const outDir = join(sourceRoot, "out");
    const paths = ["src/linked.ts"];
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: paths,
      identity: { ...identity, artifact_set_digest: sha256Digest(canonicalJson(paths)) },
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_source_unsafe"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-009c: source root欠落を例外化せずarchive write前にtyped拒否する", () => {
    const sourceRoot = fixture();
    const missingRoot = join(sourceRoot, "missing-root");
    const outDir = join(sourceRoot, "out");
    const result = createDeterministicDistributionPackage({
      source_root: missingRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_source_missing"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-009d: portable path／stem逸脱をarchive write前に拒否する", () => {
    const sourceRoot = fixture();
    for (const [artifactPath, stem, failure] of [
      ["C:\\tmp\\entry.ts", "lite", "artifact_path_invalid"],
      ["src/../src/entry.ts", "lite", "artifact_path_invalid"],
      ["src/entry.ts", "../escape", "artifact_stem_invalid"],
    ] as const) {
      const outDir = join(sourceRoot, `out-${failure}-${artifactPath.length}`);
      const paths = [artifactPath];
      const result = createDeterministicDistributionPackage({
        source_root: sourceRoot,
        out_dir: outDir,
        artifact_stem: stem,
        artifact_paths: paths,
        identity: { ...identity, artifact_set_digest: sha256Digest(canonicalJson(paths)) },
      });
      expect(result.failures, `${artifactPath}:${stem}`).toContain(failure);
      expect(existsSync(outDir)).toBe(false);
    }
  });

  it("U-DISTPKG-009e: extension／aliasによるmanifest authority上書きを拒否する", () => {
    const sourceRoot = fixture();
    const paths = ["src/entry.ts"];
    const base = {
      source_root: sourceRoot,
      artifact_stem: "lite",
      artifact_paths: paths,
      identity: { ...identity, artifact_set_digest: sha256Digest(canonicalJson(paths)) },
    };
    const extension = createDeterministicDistributionPackage({
      ...base,
      out_dir: join(sourceRoot, "out-extension"),
      manifest_extensions: { source_head: "forged" },
    });
    expect(extension).toMatchObject({ ok: false, failures: ["manifest_extension_reserved"] });
    const alias = createDeterministicDistributionPackage({
      ...base,
      out_dir: join(sourceRoot, "out-alias"),
      tarball_digest_aliases: ["source_head"],
    });
    expect(alias).toMatchObject({ ok: false, failures: ["tarball_digest_alias_reserved"] });
    const compatibilityAlias = createDeterministicDistributionPackage({
      ...base,
      out_dir: join(sourceRoot, "out-compatibility-alias"),
      manifest_extensions: { artifactDigest: "forged" },
    });
    expect(compatibilityAlias).toMatchObject({
      ok: false,
      failures: ["manifest_extension_reserved"],
    });
    expect(compatibilityAlias.manifest).not.toHaveProperty("artifactDigest");
  });

  it("U-DISTPKG-009f: source root symlinkをphysical authorityとして拒否する", () => {
    const physicalRoot = fixture();
    const linkedRoot = `${physicalRoot}-linked`;
    roots.push(linkedRoot);
    symlinkSync(physicalRoot, linkedRoot);
    const outDir = join(physicalRoot, "out-linked-root");
    const result = createDeterministicDistributionPackage({
      source_root: linkedRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_source_unsafe"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-009g: output symlink経由の物理出力先変更をwrite前に拒否する", () => {
    const sourceRoot = fixture();
    const physicalOutput = fixture();
    const linkedOutput = join(sourceRoot, "linked-output");
    symlinkSync(physicalOutput, linkedOutput);
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: linkedOutput,
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity,
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_output_unsafe"] });
    expect(existsSync(join(physicalOutput, "lite.tar.gz"))).toBe(false);
  });

  it("U-DISTPKG-009h: directoryを1 artifactとして再帰収録せずexact file setへ限定する", () => {
    const sourceRoot = fixture();
    const outDir = join(sourceRoot, "out-directory");
    const paths = ["src"];
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: paths,
      identity: { ...identity, artifact_set_digest: sha256Digest(canonicalJson(paths)) },
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_source_unsafe"] });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-009i: runtime余剰identity keyでmanifest schemaを上書きできない", () => {
    const sourceRoot = fixture();
    const outDir = join(sourceRoot, "out-forged-identity");
    const forgedIdentity = { ...identity, schema_version: "forged" } as DistributionPackageIdentity;
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: outDir,
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity: forgedIdentity,
    });
    expect(result).toMatchObject({
      ok: false,
      failures: ["artifact_identity_invalid"],
      manifest: { schema_version: "helix-distribution-package-manifest.v1" },
    });
    expect(existsSync(outDir)).toBe(false);
  });

  it("U-DISTPKG-009k: nested identity余剰keyをmanifestへ再投影しない", () => {
    const sourceRoot = fixture();
    const forgedIdentity = {
      ...identity,
      requirements: { ...identity.requirements, forged: "nested" },
      profile: { ...identity.profile, forged: "nested" },
    } as DistributionPackageIdentity;
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out-nested-identity"),
      artifact_stem: "lite",
      artifact_paths: ["src/entry.ts"],
      identity: forgedIdentity,
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_identity_invalid"] });
    expect(result.manifest.requirements).not.toHaveProperty("forged");
    expect(result.manifest.profile).not.toHaveProperty("forged");
  });

  it("U-DISTPKG-009l: 既存output symlink／hardlinkを外部上書き前に拒否する", () => {
    for (const suffix of [".tar.gz", ".tar.gz.sha256", ".manifest.json"]) {
      for (const linkKind of ["symlink", "hardlink"] as const) {
        const sourceRoot = fixture();
        const outside = fixture();
        const outDir = join(sourceRoot, `out-${linkKind}-${suffix.replaceAll(".", "-")}`);
        mkdirSync(outDir);
        const external = join(outside, "external.bin");
        writeFileSync(external, "outside-original\n", "utf8");
        const output = join(outDir, `lite${suffix}`);
        if (linkKind === "symlink") symlinkSync(external, output);
        else linkSync(external, output);
        const result = createDeterministicDistributionPackage({
          source_root: sourceRoot,
          out_dir: outDir,
          artifact_stem: "lite",
          artifact_paths: ["src/entry.ts"],
          identity,
        });
        expect(result).toMatchObject({ ok: false, failures: ["artifact_output_unsafe"] });
        expect(readFileSync(external, "utf8")).toBe("outside-original\n");
      }
    }
  });

  it("U-DISTPKG-009n: dangling output symlinkを例外化せずtyped拒否する", () => {
    for (const target of ["lite.tar.gz", "lite.tar.gz.sha256", "lite.manifest.json", null]) {
      const sourceRoot = fixture();
      const outDir = join(sourceRoot, `dangling-${target ?? "directory"}`);
      if (target === null) {
        symlinkSync(join(sourceRoot, "missing-directory"), outDir);
      } else {
        mkdirSync(outDir);
        symlinkSync(join(sourceRoot, "missing-output"), join(outDir, target));
      }
      let result: ReturnType<typeof createDeterministicDistributionPackage> | undefined;
      expect(() => {
        result = createDeterministicDistributionPackage({
          source_root: sourceRoot,
          out_dir: outDir,
          artifact_stem: "lite",
          artifact_paths: ["src/entry.ts"],
          identity,
        });
      }).not.toThrow();
      expect(result).toMatchObject({ ok: false, failures: ["artifact_output_unsafe"] });
    }
  });

  it("U-DISTPKG-009o: source hardlinkを外部inode混入として拒否する", () => {
    const sourceRoot = fixture();
    const outside = fixture();
    const external = join(outside, "external.ts");
    writeFileSync(external, "external bytes\n", "utf8");
    linkSync(external, join(sourceRoot, "src", "linked.ts"));
    const paths = ["src/linked.ts"];
    const result = createDeterministicDistributionPackage({
      source_root: sourceRoot,
      out_dir: join(sourceRoot, "out-source-hardlink"),
      artifact_stem: "lite",
      artifact_paths: paths,
      identity: { ...identity, artifact_set_digest: sha256Digest(canonicalJson(paths)) },
    });
    expect(result).toMatchObject({ ok: false, failures: ["artifact_source_unsafe"] });
    expect(readFileSync(external, "utf8")).toBe("external bytes\n");
  });

  it("U-DISTPKG-009j: canonical Requirement IR shard driftをpackage identityとして拒否する", () => {
    expect(resolveLiteRequirementsIdentity(process.cwd())).toMatchObject({
      version: "1.3.13",
      root_digest: expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
    });
    const invalidRoot = fixture();
    mkdirSync(join(invalidRoot, "docs", "governance"), { recursive: true });
    mkdirSync(join(invalidRoot, "requirements-ir"), { recursive: true });
    writeFileSync(
      join(invalidRoot, "docs", "governance", "helix-harness-requirements_v1.3.md"),
      "- **Version**: 1.3.13\n",
      "utf8",
    );
    writeFileSync(
      join(invalidRoot, "requirements-ir", "manifest.json"),
      JSON.stringify({ root_digest: `sha256:${"0".repeat(64)}` }),
      "utf8",
    );
    expect(resolveLiteRequirementsIdentity(invalidRoot)).toBeNull();
  });

  it("U-DISTPKG-009m: Full package経路もcanonical Requirement IR resolverを共有する", () => {
    const cli = readFileSync("src/cli.ts", "utf8");
    expect(cli).toContain(
      "const requirementsIdentity = resolveLiteRequirementsIdentity(repoRoot);",
    );
    expect(cli).toContain("const packageResult =\n      exportPlan.ok && requirementsIdentity");
    expect(cli).not.toContain(
      'JSON.parse(readFileSync(join(repoRoot, "requirements-ir/manifest.json"), "utf8"))',
    );
  });

  it("U-DISTPKG-010: current package-profile CLIを実行してprofile-bound artifactを生成する", () => {
    const outDir = mkdtempSync(join(tmpdir(), "helix-lite-cli-package-"));
    roots.push(outDir);
    const run = spawnSync(
      process.execPath,
      [
        ensureCliBundle(process.cwd()),
        "distribution",
        "package-profile",
        "--profile",
        "consumer_core_v1",
        "--out",
        outDir,
        "--json",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
        timeout: 45_000,
      },
    );
    expect(run.status, run.stderr).toBe(0);
    const receipt = JSON.parse(run.stdout) as {
      ok: boolean;
      manifest: { profile: { id: string }; distribution_repository: string };
      paths: { tarball: string; manifest: string; checksum: string };
    };
    expect(receipt).toMatchObject({
      ok: true,
      manifest: {
        profile: { id: "consumer_core_v1" },
        distribution_repository: "RetryYN/HELIX-HARNESS-DevOS",
      },
    });
    expect(Object.values(receipt.paths).every((path) => existsSync(path))).toBe(true);
  });
});
