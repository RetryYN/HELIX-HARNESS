/**
 * P7 共有メモリ — Red-first oracle スタブ (PLAN-L6-50 add-design Step 3)。
 *
 * pair = docs/design/helix/L6-function-design/orchestration-memory.md (①) ⇔
 *        docs/test-design/helix/orchestration-memory.md (③)。
 *
 * add-design 凍結時点の forward-citation 充足用スタブ。add-impl (L7) で Red→Green へ展開する。
 */
import { describe, it } from "vitest";

describe("P7 memory (PLAN-L6-50 add-impl で実装)", () => {
  it.todo("U-MEM-001: writeMemory は harness.db + jsonl の 2 層投影 / secret 拒否 / supersede");
  it.todo("U-MEM-002: listMemory は superseded を除外し指定層のみ createdAt 昇順");
  it.todo("U-MEM-003: surfaceMemory は harness 層のみ surface し秘匿を漏らさない");
});
