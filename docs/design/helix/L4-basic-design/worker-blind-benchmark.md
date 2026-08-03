---
title: "worker blind benchmark基本設計"
layer: L4
artifact_type: design
status: draft
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
brokerのsealed execution originとvalidated outputから導出する。fixture/task/riskは実行originとdefinitionのexact一致を要求する。
judgeは採点とpacket digestだけを返し、costはbrokerの単調時計でsealしたhost observationから導出する。
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
sealed worker output + current admission -> blind packet (identity/private context 0)
sealed judge output(packet digest + score) + broker observation -> weighted score + effective cost
distinct provenance count >= 2 -> selection allowed
stable sort(score desc, cost asc, sealed opaque key asc) -> selection receipt
```

## 3. 設計リファクタリング

DB、workflow、service、provider forkは追加しない。新規production moduleは一件だけで、既存digest coreを再利用する。
旧`harness-agent-lifecycle`のdraft `BlindPacketV1`は設計入力でありcurrent runtime実在証拠には数えない。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "digest-core", "classification": "existing_runtime", "artifact_path": "src/runtime/digest.ts", "resource_kind": "typescript_export", "resource_name": "canonicalJson", "source_digest": "sha256:c8f4c6eff75cf5bde2bd467ac647c1953168cbaa5ac5b913e8298fdaddd17000", "current_authority": true },
    { "asset_id": "worker-blind-benchmark", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "freezeWorkerBlindBenchmark", "source_digest": "sha256:1961bbbeadf586c6cb1ea7e53c313f8b927c740bf771398d83e525e5d601829b", "current_authority": true }
  ],
  "failure_reachability": []
}
```
