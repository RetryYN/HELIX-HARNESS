# 旧IR 153件の再配置wave台帳

status: queued_after_repository_foundation
source: [IR対象routing queue](legacy-ir-target-routing-queue.jsonl)

## 処理順

要求は削減せず、業務価値、機能、非機能、技術制約の順に対象別successorへ再配置する。各partitionを別の`requirement` PRとして扱い、前waveで確定した価値・責務を後waveの入力にする。37件のrouting containerは参照先候補であり、successorそのものではない。

| 順序 | partition | 件数 | 処理 |
|---:|---|---:|---|
| 1 | `W1-business-value::os` | 18 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 2 | `W1-business-value::harness-os-split` | 14 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 3 | `W1-business-value::unresolved-target` | 1 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 4 | `W2-functional::os` | 43 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 5 | `W2-functional::harness-os-split` | 23 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 6 | `W2-functional::unresolved-target` | 3 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 7 | `W3-nonfunctional::os` | 22 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 8 | `W3-nonfunctional::harness-os-split` | 14 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 9 | `W3-nonfunctional::unresolved-target` | 4 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 10 | `W4-technical-constraint::os` | 1 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |
| 11 | `W4-technical-constraint::unresolved-target` | 10 | 原要求ID・原文・digestを保持し、対象・successor・保持atom・未被覆atomを記録 |

## 各PRの停止条件

- 親Concept／L1 revisionが確定していない。
- 対象productを一つに決められない場合に、分割successorを作らず単独ownerへ押し込もうとした。
- 原要求のactor、目的、正常系、失敗、回復、制約、受入のいずれかがsuccessorで未被覆になった。
- 意味変更・縮退・retireに対象revision付きの人間decisionがない。
- GitHub Issue、PR、CI、旧実装状態から要求の意味や完了を生成しようとした。

## 成立しないもの

このwave割当は作業順のprojectionであり、要求の配置、承認、変更、L3設計、実装、受入を成立させない。全153件の`successor_assignment_status`は現在`unassigned`である。
