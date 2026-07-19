---
title: "Scrum Reverse・設計Refactor・検証計測エンジン受入テスト設計"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: confirmed
created: 2026-07-18
updated: 2026-07-18
owner: QA
pair_artifact: docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md
---

# Scrum Reverse・設計Refactor・検証計測エンジン受入テスト設計

- pair: `docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md`
- status: confirmed

| AC | 合格条件 |
|---|---|
| SRV-AC-001 | Scrum slice fixtureがSR receiptなしではrelease-readyにならない |
| SRV-AC-002 | SR phase欠落、飛越、別HEAD、stale evidenceを全て拒否する |
| SRV-AC-003 | code-only観測をL1〜L5の必要資産へmappingし、説明不能部分をfinding化する |
| SRV-AC-004 | contract/structure/performance/stateの境界fixtureが4 routeへexactly oneで分類される |
| SRV-AC-005 | semantic同等・consumer/oracle保持時だけDesign Refactorを許可する |
| SRV-AC-006 | 名前だけ類似、要求外汎用化、機能追加混載を拒否する |
| SRV-AC-007 | baseline/workload/budget/oracle未凍結の性能変更を開始拒否する |
| SRV-AC-008 | FR/NFR fixtureからtest contractとmeasurement contractが両方生成される |
| SRV-AC-009 | metric contract必須fieldの各欠落fixtureがschema failする |
| SRV-AC-010 | 13品質領域がapplicable/N/A-with-reasonへ全件dispositionされる |
| SRV-AC-011 | test greenでもmetric missing/stale/nonrepresentative/failならcompletionがfalseになる |
| SRV-AC-012 | L5→L7→L8→L9→L10→L11→L12 evidence lineageが同一metric IDで追跡できる |
| SRV-AC-013 | 改善前後の同条件比較と副作用検査がなくperformance gainを承認しない |
| SRV-AC-014 | 再発findingがthreshold到達時だけgate/skill/template候補へ昇格する |
