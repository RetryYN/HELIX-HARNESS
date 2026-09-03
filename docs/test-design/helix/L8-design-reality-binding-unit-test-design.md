---
title: "Design Reality Binding L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/design/helix/L5-detail/design-reality-binding.md
related_l6: docs/design/helix/L6-function-design/design-reality-binding.md
---

# Design Reality Binding L8単体テスト設計

| oracle | 正例 | 反例／mutation |
|---|---|---|
| U-DRB-001 | exact path/export/digest | missing path、別symbol、digest drift |
| U-DRB-002 | 実在export | `PythonWorkerRegistry`という非実在・類似名 |
| U-DRB-003 | planned/compatibility typed境界 | current runtime/authorityへの誤昇格 |
| U-DRB-004 | identity 2-tuple | capability込みidentityでmismatchがNOT_FOUND化 |
| U-DRB-005 | capability別検証 | post-check除去mutationがOK化しない |
| U-DRB-006 | executable reason assertion | comment、文字列、`toContain()`だけのoracle |
| U-DRB-007 | PLAN lint／doctor共通解析器 | stale digestを片方だけgreenにする結線drift |
| U-DRB-008 | planned未実装／current authority境界 | 実在済みplanned、archive／migrationのexisting昇格 |
| U-DRB-009 | source callとreason assertionの同一expect束縛 | 未使用import／hardcoded reasonの偽green |
| U-DRB-010 | declared failureとwitnessの双方向exact set | 未witness、余剰、重複reason |
| U-DRB-011 | 実runtime branchを一時moduleで除去し対応Vitest oracleを実行 | 6 mutantのいずれかがgreenで生存 |
