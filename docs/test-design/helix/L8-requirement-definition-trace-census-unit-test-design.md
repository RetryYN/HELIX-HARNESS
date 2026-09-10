---
title: "Requirement↔Definition trace census L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-09
updated: 2026-09-09
owner: QA / Codex TL
plan: docs/plans/PLAN-RECOVERY-1684-requirement-definition-trace-census.md
pair_artifact: docs/design/helix/L6-function-design/requirement-definition-trace-census.md
github_issue_id: 1684
behavior_contract_id: REQUIREMENT-DEFINITION-TRACE-CENSUS-001
responsibility_owner: requirement-ir-authority
---

# Requirement↔Definition trace census L8単体テスト設計

本書は、canonical Requirement IRの宣言IDから多対多traceと最低限のfindingを導くL6契約を、
`tests/requirement-definition-trace-census.test.ts`へ降ろす。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RDTC-001 | 正当なmany-to-many共有 | 2 Requirementが1 Definitionを共有しても`VALID_SHARED_REQUIREMENT`と`SHARED_BY`になり、`DUPLICATE_SEMANTIC_OBLIGATION`を出さない | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-002 | Requirement orphan | primary Definitionが無いと`REQUIREMENT_WITHOUT_DEFINITION`とorphan REFINESになる | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-003 | Definition orphan | 親Requirementが0件だと`DEFINITION_WITHOUT_REQUIREMENT`になる | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-004 | revision非推測 | 明示bindingが無いRequirement/Definition/Acceptance間でrevision番号差だけからstaleを推測しない | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-005 | ambiguous owner | primaryと`downstream_obligation.owner_id`が違うと`AMBIGUOUS_TRACE`になる | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-006 | 決定性と既存owner | 入力順を入れ替えてもgraph digestが一致し、REFINES ownerは既存`owner_id`だけを使う | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-007 | current canonical IR | 実IR投影でも共有契約をduplicateにせず、同一入力のdigestが再安定する | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-008 | Acceptance contract | Acceptanceのcontractがprimaryと不一致またはunknownならambiguousになりsilent greenしない | `tests/requirement-definition-trace-census.test.ts` |
| U-RDTC-009 | finding ID境界 | finding構成要素をlength-prefixし、delimiter由来のID衝突を許さない | `tests/requirement-definition-trace-census.test.ts` |

## Red／Green／mutation境界

共有契約をduplicateへ分類するmutation、根拠なくrevision差をstale化するmutation、owner/Acceptance
contract不一致を無視するmutation、duplicate record先頭採用、locale依存整列は対応oracleでredになる。
テストはRequirement本文を書き換えず、
DB/GitHub writeと`src/cli.ts`編集を行わない。
