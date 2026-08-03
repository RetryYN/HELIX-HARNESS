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

- `freezeWorkerBlindBenchmark`: exact definitionを検証し、候補launch前にbrokerへ渡すexecution capabilityと一緒にsealする。
- `buildWorkerBlindPacket`: broker sealed outputをcurrent admissionへ再照合し、fixture/task/risk exact一致と同一output用host observationを要求してblind packetへidentityを露出しない。
- `buildWorkerBlindJudgeContext`: sealed packetだけをjudge taskにしたbroker用pre-execution capabilityを生成する。
- `evaluateWorkerBlindBenchmark`: judge originのpacket binding、sealed judge score、broker計測時間から、異なるprovenance 2件以上をstable ranking/selection receiptへsealする。
- `isWorkerBlindBenchmarkReceipt`: plain copyを拒否しrepository-owned receiptだけを判定する。

pure coreはfilesystem、DB、network、clockを読まない。重大failure dispositionはFR-08へ残す。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "worker-blind-benchmark", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "buildWorkerBlindPacket", "source_digest": "sha256:c911e03826d92dc9e062af2700045bc104cb21587a772ef610c8fd3c9d1e4231", "current_authority": true }
  ],
  "failure_reachability": []
}
```
