---
title: "worker risk admission基本設計"
layer: L4
artifact_type: design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: SE
plan: docs/plans/PLAN-L4-68-worker-risk-admission.md
pair_artifact: docs/test-design/helix/L9-worker-risk-admission-system-test-design.md
related_l3: docs/design/helix/L3-requirements/worker-common-contract.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission基本設計

## 1. 目的と境界

FR-07のsealed blind benchmark receiptを用途別policyへ評価し、worker/model/effortを`admit`又は`retire`する。
scope逸脱、secret漏洩、schema違反はstandalone findingとして保持し、scoreやcostの平均へ入れない。
用途ごとにrequired risk、score下限、cost上限を持ち、用途Aでadmit、用途Bでretireを許す。
effort固定はreviewable justification digestなしに許可しない。

## 2. componentとdata flow

| component | 分類 | 責務 |
|---|---|---|
| blind benchmark receipt | existing runtime | risk別のsealed rankingとcostを供給 |
| `WorkerRiskAdmissionPolicy` | new value object | 用途、required risk、score/cost境界、effort例外を固定 |
| `WorkerStandaloneFinding` | new value object | 重大failureをcandidateへ独立束縛 |
| `WorkerRiskAdmissionDecision` | new domain service | critical pre-filter後に用途別admit/retireとselected candidateを決定 |

```text
sealed risk receipts + standalone findings + use policies
  -> critical findingを候補単位で先にretire
  -> required risk evidence exact照合
  -> score/cost/justified effort評価
  -> use-specific admit/retire + deterministic selection receipt
```

## 3. 設計リファクタリング

DB、workflow、provider fork、新しいscore ledgerは追加しない。FR-07 receipt capabilityとdigest coreを再利用し、
判断だけをpure domain service一件へ分離する。重大findingを数値scoreへ変換しないことで平均相殺経路を構造的に除去する。

## 4. 設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    { "asset_id": "worker-blind-receipt", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-blind-benchmark.ts", "resource_kind": "typescript_export", "resource_name": "readWorkerBlindBenchmarkReceiptRisk", "source_digest": "sha256:55a923a3fc7fbfdd1a9c6392424a7ad42360b3e0aa48abe6f38e97ac2e9b8eec", "current_authority": true },
    { "asset_id": "worker-risk-admission", "classification": "existing_runtime", "artifact_path": "src/runtime/worker-risk-admission.ts", "resource_kind": "typescript_export", "resource_name": "decideWorkerRiskAdmission", "source_digest": "sha256:6d52de657b4ab88433f2ab36b387dbbaee812fcae5576048b6a5c120267cac86", "current_authority": true }
  ],
  "failure_reachability": []
}
```
