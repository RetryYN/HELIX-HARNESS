import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readLoopEpochFromFs } from "../src/orchestration/durable-loop-epoch-node";

const PLAN = "PLAN-L7-449-durability-boundary-implementation";
const fixture = join(process.cwd(), "tests", "fixtures", "durable-loop-process-child.ts");
const tsxCli = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
const roots: string[] = [];
const root = () => {
  const value = mkdtempSync(join(tmpdir(), "helix-loop-process-"));
  roots.push(value);
  return value;
};
afterEach(() => {
  for (const value of roots.splice(0)) rmSync(value, { recursive: true, force: true });
});

async function waitUntil(predicate: () => boolean): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("process barrier timeout");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

function child(repo: string, mode: string, id: string) {
  const process = spawn("node", [tsxCli, fixture, repo, mode, id], { stdio: "pipe" });
  let stderr = "";
  process.stderr.on("data", (chunk: Buffer) => {
    stderr = (stderr + chunk.toString("utf8")).slice(-8192);
  });
  const exited = new Promise<number | null>((resolve) => process.once("exit", resolve));
  const closed = new Promise<void>((resolve) => process.once("close", () => resolve()));
  return { process, exited, closed, diagnostic: () => ({ id, stderr }) };
}

describe("PLAN-L7-449 actual process durability", () => {
  it("PLAN-RECOVERY-1562-durable-loop-completion: stale contender does not block completion", async () => {
    const repo = root();
    const worker = child(repo, "held-effect", "worker");
    const contender = child(repo, "stale-contender", "contender");
    try {
      const workerExit = await worker.exited;
      writeFileSync(join(repo, "completion-attempted"), "done");
      const contenderExit = await contender.exited;
      await Promise.all([worker.closed, contender.closed]);
      expect(workerExit, JSON.stringify(worker.diagnostic())).toBe(0);
      expect(contenderExit, JSON.stringify(contender.diagnostic())).toBe(2);
      expect(JSON.parse(readFileSync(join(repo, "contender-result.json"), "utf8")).reason).toBe(
        "stale_previous",
      );
      expect(readFileSync(join(repo, "effects.log"), "utf8").trim().split(/\r?\n/)).toEqual([
        "worker",
      ]);
      expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
    } finally {
      if (worker.process.exitCode === null) worker.process.kill();
      if (contender.process.exitCode === null) contender.process.kill();
      await Promise.all([worker.closed, contender.closed]);
    }
  }, 30_000);

  it("IT-DUR-004/007: two child processes dispatch the same worker at most once", async () => {
    const repo = root();
    const first = child(repo, "barrier", "first");
    const second = child(repo, "barrier", "second");
    await waitUntil(
      () => existsSync(join(repo, "ready-first")) && existsSync(join(repo, "ready-second")),
    );
    writeFileSync(join(repo, "release"), "release");
    const exits = await Promise.all([first.exited, second.exited]);
    await Promise.all([first.closed, second.closed]);
    expect(
      exits.filter((code) => code === 0),
      JSON.stringify({ exits, children: [first.diagnostic(), second.diagnostic()] }),
    ).toHaveLength(1);
    expect(readFileSync(join(repo, "effects.log"), "utf8").trim().split(/\r?\n/)).toHaveLength(1);
    expect(readLoopEpochFromFs(repo, PLAN).status).toBe("committed");
  });

  it.skipIf(process.platform === "win32")(
    "IT-DUR-005: SIGKILL inside the callback leaves ambiguous intent and restart callback zero",
    async () => {
      const repo = root();
      const killed = child(repo, "kill", "killed");
      expect(await killed.exited).not.toBe(0);
      expect(readLoopEpochFromFs(repo, PLAN).status).toBe("ambiguous_side_effect");
      const retry = child(repo, "retry", "retry");
      expect(await retry.exited).not.toBe(0);
      expect(readFileSync(join(repo, "effects.log"), "utf8").trim().split(/\r?\n/)).toEqual([
        "killed",
      ]);
    },
  );

  it.skipIf(process.platform === "win32")(
    "IT-DUR-003: C1-C6 child SIGKILL matrix never exposes an authoritative transition",
    async () => {
      const boundaries = [
        "claim_acquired",
        "payload_temp_written",
        "payload_temp_fsynced",
        "payload_renamed",
        "manifest_temp_written",
        "manifest_temp_fsynced",
        "manifest_renamed",
        "pointer_renamed",
        "claim_unlinked",
      ] as const;
      for (const boundary of boundaries) {
        const repo = root();
        const killed = child(repo, `publish:${boundary}`, boundary);
        expect(await killed.exited, boundary).not.toBe(0);
        const snapshot = readLoopEpochFromFs(repo, PLAN);
        expect(snapshot.status, boundary).toBe("durability_uncertain");
      }
      const releasedRepo = root();
      const released = child(
        releasedRepo,
        "publish:release_proof_published",
        "release_proof_published",
      );
      expect(await released.exited).not.toBe(0);
      expect(readLoopEpochFromFs(releasedRepo, PLAN).status).toBe("committed");

      const proofGcRepo = root();
      const proofGc = child(
        proofGcRepo,
        "gc:release_proof_gc_unlinked",
        "release_proof_gc_unlinked",
      );
      expect(await proofGc.exited).not.toBe(0);
      expect(readLoopEpochFromFs(proofGcRepo, PLAN).status).toBe("durability_uncertain");

      const releasingGcRepo = root();
      const releasingGc = child(
        releasingGcRepo,
        "gc:releasing_gc_unlinked",
        "releasing_gc_unlinked",
      );
      expect(await releasingGc.exited).not.toBe(0);
      expect(readLoopEpochFromFs(releasingGcRepo, PLAN).status).toBe("committed");
    },
    30_000,
  );
});

import { spawn } from "node:child_process";
