---
title: "worker independent review基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-03
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L4-65-worker-independent-review.md
pair_artifact: docs/test-design/helix/L9-worker-independent-review-system-test-design.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review基本設計

## 1. 境界

FR-05のsealed output capabilityをproposalとreviewer実行の入力とし、隔離brokerが実行成功後に発行したprocess-local originからactorを導出する。receiptによるactor自己申告は受け付けない。
provider／model familyは双方へ必須記録するが、それ自体をidentity解決キーにせず、同一provider／modelでも三軸が独立なら受理する。
成功時だけcanonical digest付きsealed review capabilityを返す。

## 2. 構成

| 構成要素 | 責務 | fail-close |
|---|---|---|
| FR-05 proposal join | sealed capabilityとproposal digestを照合 | copy、forge、digest drift |
| execution origin join | current admission、descriptor、runtime、model、session、contextを照合 | copy、未実行、stale |
| strict receipt parser | 4-field exact set、digest、verdict | actor自己申告、unknown、欠落 |
| finding join | `finding_digest`をsealed reviewer outputの`payload_digest`へexact束縛 | 任意claim、copy、digest drift |
| separation validator | identity→session→contextを別検証 | 各collision |
| receipt sealer | canonical receipt digestとactor記録を封印 | copy capability |

## 3. 設計リファクタリング

既存FR-05 capabilityとdigest helperを再利用し、DB、ledger、CLI、workflow、provider別adapterを追加しない。
durable lifecycle、Node commit transaction、quarantineは本契約の完了claimへ含めない。
これらはIssue #227内の後続原子sliceでcurrent L3契約へexact traceしてから実装し、
current mainに存在しない将来IDを正本参照として先書きしない。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "worker-independent-review",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-review-receipt.ts",
      "resource_kind": "typescript_export",
      "resource_name": "admitWorkerIndependentReview",
      "source_digest": "sha256:76ced4ac5d3ac84dfb08f88a9263133242275dbb5b738a704620f9be6fba9eee",
      "current_authority": true
    },
    {
      "asset_id": "worker-execution-origin",
      "classification": "existing_runtime",
      "artifact_path": "src/runtime/worker-isolation-broker.ts",
      "resource_kind": "typescript_export",
      "resource_name": "resolveWorkerIsolationExecutionOrigin",
      "source_digest": "sha256:5a0f69619306f27c2c04fac3f05566346aec5c499631d62440d34c7e7b0e220d",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```
