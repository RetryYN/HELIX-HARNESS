---
plan_id: PLAN-L7-214-loop-effort-budget
title: "PLAN-L7-214 (add-impl): loop effort-budget 制御"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - HC-P2 loop effort-budget enforcement"
  - role: qa
    slot_label: "QA - over-budget loop cannot continue or pass"
generates:
  - artifact_path: docs/plans/PLAN-L7-214-loop-effort-budget.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/loop-effort-budget.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-runner.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-state.ts
    artifact_type: source_module
  - artifact_path: tests/orchestration/orchestration.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
  requires:
    - docs/plans/PLAN-L3-06-helix-pillar-descent.md
    - docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
    - docs/plans/PLAN-REVERSE-214-loop-effort-budget.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:05:00+09:00"
    tests_green_at: "2026-07-01T07:05:00+09:00"
    verdict: approve
    scope: "HC-P2 loop effort-budget: plan size / model role / iteration / toolCalls / costUsd / elapsedMs now have a pure budget decision, and tick applies it before worker dispatch and before verifier verdict recording. Over-budget loops stop with effort_budget and cannot record same-worker pass/continue. This closes the core loop effort-budget gap; hosted/API preflight is closed by PLAN-L7-215. Whole-program completion remains approval/S4/cutover blocked."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/orchestration/orchestration.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:05:00+09:00"
        evidence_path: tests/orchestration/orchestration.test.ts
        output_digest: "sha256:27d21f17db9adbeac47bd7d1894214c45c679ef657d7a5ddc9e06ab55a39ab1c"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:05:00+09:00"
        evidence_path: src/orchestration/loop-effort-budget.ts
        output_digest: "sha256:71f0b3adcee87013c199c4f7510764c3f522e0014aab48878a0ad63c0d6f7dfb"
---

# PLAN-L7-214: loop effort-budget 制御

## 目的

L3/L6 では loop budget の説明がある一方で、runtime 側は汎用的な `cost_budget` stop rule しか持っていなかった
HC-P2 / HR-FR-P2-02 の gap を埋める。実装では effort を plan size、model role、iteration count、tool use、
cost、elapsed time に結び付け、予算超過の worker が継続したり `pass` を記録したりできないようにする。

## スコープ

- `src/orchestration/loop-effort-budget.ts` を追加し、純粋な budget 構築、role/plan-size から導く limit、
  `tickLoopEffortBudget` を実装する。
- `LoopState` に任意の effort-budget state を追加し、既存の loop JSON 互換性は維持する。
- `tick` を worker dispatch の前と verifier verdict 記録の前で budget 判断につなげる。
- 導出 limit、予算超過検知、dispatch 前停止、verdict 後の `pass` 抑止について unit coverage を追加する。
- L1/L3/L6 と対応する test-design 文を更新し、P2 residuals が loop effort-budget を全面不在として
  語らないようにする。

## 対象外

- この PLAN は hosted/API developer tools を mechanically hook-covered にしない。
- この PLAN は full continuous-run heartbeat engine を実装しない。
- この PLAN は `旧 state path -> .helix` cutover を有効化しない。

## 設計メモ

`tickLoopEffortBudget` は意図的に pure で provider-neutral である。runtime loop は `readEffortUsage` を通じて
最新の usage を注入できる。これが無い場合は、`LoopState` に保持された budget usage を使って判断する。
設定済みの overrun は常に `allowContinue=false` と `allowWorkerPass=false` を返すため、`tick` が予算超過の
`pass` をこっそり loop progress に変えることはできない。

## 完了条件

- [x] Plan-size / model-role に基づく derived limits が存在する。
- [x] Iteration / toolCalls / costUsd / elapsedMs の overrun は fail-closed する。
- [x] `tick` は budget がすでに exceeded のとき、worker dispatch 前に停止する。
- [x] `tick` は budget が exceeded になった後の verifier 後 `pass` を抑止する。
- [x] L1/L3/L6 design と対応する test-design を、whole P2 completion を主張せずに更新した。
