import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// PLAN-L7-458-node-minimum-p0-p1

interface CommandReceipt {
  executable_id: "node";
  argv: string[];
  exit_code: number | null;
  signal: string | null;
  stdout_digest: string;
  stderr_digest: string;
}

const repoRoot = resolve(import.meta.dirname, "..");
const sha256 = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");

function npmCliPath(): string {
  const candidates = [
    process.env.npm_execpath,
    resolve(dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js"),
    resolve(dirname(process.execPath), "../node_modules/npm/bin/npm-cli.js"),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("official npm CLI could not be resolved from the Node toolchain");
  return found;
}

function runNode(
  cwd: string,
  isolatedPath: string,
  modulePath: string,
  args: string[],
  extraEnv: Record<string, string> = {},
): CommandReceipt {
  const result = spawnSync(process.execPath, [modulePath, ...args], {
    cwd,
    encoding: "utf8",
    shell: false,
    env: {
      ...process.env,
      PATH: isolatedPath,
      ...extraEnv,
    },
    timeout: 170_000,
  });
  const receipt: CommandReceipt = {
    executable_id: "node",
    argv: [modulePath, ...args].map((item) => item.replace(cwd, "<fixture>")),
    exit_code: result.status,
    signal: result.signal,
    stdout_digest: sha256(result.stdout ?? ""),
    stderr_digest: sha256(result.stderr ?? ""),
  };
  if (result.error) {
    throw new Error(
      `Node command failed to start: ${result.error.message}; receipt=${JSON.stringify(receipt)}`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `Node command exited ${result.status}: ${(result.stderr ?? "").slice(-2_000)}; receipt=${JSON.stringify(receipt)}`,
    );
  }
  return receipt;
}

function copyProjectInputs(root: string): void {
  cpSync(join(repoRoot, "src"), join(root, "src"), { recursive: true });
  mkdirSync(join(root, "tests"), { recursive: true });
  for (const file of [
    "node-build.test.ts",
    "node-runtime-cutover-gate.test.ts",
    "node-runtime-cutover-toolchain.test.ts",
  ]) {
    cpSync(join(repoRoot, "tests", file), join(root, "tests", file));
  }
  for (const file of ["tsconfig.json", "vitest.config.ts", "biome.json"]) {
    cpSync(join(repoRoot, file), join(root, file));
  }
}

describe.skipIf(process.platform !== "linux")(
  "Node Minimum clean Linux integration IT-NCUT-001..002",
  () => {
    let root = "";
    let isolatedBin = "";
    let cache = "";
    let onlineInstall: CommandReceipt;
    let offlineInstall: CommandReceipt;
    let firstInstalledLockDigest = "";

    beforeAll(() => {
      root = mkdtempSync(join(tmpdir(), "helix-node-minimum-"));
      isolatedBin = join(root, ".isolated-bin");
      cache = join(root, ".npm-cache");
      mkdirSync(isolatedBin);
      mkdirSync(cache);
      symlinkSync(process.execPath, join(isolatedBin, "node"));
      // npm lifecycle scripts require a POSIX shell; expose only the fixed Node
      // and the OS shell rather than inheriting the developer PATH (which may contain Bun).
      symlinkSync("/bin/sh", join(isolatedBin, "sh"));
      cpSync(join(repoRoot, "package.json"), join(root, "package.json"));
      cpSync(join(repoRoot, "package-lock.json"), join(root, "package-lock.json"));

      const version = process.versions.node.split(".").map(Number);
      expect(version[0]).toBe(24);
      expect(version[1]).toBeGreaterThanOrEqual(15);
      expect(process.versions.sqlite).toBeTruthy();
      const npmPackage = JSON.parse(
        readFileSync(resolve(dirname(npmCliPath()), "..", "package.json"), "utf8"),
      ) as { version?: string };
      expect(npmPackage.version).toBe("11.12.1");

      const npmArgs = ["ci", "--cache", cache, "--no-audit", "--no-fund"];
      onlineInstall = runNode(root, isolatedBin, npmCliPath(), npmArgs, {
        npm_config_update_notifier: "false",
      });
      firstInstalledLockDigest = sha256(
        readFileSync(join(root, "node_modules", ".package-lock.json")),
      );

      rmSync(join(root, "node_modules"), { recursive: true, force: true });
      offlineInstall = runNode(root, isolatedBin, npmCliPath(), [...npmArgs, "--offline"], {
        npm_config_update_notifier: "false",
      });
      copyProjectInputs(root);
    }, 180_000);

    afterAll(() => {
      if (root) rmSync(root, { recursive: true, force: true });
    });

    it("IT-NCUT-001: canonical lockからnetwork/cache installとoffline reinstallをBunなしPATHで再現する", () => {
      expect(onlineInstall).toMatchObject({ executable_id: "node", exit_code: 0, signal: null });
      expect(offlineInstall).toMatchObject({ executable_id: "node", exit_code: 0, signal: null });
      expect(offlineInstall.argv).toContain("--offline");
      expect(sha256(readFileSync(join(root, "package-lock.json")))).toBe(
        sha256(readFileSync(join(repoRoot, "package-lock.json"))),
      );
      expect(sha256(readFileSync(join(root, "node_modules", ".package-lock.json")))).toBe(
        firstInstalledLockDigest,
      );

      const bun = spawnSync("bun", ["--version"], {
        cwd: root,
        env: { ...process.env, PATH: isolatedBin },
        encoding: "utf8",
        shell: false,
      });
      expect(bun.status).toBeNull();
      expect((bun.error as NodeJS.ErrnoException | undefined)?.code).toBe("ENOENT");
    });

    it("IT-NCUT-002: clean installed Node toolchainでtypecheck、lint、targeted/full P0-P1 testを順次実行する", () => {
      const receipts = [
        runNode(root, isolatedBin, join(root, "node_modules", "typescript", "bin", "tsc"), [
          "--noEmit",
        ]),
        runNode(
          root,
          isolatedBin,
          join(root, "node_modules", "@biomejs", "biome", "bin", "biome"),
          [
            "check",
            "src/runtime/node-build.ts",
            "src/runtime/node-runtime-cutover.ts",
            "tests/node-build.test.ts",
            "tests/node-runtime-cutover-gate.test.ts",
            "tests/node-runtime-cutover-toolchain.test.ts",
          ],
        ),
        runNode(root, isolatedBin, join(root, "node_modules", "vitest", "vitest.mjs"), [
          "run",
          "tests/node-runtime-cutover-toolchain.test.ts",
        ]),
        runNode(root, isolatedBin, join(root, "node_modules", "vitest", "vitest.mjs"), [
          "run",
          "tests/node-build.test.ts",
          "tests/node-runtime-cutover-gate.test.ts",
          "tests/node-runtime-cutover-toolchain.test.ts",
        ]),
      ];
      expect(receipts).toHaveLength(4);
      expect(receipts.every((receipt) => receipt.executable_id === "node")).toBe(true);
      expect(receipts.every((receipt) => receipt.exit_code === 0 && receipt.signal === null)).toBe(
        true,
      );
    }, 180_000);
  },
);
