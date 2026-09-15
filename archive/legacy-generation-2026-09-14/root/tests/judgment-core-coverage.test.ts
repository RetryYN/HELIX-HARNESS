import { describe, expect, it } from "vitest";
import {
  analyzeJudgmentCoreCoverage,
  JUDGMENT_CORE_SSOT_PATH,
  judgmentCoreCoverageMessages,
  loadJudgmentCoreCoverageInput,
} from "../src/lint/judgment-core-coverage";

describe("U-JUDG: judgment-core-coverage (PLAN-L7-335)", () => {
  it("U-JUDG-001: marker と SSoT version が一致し参照もあれば pass", () => {
    const result = analyzeJudgmentCoreCoverage({
      ssotVersion: 1,
      docs: [
        { path: ".claude/agents/a.md", kind: "agent", marker: "v1", referencesSsot: true },
        { path: ".claude/commands/b.md", kind: "command", marker: "v1", referencesSsot: true },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.expectedMarker).toBe("v1");
    expect(judgmentCoreCoverageMessages(result)[0]).toContain("judgment-core-coverage - OK");
  });

  it("U-JUDG-002: marker 欠落 / version 不一致 / 参照欠落はそれぞれ violation (fail-close)", () => {
    const result = analyzeJudgmentCoreCoverage({
      ssotVersion: 2,
      docs: [
        { path: ".claude/agents/none.md", kind: "agent", marker: null, referencesSsot: true },
        { path: ".claude/agents/old.md", kind: "agent", marker: "v1", referencesSsot: true },
        { path: ".claude/commands/noref.md", kind: "command", marker: "v2", referencesSsot: false },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.kind)).toEqual([
      "missing-marker",
      "version-mismatch",
      "missing-reference",
    ]);
    const joined = judgmentCoreCoverageMessages(result).join("\n");
    expect(joined).toContain(".claude/agents/none.md");
    expect(joined).toContain("v2");
  });

  it("U-JUDG-003: SSoT version が読めない場合は単独で fail-close", () => {
    const result = analyzeJudgmentCoreCoverage({
      ssotVersion: null,
      docs: [{ path: ".claude/agents/a.md", kind: "agent", marker: "v1", referencesSsot: true }],
    });
    expect(result.ok).toBe(false);
    expect(result.violations[0].kind).toBe("missing-ssot-version");
    expect(result.violations[0].path).toBe(JUDGMENT_CORE_SSOT_PATH);
  });

  it("U-JUDG-004: 対象 doc 0 件 (配線消失) は pass にしない", () => {
    const result = analyzeJudgmentCoreCoverage({ ssotVersion: 1, docs: [] });
    expect(result.ok).toBe(false);
  });

  it("U-JUDG-005: 実 repo の agents/commands 全件が SSoT と同期している (real-repo regression)", () => {
    const input = loadJudgmentCoreCoverageInput(process.cwd());
    expect(input.ssotVersion).toBe(2);
    expect(input.docs.length).toBeGreaterThan(0);
    const result = analyzeJudgmentCoreCoverage(input);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });
});
