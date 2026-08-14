---
title: "Workflow interview／unresolved L9結合テスト設計"
layer: L9
executed_at_layer: L9
artifact_type: test_design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: QA / TL
plan: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
pair_artifact: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
---

# Workflow interview／unresolved L9結合テスト設計

| ID | system scenario | expected |
|---|---|---|
| IT-UWINT-001 | signalなしsourceをinterview portへ渡す | coreだけを返し、write／dispatch 0 |
| IT-UWINT-002 | 15 signalを個別に切り替える | 対応questionだけ増減し、非該当要求を生成しない |
| IT-UWINT-003 | stale／authority不足／矛盾回答をenvelopeへ接続する | unresolved保持、freeze／activation denied |
| IT-UWINT-004 | source spanまたはquestion historyを欠落させる | admission denied、推測補完0 |

Node admission側はevaluationを再検証し、`freeze_allowed=false`時のDB/Git/GitHub writeを0件とする。
