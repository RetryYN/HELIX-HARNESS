---
layer: L8
artifact_type: test_design
status: confirmed
legacy_source: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: docs/design/harness/L6-function-design/
created: 2026-07-08
updated: 2026-07-08
---

# HELIX — L8 単体テスト設計

## §0 位置付け

PO 指示（2026-07-08）により、L7 実装 PLAN の起票前提として参照する単体テスト設計の正本 path を
`docs/test-design/harness/L8-unit-test-design.md` とする。

既存 `docs/test-design/harness/L7-unit-test-design.md` は legacy shim として残すが、2026-07-08 以降に起票する
`kind=impl` / `kind=add-impl` の L7 PLAN は、本書を `pair_artifact` に持たなければならない。

## §1 起票 gate

- L7 PLAN は L6 機能設計 doc を `parent_design` に持つ。
- L7 PLAN は本書を `pair_artifact` に持つ。
- L7 PLAN は `generates` に `test_code` を持つ。
- L7 PLAN が採用候補や設計棚卸しだけを本文に置く場合、実装 ready として扱わず L3-L6 へ降下する。

## §2 Legacy 移行

既存の L7-unit test design 内容は本書へ段階移行する。移行完了まで、本書は gate 用の正本 path として機能し、
詳細 oracle は旧正本を参照する。

## §3 単体 oracle 被覆

L8 は単体テスト設計の正本であり、L9 結合テスト設計とは混同しない。既存 oracle は段階移行中のため、
本書は `fr-unit-coverage.md` と legacy `L7-unit-test-design.md` を参照しながら L6 function design の
単体粒度を閉じる。

| 被覆 family | trace | oracle route |
|---|---|---|
| L6 function contract | FR-L1-01..FR-L1-51 | `docs/design/harness/L6-function-design/fr-unit-coverage.md` の `U-FR-*` 行を単体 oracle 正本とする |
| descent obligation | FR-L1-03 | `U-DESC-*`。L6 から L8 単体テスト設計への pair を fail-close で検査する |
| plan descent gate | FR-L1-03 | `U-PDESC-*`。L7 impl PLAN は L8 unit pair を持つまで起票不可 |

## §4 L6 reverse reference 追補

`l6-completion` は L6 設計 doc の filename が L8 単体テスト設計または旧正本に現れることを
凍結入力として扱う。以下の L6 追加設計は L8 正本の逆参照として保持し、詳細 oracle は
対応 PLAN / 旧正本に残す。

| L6 doc | oracle route |
|---|---|
| `handover-db-derivation.md` | 引き継ぎ DB 派生の単体 oracle |
| `harness-memory-compaction.md` | harness memory 圧縮の単体 oracle |
| `plan-descent-specific-parent-binding.md` | PSPB 系 oracle |
| `reverse-feedback-closure.md` | reverse feedback 閉塞の単体 oracle |
