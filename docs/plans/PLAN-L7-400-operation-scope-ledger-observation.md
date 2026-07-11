---
plan_id: PLAN-L7-400-operation-scope-ledger-observation
title: "PLAN-L7-400 (troubleshoot): operation scope ledger 観測結合"
kind: troubleshoot
layer: L7
drive: be
status: completed
route_mode: incident
created: 2026-07-09
updated: 2026-07-09
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-09 全ZIPの修正改善を反映し、ハイブリッド版への差し替え前に未配線の機械検出を強化する"
backprop_decision: not_required
backprop_decision_reason: "`incident_recovery_route` が evidence table として `closure_next_action_ledger` を持つ一方、observed 判定では未使用だったため、既存 L12 operation scope の未配線を補修し、L6 function-spec への設計同期もこのPLANの generates に含めて完了する。追加の上位戻しPLANは不要。"
agent_slots:
  - role: tl
    slot_label: "TL - L12 operation scope と closure ledger の整合"
  - role: aim
    slot_label: "AIM - current-location read-model 結合"
  - role: qa
    slot_label: "QA - incident route observed 昇格の回帰検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-400-operation-scope-ledger-observation.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/state-db/current-location.ts
    artifact_type: source_module
  - artifact_path: tests/current-location.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
  requires:
    - docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
  references:
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T19:50:17+09:00"
    tests_green_at: "2026-07-09T19:50:17+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "closure next-action ledger を incident_recovery_route の observed source に結合し、運用後スコープの未使用 evidence table を実際の read-model 判定へ接続した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T19:49:05+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:c6bb331661969f4e9b2434caa396aa3c624291d64096d098f9470d5e430fe1fa"
      - kind: unit_test
        command: "bun run test:fast -- tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T19:50:07+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:2414e0ff5e5caaa4da6461084b62a67f749ee5fe29fc8c0647a3a912bde064c8"
      - kind: lint
        command: "bunx biome check src/state-db/current-location.ts tests/current-location.test.ts docs/design/harness/L6-function-design/function-spec.md docs/plans/PLAN-L7-400-operation-scope-ledger-observation.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T19:50:07+09:00"
        evidence_path: docs/plans/PLAN-L7-400-operation-scope-ledger-observation.md
        output_digest: "sha256:f6259331da1c1fcc225b8c760164d53cd5bd7afd8a96a6c72c74c44390cf9d04"
---

# PLAN-L7-400: operation scope ledger 観測結合

## 目的

ハイブリッド版で要求された「障害時の逆流 route を機械検出対象にする」契約を、Project current-location の
operation scope 観測に結合する。

## スコープ

- `incident_recovery_route` の observed source として、Recovery / Reverse を含む `closure.next_action_ledger`
  entry を `closure_next_action_ledger:*` 形式で投影する。
- `buildProjectCurrentLocationSnapshot` は closure ledger を構築してから operation scope を評価する。
- 既存の accepted `runtime_verification_events` による observed 昇格は維持する。

## 対象外

- `class_method_contract` の observed 昇格を設計宣言だけで水増ししない。
- `operation_test` の passed test/gate 判定を緩めない。
- closure apply や approval gate の状態変更は行わない。

## 受入条件

- closure next-action ledger に Recovery / Reverse route があるとき、`incident_recovery_route` が source 付きで
  `observed` になる。
- 観測 source が無い scope は従来どおり `designed` / `observed_gap` のまま残る。
- `current-location` / `vmodel fit` / `doctor` の既存 gate は、承認待ち close-ready を除いて新しいエラーを出さない。
