import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readLoopEpochFromFs } from "../src/orchestration/durable-loop-epoch-node";

const PLAN = "PLAN-L7-449-durability-boundary-implementation";
const fixture = join(process.cwd(), "tests", "fixtures", "durable-loop-process-child.ts");
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
  const process = spawn("bun", [fixture, repo, mode, id], { stdio: "pipe" });
  const exited = new Promise<number | null>((resolve) => process.once("exit", resolve));
  return { process, exited };
}

describe("PLAN-L7-449 actual process durability", () => {
  it("IT-DUR-004/007: two child processes dispatch the same worker at most once", async () => {
    const repo = root();
    const first = child(repo, "barrier", "first");
    const second = child(repo, "barrier", "second");
    await waitUntil(
      () => existsSync(join(repo, "ready-first")) && existsSync(join(repo, "ready-second")),
    );
    writeFileSync(join(repo, "release"), "release");
    const exits = await Promise.all([first.exited, second.exited]);
    expect(exits.filter((code) => code === 0)).toHaveLength(1);
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
});

import { spawn } from "node:child_process";
