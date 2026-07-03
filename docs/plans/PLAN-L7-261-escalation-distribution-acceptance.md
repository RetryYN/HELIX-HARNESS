---
plan_id: PLAN-L7-261-escalation-distribution-acceptance
title: "PLAN-L7-261: escalation workflow distribution acceptance 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "consumer setup 配布 acceptance の検証範囲を escalation workflow へ拡張するテスト強化。runtime apply や外部 write は行わない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - escalation workflow distribution acceptance"
generates:
  - artifact_path: docs/plans/PLAN-L7-261-escalation-distribution-acceptance.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - tests/distribution-acceptance.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T17:20:00+09:00"
    tests_green_at: "2026-07-03T17:20:00+09:00"
    verdict: approve
    scope: "clean distribution acceptance が harness-check だけでなく escalation-stale workflow の生成・placeholder 不在・read-only route audit command 実行を確認するようにした。外部 GitHub write、branch protection、rename/cutover apply は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T17:20:00+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:6b4c3b26acbd1a4d9f35cb1a987ac0e7c4bf4f7d65138d1e3d7f2c8e3a4b5c61"
---

# PLAN-L7-261: escalation workflow distribution acceptance 強化

## 目的

`PLAN-L7-260` で `escalation-stale.yml` は setup readiness と consumer doctor の検査対象になったが、
clean distribution acceptance は `harness-check.yml` の生成と command 実行だけを確認していた。
そのため、clean artifact 経由で consumer repo へ配布した後の escalation workflow drift を acceptance が直接証明していない。

この PLAN は、clean artifact → linked consumer repo → `ut-tdd setup project --json` の実経路で
`.github/workflows/escalation-stale.yml` が生成され、placeholder なし・read-only・fixed no-write command set として
linked bin 経由で実行可能であることを acceptance に追加する。

## 変更

- `tests/distribution-acceptance.test.ts` が生成済み `.github/workflows/escalation-stale.yml` を読む。
- `permissions: contents: read`、checkout credential 非保持、placeholder/TODO/TBD 不在を確認する。
- `CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS` の `ut-tdd` command を consumer repo の linked bin 経由で実行する。
- L7 unit test design の U-SETUP-013 / AT-DIST-001 に escalation workflow acceptance を追記する。

## 境界

- 外部 clean GitHub repo 作成、tag push、signed tarball publish は実行しない。
- GitHub issue 書き込み、branch protection、ruleset、secret、外部 API 書き込みは実行しない。
- `PLAN-M-02` の rename/cutover approval と `.helix` 実移行は扱わない。

## 完了条件

- distribution acceptance が escalation workflow の生成と no-write command 実行を証明する。
- targeted distribution acceptance、typecheck、design-language、plan governance、doctor が green。
