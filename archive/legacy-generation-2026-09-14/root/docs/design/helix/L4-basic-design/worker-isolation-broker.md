---
title: "worker isolation broker基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L4-62-worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L9-worker-isolation-broker-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 226
behavior_contract_id: WCC-FR-03
responsibility_owner: worker-isolation-broker
---

# worker isolation broker基本設計

## 1. 境界

`WorkerIsolationBroker`はcurrent descriptor admission、immutable wrapper execution、repository-owned runtime catalogが事前承認した
backend/runtimeのexact path＋content digest、allowlisted input bytesを受け、repo外scratchへ
regular fileだけをcopyした後、Linux bubblewrap processを起動する。repo root、`.git`、`.helix`、`harness.db`、parent envはbindしない。
git worktreeは`.git`がcommon repository/historyへ接続するため採用しない。

```text
descriptor decision + current snapshot + sealed wrapper execution + input allowlist
  -> validate (spawn 0 on failure)
  -> bounded byte snapshot outside repo
  -> bubblewrap: /usr(ro), provider executable(ro), /workspace(rw), fixed env
  -> worker process result
```

network deny、secret task classification、egress scope diffはWCC-FR-04、output revalidationとreceiptはWCC-FR-05/06へ委譲する。

## 2. component

| component | authority | failure |
|---|---|---|
| descriptor鮮度 | `isWorkerAdmissionCurrent` | 拒否済み／stale |
| wrapper同一性 | `isWrapperLaunchExecution` | 未封印／複製／捏造execution |
| snapshot builder | broker | repo内scratch、symlink、git/state/DB、size超過 |
| Linux backend/runtime authority | 封印済みauthority capability＋exact content digest | Linux以外、欠落／複製／driftしたbackend/runtime |
| 封印済みexecution | broker-private `WeakSet` | 複製launch |

## 3. 設計リファクタリング

provider別sandbox service、git worktree、第二ledgerを棄却し、broker module 1件と既存adapter identity helperを採用する。
永続state、DB table、workflow、provider別branchは0である。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "worker-isolation-broker",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-broker.ts",
      "resource_kind": "typescript_export",
      "resource_name": "prepareWorkerIsolationLaunch",
      "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
