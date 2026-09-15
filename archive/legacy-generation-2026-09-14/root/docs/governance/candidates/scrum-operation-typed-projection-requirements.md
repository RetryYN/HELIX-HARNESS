---
title: "Scrum運営層typed projection要件候補"
status: draft_candidate
authority_status: pending_canonical_promotion
candidate_layer: L3
owner_issue: 1751
plan_id: PLAN-RECOVERY-1751-scrum-operation-typed-projection
pair_artifact: docs/governance/candidates/scrum-operation-typed-projection-acceptance.md
---

# Scrum運営層typed projection要件候補

## 責務境界

管理側Scrumは見落としをS0〜S4で収束し、結果をScrum Reverseでproduct側の正規Vモデルへ返す。
ZIP内の旧YAMLはmigration provenanceであり、current runtime authorityにはしない。採用した意味を
次のtyped declarationへ一意に登録し、語句heuristicだけでobservedへ昇格しない。

| ID | operation | layer | 責務 |
| --- | --- | --- | --- |
| SCRUM-OPS-R-01 | `scrum:story-mapping` | L3 | backlogを要求・責務・release sliceへ対応付ける |
| SCRUM-OPS-R-02 | `scrum:estimation-velocity` | L3 | 見積りと実測velocityを分離して計測する |
| SCRUM-OPS-R-03 | `scrum:dor-dod` | L3 | 着手条件と完成条件をtyped gateへ束縛する |
| SCRUM-OPS-R-04 | `scrum:daily-record` | L7 | 進行・blocker・次行動をevent/receiptへ投影する |
| SCRUM-OPS-R-05 | `scrum:sprint-review` | L11 | incrementを受入条件と照合してfeedbackを生成する |
| SCRUM-OPS-R-06 | `scrum:retrospective` | L12 | 再発所見をRecovery/Reverseへ還流する |
| SCRUM-OPS-R-07 | `scrum:burndown-velocity` | L12 | 工程実績を管理指標として観測し、意味正本と分離する |

## 不変条件

- management Scrumとproduct Forwardを別laneとして保持する。
- Projectはread-side projectionであり、Issue/PLAN、event/receipt、closure evidenceを置換しない。
- 7 operationの欠落、重複、誤layer、source binding欠落をfail-closeする。
- ceremonyとmetricの観測値がゼロのまま管理工程完了を主張しない。
