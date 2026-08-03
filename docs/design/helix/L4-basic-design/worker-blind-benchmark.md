---
title: "worker blind benchmark基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L4-67-worker-blind-benchmark.md
pair_artifact: docs/test-design/helix/L9-worker-blind-benchmark-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 225
behavior_contract_id: WCC-FR-07
responsibility_owner: worker-blind-benchmark
---

# worker blind benchmark基本設計

## 1. 目的と境界

候補worker/model/effortを、fixed fixture／rubric／task／riskへ束縛したblind packetで比較し、risk別blind score、
broker計測時間によるeffective cost、deterministic rankingとselection receiptを生成する。packetへauthor claim、reasoning、chat/private
context、worker/model/effort identityを渡さない。候補identity/model/effort/artifactはcaller申告を受けず、
brokerのsealed execution originとvalidated outputから導出する。definitionは候補実行前にbrokerへ渡し、fixture/task/riskとdefinition digestをoriginへsealする。
judgeはsealed blind packetだけをtaskにしたcontext capabilityで実行し、採点とpacket digestだけを返す。costはbrokerの単調時計でsealしたhost observationから導出する。
異なるprovenance 2件未満ではselectionを生成しない。`smoke`は観測用途に限定しfull admission根拠として拒否する。

WCC-FR-08の重大failure非相殺、用途別admit/retire/quarantineは扱わない。

## 2. componentとdata flow

| component | 分類 | 責務 |
|---|---|---|
| `BlindBenchmarkDefinition` | new value object | fixture/rubric/task/risk/cost policyをexact digestへ凍結 |
| `BlindPacketBuilder` | new pure core | broker execution originを再照合しcandidate identityをopaque IDへ変換 |
| `BlindBenchmarkEvaluator` | new pure core | packet-bound sealed judge scoreとbroker observationからranking receiptをseal |
| worker isolation broker | existing runtime | current admission、fixture/task/risk、output、worker/model/effort、実行時間をseal |
| worker output admission | existing runtime | blind evaluation schemaとpayload digestをstrict再検証 |
| digest core | existing runtime | canonical JSONとSHA-256 |

```text
fixed definition -> sealed definition
sealed definition -> broker-bound candidate launch -> blind packet (identity/private context 0)
blind packet -> broker-bound judge launch -> sealed judge output(packet digest + score)
sealed judge output + broker observation -> weighted score + effective cost
distinct provenance count >= 2 -> selection allowed
stable sort(score desc, cost asc, sealed opaque key asc) -> selection receipt
```

## 3. 設計リファクタリング

DB、workflow、service、provider forkは追加しない。definition sealと評価runtimeの循環依存を避けるため同一ownerのmoduleを二件に分け、既存digest coreを再利用する。
旧`harness-agent-lifecycle`のdraft `BlindPacketV1`は設計入力でありcurrent runtime実在証拠には数えない。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "digest-core", "classification": "existing_runtime", "artifact_path": "src/runtime/digest.ts", "resource_kind": "typescript_export", "resource_name": "canonicalJson", "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000", "current_authority": true },
    { "asset_id": "worker-blind-definition", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-definition.ts", "resource_kind": "typescript_export", "resource_name": "freezeWorkerBlindDefinition", "source_digest": "sha256:0217dc0a5c888ea95a5a37964ee6f3b22c5e0dab78eb4359d0ccce9b6e605d44", "current_authority": true },
    { "asset_id": "worker-blind-benchmark", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "freezeWorkerBlindBenchmark", "source_digest": "sha256:5dcbac82100ff9cf5d907f66198fd5cc639bad1b46a67816f901d891f696efc3", "current_authority": true }
  ],
  "failure_reachability": []
}
```
