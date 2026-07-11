---
title: "HELIX L5 operation scope テスト・検証設計"
layer: L5
artifact_type: test_design
status: confirmed
created: 2026-07-11
updated: 2026-07-11
owner: Codex / TL
plan: PLAN-L7-397-vmodel-current-location-projection
pair_artifact: docs/design/helix/L5-detail/
related_l7_oracles: docs/test-design/harness/L7-unit-test-design.md
source_package: ハイブリッド設計ドキュメントv1-fixed.zip
---

# HELIX L5 operation scope テスト・検証設計

本書は `docs/design/helix/L5-detail/operation-scope.md` と双方向 Vペアを構成するテスト・検証設計の正本である。
ZIP由来の運用、ログ、KPI、保守、インシデント契約を、設計済みという理由だけで観測済みに昇格させない。

## §1 Vペア対応

| Oracle ID | 設計ID | 検証対象 | pass条件 |
|---|---|---|---|
| U-OPS-SCOPE-001 | HOD-OPS-LOG-DESIGN | ログ設計 | `log_design` が設計ID、観測source、evidence tableを保持する |
| U-OPS-SCOPE-002 | HOD-OPS-KPI-METRIC | KPI | `kpi_metric` が quality signal と runtime evidence を区別する |
| U-OPS-SCOPE-003 | HOD-OPS-RUNTIME-VERIFICATION | runtime verification | acceptedかつ`runtime_verified`の証跡だけを観測済みにする |
| U-OPS-SCOPE-004 | HOD-OPS-OPERATION-TEST | 運用テスト | passed test/gateとruntime evidenceの結合を要求する |
| U-OPS-SCOPE-005 | HOD-OPS-CLASS-METHOD-CONTRACT | class/method契約 | typed設計IDとaccepted runtime evidenceの結合を要求する |
| U-OPS-SCOPE-006 | HOD-OPS-INCIDENT-RECOVERY-ROUTE | 障害時逆流 | closure ledgerとruntime evidenceからRecovery/Reverse経路を観測する |

## §2 失敗時の判定

- 6 scopeのいずれかが欠ける場合はfail-closeする。
- 設計IDが存在してもaccepted runtime evidenceが無ければ`observed_gap`として保持する。
- projection-onlyまたはincompleteなruntime rowを観測済み根拠に使わない。
- Project view、`current-location`、`vmodel fit`でscope、状態、設計数、観測数、evidence tableが一致しなければ退行とする。
- 本書または設計側の`pair_artifact`が切れた場合はpair-freezeとverification triggerを失敗させる。

## §3 実装oracle

- `tests/current-location.test.ts`
- `tests/visualization-view-model.test.ts`
- `tests/visualization-treeview.test.ts`
- `tests/slow/doctor.test.ts`
- `tests/vmodel-pair.test.ts`

検証コマンドはtargeted Vitest、`helix db rebuild`、`helix current-location --summary-json`、
`helix vmodel fit --summary-json`、`helix doctor`を用いる。承認待ちclosureのapplyは本検証に含めない。
