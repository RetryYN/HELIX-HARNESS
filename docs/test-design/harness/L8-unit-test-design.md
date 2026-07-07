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
詳細 oracle は legacy source を参照する。
