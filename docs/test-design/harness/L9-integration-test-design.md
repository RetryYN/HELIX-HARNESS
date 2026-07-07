---
layer: L9
artifact_type: test_design
status: confirmed
legacy_source: docs/test-design/harness/L8-integration-test-design.md
pair_artifact: docs/design/harness/L5-detailed-design/
created: 2026-07-08
updated: 2026-07-08
---

# HELIX — L9 結合テスト設計

## §0 位置付け

PO 指示（2026-07-08）により、結合テスト設計の正本 path を
`docs/test-design/harness/L9-integration-test-design.md` とする。

既存 `docs/test-design/harness/L8-integration-test-design.md` は legacy shim として残し、詳細 oracle は段階移行する。

## §1 結合テスト oracle

L9 結合テスト設計は、L5 詳細設計の module boundary、adapter boundary、state boundary、DB projection、
search / feedback / automation / guardrail / asset catalog boundary を、IT-* の Given / When / Then 粒度で検証する。

初期移行では、既存 `L8-integration-test-design.md` の IT-* 行を legacy oracle として参照する。
新規 PLAN では、L8 を単体テスト設計、L9 を結合テスト設計として扱い、L7 起票 gate の unit pair と混同しない。
