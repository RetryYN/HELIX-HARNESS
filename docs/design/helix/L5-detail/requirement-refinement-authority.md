---
title: "Requirement refinement JSON authority 詳細設計"
canonical_layer_scheme: L1-L12
layer: L5
paired_layer: L8
status: draft
plan: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md
related_l4: docs/design/helix/L4-basic-design/requirement-refinement-authority.md
behavior_contract_id: REQUIREMENT-JSON-DELTA-ADMISSION-001
responsibility_owner: requirement-json-delta-admission
---

# Requirement refinement JSON authority 詳細設計

## 1. bundle schema定義

`refinement_contracts.json`はcontract ID keyed objectとし、各recordは次のexact field setを持つ。

```yaml
schema_version: helix-requirement-refinement.v1
refinement_contract_id: MIC-FR-001
revision: 1
lifecycle_status: draft|specified|approved|frozen|rejected|superseded
primary_system_contract_id: HR-FR-HIL-08
related_system_contract_ids: [HR-FR-HIL-02, HR-FR-HIL-05, HR-FR-HIL-06]
source:
  requirement_path: docs/design/helix/L3-requirements/management-integration-cell-requirements.md
  requirement_digest: sha256:...
  acceptance_path: docs/test-design/helix/management-integration-cell-acceptance.md
  acceptance_digest: sha256:...
plan_id: PLAN-L3-43-management-integration-cell-model
responsibility_owner: management-integration-cell-orchestration
supporting_requirements:
  - { requirement_id: MIC-R-01, statement: "...", acceptance_ids: [MIC-AC-001], semantic_digest: sha256:... }
acceptance_cases:
  - { acceptance_id: MIC-AC-001, requirement_ids: [MIC-R-01], polarity: positive, statement: "...", semantic_digest: sha256:... }
downstream_issue_ids: [213, 214, 215]
approval:
  authority: PO
  decision_source: issue-comment-or-repo-owned-receipt
  decision_digest: sha256:...
  source_set_digest: sha256:...
  candidate_head: 40-hex
  approved_revision: 1
  approved_at: RFC3339
semantic_digest: sha256:...
```

`draft`／`specified`ではapprovalを空にできるが、`approved`／`frozen`は全approval fieldを必須とする。
`frozen`だけが#213のimplementation bindingとして利用できる。source pathはrepo-relative current L3/L10だけを許可し、
compatibility／archive／migration pathを拒否する。

## 2. invariant

- baseline shard 4件のbytes、count、digestは旧snapshotと一致する。
- refinement contract keyと`refinement_contract_id`は一致し、全IDはroot全体で一意である。
- primary／related ownerはbaseline system contractに実在し、primaryはrelatedへ重複しない。
- supporting requirementは1件以上、各requirementは1件以上のACを持つ。
- acceptanceのrequirement参照はsupporting exact set内で、全R／ACの未被覆・重複は0である。
- source bytesのsha256、record semantic digest、manifest shard/root digestを全て再現できる。
- frozen recordのPLANはconfirmed、approvalは同revision・L3/L10 source集合digest・同candidate HEADへ束縛する。
- downstream Issue exact setはclosure graphと一致し、closed parentに未完contractを隠さない。

## 3. failure code一覧

| code | 条件 |
|---|---|
| `REFINEMENT_SHARD_MISSING` | manifestにrefinement shardが無い |
| `REFINEMENT_BASELINE_DRIFT` | baseline bytes／count／digestが変化 |
| `REFINEMENT_SOURCE_STALE` | L3/L10 source digestが不一致 |
| `REFINEMENT_OWNER_ORPHAN` | HIL ownerがbaselineに無い |
| `REFINEMENT_TRACE_INCOMPLETE` | R／ACの欠落、重複、未被覆 |
| `REFINEMENT_APPROVAL_MISSING` | approved/frozenに有効なPO receiptが無い |
| `REFINEMENT_PARTIAL_UPDATE` | shard、manifest、view、DBのroot digestが不一致 |
| `REFINEMENT_COMPATIBILITY_PROMOTION` | compatibility/historical sourceをcurrentへ昇格 |
| `REFINEMENT_DUPLICATE_ID` | root内でIDが重複 |

## 4. mutation検証契約

owner存在検査、source digest比較、approval revision比較、R→AC全被覆、baseline digest比較をそれぞれ除去した
mutantは独立fixtureでRedになる。`toContain()`による文言確認だけを到達証拠にしない。

## 5. 実装順

1. Red fixtureで現loaderがMIC欠落を見逃すことを固定する。
2. typed parserとroot digestを実装する。
3. generated view、authority gate、既存DB projectionへ接続する。
4. MIC L3 traceとapproval入力を確定後、最初のbundleをadmitする。
5. DB x2、doctor、full CI、独立AI-Bを同一HEADへ束縛する。

## 6. 現在の設計実在性束縛

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [
    {
      "asset_id": "requirement-refinement-validator",
      "classification": "existing_runtime",
      "artifact_path": "src/requirements/requirement-refinement-authority.ts",
      "resource_kind": "typescript_export",
      "resource_name": "validateRequirementRefinement",
      "source_digest": "sha256:1d4462dc2de8c30f309d0a4d8368bbae3932e948a836a0a7715d139323ddc448",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

現在はpure validatorのpositive／negative testまでである。failure mutation、manifest／view／DB統合、
MIC frozen bundleは未実装なので`declared_failure_codes`へ完了済みとして載せない。
