---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-53-agent-context-efficiency.md
---

> **L6 contract marker**: `assertAgentContextEfficiency(agentDocs: AgentDoc[], judgmentCoreText: string) => AgentContextEfficiencyResult` は unit-test 粒度の contract。pre: agentDocs は `.claude/agents/*.md` の本文集合。post: U-CTX-001..004 の oracle が全て green のときだけ合格。invariant: 判断規律の内容（judgment-core の規範）は変更せず、記載場所と読み込み範囲のみ変更する。

# サブエージェント コンテキスト効率 — 機能設計

## §1 範囲

委譲 1 回あたりの固定コンテキスト消費を削減する。2026-07-06 検査の実測:
(C1) `.claude/agents/` の 9 agent が「作業前に必ず CLAUDE.md（263 行）+ .claude/CLAUDE.md
（239 行）+ docs/governance/README.md を Read」と指示 = 委譲毎に 500 行超（概算 15–20K tokens）。
(C2) `.claude/agents/code-reviewer.md` だけが 5 軸 ×4 項目チェックリストをベタ書きし、
judgment-core SSoT 参照パターン（他 20 agent は参照 1 行）から逸脱。

対象は「読む側の指示」と「記載場所」のみ。CLAUDE.md 本文の削減・SessionStart feedback surface
（既に limit + 集約済みで良好と判定）は対象外。

## §2 設計規則

| 対象 | 規則 |
|---|---|
| role-scoped read 指示 (C1) | 全文 Read 指示を廃し、role 別必要節のみの節限定 Read 指示へ置換。共通必須 = CLAUDE.md「実装規則」「Git Rules」節 + .claude/CLAUDE.md「Guard 規則」節。se/be/fe 系 += 「構成境界」節。review 系 += judgment-core §4/§5。`docs/governance/README.md` の全文 Read 指示は全 agent から削除（governance 詳細は委譲ブリーフ【ツール方針】で lead が対象 doc を明示する運用）。 |
| 5 軸 SSoT 統合 (C2) | code-reviewer.md の 5 軸チェックリストを `docs/skills/judgment-core.md` の新節へ移し、agent 側は参照 1–2 行へ圧縮。judgment-core は versioned SSoT のため version up（v1→v2）+ 全 marker 追随（`judgment-core-coverage` gate fail-close に従う）。 |
| 節見出しの実在保証 | 置換後 `grep -n "^## " CLAUDE.md .claude/CLAUDE.md` で指定節が実在することを確認。見出し改名時に指示が空振りしないよう U-CTX lint が節名の存在も検査する。 |

## §3 Runtime 挙動

- agent 定義は Claude Code が委譲時にフルロードするため、指示の置換は即時反映（コード変更なし）。
- fail 挙動: 指示された節が見つからない場合、agent は Read を skip せず親（lead）へ節名の
  齟齬を報告する（silent skip を指示文で禁止する）。

## §4 Test oracle 設計

Covered by `tests/agent-context-efficiency.test.ts`（文字列 lint）:

| ID | oracle |
|---|---|
| U-CTX-001 | `.claude/agents/*.md` に governance/README.md の必読指示が残らない |
| U-CTX-002 | CLAUDE.md 全文 Read 指示を持つ agent = 0 件（節限定は許可） |
| U-CTX-003 | code-reviewer.md が judgment-core 5 軸節を参照し、5 軸見出しのベタ書きなし |
| U-CTX-004 | judgment-core version と全参照 marker version の一致（既存 gate があれば gate green を条件に流用） |
