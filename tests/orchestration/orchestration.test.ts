/**
 * P2 hybrid orchestration — Red-first oracle スタブ (PLAN-L6-50 add-design Step 3)。
 *
 * pair = docs/design/helix/L6-function-design/orchestration-memory.md (①) ⇔
 *        docs/test-design/helix/orchestration-memory.md (③)。
 *
 * 本ファイルは add-design 凍結時点の forward-citation 充足用スタブ。各 oracle を `it.todo` で
 * 宣言し（module 未実装ゆえ import せず typecheck を壊さない）、add-impl (L7, writable Codex) で
 * Red→Green の実テストへ展開する。tdd_red_required=true。
 */
import { describe, it } from "vitest";

describe("P2 orchestration (PLAN-L6-50 add-impl で実装)", () => {
  it.todo("U-ORCH-001: canResume は status/window/lastVerdict/iteration の 3 条件 AND");
  it.todo("U-ORCH-002: evaluateStop は各 StopReason を判定し未知 reason を escalate で fail-close");
  it.todo("U-ORCH-003: selectVerifier は hybrid で worker と別 provider / single は fallback 記録");
  it.todo("U-ORCH-004: tick は resume 偽で不変 / stop 経路 / iteration++ で token を漏らさない");
  it.todo("U-ORCH-005: classifyRecovery は C1-C4 を escalate/retry/abort/continue へ分類");
  it.todo("U-ORCH-006: claimNextJob は BEGIN IMMEDIATE で競合 claim を二重取得しない");
});
