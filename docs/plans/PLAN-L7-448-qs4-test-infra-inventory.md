---
plan_id: PLAN-L7-448-qs4-test-infra-inventory
title: "PLAN-L7-448 (troubleshoot): QS4 test infrastructure Vペア入口監査"
kind: troubleshoot
layer: L7
drive: agent
status: draft
route_mode: incident
entry_signals: ["po_directive:2026-07-13 /goal『テストや検出基は設計に追従』に基づきPLAN-L7-442 QS4-TEST-INFRA #6/#19/#21をexact successorへ接続"]
created: 2026-07-13
updated: 2026-08-13
owner: Codex
behavior_contract_id: QS4-TEST-INFRA-INVENTORY-001
responsibility_owner: test-infrastructure-inventory
backprop_decision: not_required
backprop_decision_reason: "fixture/reader/goldenの現状測定。共通test infrastructure設計は後続L5/L6 PLANでfreezeする。"
agent_slots: [{ role: aim, slot_label: "AIM — test authority境界" }, { role: se, slot_label: "SE — reader/fixture/golden inventory" }, { role: qa, slot_label: "QA — escaped syntax/cleanup/schema oracle" }]
generates: [{ artifact_path: docs/plans/PLAN-L7-448-qs4-test-infra-inventory.md, artifact_type: markdown_doc }]
dependencies: { parent: docs/plans/PLAN-L7-442-quality-sweep-successor-clusters.md, requires: [] }
---
# PLAN-L7-448: QS4 test infrastructure Vペア入口監査
## 工程表
| Step | 実行 | 内容 | 完了条件 |
|---|---|---|---|
| 1 | [並列] | #6 table reader、#19 temp repo/CLI fixture、#21 DDL goldenを測定 | 重複・脆弱点・cleanup漏れ一覧 |
| 2 | [直列] | shared test infrastructureのL5/L6契約を決定 | API/ownership/compatibility境界 |
| 3 | [直列] | L8/L9 oracleとimpl/refactor PLANを起票 | 3件exact ID接続 |
| 4 | [review] | 独立reviewerがfixture isolationを確認 | orphan 0、flaky risk記録 |
## 完了条件
- #6/#19/#21がexact design/impl PLANへ接続される。
- escaped table syntax、temp cleanup、schema digest driftのnegative oracleがある。

## 現行baseline再測定（2026-08-13）

最新main `ba4237af4116e984af86b3400ff1bb484597d19d`で3件を再測定した。

| annex | 現行観測 | 未完了境界 |
|---|---|---|
| #6 | `src/lint`にはMarkdown table cellを直接`split("|")`する箇所が27件あり、`plan-specific-vpair-binding.ts`と`db-projection-coverage.ts`にも個別`splitTableRow`がある | escaped pipe、code span、header separator、CRLFを同じ意味で扱うshared parserとcaller別compatibility oracleが未接続 |
| #19 | `tests/`の124 filesに`mkdtempSync`が367 callあり、そのうち21 filesは同一file内に直接`rmSync`を持たない | shared temp-repo/PLAN/CLI fixture owner、Windows retry cleanup、cleanup委譲を区別するinventoryが未接続。21 filesを即leakとは判定しない |
| #21 | `tests/state-db.test.ts`のdeterminism oracleは現在も`expect(schemaDdl()).toEqual(schemaDdl())`という同一実装の自己比較を含む | pinned golden digestとmigration後の実SQLite schemaを双方向照合するoracleが未接続 |

3件はいずれも現行mainで残存する。単なるhelper共通化ではなく、#6はMarkdown構文互換、#19はresource lifecycle、
#21はDDL authorityという別契約なので、1つの実装PRへ混載しない。exact L5/L6/test-design/impl PLAN IDが3件すべてに
割り当たるまで本PLANは`draft`を維持する。

## 次の原子的降下

1. #21 schema DDL goldenを先行し、self-comparison mutantがredになる固定digestとmigration round-tripを設計する。
2. #6 shared Markdown table readerをpure parserとして設計し、同義callerだけを段階移行する。
3. #19 shared fixture lifecycleをPOSIX/Windows両方のcleanup oracle付きで設計し、既存124 filesを一括書換えしない。

各successorはnegative mutation、既存callerの出力同値、cleanup後のpath不存在、SQLite schemaのtable/index/trigger集合を
実測する。helper数や重複行数の減少だけを完了根拠にしない。
