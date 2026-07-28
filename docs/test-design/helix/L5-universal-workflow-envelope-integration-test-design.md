---
title: "Universal Workflow envelope L8 integration test設計"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: QA / TL
plan: docs/plans/PLAN-L5-80-universal-workflow-envelope.md
pair_artifact: docs/design/helix/L5-detail/universal-workflow-envelope.md
---

# Universal Workflow envelope L8 integration test設計

| ID | mutation | expected |
|---|---|---|
| IT-UWENV-001 | atom ID重複、参照先state/trigger/condition/action/data欠落 | semantic reject |
| IT-UWENV-002 | coverage actual/declared差、missing非空 | activation denied |
| IT-UWENV-003 | blocking unresolved追加 | activation denied |
| IT-UWENV-004 | runtime schema/version/fallback/dead-letter欠落 | schema reject |
| IT-UWENV-005 | 3箇所のsource digest不一致 | semantic reject |

各反例はvalidation resultとwrite/dispatch 0を結合して検証する。field存在だけ、truthy文字列、
unknown fieldの黙認をgreenにしない。
