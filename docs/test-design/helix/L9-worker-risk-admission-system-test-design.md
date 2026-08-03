---
title: "worker risk admission L9システムテスト設計"
layer: L9
artifact_type: test_design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L4-68-worker-risk-admission.md
pair_artifact: docs/design/helix/L4-basic-design/worker-risk-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission L9システムテスト設計

| ID | oracle | 証拠 |
|---|---|---|
| HAT-WCC-08 | 高score候補にscope逸脱findingがあれば平均相殺せずretireし、別候補を用途別selectする | `tests/worker-isolation-broker.test.ts` U-WRA-001 |
| HAT-HIL-22 | 用途別thresholdで同じ候補集合を異なるadmit/retireへ分岐する | `tests/worker-isolation-broker.test.ts` U-WRA-001 |
| HAT-HIL-23 | required riskごとのscore下限を平均相殺せず、最弱riskを用途別admissionへ反映する | `tests/worker-isolation-broker.test.ts` U-WRA-005 |
