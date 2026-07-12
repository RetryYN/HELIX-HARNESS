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

describe("PLAN-L7-449 actual process durability", () => {
  it("IT-DUR-004/007: two child processes dispatch the same worker at most once", async () => {
    const repo = root();
    const first = Bun.spawn(["bun", fixture, repo, "barrier", "first"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const second = Bun.spawn(["bun", fixture, repo, "barrier", "second"], {
      stdout: "pipe",
      stderr: "pipe",
    });
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
      const killed = Bun.spawn(["bun", fixture, repo, "kill", "killed"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(await killed.exited).not.toBe(0);
      expect(readLoopEpochFromFs(repo, PLAN).status).toBe("ambiguous_side_effect");
      const retry = Bun.spawn(["bun", fixture, repo, "retry", "retry"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(await retry.exited).not.toBe(0);
      expect(readFileSync(join(repo, "effects.log"), "utf8").trim().split(/\r?\n/)).toEqual([
        "killed",
      ]);
    },
  );
});
