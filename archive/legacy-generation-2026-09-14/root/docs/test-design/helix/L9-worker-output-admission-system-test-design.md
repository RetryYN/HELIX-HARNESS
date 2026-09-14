---
title: "worker output admission L9 system test設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L4-64-worker-output-admission.md
pair_artifact: docs/design/helix/L4-basic-design/worker-output-admission.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker output admission L9 system test設計

| ST-ID | 経路 | 期待結果 |
|---|---|---|
| ST-WOA-001 | current descriptor→sealed stdin→broker→canonical output | raw stdoutを公開せずsealed capability 1件 |
| ST-WOA-002 | unknown schema／contract欠落 | spawn 0、`WORKER_OUTPUT_SCHEMA_UNRESOLVED` |
| ST-WOA-003 | nonzero／scope違反／schema違反 | capability 0、既存security failureを相殺しない |
| ST-WOA-004 | FR-06 field／DB／commit不在 | 原子scopeを維持しIssue #227をcloseしない |
