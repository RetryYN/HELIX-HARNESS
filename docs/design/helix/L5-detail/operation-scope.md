---
title: "HELIX L5 詳細設計 — L12 operation scope 契約"
layer: L5
kind: add-design
status: confirmed
created: 2026-07-10
updated: 2026-07-10
owner: Codex / TL
plan: PLAN-L7-397-vmodel-current-location-projection
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l12:
  - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
  - docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md
pair_artifact: docs/test-design/helix/operation-scope.md
source_package: ハイブリッド設計ドキュメントv1-fixed.zip
spec:
  defines:
    - id: HOD-OPS-LOG-DESIGN
      kind: L12 operation log design contract
      title: log design projection contract
      layer: L5
      owner: TL
      status: confirmed
    - id: HOD-OPS-KPI-METRIC
      kind: L12 operation KPI metric contract
      title: KPI metric projection contract
      layer: L5
      owner: TL
      status: confirmed
    - id: HOD-OPS-RUNTIME-VERIFICATION
      kind: L12 runtime verification contract
      title: runtime verification projection contract
      layer: L5
      owner: TL
      status: confirmed
    - id: HOD-OPS-OPERATION-TEST
      kind: L12 operation test contract
      title: operation test projection contract
      layer: L5
      owner: TL
      status: confirmed
    - id: HOD-OPS-CLASS-METHOD-CONTRACT
      kind: L12 class method contract
      title: class/method contract projection contract
      layer: L5
      owner: TL
      status: confirmed
    - id: HOD-OPS-INCIDENT-RECOVERY-ROUTE
      kind: L12 incident Recovery route contract
      title: incident Recovery/Reverse route projection contract
      layer: L5
      owner: TL
      status: confirmed
  refs:
    - from: HOD-OPS-LOG-DESIGN
      to: HR-FR-VMFIT-07
      kind: refines
    - from: HOD-OPS-KPI-METRIC
      to: HR-FR-VMFIT-07
      kind: refines
    - from: HOD-OPS-RUNTIME-VERIFICATION
      to: HVM-ADOPT-05
      kind: implements
    - from: HOD-OPS-OPERATION-TEST
      to: HVM-TAILOR-OPERATION
      kind: implements
    - from: HOD-OPS-CLASS-METHOD-CONTRACT
      to: HVM-TAILOR-DETAIL-CONTRACT
      kind: refines
    - from: HOD-OPS-INCIDENT-RECOVERY-ROUTE
      to: HVM-ADOPT-05
      kind: implements
---

# HELIX L5 詳細設計 — L12 operation scope 契約

本書は `ハイブリッド設計ドキュメントv1-fixed.zip` の運用・ログ・KPI・保守・インシデント設計を、HELIX の L5 詳細設計へ吸収する。
独立した重い機能設計は復活させず、L12 運用後検証で必要な契約を typed declaration と DB projection で検出できる粒度に固定する。

## §1 Scope 契約

| ID | scope | L5 契約 | 観測 source |
|----|-------|---------|-------------|
| HOD-OPS-LOG-DESIGN | `log_design` | hook event / session log / runtime verification からログ設計の観測可否を判定する。 | `hook_events`, `runtime_verification_events` |
| HOD-OPS-KPI-METRIC | `kpi_metric` | quality signal と Scrum metric を KPI として project し、運用時の傾向を current-location へ出す。 | `quality_signals`, `runtime_verification_events` |
| HOD-OPS-RUNTIME-VERIFICATION | `runtime_verification` | accepted かつ `runtime_verified` の runtime evidence だけを L12 検証根拠にする。projection-only row は完了根拠にしない。 | `runtime_verification_events` |
| HOD-OPS-OPERATION-TEST | `operation_test` | 運用テストは passed `test_runs` / `gate_runs` と runtime evidence の両方から観測し、テスト名の自然語だけで pass にしない。 | `test_runs`, `gate_runs`, `runtime_verification_events` |
| HOD-OPS-CLASS-METHOD-CONTRACT | `class_method_contract` | class/method contract は設計 ID に結合した accepted runtime evidence がある場合だけ observed に昇格する。 | `design_declarations`, `runtime_verification_events` |
| HOD-OPS-INCIDENT-RECOVERY-ROUTE | `incident_recovery_route` | Recovery / Reverse / incident route は closure ledger と runtime evidence の両方から観測し、障害時の逆流経路を current-location に残す。 | `closure_next_action_ledger`, `runtime_verification_events` |

## §2 Summary 投影

`helix current-location --summary-json`、`helix vmodel fit --summary-json`、`helix progress frontier --summary-json` は、`operation_scope` を counts-only にしない。
各 summary は `operation_scope.items[]` として `scope`、`status`、`design_count`、`observed_count`、`observation_gap`、sample design / observation source、`evidence_tables` を返す。

`designed=0 observed=6` は「設計が無い」ではなく、全 scope が runtime / quality / closure evidence により `observed` へ昇格済みであることを示す。
そのため item 単位の設計 ID と観測 source を同時に出し、現在地・工程表・Project view が同じ意味で読めるようにする。

## §3 失敗時に閉じる条件

- `operation_scope.items[]` が summary から消えた場合は退行とする。
- `log_design`、`class_method_contract`、`runtime_verification` のいずれかが item に存在しない場合は退行とする。
- `class_method_contract` は単語一致だけで observed にしない。設計 ID と accepted runtime evidence の結合を要求する。
- `runtime_verification_events` の projection-only / incomplete row は accepted runtime evidence として扱わない。
- Project view は `Operation scope` 子ノードに status だけでなく design count と observed count を出す。
