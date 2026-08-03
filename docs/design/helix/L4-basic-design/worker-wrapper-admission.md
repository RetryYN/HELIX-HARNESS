---
title: "worker wrapper admission基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L4-61-worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L9-worker-wrapper-admission-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission基本設計

## 1. 設計目的

全worker起動をHELIX所有adapter routeへ束縛し、direct provider CLI由来の結果をbenchmark比較候補へ混入させない。
本sliceは`WCC-FR-02`だけを扱い、descriptor内容は`WCC-FR-01`、sandboxは`WCC-FR-03/04`、
output receiptは`WCC-FR-05/06`、score計算は`WCC-FR-07/08`、context packetは`WCC-FR-09`へ委譲する。

## 2. component境界

| component | current実体 | 入力 | 出力 | authority | failure |
|---|---|---|---|---|---|
| `AdapterPlanBuilder` | `buildAdapterPlan` | provider、role、task、PLAN | provider-neutral `AdapterPlan` | wrapper proposal | provider unavailable、task boundary欠落 |
| `ProviderInvocation` | `buildProviderInvocation` | `AdapterPlan`のprovider／command／args | native invocation | process launch boundary | provider／command drift |
| `RuntimeCliEntrypoint` | `helix codex` / `helix claude` | CLI request | `AdapterPlan` | wrapper entry authority | raw CLI bypass |
| `TeamAdapterRunner` | `executeTeamRunPlan` | member `AdapterPlan` | bounded member result | team execution boundary | member adapter欠落 |
| `WrapperRouteAdmission` | L6で既存adapterへ追加 | typed launch route | admitted／rejected | benchmark handoff boundary | direct provider route、route改竄 |

`WrapperRouteAdmission`は独立serviceにせず既存adapter moduleのpure policyとして追加する。provider processの
stdout文言、exit code、環境変数だけからwrapper provenanceを逆算しない。routeはspawn前にHELIX側で生成し、
将来scorecard consumerはadmitted routeだけを入力にできる。

## 3. typed route

```ts
type WorkerLaunchRoute = "helix_cli_adapter" | "team_adapter" | "direct_provider_cli";

interface WorkerWrapperAdmissionRequest {
  route: WorkerLaunchRoute;
  provider: "claude" | "codex";
  command: string;
  adapter_plan_digest: string | null;
}

interface WorkerWrapperAdmissionDecision {
  disposition: "admitted" | "rejected";
  route: WorkerLaunchRoute;
  reason_codes: readonly string[];
}
```

L5でstrict field、digest payload、failure exact setを固定する。`direct_provider_cli`はmigration調査の入力として
識別できても、current worker completion、review green、benchmark scorecardの根拠には利用できない。

## 4. data flow

```text
helix codex / helix claude / helix team run
  -> buildAdapterPlan
  -> WrapperRouteAdmission
       -> admitted wrapper route -> buildProviderInvocation -> provider process
       -> direct/raw route       -> rejected -> spawn/scorecard handoff 0
```

provider binaryはwrapper内部でのみnative commandへ解決する。raw CLIを実行して得た出力へ後付けで
`helix_cli_adapter`を設定する経路を作らない。team memberもdecomposed commandではなく同じ`AdapterPlan`を渡す。

## 5. 設計リファクタリング

| metric | 新wrapper service案 | 既存adapter pure admission案（採用） |
|---|---:|---:|
| new responsibility owner | 1 | 0 |
| new persistence surface | 1以上 | 0 |
| provider spawn implementation | 重複 | 既存4経路を共通policyへ接続 |
| L9 oracle coverage | 100%必須 | 100%必須 |

機能・性能を落とさず、既存`AdapterPlan`と`ProviderInvocation`の間へpure admissionを置く案を採用する。
CIやdoctorの新workflow、第二ledger、benchmark runnerは追加しない。

## 6. 下流境界

L5/L8はroute enum、strict request/decision、failureとmutationを確定する。L6/L7は既存`adapter.ts`へpure
admissionを実装し、runtime／team／pair／loopの実行経路へ接続する。output schema/digest、sandbox、score、
admit/retire決定は各後続behaviorが本decisionをconsumerとして再利用する。

## 7. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "adapter-plan-builder",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/adapter.ts",
      "resource_kind": "typescript_export",
      "resource_name": "buildAdapterPlan",
      "source_digest": "sha256:8b6d31e6877a65ddd45c748474a19a873f72bb8cc715033246a5a3593eeb31ca",
      "current_authority": true
    },
    {
      "asset_id": "provider-invocation",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/adapter.ts",
      "resource_kind": "typescript_export",
      "resource_name": "buildProviderInvocation",
      "source_digest": "sha256:8b6d31e6877a65ddd45c748474a19a873f72bb8cc715033246a5a3593eeb31ca",
      "current_authority": true
    },
    {
      "asset_id": "team-adapter-runner",
      "classification": "existing_runtime",
      "artifact_path": "src/team/run.ts",
      "resource_kind": "typescript_export",
      "resource_name": "executeTeamRunPlan",
      "source_digest": "sha256:7c5d1e1261341865aeff52645103c0cf929b8e5ce6482cfd79e59168288d46a8",
      "current_authority": true
    },
    {
      "asset_id": "codex-wrapper-command",
      "classification": "existing_runtime",
      "artifact_path": "src/cli.ts",
      "resource_kind": "cli_command",
      "resource_name": "codex",
      "source_digest": "sha256:5bf6a392e53a917a6483c5673303d36aeeb82bc0e658ec98711071f608dc4ee3",
      "current_authority": true
    },
    {
      "asset_id": "claude-wrapper-command",
      "classification": "existing_runtime",
      "artifact_path": "src/cli.ts",
      "resource_kind": "cli_command",
      "resource_name": "claude",
      "source_digest": "sha256:5bf6a392e53a917a6483c5673303d36aeeb82bc0e658ec98711071f608dc4ee3",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
