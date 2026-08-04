---
title: "worker lifecycle receipt L9 system test設計"
layer: L9
artifact_type: test-design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L4-69-worker-lifecycle-receipt.md
pair_artifact: docs/design/helix/L4-basic-design/worker-lifecycle-receipt.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker lifecycle receipt L9 system test設計

| oracle | fixture | 合格条件 |
|---|---|---|
| `IT-WLIFE-001` | proposal workerと独立reviewerをbroker実行 | seven-state receiptがcurrent HEADと全境界digestへ束縛される |
| `IT-WLIFE-002` | copied run receipt／別proposal review | lifecycle receipt 0、typed failure |
| `IT-WLIFE-003` | approve/rejectとterminalを矛盾させる | terminal receipt 0、typed failure |
