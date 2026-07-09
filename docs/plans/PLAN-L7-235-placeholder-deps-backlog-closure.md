---
plan_id: PLAN-L7-235-placeholder-deps-backlog-closure
title: "PLAN-L7-235 (troubleshoot): placeholder_deps backlog 整合"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-107 は既存 placeholder-deps lint / descent-obligation evidence に合わせて stale backlog 表示を是正する troubleshoot であり、新規 product requirement や外部 contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: placeholder-deps backlog closure と L7 impl-state / spec-backfill wait の分離が現HEADの fast regression で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/placeholder-deps.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: aim
    slot_label: "AIM - placeholder_deps backlog closure evidence"
  - role: tl
    slot_label: "TL - stale backlog synchronization"
generates:
  - artifact_path: docs/plans/PLAN-L7-235-placeholder-deps-backlog-closure.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-51-descent-obligation.md
  requires:
    - docs/plans/PLAN-L7-51-descent-obligation.md
    - docs/design/harness/L5-detailed-design/physical-data.md
    - src/lint/placeholder-deps.ts
    - tests/placeholder-deps.test.ts
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-235: placeholder_deps backlog 整合

## 0. 目的

IMP-107 は `placeholder_deps` の `waiting_layer` 2 類型を専用 doctor / vmodel rule として扱い、
doctor green を「placeholder_deps 完全 fail-close」と誤読させないことを課題にしていた。

現 HEAD では `PLAN-L7-51` の descent-obligation と `src/lint/placeholder-deps.ts` が役割分担済みである。
型② (`waiting_layer=L7` の実装状態解消型) は active design / test-design に残ると hard-fail し、
型① (`waiting_layer=L1-L6` の spec back-fill 型) は正当な carry として検出数を surface する。
型①の threshold は `descent-obligation` の impl-ahead 検査が正本として扱うため、placeholder-deps 側では
重複実装しない。

この slice では実装を増やさず、古い `triaged` 表示を現在の evidence に同期する。実装済みの課題が
backlog 上で未了扱いのまま残ると、実際の残作業と人間判断 blocker の識別を曇らせるため、workflow の穴として閉じる。

## 1. スコープ

対象:

- `docs/improvement-backlog.md` の IMP-107 を `implemented` に更新する。
- 実装済み evidence として `PLAN-L7-51`、`src/lint/placeholder-deps.ts`、`tests/placeholder-deps.test.ts`、
  `docs/design/harness/L5-detailed-design/physical-data.md` を明示する。

対象外:

- placeholder-deps / descent-obligation の新規 lint 追加。
- L6 spec back-fill 型の item 単位 threshold 判定の重複実装。
- L14 completion / version-up activation / irreversible rename cutover の承認。

## 2. 受入条件

- IMP-107 が `triaged` のまま残らず、実装済み evidence へ接続されている。
- `placeholder-deps` lint が L7 impl-state wait を hard-fail、L1-L6 spec back-fill wait を count-only として扱う証跡がある。
- unknown `waiting_layer` と旧「placeholder_deps doctor rule is not implemented」記述が hard-fail する証跡がある。
- doctor が backlog / plan governance / design-language を green に保つ。

## 3. 検証

- `bun test tests/placeholder-deps.test.ts tests/descent-obligation.test.ts tests/doctor.test.ts --timeout 180000`
- `bun run src/cli.ts plan lint --gate governance`
- `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor`

## 4. 完了条件

- [x] IMP-107 が implemented へ更新されている。
- [x] この PLAN が docs-only closure の trace を持つ。
- [x] placeholder_deps 2 類型の実装済み evidence が backlog から追跡できる。
