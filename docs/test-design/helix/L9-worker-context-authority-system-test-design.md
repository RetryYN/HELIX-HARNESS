---
title: "worker context authority L9 system test設計"
layer: L9
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L4-66-worker-context-authority.md
pair_artifact: docs/design/helix/L4-basic-design/worker-context-authority.md
github_issue_id: 225
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
---

# worker context authority L9 system test設計

| ST-ID | 経路 | 期待結果 |
|---|---|---|
| ST-WCP-001 | current authority bytes→packet→adapter→broker | exact HEADのisolated launch一件 |
| ST-WCP-002 | compatibility／missing authority／rule | spawn 0、固有failure |
| ST-WCP-003 | style/case/specialist混同、scope/budget欠落 | compile拒否 |
| ST-WCP-004 | role/lens/output schema/payload drift | broker前再検証で拒否 |
| ST-WCP-005 | plain copy／legacy wrapper | `WORKER_CONTEXT_UNSEALED` |
| ST-WCP-006 | DB／workflow／provider fork | 新規surface 0 |
