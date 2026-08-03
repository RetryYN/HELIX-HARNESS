---
title: "worker blind benchmark関数設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L6-101-worker-blind-benchmark.md
pair_artifact: docs/test-design/helix/L6-worker-blind-benchmark-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-blind-benchmark.md
github_issue_id: 225
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
---

# worker blind benchmark関数設計

- `freezeWorkerBlindBenchmark`: exact definitionを検証しprocess-local capabilityへsealする。
- `buildWorkerBlindPacket`: broker sealed outputをcurrent admissionへ再照合し、execution originをWeakMap側へ隔離してblind packetへidentityを露出しない。
- `evaluateWorkerBlindBenchmark`: packet digestへ束縛されたsealed judge outputからだけexact rubricとhost observationを読み、異なるprovenance 2件以上をstable ranking/selection receiptへsealする。
- `isWorkerBlindBenchmarkReceipt`: plain copyを拒否しrepository-owned receiptだけを判定する。

pure coreはfilesystem、DB、network、clockを読まない。重大failure dispositionはFR-08へ残す。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "worker-blind-benchmark", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "buildWorkerBlindPacket", "source_digest": "sha256:6bf2718a97bf5e1b513a2ad317d8cfa57b2bb3c54e17eb4cad1fdab380e9b60f", "current_authority": true }
  ],
  "failure_reachability": []
}
```
