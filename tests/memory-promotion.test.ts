import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MEMORY_PROMOTION_WARNING,
  memoryPromotionNudge,
  memoryPromotionNudgeEventId,
  memoryPromotionSessionRef,
} from "../src/runtime/memory-promotion";
import {
  nodeDeps,
  onPostToolUse,
  onStop,
  parseSessionEvents,
  type SessionEvent,
  type SessionLogDeps,
} from "../src/runtime/session-log";

function event(
  event_type: SessionEvent["event_type"],
  outcome?: SessionEvent["outcome"],
): SessionEvent {
  return { ts: "2026-07-11T00:00:00.000Z", session_id: "s1", plan_id: "P", event_type, outcome };
}

function deps(seed: string): SessionLogDeps & { files: Map<string, string>; warnings: string[] } {
  const files = new Map<string, string>([["/repo/.helix/logs/session/s1.jsonl", seed]]);
  const warnings: string[] = [];
  let locked = false;
  return {
    files,
    warnings,
    repoRoot: "/repo",
    now: () => "2026-07-11T00:00:01.000Z",
    appendLine: (path, line) => files.set(path, `${files.get(path) ?? ""}${line}\n`),
    readText: (path) => files.get(path) ?? null,
    writeText: (path, content) => files.set(path, content),
    currentBranch: () => null,
    withEventLock: (_eventId, fn) => {
      expect(locked).toBe(false);
      locked = true;
      try {
        return fn();
      } finally {
        locked = false;
      }
    },
    emitWarning: (warning) => warnings.push(warning),
  };
}

describe("memory promotion nudge (PLAN-L7-413)", () => {
  it("U-FLIFE-011: 成功commit/plan_switchかつ成功memory_writeなしだけを1回通知する", () => {
    expect(memoryPromotionNudge([event("commit", "ok")])).toMatchObject({ shouldNudge: true });
    expect(memoryPromotionNudge([event("plan_switch", "ok")])).toMatchObject({ shouldNudge: true });
    expect(memoryPromotionNudge([event("commit", "error")])).toMatchObject({ shouldNudge: false });
    expect(memoryPromotionNudge([event("commit")])).toMatchObject({ shouldNudge: false });
    expect(
      memoryPromotionNudge([event("commit", "ok"), event("memory_write", "ok")]),
    ).toMatchObject({ shouldNudge: false, reason: "memory_already_written" });
    expect(
      memoryPromotionNudge([event("commit", "ok"), event("memory_write", "error")]),
    ).toMatchObject({ shouldNudge: true });

    const seed = `${JSON.stringify(event("commit", "ok"))}\n`;
    const io = deps(seed);
    expect(onStop({ session_id: "s1" }, io)).toBe(0);
    expect(onStop({ session_id: "s1" }, io)).toBe(0);
    const events = parseSessionEvents(io.files.get("/repo/.helix/logs/session/s1.jsonl") ?? "");
    expect(events.filter((row) => row.event_type === "memory_promotion_nudge")).toHaveLength(1);
    expect(io.warnings).toEqual([MEMORY_PROMOTION_WARNING]);
    expect(events.find((row) => row.event_type === "memory_promotion_nudge")?.event_id).toBe(
      memoryPromotionNudgeEventId("s1"),
    );

    const hook = deps("");
    expect(
      onPostToolUse(
        {
          session_id: "s1",
          tool_name: "Bash",
          tool_input: { command: 'git commit -m "feat: production hook"' },
          tool_response: { outcome: "ok" },
        },
        hook,
      ),
    ).toBe(0);
    expect(onStop({ session_id: "s1" }, hook)).toBe(0);
    expect(hook.warnings).toEqual([MEMORY_PROMOTION_WARNING]);
  });

  it("U-FLIFE-011: 2 processの同時Stopもdeterministic event idで1件に収束する", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-memory-nudge-"));
    try {
      const sessionDir = join(root, ".helix", "logs", "session");
      mkdirSync(sessionDir, { recursive: true });
      writeFileSync(join(sessionDir, "s1.jsonl"), `${JSON.stringify(event("commit", "ok"))}\n`);
      // nodeDepsを先に開閉し、競合oracleをSQLite初期化競合ではなくevent lock自体へ絞る。
      const init = nodeDeps(root, () => null);
      init.withEventLock?.("init", () => undefined);
      const script = [
        'import { nodeDeps, onStop } from "./src/runtime/session-log.ts";',
        "const root = process.argv[1];",
        "onStop({ session_id: 's1' }, nodeDeps(root, () => null));",
      ].join("\n");
      const output = await Promise.all(
        [0, 1].map(
          () =>
            new Promise<string>((resolve, reject) => {
              execFile("bun", ["-e", script, root], { cwd: process.cwd() }, (error, stdout) => {
                if (error) reject(error);
                else resolve(stdout);
              });
            }),
        ),
      );
      expect(output.join("").split(MEMORY_PROMOTION_WARNING).length - 1).toBe(1);
      const events = parseSessionEvents(readFileSync(join(sessionDir, "s1.jsonl"), "utf8"));
      expect(events.filter((row) => row.event_type === "memory_promotion_nudge")).toHaveLength(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-FLIFE-012: 破損行/書込失敗はStop fail-open、nudgeへbody/diff/secretを保存しない", () => {
    const sensitive = {
      ...event("commit", "ok"),
      body: "token=do-not-store",
      diff: "+ password=do-not-store",
      provider_transcript: "private transcript",
    };
    const io = deps(`{damaged json\n${JSON.stringify(sensitive)}\n`);
    expect(onStop({ session_id: "s1" }, io)).toBe(0);
    const raw = io.files.get("/repo/.helix/logs/session/s1.jsonl") ?? "";
    const nudgeLine = raw
      .split("\n")
      .find((line) => line.includes('"event_type":"memory_promotion_nudge"'));
    expect(nudgeLine).toBeDefined();
    expect(nudgeLine).not.toContain("do-not-store");
    expect(nudgeLine).not.toContain("private transcript");
    expect(nudgeLine).not.toContain('"session_id":"s1"');
    expect(JSON.parse(nudgeLine ?? "{}")).toEqual({
      event_id: memoryPromotionNudgeEventId("s1"),
      ts: "2026-07-11T00:00:01.000Z",
      session_id: memoryPromotionSessionRef("s1"),
      plan_id: null,
      event_type: "memory_promotion_nudge",
      outcome: "ok",
    });

    const broken = deps(`${JSON.stringify(event("commit", "ok"))}\n`);
    broken.appendLine = () => {
      throw new Error("disk full");
    };
    expect(() => onStop({ session_id: "s1" }, broken)).not.toThrow();
    expect(onStop({ session_id: "s1" }, broken)).toBe(0);
    expect(broken.warnings).toEqual([]);
  });
});
