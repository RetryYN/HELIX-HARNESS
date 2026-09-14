---
title: "worker lifecycle receipt基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: Architect
plan: docs/plans/PLAN-L4-69-worker-lifecycle-receipt.md
pair_artifact: docs/test-design/helix/L9-worker-lifecycle-receipt-system-test-design.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker lifecycle receipt基本設計

## 1. 目的

worker実行を`requested -> admitted -> sandboxed -> running -> proposal_received -> revalidated -> accepted/rejected/quarantined`として再生し、parent/child exact set、current HEAD、admission、sandbox、diff、egress、output、独立reviewを一つのreceiptへ束縛する。

## 2. component境界

- isolation brokerは既存sealed launch/output/observationからrun receiptを生成する。
- lifecycle projectorはrun receiptとWCC-FR-06 sealed reviewだけを受理し、hash-chain eventとterminal receiptを生成する。
- Node callerだけがserialization後の永続化を行える。worker、reviewer、Pythonへwrite/commit authorityを与えない。

## 3. 不変条件

- copied/unsealed run receipt、review receipt、別proposal reviewを拒否する。
- `approve`は`accepted`だけ、`reject`は`rejected|quarantined`だけへ遷移する。
- terminal後の遷移は存在せず、event sequenceとprevious digestはexact chainとする。
- 新DB table、workflow、provider固有分岐を追加しない。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "worker-isolation-run-receipt", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-isolation-broker.ts", "resource_kind": "typescript_export", "resource_name": "resolveWorkerIsolationRunReceipt", "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d", "current_authority": true },
    { "asset_id": "worker-lifecycle-receipt", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-lifecycle-receipt.ts", "resource_kind": "typescript_export", "resource_name": "createWorkerLifecycleReceipt", "source_digest": "sha256:0bffec75b257d7f101ade5e7e54974e13a46e596b714ecf1ed4d747f8553e2a4", "current_authority": true }
  ],
  "failure_reachability": []
}
```
