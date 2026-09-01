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

baseline digestは可変manifestだけへ自己申告せず、G3 JSON freeze material commit `434ef587…`と
`sha256:3351a371…eb75`をauthority config＋schema literalへ二面固定する。Git履歴が利用できる環境では
material commitがcurrent HEADのancestorで、当時manifestのroot digestが固定値と一致することも検査する。
検査はmaterial commit objectの到達性、current HEADとのancestor関係、当時manifestの到達性／JSON妥当性、
root digest一致を別findingとして返す。非ancestorをobject到達不能へ畳み込まず、固定material commitは
履歴書換えではなく加法的なmerge parentとしてcurrent mainへ接続する。

## 3. 正本グラフ

```text
requirements-ir/manifest.json
  ├─ baseline: requirements / system_contracts / acceptance_cases / system_tests
  └─ refinements: refinement_contracts
       └─ contract → primary HIL owner + related HIL owners
                    → supporting clauses → acceptance cases
                    → acceptance owner (#213/#214/#215 + terminal #92)
                    → L3/L10 source digest → PLAN/downstream → PO delta receipt
```

refinementはbaseline requirementを上書きしない。peer-FRはcontract自身をtyped source projectionへ束縛し、
umbrella＋supporting構造だけを前提にしない。primary ownerはexactly one、related ownerは0以上のunique setとする。
ownerはbaseline `system_contracts`に実在しなければならない。MICのdraft mapping候補はprimary
`HR-FR-HIL-08`、related `HR-FR-HIL-02/05/06`だが、L3 traceとPO delta receiptが揃うまでfrozenにしない。

## 4. 状態とtransaction

```text
draft → specified → approved → frozen
  └──────────────→ rejected / superseded
```

JSON write、manifest digest、generated view、DB rebuildをcurrent receipt HEADへ束縛する。PO approvalは、
approvalを埋め込む前のspecified material HEADと全意味fieldのsubject digestへ束縛し、そのmaterial HEADが
receipt HEADのancestorである二相transactionとする。同じrecordへcurrent HEADを埋め込む自己参照は禁止する。
途中失敗はrootを更新せず、baselineのみのcurrent authorityを維持する。source、owner、AC、approvalの変更は
既存bundleをsilent rewriteせずrevisionを増やし、downstreamをstale化する。

## 5. 設計リファクタリングgate

別shardはbaselineの不変性と原子的bundle境界に必要な1件だけとする。acceptanceやclauseごとの追加shard、
新service、新DB tableは採用しない。bundle内にR→AC mappingを保持し、既存loader／view／projectionへ統合する。

## 6. L9合否境界

- baseline digestと4分母が変更されない。
- current rootからMIC exact set、owner、source、approval、downstreamを逆引きできる。
- frozen化は実在confirmed PLANと、downstream Issue exact setが全てopenであるsnapshot receiptを要求する。
- MIC-AC-001〜004=#213、005〜009=#214、010〜011=#215、terminal AC-012=#92を欠落・重複0で束縛する。
- 各Rは宣言済みのH4またはATX heading projection、各ACは宣言済みの5列mutation表または3列oracle表から
  typed projectionでき、ID／本文／edge／polarityが一致する。family名では分岐せずprojection modeをexact enumで選び、
  source形状とmodeの不一致、見出し消失、列数変化をfail-closeする。
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
      "source_digest": "sha256:d7ce8f07137318c51d544fa2fde06cf1283f5541c7c36098cb22a88214c2b8c8",
      "current_authority": true
    }
  ],
  "failure_reachability": []
}
```

これはpure validatorの現在実在だけを示す。manifest／view／DB統合やMIC admission completionは主張しない。
