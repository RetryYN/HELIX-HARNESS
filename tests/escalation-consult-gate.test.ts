// PLAN-L7-549-escalation-consult-gate
// oracle: docs/test-design/harness/L8-unit-test-design.md §escalation-consult gate
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSULT_OVERRIDE_RELATIVE_PATH,
  CONSULT_RECEIPT_RELATIVE_PATH,
  CONSULT_RECEIPT_TTL_MS,
  detectEscalationIntent,
  evaluateEscalationConsultGate,
  extractLastAssistantText,
  overrideMarkerNonce,
  recordConsultReceipt,
} from "../src/runtime/escalation-consult-gate";

function transcriptLine(text: string, type = "assistant"): string {
  return JSON.stringify({ type, message: { content: [{ type: "text", text }] } });
}

describe("escalation-consult-gate", () => {
  let repoRoot: string;
  let transcriptPath: string;

  beforeEach(() => {
    repoRoot = mkdtempSync(join(tmpdir(), "esc-gate-"));
    mkdirSync(join(repoRoot, ".helix", "state"), { recursive: true });
    transcriptPath = join(repoRoot, "transcript.jsonl");
  });

  afterEach(() => {
    rmSync(repoRoot, { recursive: true, force: true });
  });

  describe("detectEscalationIntent", () => {
    it("エスカレーション文言を検出する", () => {
      expect(detectEscalationIntent("この件は PO へ確認が必要です")).toBe(true);
      expect(detectEscalationIntent("PO 判断待ちとします")).toBe(true);
      expect(detectEscalationIntent("エスカレーションします")).toBe(true);
      expect(detectEscalationIntent("ご判断を仰ぎたい点があります")).toBe(true);
      expect(detectEscalationIntent("POの判断が必要です")).toBe(true);
      expect(detectEscalationIntent("We should escalate this to the PO")).toBe(true);
    });

    it("通常の完了報告は検出しない", () => {
      expect(detectEscalationIntent("テストは全件 green です。PR を作成しました。")).toBe(false);
      expect(detectEscalationIntent("")).toBe(false);
    });

    it("否定文脈 (エスカレーション不要 等) は検出しない", () => {
      expect(detectEscalationIntent("この件はエスカレーション不要です。AI 自走で進めます。")).toBe(
        false,
      );
      expect(detectEscalationIntent("エスカレーションせず通常ゲートで進めます。")).toBe(false);
      expect(detectEscalationIntent("PO へ確認は不要と判断しました。")).toBe(false);
    });

    it("否定と肯定が混在する場合は肯定を優先して検出する", () => {
      expect(
        detectEscalationIntent("A はエスカレーション不要ですが、B は PO へ確認が必要です。"),
      ).toBe(true);
    });
  });

  describe("extractLastAssistantText", () => {
    it("最後の assistant メッセージの text を返す", () => {
      const raw = [
        transcriptLine("最初の応答"),
        transcriptLine("ユーザー発話", "user"),
        transcriptLine("最後の応答"),
        "not-json",
      ].join("\n");
      expect(extractLastAssistantText(raw)).toBe("最後の応答");
    });

    it("assistant が無ければ空文字 (fail-open 入力)", () => {
      expect(extractLastAssistantText(transcriptLine("hi", "user"))).toBe("");
    });
  });

  describe("evaluateEscalationConsultGate", () => {
    it("U-ESC-001: escalation 文言 + receipt 無し → block", () => {
      writeFileSync(transcriptPath, transcriptLine("この判断は PO へ確認します"));
      const result = evaluateEscalationConsultGate({ repoRoot, transcriptPath });
      expect(result.block).toBe(true);
      expect(result.messages.join("\n")).toContain("Sol 壁打ち receipt がありません");
    });

    it("U-ESC-002: escalation 文言 + fresh receipt (consult role) → pass", () => {
      writeFileSync(transcriptPath, transcriptLine("エスカレーションが必要です"));
      expect(
        recordConsultReceipt(repoRoot, { provider: "codex", role: "tl", task: "壁打ち論点" }),
      ).toBe(true);
      const result = evaluateEscalationConsultGate({ repoRoot, transcriptPath });
      expect(result.block).toBe(false);
      expect(result.messages.join("\n")).toContain("receipt");
    });

    it("escalation 文言 + stale receipt → block", () => {
      writeFileSync(transcriptPath, transcriptLine("PO 判断が必要です"));
      const stale = new Date(Date.now() - CONSULT_RECEIPT_TTL_MS - 60_000);
      recordConsultReceipt(repoRoot, { provider: "codex", role: "tl", task: "t" }, stale);
      expect(evaluateEscalationConsultGate({ repoRoot, transcriptPath }).block).toBe(true);
    });

    it("未来時刻の receipt は fresh 扱いしない → block", () => {
      writeFileSync(transcriptPath, transcriptLine("PO 判断が必要です"));
      recordConsultReceipt(
        repoRoot,
        { provider: "codex", role: "tl", task: "t" },
        new Date(Date.now() + 60_000),
      );
      expect(evaluateEscalationConsultGate({ repoRoot, transcriptPath }).block).toBe(true);
    });

    it("U-ESC-003: escalation 無し → fail-open (receipt 不問)", () => {
      writeFileSync(transcriptPath, transcriptLine("実装完了。テスト green。"));
      expect(evaluateEscalationConsultGate({ repoRoot, transcriptPath }).block).toBe(false);
    });

    it("transcript 欠落・path 無し → fail-open", () => {
      expect(evaluateEscalationConsultGate({ repoRoot }).block).toBe(false);
      expect(
        evaluateEscalationConsultGate({ repoRoot, transcriptPath: join(repoRoot, "missing") })
          .block,
      ).toBe(false);
    });

    it("schema は満たすが consult role でない receipt (role=qa 等) は block (B-1)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      writeFileSync(
        join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH),
        JSON.stringify({
          ts: new Date().toISOString(),
          provider: "codex",
          role: "qa",
          task_digest: `sha256:${"a".repeat(64)}`,
        }),
      );
      const result = evaluateEscalationConsultGate({ repoRoot, transcriptPath });
      expect(result.block).toBe(true);
      expect(result.messages.join("\n")).toContain("role=qa");
    });

    it("task_digest の無い receipt (旧形式/手書き) は block (B-1)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      writeFileSync(
        join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH),
        JSON.stringify({ ts: new Date().toISOString(), provider: "codex", role: "tl" }),
      );
      expect(evaluateEscalationConsultGate({ repoRoot, transcriptPath }).block).toBe(true);
    });

    it("解析不能な timestamp の receipt は fail-open + WARN (B-3 semantic invalid)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      writeFileSync(
        join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH),
        JSON.stringify({ ts: "not-a-date", provider: "codex", role: "tl" }),
      );
      const result = evaluateEscalationConsultGate({ repoRoot, transcriptPath });
      expect(result.block).toBe(false);
      expect(result.messages.join("\n")).toContain("fail-open");
    });

    it("receipt が存在するが解析不能 → fail-open + warning (tri-state)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      writeFileSync(join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH), "{broken json");
      const result = evaluateEscalationConsultGate({ repoRoot, transcriptPath });
      expect(result.block).toBe(false);
      expect(result.messages.join("\n")).toContain("fail-open");
    });

    it("receipt が存在するが読取エラー → fail-open (tri-state)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      const receiptPath = join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH);
      writeFileSync(receiptPath, '{"ts":"2026-08-12T00:00:00Z","provider":"codex","role":"tl"}');
      chmodSync(receiptPath, 0o000);
      try {
        expect(evaluateEscalationConsultGate({ repoRoot, transcriptPath }).block).toBe(false);
      } finally {
        chmodSync(receiptPath, 0o600);
      }
    });

    it("receipt path の stat が権限エラー → fail-open (ENOENT のみ missing 扱い)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      const stateDir = join(repoRoot, ".helix", "state");
      writeFileSync(join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH), '{"ts":"2026-08-12T00:00:00Z"}');
      chmodSync(stateDir, 0o000);
      try {
        expect(evaluateEscalationConsultGate({ repoRoot, transcriptPath }).block).toBe(false);
      } finally {
        chmodSync(stateDir, 0o700);
      }
    });

    it("non-empty override marker は transaction 経由で one-shot bypass (audit 委譲)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      const overridePath = join(repoRoot, CONSULT_OVERRIDE_RELATIVE_PATH);
      writeFileSync(overridePath, "正当な L3 承認依頼 (charter §3)");
      const runOverrideTransaction = vi.fn().mockImplementation(({ nonce }) => {
        const current = overrideMarkerNonce(repoRoot);
        if (current === null || current.nonce !== nonce) return { status: "blocked_reuse" };
        rmSync(overridePath);
        return { status: "allowed" };
      });
      const first = evaluateEscalationConsultGate(
        { repoRoot, transcriptPath },
        { runOverrideTransaction },
      );
      expect(first.block).toBe(false);
      expect(first.messages.join("\n")).toContain("audited");
      expect(first.messages.join("\n")).not.toContain("正当な L3 承認依頼");
      expect(runOverrideTransaction).toHaveBeenCalledOnce();
      // one-shot: marker 消費後の 2 回目は block
      expect(
        evaluateEscalationConsultGate({ repoRoot, transcriptPath }, { runOverrideTransaction })
          .block,
      ).toBe(true);
    });

    it("override transaction が拒否 (nonce 再利用等) なら block を維持する", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      writeFileSync(join(repoRoot, CONSULT_OVERRIDE_RELATIVE_PATH), "reuse attempt");
      const result = evaluateEscalationConsultGate(
        { repoRoot, transcriptPath },
        { runOverrideTransaction: () => ({ status: "blocked_reuse" }) },
      );
      expect(result.block).toBe(true);
      expect(result.messages.join("\n")).toContain("blocked_reuse");
    });

    it("empty override marker は bypass しない (transaction を呼ばない)", () => {
      writeFileSync(transcriptPath, transcriptLine("PO へ確認が必要です"));
      writeFileSync(join(repoRoot, CONSULT_OVERRIDE_RELATIVE_PATH), "   ");
      const runOverrideTransaction = vi.fn();
      expect(
        evaluateEscalationConsultGate({ repoRoot, transcriptPath }, { runOverrideTransaction })
          .block,
      ).toBe(true);
      expect(runOverrideTransaction).not.toHaveBeenCalled();
    });
  });

  describe("recordConsultReceipt", () => {
    it("consult role (tl) の receipt を task digest 付き JSON で書き込む", () => {
      const now = new Date("2026-08-12T00:00:00Z");
      expect(
        recordConsultReceipt(
          repoRoot,
          { provider: "codex", role: "tl", session_id: "s1", task: "相談本文" },
          now,
        ),
      ).toBe(true);
      const parsed = JSON.parse(
        readFileSync(join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH), "utf8"),
      );
      expect(parsed).toMatchObject({
        ts: now.toISOString(),
        provider: "codex",
        role: "tl",
        session_id: "s1",
      });
      expect(parsed.task_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    });

    it("consult role 以外 (qa/reviewer 等) では発行しない (B-1)", () => {
      for (const role of ["qa", "reviewer", "security", "uiux"]) {
        expect(recordConsultReceipt(repoRoot, { provider: "codex", role })).toBe(false);
      }
      expect(() => readFileSync(join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH), "utf8")).toThrow();
    });

    it("state dir が無ければ false (throw しない)", () => {
      rmSync(join(repoRoot, ".helix"), { recursive: true, force: true });
      expect(recordConsultReceipt(repoRoot, { provider: "codex", role: "tl" })).toBe(false);
    });
  });
});
