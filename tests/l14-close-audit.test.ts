import { describe, expect, it } from "vitest";
import {
  analyzeL14CloseAudit,
  l14CloseAuditMessages,
  loadL14CloseAuditInput,
} from "../src/lint/l14-close-audit";

const compliant = `# A-TEST

| Item | 監査質問 | Current evidence | Gap | 境界 | 次アクション | Status |
|---|---|---|---|---|---|---|
| P0-forward-convergence | Forward へ戻るか | \`src/lint/forward-convergence.ts\`、\`tests/semantic-frontier-consistency.test.ts\` | なし | Forward / semantic frontier | なし | \`closed\` |
| P1-autonomous-engine | 自律完了 claim を制限するか | \`src/lint/completion-decision-packet.ts\`、\`tests/completion-decision-packet.test.ts\` | version-up parked | completionClaimAllowed=false / version-up | decision packet を継続 | \`blocked-human\` |
| P2-orchestration-loop | loop が追跡されるか | \`docs/plans/PLAN-L7-304-loop-iterations-db-schema.md\`、\`docs/plans/PLAN-L7-307-loop-continuous-run-heartbeat.md\` | runtime polish | heartbeat / loop | child PLAN 継続 | \`partial\` |
| P3-verification-foundation | 検証が対で凍結されるか | \`docs/process/gates.md\`、\`tests/vmodel-pair.test.ts\` | なし | G8-G14 / pair | なし | \`closed\` |
| P4-self-maintenance | feedback が保守へ戻るか | \`.helix/audit/A-134-harness-telemetry-self-improvement-audit.md\`、\`src/lint/telemetry-closure.ts\` | なし | feedback / improvement | なし | \`closed\` |
| P5-context-efficiency | context 注入が bounded か | \`docs/plans/PLAN-L7-315-context-doc-router.md\`、\`tests/context-doc-router.test.ts\` | CLI hook 未接続 | context / fail-open | router 配線を継続 | \`partial\` |
| P6-github-automation | GitHub 操作は gate 経由か | \`.github/workflows/harness-check.yml\`、\`docs/plans/PLAN-L7-230-destructive-git-command-guard.md\` | main merge は未実行 | push / PR | green 後に明示 stage/commit/push | \`partial\` |
| P7-agent-memory | memory が DB と結び付くか | \`docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md\`、\`docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md\` | runtime 適用中 | memory / DB | memory PLAN 継続 | \`partial\` |
| P8-external-security | 不可逆操作が承認待ちになるか | \`src/lint/action-binding-approval-readiness.ts\`、\`src/lint/cutover-readiness.ts\` | cutover approval pending | human / cutover | PLAN-M-02 承認待ち | \`blocked-human\` |
| P9-db-convergence | DB projection に収束するか | \`src/state-db/projection-writer.ts\`、\`tests/projection-writer.test.ts\` | なし | harness.db / projection | なし | \`closed\` |
`;

describe("l14-close-audit lint", () => {
  it("accepts a HELIX P0-P9 close matrix with explicit open boundaries", () => {
    const result = analyzeL14CloseAudit({
      repoRoot: process.cwd(),
      auditPath: "A-TEST.md",
      auditMd: compliant,
    });

    expect(result.ok).toBe(true);
    expect(result.rows).toHaveLength(10);
    expect(result.openRows).toHaveLength(6);
    expect(l14CloseAuditMessages(result)[0]).toContain("OK");
  });

  it("fails missing required evidence and boundary markers", () => {
    const result = analyzeL14CloseAudit({
      repoRoot: process.cwd(),
      auditPath: "A-TEST.md",
      auditMd: compliant
        .replace("`tests/vmodel-pair.test.ts`", "`tests/missing-vmodel-pair.test.ts`")
        .replace("G8-G14 / pair", "G8-G14"),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "P3-verification-foundation: missing required evidence citation tests/vmodel-pair.test.ts",
    );
    expect(result.violations).toContain("P3-verification-foundation: missing boundary marker pair");
  });

  it("fails non-closed rows without a concrete gap or next action", () => {
    const result = analyzeL14CloseAudit({
      repoRoot: process.cwd(),
      auditPath: "A-TEST.md",
      auditMd: compliant
        .replace("runtime polish", "なし")
        .replace("child PLAN 継続", "なし"),
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContain("P2-orchestration-loop: non-closed row must name a gap");
    expect(result.violations).toContain(
      "P2-orchestration-loop: non-closed row must name next action",
    );
  });

  it("live repo keeps the L14 close matrix machine-checkable", () => {
    const result = analyzeL14CloseAudit(loadL14CloseAuditInput());

    expect(result.ok).toBe(true);
    expect(result.rows.map((row) => row.item)).toEqual([
      "P0-forward-convergence",
      "P1-autonomous-engine",
      "P2-orchestration-loop",
      "P3-verification-foundation",
      "P4-self-maintenance",
      "P5-context-efficiency",
      "P6-github-automation",
      "P7-agent-memory",
      "P8-external-security",
      "P9-db-convergence",
    ]);
    expect(result.openRows).toHaveLength(7);
    expect(
      result.rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      }, {}),
    ).toEqual({
      "blocked-human": 2,
      closed: 3,
      partial: 5,
    });
  });
});
