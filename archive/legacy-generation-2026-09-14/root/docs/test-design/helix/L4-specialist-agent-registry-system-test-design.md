---
title: "専門agent registry L9 system test設計"
layer: L4
executed_at_layer: L9
artifact_type: test_design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: QA
plan: docs/plans/PLAN-L4-54-specialist-agent-registry.md
pair_artifact: docs/design/helix/L4-basic-design/specialist-agent-registry.md
---

# 専門agent registry L9 system test設計

| oracle | scenario | 合格条件 |
|---|---|---|
| ST-SAREG-001 | 5 driveから既存workerを選択 | exactly-one worker候補 |
| ST-SAREG-002 | correctness/test/security axisを要求 | 各axisを別provider verifierが被覆 |
| ST-SAREG-003 | definitionまたはallowlist drift | 起動候補0、doctor red |
| ST-SAREG-004 | registry外agentを要求 | fail-close、推測fallback 0 |

L9ではselector結果を既存team adapterへ渡す直前までを検証し、実agent起動は行わない。
