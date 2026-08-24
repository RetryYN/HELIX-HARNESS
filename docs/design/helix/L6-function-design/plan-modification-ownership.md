---
title: "既存artifact修正sliceのPLAN所有権モデル機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
plan: docs/plans/PLAN-L7-665-plan-modification-ownership.md
pair_artifact: docs/test-design/helix/L8-plan-modification-ownership-unit-test-design.md
---

# 既存artifact修正sliceのPLAN所有権モデル機能設計

## 目的

既にmainへ存在するsource・testを後続の原子的sliceが修正する場合に、完了所有を再宣言する
`generates`と、既存artifactへ差分を適用する`modifies`を分離する。これにより、draft PLANが
review前置証拠を得る前に`merged-plan-status`で停止する循環を解消し、同時にL6/L8 pairと
PLAN固有V-pairのtraceを失わない。

## 正本契約

| field | 意味 | 完了・存在 gate |
|---|---|---|
| `generates` | このPLANが新規に生成し、最終的な所有を引き受けるartifact | `merged-plan-status` / `plan-artifact-existence`の対象 |
| `modifies` | 公開baseに既に存在し、今回のPLANが差分を適用する既存artifact | draftのmerged判定対象外。既存pathのV-pair／oracle traceへ接続 |

同じpathを`generates`と`modifies`へ重複記録してはならない。新設・移動testは`generates`、
既存testの修正は`modifies`に記録する。`modifies`を新規pathの隠れた生成宣言に使わない。

## 動作境界

`modifies`はfrontmatter、plan-descent、PLAN固有V-pair、relation graphの共通入力とする。
`generates`だけを対象にする完了所有・artifact実在判定は緩めない。既存testを`modifies`へ置いても、
`verification_bindings`のoracle・test citation・PLAN ID citationは必須であり、未接続のtestを許可しない。

このsliceは既存artifactの所有権表現だけを扱う。filesystem write、GitHub write、DB schema、
worker dispatch、review evidenceの代替、status confirmの自動化は対象外である。

## 受入条件

- `modifies`がcurrent frontmatter schemaでtypedに受理され、`generates`と別配列へ投影される。
- 既存testを`modifies: artifact_type=test_code`へ記録したdraft impl PLANが、plan-descentと
  PLAN固有V-pairを通過する。
- `modifies`だけを持つ既存sourceが`merged-plan-status`のdraft違反を発生させない。
- relation graphがPLANから既存sourceへの`modifies` edgeを再構築できる。
- `generates`の完了所有・phantom検査は従来どおりfail-closeする。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": ["modification_ownership_invalid", "modified_test_unbound"],
  "assets": [
    "src/schema/frontmatter.ts",
    "src/lint/plan-descent.ts",
    "src/lint/plan-specific-vpair-binding.ts",
    "src/lint/merged-plan-status.ts",
    "src/lint/relation-graph.ts",
    "tests/plan-modification-ownership.test.ts"
  ],
  "failure_reachability": [
    {
      "failure_code": "modified_test_unbound",
      "oracle_id": "U-PLANMOD-001",
      "test_path": "tests/plan-modification-ownership.test.ts"
    },
    {
      "failure_code": "modification_ownership_invalid",
      "oracle_id": "U-PLANMOD-002",
      "test_path": "tests/plan-modification-ownership.test.ts"
    }
  ]
}
```
