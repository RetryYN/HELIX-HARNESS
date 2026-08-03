---
title: "worker output admission L6関数単体テスト設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L7-501-worker-output-admission.md
pair_artifact: docs/design/helix/L6-function-design/worker-output-admission.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker output admission L6関数単体テスト設計

| U-ID | 関数境界 | mutationと期待結果 |
|---|---|---|
| U-WOA-001 | `formatWorkerOutputContract` | known map／digest binding除去でRed |
| U-WOA-002..006 | `admitWorkerOutput` | schema dispatch、canonical equality、resource bound、digest check除去でRed |
| U-WIB-010..012 | broker prepare／run | Buffer境界、raw出力非公開、contract／process／output admission check除去でRed |
