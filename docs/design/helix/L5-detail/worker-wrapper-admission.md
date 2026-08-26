---
title: "worker wrapper admission詳細設計"
layer: L5
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L5-87-worker-wrapper-admission.md
pair_artifact: docs/test-design/helix/L8-worker-wrapper-admission-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/worker-wrapper-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission詳細設計

## 1. 契約

worker実行候補は`buildWrapperAdapterPlan`が生成した同一object identityの`AdapterPlan`だけを受け付ける。
生成時にmodule-private `WeakMap`へroute、provider、plan digest、invocation digestを保存し、実行直前に再計算する。
JSON copy、raw `buildAdapterPlan`、生成後のprovider／command／args／stdin改竄はsealed capabilityへ昇格できない。

canonical plan payloadは`provider`、`command`、`args`、`stdin`である。canonical invocation payloadは
`provider`、native解決後の`command`／`args`、同一`stdin`である。環境変数はWCC-FR-03/04のsandbox責務であり、
本identityへ混ぜない。cross-process receipt真正性はWCC-FR-05/06へ委譲する。

## 2. failureの完全な集合

| 順序 | reason code | 条件 |
|---:|---|---|
| 1 | `WRAPPER_ROUTE_REJECTED` | raw／copy plan、または`direct_provider_cli` |
| 2 | `WRAPPER_ORIGIN_PROVIDER_MISMATCH` | origin providerとcurrent plan providerが不一致 |
| 3 | `WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH` | canonical plan payloadが生成時からdrift |
| 4 | `WRAPPER_INVOCATION_DIGEST_MISMATCH` | canonical invocation payloadが生成時からdrift |

provider unavailable、process exit、malformed outputは既存adapter責務であり、本failureへ重複追加しない。

## 3. 封印済みcapability

成功時だけfrozen objectを発行し、module-private `WeakMap`へexecutionを束縛する。fieldが同じplain objectやspread copyは
capabilityではない。TypeScript brandをsecurity tokenや署名とは主張せず、同一process内の後付け再ラベル防止だけを所有する。

## 4. 設計リファクタリング

新service／ledger／workflow案を棄却し、既存`adapter.ts`のpure admissionへ集約する。production新規file 0、DB table 0、
network 0、永続state 0で、CLI、team、pair-agent、loopの既存spawn sinkだけを共通policyへ接続する。

## 5. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "WRAPPER_ROUTE_REJECTED",
    "WRAPPER_ORIGIN_PROVIDER_MISMATCH",
    "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
    "WRAPPER_INVOCATION_DIGEST_MISMATCH"
  ],
  "assets": [
    {
      "asset_id": "wrapper-route-admission",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/adapter.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWrapperLaunch",
      "source_digest": "sha256:596290b45eb8f8ce6607bed56d154a97187a30e7491d3ded90c6a79167c10678",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    {
      "reason_code": "WRAPPER_ROUTE_REJECTED",
      "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/adapter.ts",
      "source_symbol": "admitWrapperLaunch",
      "test_path": "tests/worker-wrapper-admission.test.ts",
      "oracle_id": "U-WWA-002",
      "identity_fields": [],
      "post_resolution_checks": [],
      "fixture": { "registry": [], "request": {} },
      "expected_reason": "WRAPPER_ROUTE_REJECTED",
      "mutation": { "remove_post_resolution_check": "if (!origin)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-013", "execution_helper": "executeWrapperMutationOracle" }
    },
    {
      "reason_code": "WRAPPER_ORIGIN_PROVIDER_MISMATCH",
      "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/adapter.ts",
      "source_symbol": "admitWrapperLaunch",
      "test_path": "tests/worker-wrapper-admission.test.ts",
      "oracle_id": "U-WWA-004",
      "identity_fields": [],
      "post_resolution_checks": [],
      "fixture": { "registry": [], "request": {} },
      "expected_reason": "WRAPPER_ORIGIN_PROVIDER_MISMATCH",
      "mutation": { "remove_post_resolution_check": "if (origin.provider !== plan.provider)", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-013", "execution_helper": "executeWrapperMutationOracle" }
    },
    {
      "reason_code": "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
      "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/adapter.ts",
      "source_symbol": "evaluateWrapperAdmissionWitness",
      "test_path": "tests/worker-wrapper-admission.test.ts",
      "oracle_id": "U-WWA-006",
      "identity_fields": [],
      "post_resolution_checks": [],
      "fixture": { "registry": [], "request": {} },
      "expected_reason": "WRAPPER_ADAPTER_PLAN_DIGEST_MISMATCH",
      "mutation": { "remove_post_resolution_check": "witness.expected_adapter_plan_digest !== witness.actual_adapter_plan_digest", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-013", "execution_helper": "executeWrapperMutationOracle" }
    },
    {
      "reason_code": "WRAPPER_INVOCATION_DIGEST_MISMATCH",
      "reachability_mode": "executable_oracle",
      "source_path": "src/runtime/adapter.ts",
      "source_symbol": "evaluateWrapperAdmissionWitness",
      "test_path": "tests/worker-wrapper-admission.test.ts",
      "oracle_id": "U-WWA-007",
      "identity_fields": [],
      "post_resolution_checks": [],
      "fixture": { "registry": [], "request": {} },
      "expected_reason": "WRAPPER_INVOCATION_DIGEST_MISMATCH",
      "mutation": { "remove_post_resolution_check": "witness.expected_invocation_digest !== witness.actual_invocation_digest", "expected_reason_after_mutation": "RED_BY_ORACLE", "execution_test_path": "tests/design-reality-binding.test.ts", "execution_oracle_id": "U-DRB-013", "execution_helper": "executeWrapperMutationOracle" }
    }
  ]
}
```
