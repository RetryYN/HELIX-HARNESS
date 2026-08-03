---
title: "worker context authority関数設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L6-100-worker-context-authority.md
pair_artifact: docs/test-design/helix/L6-worker-context-authority-unit-test-design.md
related_l5: docs/design/helix/L5-detail/worker-context-authority.md
github_issue_id: 225
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
---

# worker context authority関数設計

- `attestWorkerContextAuthority`: actual HEADとcanonical authority/rule file bytesを照合しsealed authorityを返す。
- `reattestWorkerContextAuthority`: broker直前に同じHEAD blobとworktree bytesを再照合し、dirty化を拒否する。
- `loadWorkerContextBoundaryFile`: CLI/loopの明示JSON boundaryを検証し、current authority capabilityへ接続する。
- `compileWorkerContextPacket`: boundary、role/lens、payloadからstrict packetとsealed envelopeを返す。
- `verifyWorkerContextEnvelope`: HEAD、output schema、role、task、envelope digestを再検証する。
- `buildContextBoundWrapperAdapterPlan`: 既存adapter promptをcompileし、wrapper originとcontext capabilityを同時発行する。
- `admitWrapperLaunch(..., { requireWorkerContext: true })`: CLI/team/pair/loopのprocess境界を一括fail-closeする。
- `prepareWorkerIsolationLaunch`: descriptor output schemaとrepository HEADを使い、spawn前にcontextを再検証する。

WeakSet/WeakMapは同一process内のcopy防止であり、署名やcross-process tokenとは主張しない。永続化、DB、Git write、
provider固有forkは0。failure exact setとreachability正本はL5 §2/§3とする。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "worker-context-runtime", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-context-packet.ts", "resource_kind": "typescript_export", "resource_name": "verifyWorkerContextEnvelope", "source_digest": "sha256:27407a97b1d4920f68883ff5d9fb369dcb978e5f00f83f4a446f062161773ecc", "current_authority": true },
    { "asset_id": "worker-context-adapter", "classification": "existing_runtime", "artifact_path": "src/runtime/adapter.ts", "resource_kind": "typescript_export", "resource_name": "buildContextBoundWrapperAdapterPlan", "source_digest": "sha256:6f3dbb3408ec70b5b7db75a0cb69fb9ea196e5311aa66520632e32bb7b5ea1ae", "current_authority": true },
    { "asset_id": "worker-context-broker", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-isolation-broker.ts", "resource_kind": "typescript_export", "resource_name": "prepareWorkerIsolationLaunch", "source_digest": "sha256:25f19c3e43c9ec6223ff632746218ef3d1b8d839f02766d03378ee91afe76a1a", "current_authority": true }
  ],
  "failure_reachability": []
}
```
