/**
 * memory-promotion — Stop 時の harness memory 昇格忘れを検出する純判定。
 *
 * L6: docs/design/harness/L6-function-design/feedback-lifecycle.md §7
 * V-pair: U-FLIFE-011..012
 */

import { createHash } from "node:crypto";
import type { SessionEvent } from "./session-log";

export const MEMORY_PROMOTION_WARNING =
  "[helix memory] warning: 成功した commit/plan_switch がありますが、成功した memory_write がありません。\n";

export interface MemoryPromotionNudgeDecision {
  shouldNudge: boolean;
  reason:
    | "promotion_candidate_without_memory"
    | "no_successful_promotion_candidate"
    | "memory_already_written"
    | "nudge_already_recorded";
}

/**
 * session event の構造化 field だけを読む。body/diff/tool input/provider transcript は参照しない。
 * 成功 (`outcome=ok`) だけを根拠にし、失敗・dry-run・outcome 不明は memory write 済みと扱わない。
 */
export function memoryPromotionNudge(
  events: readonly SessionEvent[],
): MemoryPromotionNudgeDecision {
  if (events.some((event) => event.event_type === "memory_promotion_nudge")) {
    return { shouldNudge: false, reason: "nudge_already_recorded" };
  }
  const hasPromotionCandidate = events.some(
    (event) =>
      (event.event_type === "commit" || event.event_type === "plan_switch") &&
      event.outcome === "ok",
  );
  if (!hasPromotionCandidate) {
    return { shouldNudge: false, reason: "no_successful_promotion_candidate" };
  }
  const hasSuccessfulMemoryWrite = events.some(
    (event) => event.event_type === "memory_write" && event.outcome === "ok",
  );
  if (hasSuccessfulMemoryWrite) {
    return { shouldNudge: false, reason: "memory_already_written" };
  }
  return { shouldNudge: true, reason: "promotion_candidate_without_memory" };
}

/** deterministic dedupe key。session id は event payload へ重複保存しない。 */
export function memoryPromotionNudgeEventId(sessionId: string): string {
  return `memory-promotion-nudge:${memoryPromotionSessionRef(sessionId)}`;
}

export function memoryPromotionSessionRef(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex").slice(0, 24);
}
