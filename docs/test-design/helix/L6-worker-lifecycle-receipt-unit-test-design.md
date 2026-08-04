---
title: "worker lifecycle receipt L6 executable oracle設計"
layer: L8
artifact_type: test-design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L6-103-worker-lifecycle-receipt.md
pair_artifact: docs/design/helix/L6-function-design/worker-lifecycle-receipt.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker lifecycle receipt L6 executable oracle設計

`tests/worker-isolation-broker.test.ts`の`U-WLIFE-001..003`を実行oracleとし、`tests/design-reality-binding.test.ts::U-DRB-023`がrun/review seal、proposal join、terminal分岐、event previous digestを個別に除去するとRedになることを要求する。`tests/l12-hybrid-recognition.test.ts::U-WLIFE-004`はL4設計の外部worker非authority境界をcontent digestへ束縛し、未登録・staleならRedにする。
