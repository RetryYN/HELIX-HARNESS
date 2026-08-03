---
title: "worker risk admission関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L6-102-worker-risk-admission.md
pair_artifact: docs/test-design/helix/L6-worker-risk-admission-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-risk-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission関数設計

- `readWorkerBlindBenchmarkReceiptRisk`: repository-owned receipt capabilityからriskだけを読む。plain copyは`null`。
- `decideWorkerRiskAdmission`: exact requestを検証し、critical pre-filter、risk evidence、score/cost/effort policy、stable selectionを一回で計算してreceiptをsealする。
- `isWorkerRiskAdmissionReceipt`: repository-owned receiptだけを判定しplain copyを拒否する。

pure coreはfilesystem、DB、network、clockを読まない。critical findingはscoreへ変換しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "worker-blind-receipt-risk", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "readWorkerBlindBenchmarkReceiptRisk", "source_digest": "sha256:55a923a3fc7fbfdd1a9c6392424a7ad42360b3e0aa48abe6f38e97ac2e9b8eec", "current_authority": true },
    { "asset_id": "worker-risk-admission", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-risk-admission.ts", "resource_kind": "typescript_export", "resource_name": "decideWorkerRiskAdmission", "source_digest": "sha256:b90671aa7dcd7482ef129cfec3d0eb2ce4ed5249d85b30cb3daf0d2a58370352", "current_authority": true }
  ],
  "failure_reachability": []
}
```
