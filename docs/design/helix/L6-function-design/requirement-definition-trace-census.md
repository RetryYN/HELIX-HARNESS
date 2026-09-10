---
title: "Requirement↔Definition trace census 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-09
updated: 2026-09-09
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1684-requirement-definition-trace-census.md
pair_artifact: docs/test-design/helix/L8-requirement-definition-trace-census-unit-test-design.md
github_issue_id: 1684
behavior_contract_id: REQUIREMENT-DEFINITION-TRACE-CENSUS-001
responsibility_owner: requirement-ir-authority
---

# Requirement↔Definition trace census 機能設計

## 責務

本機能は、canonical Requirement IRがすでに宣言しているstable IDだけから、Requirementと
Definitionの多対多trace graphをread-onlyで再構築する。第一sliceはRequirement、system
contract、acceptanceの宣言フィールドに限定し、要求本文の書換え、意味推測、DB/GitHub write、
CLI、新schedulerを持たない。

入力はuntrusted unknownである。callerが検証済みであることは仮定しない。出力はstable IDの
edge record exact setと、orphan / stale / ambiguous / valid sharedのfinding exact setである。

## 入出力とDbC

`compileRequirementDefinitionTraceCensus(input: unknown) => RequirementDefinitionTraceCensusResult`

| 境界 | 契約 |
|---|---|
| pre | inputはRequirement IRの宣言フィールド投影であり、caller検証済みを仮定しない |
| post | 宣言済みIDからREFINES / SATISFIES / SHARED_BY / ACCEPTED_BYを決定的に返す |
| invariant | 要求本文を変更せず、意味重複を推測せず、既存owner以外を捏造しない |
| failure | 未解決ID、owner/contract不一致、重複stable ID、入力不正をtyped findingへ閉じる |
| oracle | `U-RDTC-001`〜`U-RDTC-009` |

`requirementDefinitionTraceCensusInputFromCanonicalIr`はcanonical IRから宣言フィールドだけを
写す投影であり、新しいauthorityを作らない。

## Edgeとowner

| relation | 宣言根拠 | owner |
|---|---|---|
| REFINES | `requirement.primary_system_contract_id` | `downstream_obligation.owner_id` |
| SATISFIES | `system_contract.requirement_ids` | `system_contract_id` |
| SHARED_BY | 同一contractの解決済みrequirementが2件以上 | `system_contract_id` |
| ACCEPTED_BY | `requirement.acceptance_ids` | `downstream_obligation.owner_id` |

文字列一致だけで未宣言のrelationを確定しない。targetが無いedgeはcurrentにしない。Acceptanceの
`system_contract_id`はRequirementのprimary contractと実在contractへ照合する。重複stable IDは
先頭recordを採用せずedge生成から除外する。明示revision/digest bindingが無い異種record間では、
revision番号の一致・不一致だけからfreshnessを推測しない。

## Finding

| code | 条件 | 欠陥か |
|---|---|---|
| REQUIREMENT_WITHOUT_DEFINITION | primary Definitionが存在しない | 欠陥 |
| DEFINITION_WITHOUT_REQUIREMENT | 解決済み親Requirementが0件 | 欠陥 |
| STALE_REVISION_EDGE | 後続sliceで明示revision/digest bindingがstale | 欠陥 |
| AMBIGUOUS_TRACE | owner不一致、未解決宣言ID、重複ID、入力不正 | 欠陥 |
| VALID_SHARED_REQUIREMENT | 1 Definitionを複数Requirementが共有 | 欠陥ではない |

正当なmany-to-many共有は`DUPLICATE_SEMANTIC_OBLIGATION`へ分類しない。第一sliceは意味重複検出を
実装せず、共有をduplicateへ誤変換する経路を持たない。出力整列はlocale非依存のbytewise比較、
finding IDはlength-prefixで構成要素境界を保持する。

## 非対象

Issue/PLAN/code/runtime evidenceのunbound検出、#1170の意味保存修復、#1169の再入場、
#1682機能台帳、#1685進捗投影、doctor/CLI配線、Requirement本文の自動書換え。
