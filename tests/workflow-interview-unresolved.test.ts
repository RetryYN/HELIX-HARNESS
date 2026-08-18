import { describe, expect, it } from "vitest";
import {
  evaluateWorkflowInterview,
  WORKFLOW_CONDITIONAL_SIGNALS,
  WORKFLOW_INTERVIEW_SCHEMA_VERSION,
  WORKFLOW_QUESTION_CATALOG_VERSION,
} from "../src/workflow/workflow-interview-unresolved";

// PLAN-L7-557-workflow-interview-unresolved
const DIGEST = `sha256:${"a".repeat(64)}`;
const signals = (enabled: string[] = []) =>
  Object.fromEntries(
    WORKFLOW_CONDITIONAL_SIGNALS.map((signal) => [signal, enabled.includes(signal)]),
  );
const answer = (questionId: string, overrides: Record<string, unknown> = {}) => ({
  question_id: questionId,
  value: "確認済み",
  source_digest: DIGEST,
  source_revision: "r1",
  question_version: WORKFLOW_QUESTION_CATALOG_VERSION,
  authority: "owner",
  source_span: "lines:1-2",
  ...overrides,
});
const input = (enabled: string[] = [], answers = [answer("core.workflow")]) => ({
  schema_version: WORKFLOW_INTERVIEW_SCHEMA_VERSION,
  source: { source_id: "source:workflow", revision: "r1", digest: DIGEST, text: "申請を処理する" },
  signals: signals(enabled),
  answers,
  ambiguities: [] as Array<{ detail: string; source_span: string }>,
  branch_gaps: [] as Array<{ detail: string; source_span: string }>,
});

describe("workflow interview unresolved engine", () => {
  it("U-UWINT-001: signal 0でもcore questionをexactly once選択する", () => {
    expect(evaluateWorkflowInterview(input())).toMatchObject({
      ok: true,
      freeze_allowed: true,
      selected_question_ids: ["core.workflow"],
    });
  });

  it("U-UWINT-002: true signalだけを選択し非該当回答を拒否する", () => {
    const exact = evaluateWorkflowInterview(
      input(
        ["approval", "pii"],
        [answer("core.workflow"), answer("conditional.approval"), answer("conditional.pii")],
      ),
    );
    expect(exact.selected_question_ids).toEqual([
      "core.workflow",
      "conditional.approval",
      "conditional.pii",
    ]);
    expect(exact.freeze_allowed).toBe(true);
    expect(
      evaluateWorkflowInterview(input([], [answer("core.workflow"), answer("conditional.billing")]))
        .findings,
    ).toContainEqual(expect.objectContaining({ code: "non_applicable_answer" }));
  });

  it("U-UWINT-003: 未回答・矛盾・authority不足・branch gapを履歴付きでblockする", () => {
    const candidate = input(
      ["approval"],
      [
        answer("core.workflow"),
        answer("conditional.approval", { value: "承認者A" }),
        answer("conditional.approval", { value: "承認者B" }),
      ],
    );
    candidate.branch_gaps.push({ detail: "却下後の分岐なし", source_span: "lines:8-9" });
    const result = evaluateWorkflowInterview(candidate);
    expect(result.freeze_allowed).toBe(false);
    expect(result.unresolved_items.map((item) => item.kind)).toEqual(
      expect.arrayContaining(["contradiction", "branch_missing"]),
    );
    expect(
      result.unresolved_items.every((item) => item.source_span && item.question_history.length > 0),
    ).toBe(true);
    const missingAuthority = evaluateWorkflowInterview(
      input([], [answer("core.workflow", { authority: "unknown" })]),
    );
    expect(missingAuthority.unresolved_items[0]?.kind).toBe("authority_missing");
  });

  it("U-UWINT-004: stale source bindingのanswerを再利用しない", () => {
    for (const overrides of [
      { source_digest: `sha256:${"b".repeat(64)}` },
      { source_revision: "r0" },
    ]) {
      const result = evaluateWorkflowInterview(input([], [answer("core.workflow", overrides)]));
      expect(result.freeze_allowed).toBe(false);
      expect(result.unresolved_items[0]?.code).toBe("stale_answer");
    }
  });

  it("U-UWINT-005: 空sourceとunknown version／fieldをschema rejectする", () => {
    const empty = input();
    empty.source.text = "";
    expect(evaluateWorkflowInterview(empty).findings[0]?.code).toBe("schema_invalid");
    expect(evaluateWorkflowInterview({ ...input(), schema_version: "legacy" }).ok).toBe(false);
    expect(evaluateWorkflowInterview({ ...input(), extra: true }).ok).toBe(false);
  });
});
