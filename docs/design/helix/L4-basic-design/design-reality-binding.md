---
title: "Design Reality Binding基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-09-04
owner: SE
plan: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
pair_artifact: docs/test-design/helix/L9-design-reality-binding-system-test-design.md
behavior_contract_id: DESIGN-REALITY-BINDING-001
responsibility_owner: design-reality-binding
---

# Design Reality Binding基本設計

## 1. 目的と境界

L4/L5の内部整合、review、digestだけではなく、設計がexact HEADのcurrent sourceへ接続し、宣言failureが到達可能であることをfreeze前に証明する。
既存PLAN lint、doctor、review evidence、TypeScript ASTを再利用し、新service、DB table、workflow、重複ledgerは作らない。

## 2. component

| component | 入力 | 出力 | failure |
|---|---|---|---|
| `RealityBindingLoader` | confirmed L4/L5、exact HEAD | typed binding | marker欠落、JSON不正、別HEAD |
| `RuntimeAssetResolver` | classification、path、resource、digest | current asset evidence | missing、類似名代替、stale digest、compatibility昇格 |
| `FailureReachabilityEvaluator` | identity、post-check、fixture、mutation | reachable／unreachable | 0件化、文言oracle、mutation生存 |
| `DesignRealityAdmission` | 上記結果 | confirm可否 | findingをreview greenで相殺 |

## 3. データフロー

```text
confirmed candidate -> typed binding -> repo-contained exact source -> AST resource + digest
                    -> executable oracle -> semantic witness -> mutation witness
                    -> findings 0 only -> design admission green
```

既存設計の `declared_failure_codes` と `failure_reachability` が空であることは、実装済みの
failure契約を意味しない。現在の空bindingは `config/design-reality-binding-empty-baseline.json` の
固定baselineとして可視化し、baseline外で新たに空へ退行した設計はfail-closeする。baselineは
追加で拡張できず、failure契約をmaterializeした設計からのみ縮小する。本文にfailure方針がある
baseline entryはhard failureへ自動昇格せず、doctorのadvisoryとして上流のmaterialize候補を示す。

2026-08-03以降に更新されたconfirmed L4/L5をactivation対象とし、それ以前の設計在庫を一括移行しない。
ただしPR #355のworker descriptor pairは既知回帰として明示bindingする。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "design-reality-analyzer",
      "classification": "existing_runtime",
      "artifact_path": "src/lint/design-reality-binding.ts",
      "resource_kind": "typescript_export",
      "resource_name": "analyzeDesignRealityBinding",
      "source_digest": "sha256:fbe34f66aa2ba594c08ced3fffcc3d30241b3511339e4082c931d256c3da0452",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
