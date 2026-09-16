---
plan_id: PLAN-L7-234-team-run-backlog-closure
title: "PLAN-L7-234 (troubleshoot): team run backlog 整合"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-104 は既存 team run 実装済み evidence に合わせて stale backlog / carry 表示を是正する troubleshoot であり、新規 product requirement や外部 contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/agent-slots.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: team run backlog 整合と agent-slots carry 表現が現HEADの fast regression で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/team-run.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: aim
    slot_label: "AIM - team run backlog closure evidence"
  - role: tl
    slot_label: "TL - stale backlog and carry synchronization"
generates:
  - artifact_path: docs/plans/PLAN-L7-234-team-run-backlog-closure.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/agent-slots.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-64-team-runner-launch.md
  requires:
    - docs/plans/PLAN-L7-64-team-runner-launch.md
    - docs/plans/PLAN-L7-75-cost-tiered-provider-router.md
    - docs/plans/PLAN-L7-140-proposal-document-coverage-lint.md
    - docs/design/harness/L6-function-design/agent-slots.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-234: team run backlog 整合

## 0. 目的

IMP-104 は「`helix team run` が validate-only で、実委譲と drive 招集が未実装」という観測を
backlog に残していた。しかし現 HEAD では `PLAN-L7-64` が `executeTeamRunPlan` と provider adapter 実行、
`PLAN-L7-75` が tier-router から team run placement への橋渡し、`PLAN-L7-140` が proposal coverage lanes
から `team suggest --design-docs` への橋渡しを実装済みである。

この slice では実装を増やさず、古い未了表示を現在の evidence に同期する。未了扱いの stale backlog は、
実際の自律作業 blocker と人間判断 blocker の識別を曇らせるため、workflow の穴として閉じる。

## 1. スコープ

対象:

- `docs/improvement-backlog.md` の IMP-104 を `implemented` に更新する。
- `docs/design/harness/L6-function-design/agent-slots.md` の `helix team run` carry 表現を実装済みに更新する。
- 実装済み evidence として `PLAN-L7-64`、`PLAN-L7-75`、`PLAN-L7-140`、関連テストを明示する。

対象外:

- provider CLI 実行ロジックの変更。
- 実 provider への外部実行。
- L14 completion / version-up activation / irreversible rename cutover の承認。

## 2. 受入条件

- IMP-104 が observed のまま残らず、実装済み evidence へ接続されている。
- L6 agent-slots 設計が `helix team run` を未実装 carry と誤読させない。
- `team run --execute`、tier-router placement、proposal coverage team suggestion の既存テストが green である。
- doctor が backlog / plan governance / design-language を green に保つ。

## 3. 検証

- `bun test tests/team-run.test.ts tests/cli-surface.test.ts tests/runtime-hook-entrypoints.test.ts --timeout 180000`
- `bun run src/cli.ts plan lint --gate governance`
- `bun run src/cli.ts db rebuild && bun run src/cli.ts doctor`

## 4. 完了条件

- [x] IMP-104 が implemented へ更新されている。
- [x] `agent-slots.md` の team run carry が実装済み evidence を指している。
- [x] この PLAN が docs-only closure の trace を持つ。
