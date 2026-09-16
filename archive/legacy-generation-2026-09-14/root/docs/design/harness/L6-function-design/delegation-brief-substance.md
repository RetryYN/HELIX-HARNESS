---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-52-delegation-brief-substance.md
---

> **L6 contract marker**: `thinBriefMarkers(text: string) => string[]` は unit-test 粒度の contract。pre: text は任意文字列。post: 返り値は薄い marker の key 配列（決定論）。invariant: `evaluateAgentGuard` の allow/deny 判定を一切変えない（advisory のみ、fail-close 挙動不変）。

# 委譲ブリーフ実質検査（thin-brief advisory）— 機能設計

## §1 範囲

PLAN-L7-337 の委譲ブリーフ 4 marker 強制は marker 文字列の存在検査のみで、marker 直後が
空でも合格する（`missingBriefMarkers` = `text.includes(label)`）。本設計は marker 区間の実質
文字数を検査する advisory warn を追加し、下位モデル worker への空疎な委譲を可視化する。
block 化はしない（誤検知の運用実績を見てから別途判断）。あわせて `SUBAGENT_ALLOWLIST` に
be-* / db-schema / devops-deploy が意図的に含まれない（Codex delegation-only）ことを
コード コメントで明文化する。

## §2 関数 / 定数 contract

| 対象 | contract |
|---|---|
| `BRIEF_MARKER_MIN_SUBSTANCE_CHARS = 20` (`src/runtime/agent-guard-policy.ts`) | 実質文字数の下限。空白・改行は実質文字数に数えない。 |
| `thinBriefMarkers(text)` (`src/runtime/agent-guard.ts` 新設) | `DELEGATION_BRIEF_MARKERS` 各 marker のラベル出現位置から次の任意 marker ラベル（無ければ文末）までの区間の実質文字数が下限未満なら当該 key を返す。marker 不在は対象外（existence は `missingBriefMarkers` の責務、二重報告しない）。英語・日本語ラベル両対応。 |
| `evaluateAgentGuard` 組み込み | 全 marker が存在し block されないケースに限り `thinBriefMarkers` を評価、非空なら `decision.message` に thin-brief warning を追記。decision の allow/deny は不変。 |
| allowlist コメント | `SUBAGENT_ALLOWLIST` 直前に「be-api / be-logic / db-schema / devops-deploy は意図的に対象外（Codex delegation-only）。追加時は `.claude/CLAUDE.md` FE ロスター節の改訂と PLAN を伴う」を明記（コード変更なし）。 |

## §3 Runtime 挙動

- hook 側（`.claude/hooks/agent-guard.ts`）は `decision.message` を透過する既存経路を使う。
  透過しない場合のみ最小変更で message を表示に含める。
- fail 挙動: `thinBriefMarkers` の評価例外は握りつぶさず guard 全体の既存 fail-close 経路に従う
  が、advisory 追記自体は判定結果へ影響しない。

## §4 Test oracle 設計

Covered by `tests/agent-guard-brief-substance.test.ts`:

| ID | oracle |
|---|---|
| U-BRIEF-001 | 【目的】直後が実質 20 文字未満 → `objective` を返す |
| U-BRIEF-002 | 全 marker に十分な本文 → 空配列 |
| U-BRIEF-003 | marker 欠落は thin 側で報告しない |
| U-BRIEF-004 | thin-brief があっても allow/deny 不変（advisory） |
| U-BRIEF-005 | 英語ラベルでも同判定 |
