---
title: "専門agent registry L8 integration test設計"
layer: L5
executed_at_layer: L8
artifact_type: test_design
status: draft
created: 2026-07-28
updated: 2026-07-28
owner: QA
plan: docs/plans/PLAN-L5-81-specialist-agent-registry.md
pair_artifact: docs/design/helix/L5-detail/specialist-agent-registry.md
---

# 専門agent registry L8 integration test設計

| oracle | mutation | 合格条件 |
|---|---|---|
| IT-SAREG-001 | definition byteを変更 | digest drift |
| IT-SAREG-002 | launch IDをallowlist外へ変更 | admission denied |
| IT-SAREG-003 | capabilityを欠落 | worker missing |
| IT-SAREG-004 | verifierをworkerと同providerだけにする | independent verifier missing |
| IT-SAREG-005 | verification axisを欠落 | verifier missing |

部分的に選べたentryを成功へ丸めず、全要求の論理積をteam admissionとする。
