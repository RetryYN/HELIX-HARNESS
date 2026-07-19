import { describe, expect, it } from "vitest";
import { checkMemoryHandoverIsolation } from "../src/doctor/index";
import {
  analyzeMemoryHandoverIsolation,
  type MemoryHandoverCommit,
  memoryHandoverIsolationMessages,
} from "../src/lint/memory-handover-isolation";

const NOW = 1_800_000_000;

function commit(overrides: Partial<MemoryHandoverCommit> = {}): MemoryHandoverCommit {
  return {
    hash: "a".repeat(40),
    subject: "chore(memory): 引き継ぎ",
    committedAtEpochSeconds: NOW - 48 * 3600,
    memoryPaths: [".helix/memory/harness.jsonl"],
    ...overrides,
  };
}

describe("memory-handover-isolation (PLAN-L7-459 / MEMX-S6)", () => {
  it("[PLAN-L7-459/U-MEMX-006] 閾値超過の remote 未到達 memory コミットを violation にする", () => {
    const r = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [commit()] },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(false);
    expect(r.isolated).toHaveLength(1);
    expect(r.stale).toHaveLength(0);
    const [message] = memoryHandoverIsolationMessages(r);
    expect(message).toContain("violation");
    expect(message).toContain("閾値超過 1 件");
    expect(message).toContain("aaaaaaaa:chore(memory): 引き継ぎ");
  });

  it("[PLAN-L7-459/U-MEMX-006] 閾値内の未 push コミットは ok のまま stale 件数を surface する", () => {
    const r = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [commit({ committedAtEpochSeconds: NOW - 3600 })] },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(true);
    expect(r.isolated).toHaveLength(0);
    expect(r.stale).toHaveLength(1);
    const [message] = memoryHandoverIsolationMessages(r);
    expect(message).toContain("OK");
    expect(message).toContain("閾値内の未 push memory コミット 1 件");
  });

  it("[PLAN-L7-459/U-MEMX-006] remote 到達済み (未到達 0 件) は無条件で OK", () => {
    const r = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [] },
      { nowEpochSeconds: NOW },
    );
    expect(r.ok).toBe(true);
    expect(memoryHandoverIsolationMessages(r)).toEqual([
      "memory-handover-isolation - OK (remote 未到達の memory 引き継ぎコミット 0)",
    ]);
  });

  it("[PLAN-L7-459/U-MEMX-006] 閾値は thresholdHours で調整でき境界は超過側だけ violation", () => {
    const boundary = commit({ committedAtEpochSeconds: NOW - 2 * 3600 });
    const within = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [boundary] },
      { nowEpochSeconds: NOW, thresholdHours: 2 },
    );
    expect(within.ok).toBe(true);
    const beyond = analyzeMemoryHandoverIsolation(
      { unreachedMemoryCommits: [boundary] },
      { nowEpochSeconds: NOW, thresholdHours: 1 },
    );
    expect(beyond.ok).toBe(false);
  });

  it("[PLAN-L7-459/U-MEMX-006] git 履歴を検査できない場合は fail-close で violation を返す", () => {
    const r = checkMemoryHandoverIsolation("/nonexistent-repo-root-for-fail-close");
    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("fail-close");
  });
});
