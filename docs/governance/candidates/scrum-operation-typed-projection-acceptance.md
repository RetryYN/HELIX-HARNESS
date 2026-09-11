---
title: "Scrum運営層typed projection受入候補"
status: draft_candidate
authority_status: pending_canonical_promotion
candidate_layer: L10
owner_issue: 1751
plan_id: PLAN-RECOVERY-1751-scrum-operation-typed-projection
parent_design: docs/governance/candidates/scrum-operation-typed-projection-requirements.md
---

# Scrum運営層typed projection受入候補

| AC-ID | Given | When | Then |
| --- | --- | --- | --- |
| SCRUM-OPS-AC-01 | 7 operationのL3/L10候補がある | declarationを走査する | operation、layer、owner、sourceがexact setで得られる |
| SCRUM-OPS-AC-02 | declarationが1件欠落する | current-locationを生成する | missingが1以上になり管理工程完了を拒否する |
| SCRUM-OPS-AC-03 | categoryまたはlayerを誤配線する | DB projectionを再構築する | typed mismatchを検出し、語句一致で相殺しない |
| SCRUM-OPS-AC-04 | 7件が正しく登録される | DB rebuildを2回実行する | projection digestが収束し、Scrum operation missingが0になる |
| SCRUM-OPS-AC-05 | ceremonyとmetricが登録済みである | roadmapとvmodel fitを生成する | ceremony/metricが非ゼロで同じDB根拠を返す |
| SCRUM-OPS-AC-06 | S4で採否を決定する | Scrum Reverseを実行する | 対象Issue/PLANとL1〜L12の還流先がtyped evidenceで追跡できる |

## PLAN固有oracle

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-SCRUMOPS-001 | L3/L10候補pair | operation集合、pair metadata、受入条件のいずれかが欠ければ失敗する | `tests/current-location.test.ts` |

## 検証順序

Red、Green、mutation kill、DB rebuild 2回、current-location／roadmap／vmodel fit、
exact-HEAD独立review、CI、S4 decisionの順序を維持する。
