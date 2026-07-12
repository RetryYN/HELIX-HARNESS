import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
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

  it("2 child同時barrierではatomic claim winnerがexactly-oneになる", async () => {
    const root = repository();
    const barrier = join(root, "barrier");
    const moduleUrl = pathToFileURL(
      join(import.meta.dirname, "../src/state-db/closure-materialization-lock.ts"),
    ).href;
    const script = `
      import { existsSync } from "node:fs";
      import { acquireClosureMaterializationLock, releaseClosureMaterializationLock } from ${JSON.stringify(moduleUrl)};
      const [root, barrier] = process.argv.slice(1);
      while (!existsSync(barrier)) await Bun.sleep(5);
      try {
        const lock = acquireClosureMaterializationLock(root);
        console.log("WON");
        await Bun.sleep(150);
        releaseClosureMaterializationLock(lock);
      } catch { console.log("LOST"); }
    `;
    const runChild = (): Promise<string> =>
      new Promise((resolveOutput, reject) => {
        const child = spawn("bun", ["-e", script, root, barrier], {
          stdio: ["ignore", "pipe", "pipe"],
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString("utf8")));
        child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString("utf8")));
        child.once("error", reject);
        child.once("close", (code) =>
          code === 0 ? resolveOutput(stdout.trim()) : reject(new Error(stderr)),
        );
      });
    const children = [runChild(), runChild()];
    writeFileSync(barrier, "go\n");
    const results = await Promise.all(children);
    expect(results.filter((value) => value === "WON")).toHaveLength(1);
    expect(results.filter((value) => value === "LOST")).toHaveLength(1);
  });

  it("Windows adapterはWMIC非依存・non-interactive identity・rename衝突正規化を固定する", () => {
    const source = readFileSync(
      join(import.meta.dirname, "../src/state-db/closure-materialization-lock.ts"),
      "utf8",
    );
    expect(source).not.toContain("wmic.exe");
    expect(source).toContain('"powershell.exe"');
    expect(source).toContain('"-NonInteractive"');
    expect(source).toContain('code === "EPERM" || code === "EACCES"');
    expect(source).toContain('if (platform() === "win32") return;');
  });
});
