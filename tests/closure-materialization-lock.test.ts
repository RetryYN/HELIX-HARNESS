import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import {
  isAtomicRenameCollision,
  parseWindowsProcessStartIdentity,
  supportsDirectoryFsync,
} from "../src/policy/filesystem-durability";
import {
  acquireClosureMaterializationLock,
  readProcessIdentity,
  releaseClosureMaterializationLock,
} from "../src/state-db/closure-materialization-lock";

// PLAN-L7-434-closure-evidence-materialization / U-CMAT-012

function repository(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-materialization-lock-"));
  mkdirSync(join(root, ".helix"));
  return root;
}

describe("closure materialization atomic lock", () => {
  it("U-CMAT-012: live process identityのlockは二重取得を拒否し、正当ownerだけが解放する", () => {
    const root = repository();
    const lock = acquireClosureMaterializationLock(root);
    expect(() => acquireClosureMaterializationLock(root)).toThrow(/already running/);
    releaseClosureMaterializationLock(lock);
    const next = acquireClosureMaterializationLock(root);
    releaseClosureMaterializationLock(next);
  });

  it("同PIDでもprocess birth identityが違うstale lockを回収する", () => {
    const root = repository();
    const lock = acquireClosureMaterializationLock(root);
    const ownerPath = join(lock.path, "owner.json");
    const owner = JSON.parse(readFileSync(ownerPath, "utf8"));
    owner.process_start_id = `${readProcessIdentity(process.pid)}-stale`;
    writeFileSync(ownerPath, JSON.stringify(owner));
    const recovered = acquireClosureMaterializationLock(root);
    expect(recovered.token).not.toBe(lock.token);
    releaseClosureMaterializationLock(recovered);
  });

  it("dead PID lockを回収する", () => {
    const root = repository();
    const state = join(root, ".helix/state");
    const lockPath = join(state, "closure-materialization.lock");
    mkdirSync(lockPath, { recursive: true });
    writeFileSync(
      join(lockPath, "owner.json"),
      JSON.stringify({
        schema_version: "closure-materialization-lock.v2",
        token: "dead-owner",
        pid: 2_147_483_647,
        host: hostname(),
        process_start_id: "linux:dead",
        acquired_at: "2026-07-12T00:00:00.000Z",
        repository_realpath: root,
      }),
    );
    const recovered = acquireClosureMaterializationLock(root);
    expect(recovered.path).toBe(lockPath);
    releaseClosureMaterializationLock(recovered);
  });

  it("torn ownerとsymlink ownerはfail-closeする", () => {
    const tornRoot = repository();
    const torn = join(tornRoot, ".helix/state/closure-materialization.lock");
    mkdirSync(torn, { recursive: true });
    writeFileSync(join(torn, "owner.json"), "{");
    expect(() => acquireClosureMaterializationLock(tornRoot)).toThrow(/schema不正/);

    const linkRoot = repository();
    const link = join(linkRoot, ".helix/state/closure-materialization.lock");
    mkdirSync(link, { recursive: true });
    writeFileSync(join(linkRoot, "owner-target.json"), "{}");
    symlinkSync(join(linkRoot, "owner-target.json"), join(link, "owner.json"));
    expect(() => acquireClosureMaterializationLock(linkRoot)).toThrow(/symlink/);
  });

  it("ownership token不一致ではlockを削除しない", () => {
    const root = repository();
    const lock = acquireClosureMaterializationLock(root);
    expect(() => releaseClosureMaterializationLock({ ...lock, token: "attacker" })).toThrow(
      /ownership不一致/,
    );
    expect(() => acquireClosureMaterializationLock(root)).toThrow(/already running/);
    releaseClosureMaterializationLock(lock);
  });

  it("24時間を超えたorphan claimだけを安全に清掃する", () => {
    const root = repository();
    const orphan = join(root, ".helix/state/.closure-materialization.claim-orphan");
    mkdirSync(orphan, { recursive: true });
    writeFileSync(join(orphan, "owner.json.tmp"), "partial");
    utimesSync(orphan, new Date(0), new Date(0));
    const lock = acquireClosureMaterializationLock(root);
    expect(existsSync(orphan)).toBe(false);
    releaseClosureMaterializationLock(lock);
  });

  it("2 child同時barrierではatomic claim winnerがexactly-oneになる", async () => {
    const root = repository();
    const barrier = join(root, "barrier");
    const release = join(root, "release");
    const moduleUrl = pathToFileURL(
      join(import.meta.dirname, "../src/state-db/closure-materialization-lock.ts"),
    ).href;
    const script = `
      import { existsSync } from "node:fs";
      import { acquireClosureMaterializationLock, releaseClosureMaterializationLock } from ${JSON.stringify(moduleUrl)};
      const [root, barrier, release] = process.argv.slice(1);
      const wait = () => new Promise((resolve) => setTimeout(resolve, 5));
      void (async () => {
        while (!existsSync(barrier)) await wait();
        try {
          const lock = acquireClosureMaterializationLock(root);
          console.log("WON");
          while (!existsSync(release)) await wait();
          releaseClosureMaterializationLock(lock);
        } catch { console.log("LOST"); }
      })();
    `;
    const runChild = (): { first: Promise<string>; done: Promise<void> } => {
      let resolveFirst: (value: string) => void = () => undefined;
      let rejectFirst: (error: Error) => void = () => undefined;
      const first = new Promise<string>((resolve, reject) => {
        resolveFirst = resolve;
        rejectFirst = reject;
      });
      const done = new Promise<void>((resolveDone, rejectDone) => {
        const child = spawn("npx", ["--no-install", "tsx", "-e", script, root, barrier, release], {
          stdio: ["ignore", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk: Buffer) => {
          stdout += chunk.toString("utf8");
          const line = stdout.trim();
          if (line === "WON" || line === "LOST") resolveFirst(line);
        });
        child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString("utf8")));
        child.once("error", (error) => {
          rejectFirst(error);
          rejectDone(error);
        });
        child.once("close", (code) => {
          if (code === 0) resolveDone();
          else {
            const error = new Error(stderr);
            rejectFirst(error);
            rejectDone(error);
          }
        });
      });
      return { first, done };
    };
    const children = [runChild(), runChild()];
    writeFileSync(barrier, "go\n");
    const results = await Promise.all(children.map((child) => child.first));
    writeFileSync(release, "release\n");
    await Promise.all(children.map((child) => child.done));
    expect(results.filter((value) => value === "WON")).toHaveLength(1);
    expect(results.filter((value) => value === "LOST")).toHaveLength(1);
  });

  it("Windows adapterはWMIC非依存・non-interactive identity・rename衝突正規化を固定する", () => {
    expect(supportsDirectoryFsync("win32")).toBe(false);
    expect(supportsDirectoryFsync("linux")).toBe(true);
    expect(parseWindowsProcessStartIdentity("638879040000000000\r\n")).toBe(
      "win32:638879040000000000",
    );
    expect(() => parseWindowsProcessStartIdentity("Get-Process failed")).toThrow(/malformed/);
    expect(
      isAtomicRenameCollision({
        platformName: "win32",
        errorCode: "EPERM",
        targetExists: true,
      }),
    ).toBe(true);
    expect(
      isAtomicRenameCollision({
        platformName: "win32",
        errorCode: "EPERM",
        targetExists: false,
      }),
    ).toBe(false);
    expect(
      isAtomicRenameCollision({
        platformName: "linux",
        errorCode: "EEXIST",
        targetExists: true,
      }),
    ).toBe(true);
    const source = readFileSync(
      join(import.meta.dirname, "../src/state-db/closure-materialization-lock.ts"),
      "utf8",
    );
    expect(source).not.toContain("wmic.exe");
    expect(source).toContain('"powershell.exe"');
    expect(source).toContain('"-NonInteractive"');
    expect(source).toContain("parseWindowsProcessStartIdentity(created)");
  });
});
