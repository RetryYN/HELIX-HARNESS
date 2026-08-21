---
title: "Node engine runtime gate単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-21
updated: 2026-08-21
owner: QA / TL
plan: docs/plans/PLAN-L7-643-node-engine-runtime-gate.md
pair_artifact: docs/design/helix/L6-function-design/node-engine-runtime-gate.md
---

# Node engine runtime gate単体テスト設計

## §0 合否境界

「engines.nodeという文字列を読んでいる」ことでは合格にしない。
**範囲外runtimeを実際に拒否し、解釈できないrangeを通さない**ことを反例で示す。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-NODEENG-001 | runtime適合 | 範囲外runtimeを`node_engine_runtime_out_of_range`で拒否し、境界値（下限patch-1、上限等値）も拒否する | `tests/node-engine-runtime.test.ts` |
| U-NODEENG-002 | 宣言欠落 | `engines.node`不在を`node_engine_declaration_missing`でfail-closeする | `tests/node-engine-runtime.test.ts` |
| U-NODEENG-003 | range解釈 | caret・tilde・OR結合・x-range・latest と壊れたruntime表記を`node_engine_range_unsupported`で閉じる | `tests/node-engine-runtime.test.ts` |
| U-NODEENG-004 | version正規化 | `v24.15.0` / `24.15` / `24` を正規化し、prerelease表記を受理しない | `tests/node-engine-runtime.test.ts` |
| U-NODEENG-005 | comparator解釈 | comparator列をAND連結として解釈し、演算子省略を完全一致として扱う | `tests/node-engine-runtime.test.ts` |

## §1 検出力（mutation実測）

宣言したoracleが空虚でないことを、実装への変異注入で示す。

| 変異 | 期待 |
|---|---|
| 範囲外判定を無効化（`if (!satisfies(...))` → `if (false)`） | killed |
| 解釈不能rangeを通す（comparator/version のnull分岐を無効化） | killed |
| 宣言欠落を通す（`if (!declaredRange)` → `if (false)`） | killed |
| 上限比較を包含へ変更（`<` → `<=`） | killed |
| 下限比較を反転（`>=` → `<=`） | killed |

`survived` または anchor 不在が 1 件でもあれば失敗として扱う。

## §2 量閉じ

- failure code: `node_engine_declaration_missing` / `node_engine_range_unsupported` /
  `node_engine_runtime_out_of_range` の exact 3 件。
- oracle: `U-NODEENG-001`〜`U-NODEENG-005` の exact 5 件。
