---
title: "Requirement refinement JSON authority 基本設計"
canonical_layer_scheme: L1-L12
layer: L4
paired_layer: L9
status: draft
plan: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L9-requirement-refinement-authority-system-test-design.md
behavior_contract_id: REQUIREMENT-JSON-DELTA-ADMISSION-001
responsibility_owner: requirement-json-delta-admission
---

# Requirement refinement JSON authority 基本設計

## 1. 目的と境界

凍結済み`153/24/72/24`はbaseline snapshotとして不変に保ち、その後に承認されたL3/L10 refinementを
同じ`requirements-ir/manifest.json`配下のtyped partitionへ追加する。Markdownを意味正本へ戻さず、
別Requirement Engine、別ledger、別DB table、別workflowを作らない。

## 2. 構成責務

| component | 責務 | 禁止 |
|---|---|---|
| Requirement authority root | baseline 4 shardとrefinement shardのexact set、各digest、baseline digest、current root digestを束縛 | baselineとdeltaの分母混同 |
| Refinement admission | source L3/L10、owner、revision、approval、R→AC、downstreamを一括検証 | Markdown単独のadmit、partial update |
| Generated view projector | baselineとrefinementを別section／別分母で同一rootから生成 | generated viewの直接編集 |
| DB projector | 既存`requirement_ir`へcontract／clause／ACを投影 | 新table、Markdown semantic read |
| Authority gate／doctor | source drift、orphan、重複、approval欠落、compatibility誤昇格をfail-close | legacy成功による相殺 |

## 3. 正本グラフ

```text
requirements-ir/manifest.json
  ├─ baseline: requirements / system_contracts / acceptance_cases / system_tests
  └─ refinements: refinement_contracts
       └─ contract → primary HIL owner + related HIL owners
                    → supporting clauses → acceptance cases
                    → L3/L10 source digest → PLAN/downstream → PO delta receipt
```

refinementはbaseline requirementを上書きしない。primary ownerはexactly one、related ownerは0以上のunique setとする。
ownerはbaseline `system_contracts`に実在しなければならない。MICのdraft mapping候補はprimary
`HR-FR-HIL-08`、related `HR-FR-HIL-02/05/06`だが、L3 traceとPO delta receiptが揃うまでfrozenにしない。

## 4. 状態とtransaction

```text
draft → specified → approved → frozen
  └──────────────→ rejected / superseded
```

JSON write、manifest digest、generated view、DB rebuild、approval receiptを同一candidate HEADへ束縛する。
途中失敗はrootを更新せず、baselineのみのcurrent authorityを維持する。source、owner、AC、approvalの変更は
既存bundleをsilent rewriteせずrevisionを増やし、downstreamをstale化する。

## 5. 設計リファクタリングgate

別shardはbaselineの不変性と原子的bundle境界に必要な1件だけとする。acceptanceやclauseごとの追加shard、
新service、新DB tableは採用しない。bundle内にR→AC mappingを保持し、既存loader／view／projectionへ統合する。

## 6. L9合否境界

- baseline digestと4分母が変更されない。
- current rootからMIC exact set、owner、source、approval、downstreamを逆引きできる。
- JSON欠落、partial update、Markdown-only、owner orphan、R→AC欠落／重複、stale approvalを拒否する。
- DB rebuild 2回のrows／digestが一致し、baselineとrefinementの分母を別表示する。

## 7. 現在の設計実在性束縛

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
      "source_digest": "sha256:c55327373a04a9d3877daa7d420e9153689444b22a62e458d9128501aa4978c1",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

これはpure validatorの現在実在だけを示す。manifest／view／DB統合やMIC admission completionは主張しない。
