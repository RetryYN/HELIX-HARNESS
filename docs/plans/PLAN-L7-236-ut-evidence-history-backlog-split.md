---
plan_id: PLAN-L7-236-ut-evidence-history-backlog-split
title: "PLAN-L7-236 (troubleshoot): 単体テスト evidence history backlog 分解"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-109 の現 HEAD 証跡を読み直し、既実装部分と残差を backlog 上で分離する docs-only troubleshoot であり、新規 product requirement や外部 contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: test_runs / test_cases / test_results / test_artifact_edges の基礎 projection と backlog split が現HEADの fast regression で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "npm test:fast"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/review-green-command-projection.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: aim
    slot_label: "AIM - unit-test evidence backlog split evidence"
  - role: tl
    slot_label: "TL - partial implementation and residual routing"
generates:
  - artifact_path: docs/plans/PLAN-L7-236-ut-evidence-history-backlog-split.md
    artifact_type: markdown_doc
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-46-projection-writer.md
  requires:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - src/workflow/contracts.ts
    - src/state-db/projection-writer.ts
    - tests/workflow-contracts.test.ts
    - tests/review-green-command-projection.test.ts
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-236: 単体テスト evidence history backlog 分解

## 0. 目的

IMP-109 は「unit-test case/run/result の履歴 projection がない」という観測として残っていた。
しかし現 HEAD では `test_runs` / `test_cases` / `test_results` / `test_artifact_edges` の schema、
`recordTestRunEvidence`、`review_evidence.green_commands[]` から `test_runs` への projection、
および DB coverage / workflow contract / visualization read-model のテストが存在する。

一方で `docs/design/harness/L5-detailed-design/physical-data.md` §9.4 は、general unit-test runner ingestion、
flake history、duration regression projection を「separate IMP-109 scope」として残している。
したがって IMP-109 を `implemented` に閉じるのは過剰主張であり、現状態は「基礎 projection は実装済み、
残差は別 backlog に分離」が正しい。

この slice では実装を増やさず、backlog の意味を現在の evidence に同期する。

## 1. スコープ

対象:

- IMP-109 を `observed` から `triaged` に更新し、基礎 projection 実装済み evidence と残差を明記する。
- general unit-test runner ingestion / flake history / duration regression projection を IMP-147 として分離する。

対象外:

- runner log parser / flake detector / duration regression detector の新規実装。
- DB schema 変更。
- L14 completion / version-up activation / irreversible rename cutover の承認。

## 2. 受入条件

- IMP-109 が「完全未着手」と誤読されず、既実装 evidence を指している。
- IMP-109 が「完全実装済み」とも誤読されず、残差が IMP-147 へ分離されている。
- `test_runs` / `test_cases` / `test_results` / `test_artifact_edges` の設計・実装・テスト証跡が追跡できる。
- doctor が backlog / plan governance / design-language を green に保つ。

## 3. 検証

- `npm test tests/workflow-contracts.test.ts tests/review-green-command-projection.test.ts tests/db-projection-coverage.test.ts tests/db-projection-ingestion.test.ts tests/visualization-read-model.test.ts --timeout 180000`
- `npx --no-install tsx src/cli.ts plan lint --gate governance`
- `npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor`

## 4. 完了条件

- [x] IMP-109 が partial implementation と residual scope を明示している。
- [x] IMP-147 が residual scope の追跡先になっている。
- [x] この PLAN が docs-only backlog split の trace を持つ。
