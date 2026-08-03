---
title: "worker output admission基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: SE
plan: docs/plans/PLAN-L4-64-worker-output-admission.md
pair_artifact: docs/test-design/helix/L9-worker-output-admission-system-test-design.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker output admission基本設計

## 1. 境界

既存descriptor admission、sealed wrapper、isolation brokerを再利用し、worker stdoutの唯一の受入口へstrict output admissionを接続する。
descriptorの`output_schema_digest`でrepository-owned schemaをexact解決し、そのschema contractがsealed stdinへ含まれないrunはspawn前に拒否する。
process終了後はscope監査、exit status、UTF-8、canonical JSON、schema、dynamic digestの順に検証し、成功時だけsealed output capabilityを返す。

## 2. 構成要素

| 構成要素 | 判定正本 | fail-close条件 |
|---|---|---|
| schema authority | module-private digest→AST map | unknown／driftしたschema digest |
| wrapper binding | adapter plan digestへ含まれるstdin contract | contract欠落／descriptor不一致 |
| output evaluator | versioned AST evaluator＋canonical encoding | oversize、invalid UTF-8、非canonical、shape違反 |
| broker admission | current descriptor＋scope＋process＋output capability | stale、nonzero exit、raw stdout公開 |

## 3. 設計リファクタリング

外部validator、schema DB、workflow、provider別parserは作らず、closed AST evaluator 1件を既存brokerへ接続する。
初版schemaはproposal summary 1種類に限定するが、unknown schemaを汎用`payload:any`へfallbackしない。schema追加はversioned definitionの原子変更とする。
FR-06のworker/reviewer identity、session、lifecycle永続化、commit transactionは本sliceへ含めない。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "worker-output-admission",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-output-admission.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWorkerOutput",
      "source_digest": "sha256:16babd0721f9fec422d291586a64d8dfd8150ede342f591d4f213edacf7d0877",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
