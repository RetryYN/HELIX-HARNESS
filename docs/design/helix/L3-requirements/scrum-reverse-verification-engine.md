---
title: "Scrum Reverse・設計Refactor・検証計測エンジン要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-07-18
updated: 2026-07-18
owner: PO / TL
pair_artifact: docs/test-design/helix/scrum-reverse-verification-engine-acceptance.md
---

# Scrum Reverse・設計Refactor・検証計測エンジン要件

- layer: L3
- status: confirmed
- authority: `docs/governance/helix-harness-requirements_v1.3.md` §4.1〜4.3
- pair: `docs/test-design/helix/scrum-reverse-verification-engine-acceptance.md`

| ID | 要件 | 受入ID |
|---|---|---|
| SRV-FR-001 | Production Scrumの各sliceはreview/release前にScrum Reverseを実行し、実装・test・metric・運用事実をVモデル資産へbackfillする | SRV-AC-001 |
| SRV-FR-002 | SR0〜SR4は順序、同一causality、同一HEAD/evidence snapshotを維持し、欠落・飛越・staleを拒否する | SRV-AC-002 |
| SRV-FR-003 | SR2は観測事実をL1企画、L2要求/画面、L3要件、L4基本、L5詳細/test/measurement contractへtyped mappingする | SRV-AC-003 |
| SRV-FR-004 | SR3はRedesign、Design Refactor、Performance Refactor、Retrofitへexactly oneでrouteする | SRV-AC-004 |
| SRV-FR-005 | Design Refactorはsemantic/consumer/oracle/dependency evidenceで外部化、共通化、DDD object化、責務/名称是正を判断する | SRV-AC-005 |
| SRV-FR-006 | lexical/name similarityだけの統合、要求外の汎用化、機能追加との混載をscope gateで拒否する | SRV-AC-006 |
| SRV-FR-007 | Performance Refactorはbaseline、NFR budget、代表workload、統計条件、回帰oracleを変更前にfreezeする | SRV-AC-007 |
| SRV-FR-008 | 設計エンジンはFR/NFRからtest contractに加えてverification/measurement contractを生成する | SRV-AC-008 |
| SRV-FR-009 | metric contractはmetric ID、NFR、environment/data/workload、baseline、target/SLO、window、probe、evidence schema、oracle、triggerを必須にする | SRV-AC-009 |
| SRV-FR-010 | 性能、信頼性、可用性、回復性、security、privacy、accessibility、互換性、運用性、保守性、cost/resource、data quality、observabilityの適用性を全件判定する | SRV-AC-010 |
| SRV-FR-011 | code/doc/test greenでも必須metricのmissing/stale/nonrepresentative/failがあればsystem completionを拒否する | SRV-AC-011 |
| SRV-FR-012 | L5設計→L7 probe実装→L8局所→L9結合→L10 system→L11利用実態→L12時間軸のmeasurement lineageを保持する | SRV-AC-012 |
| SRV-FR-013 | 改善後は同一条件比較、効果量、分散、退行、副作用、測定overheadを記録し、改善不成立ならrollback/rerouteする | SRV-AC-013 |
| SRV-FR-014 | 成功/失敗recipeをmemoryへ記録し、再発閾値でdetector/gate/skill/template候補へ昇格する | SRV-AC-014 |

## 完了式

`scrum_slice_ready = SR0..SR4 current ∧ V_asset_backfill_closed ∧ route_exactly_one ∧ pair_freeze_pass`

`system_complete = functional_AC_green ∧ required_metrics_current ∧ NFR_targets_pass ∧ operation_window_satisfied ∧ unresolved_measurement_findings=0`
