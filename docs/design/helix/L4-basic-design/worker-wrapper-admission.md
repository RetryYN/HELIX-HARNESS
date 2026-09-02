---
title: "worker wrapper admission基本設計"
layer: L4
artifact_type: design
status: confirmed
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
| `RuntimeCliEntrypoint` | `helix codex` / `helix claude` | CLI要求 | `AdapterPlan` | wrapper入口authority | raw CLI迂回 |
| `TeamAdapterRunner` | `executeTeamRunPlan` | member `AdapterPlan` | bounded member result | team execution boundary | member adapter欠落 |
| `WrapperRouteAdmission` | L6で既存adapterへ追加 | wrapper内部生成origin＋canonical `AdapterPlan` | sealed capability／rejected | benchmark handoff boundary | direct provider route、route改竄 |

`WrapperRouteAdmission`は独立serviceにせず既存adapter moduleのpure policyとして追加する。provider processの
stdout文言、exit code、環境変数だけからwrapper provenanceを逆算しない。execution originはspawn前に同一wrapper
内部で`AdapterPlan`から生成し、caller supplied JSONとして受け取らない。将来scorecard consumerは単なるadmitted
文字列ではなく、wrapper内部だけが生成できるsealed capabilityを入力にする。

## 3. 型付きroute

```ts
type WorkerLaunchRoute = "helix_cli_adapter" | "team_adapter" | "direct_provider_cli";

interface WrapperExecutionOrigin {
  readonly route: Exclude<WorkerLaunchRoute, "direct_provider_cli">;
  readonly adapter_plan_digest: string;
  readonly provider: "claude" | "codex";
  readonly canonical_invocation_digest: string;
}

interface WrapperLaunchCapability {
  readonly kind: "helix_wrapper_launch";
  readonly origin_digest: string;
  readonly __opaque: unique symbol;
}

declare function admitWrapperLaunch(
  plan: AdapterPlan,
  origin: WrapperExecutionOrigin,
): WrapperLaunchCapability | WrapperAdmissionFailure;
```

`adapter_plan_digest`はprovider、command、args、stdinを含むcanonical `AdapterPlan` payloadからwrapper内部で再計算する。
`canonical_invocation_digest`は`buildProviderInvocation`で解決したprovider／command／argsと、同一`AdapterPlan.stdin`を
合わせたcanonical execution payloadから計算する。`stdin`を`buildProviderInvocation`の入力fieldとは扱わない。
callerがrouteやdigestを任意入力するAPIは設けない。L5でcanonicalization、strict field、failure exact setを固定する。
`direct_provider_cli`はmigration調査の入力として識別できても、current worker completion、review green、benchmark
scorecardの根拠には利用できない。cross-process receiptの署名・真正性は`WCC-FR-05/06`へ委譲する。

## 4. データflow

```text
helix codex / helix claude / helix team run
  -> buildAdapterPlan
  -> wrapper内部でcanonical AdapterPlan digest／execution origin生成
  -> WrapperRouteAdmission
       -> digest一致 -> sealed WrapperLaunchCapability -> buildProviderInvocation -> provider process
       -> direct/raw route       -> rejected -> spawn/scorecard handoff 0
```

provider binaryはwrapper内部でのみnative commandへ解決する。raw CLIを実行して得た出力へ後付けで
`helix_cli_adapter`を設定する経路を作らない。team memberもdecomposed commandではなく同じ`AdapterPlan`を渡す。
consumerは`WrapperLaunchCapability`を構築・再ラベルできず、wrapperがcanonical digest照合後に返した値だけを受け取る。

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

`WrapperRouteAdmission`は既存`adapter.ts`へ追加予定の未実装symbolである。DRB v1の`planned_new`はartifact単位であり、
実在する既存file内の将来symbolを表現できないため、ここでは`existing_runtime`へ誤昇格も`planned_new`への虚偽登録も
行わない。L6/L7でexport実在とfailure witnessを束縛する。planned→realized schema拡張は本behaviorへ混載しない。

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
      "source_digest": "sha256:20f49fbb67631a80a18f11da8457370ef90ca7ce5873b576b66e27e35744d28c",
      "current_authority": true
    },
    {
      "asset_id": "provider-invocation",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/adapter.ts",
      "resource_kind": "typescript_export",
      "resource_name": "buildProviderInvocation",
      "source_digest": "sha256:20f49fbb67631a80a18f11da8457370ef90ca7ce5873b576b66e27e35744d28c",
      "current_authority": true
    },
    {
      "asset_id": "team-adapter-runner",
      "classification": "existing_runtime",
      "artifact_path": "src/team/run.ts",
      "resource_kind": "typescript_export",
      "resource_name": "executeTeamRunPlan",
      "source_digest": "sha256:720400e58cb23015d72a6297b7765c62b597cae12ec9ed365808b02afe2eacca",
      "current_authority": true
    },
    {
      "asset_id": "codex-wrapper-command",
      "classification": "existing_runtime",
      "artifact_path": "src/cli.ts",
      "resource_kind": "cli_command",
      "resource_name": "codex",
      "source_digest": "sha256:d374d313a561a759506bf05f38b56671e2f0887cb41d0c7520fd3504ab468db8",
      "current_authority": true
    },
    {
      "asset_id": "claude-wrapper-command",
      "classification": "existing_runtime",
      "artifact_path": "src/cli.ts",
      "resource_kind": "cli_command",
      "resource_name": "claude",
      "source_digest": "sha256:d374d313a561a759506bf05f38b56671e2f0887cb41d0c7520fd3504ab468db8",
      "current_authority": true
    },
    {
      "asset_id": "team-wrapper-command",
      "classification": "existing_runtime",
      "artifact_path": "src/cli.ts",
      "resource_kind": "cli_command",
      "resource_name": "team",
      "source_digest": "sha256:d374d313a561a759506bf05f38b56671e2f0887cb41d0c7520fd3504ab468db8",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
