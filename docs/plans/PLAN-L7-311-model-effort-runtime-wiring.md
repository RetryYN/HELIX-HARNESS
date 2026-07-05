---
plan_id: PLAN-L7-311-model-effort-runtime-wiring
title: "PLAN-L7-311 (impl): model 標準 effort の runtime 選択への配線"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Claude
parent_design: docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-310 の standardEffortForModel / adaptReasoningEffort を selectTeamModel の runtime 選択に配線する contract-only ギャップ解消 (Codex stop-review 指摘: model effort policy is not wired into runtime selection)。新規 L1/L3 要求なし。"
agent_slots:
  - role: tl
    slot_label: "TL - effort policy の runtime 配線境界"
  - role: qa
    slot_label: "QA - 標準既定 / 観測適応 / explicit 優先の回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-311-model-effort-runtime-wiring.md
    artifact_type: markdown_doc
  - artifact_path: src/team/model-effort.ts
    artifact_type: source_module
  - artifact_path: src/team/model-policy.ts
    artifact_type: source_module
  - artifact_path: tests/team-model-policy.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-launch-policy.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
  requires:
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
review_evidence:
  - reviewer: claude-code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T04:05:00+09:00"
    tests_green_at: "2026-07-04T04:04:00+09:00"
    verdict: approve
    scope: "selectTeamModel が model 標準 effort を既定にし observation で 1 段適応、explicit override 最優先。model-effort→schema/team 依存化で model-policy との循環を除去 (dependency-drift cycles 0)。model_family 選定 (recommendModelEffort) は不変で回帰なし。Important 指摘 (矛盾観測時の effort_source 誤読) を反映し、adaptedEffort!==standardEffort のときのみ adaptive、それ以外 standard に是正済み。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-code-reviewer
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/team-model-policy.test.ts tests/team-launch-policy.test.ts tests/model-effort.test.ts tests/team-run.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T04:04:00+09:00"
        evidence_path: tests/team-model-policy.test.ts
        output_digest: "sha256:1ccf90eb749270be7f5feaaa6ac3853e7234e1907bd62eec90045e1b4d465b35"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T04:04:00+09:00"
        evidence_path: src/team/model-policy.ts
        output_digest: "sha256:3fe5777b2da2c23cf55c6d3db24d90415658949252168adadb41a33d18dd0e90"
---

# PLAN-L7-311: model 標準 effort の runtime 選択への配線

## 0. 目的

PLAN-L7-310 で作った標準 effort registry + 適応ルールが純モジュールのままで、実際の runtime
モデル選択 (`selectTeamModel`) に配線されていなかった (Codex stop-review 指摘:
"model effort policy is not wired into runtime selection")。これを配線する。

## 1. スコープ

- `src/team/model-policy.ts` `selectTeamModel`:
  - `reasoning_effort` の既定を **選定 model の `standardEffortForModel`** にする
    (旧: recommendModelEffort の task-size 由来値)。
  - `input.observation` (shallow/tooSlow) があれば `adaptReasoningEffort` で 1 段適応。
  - 明示 `input.effort` override は最優先。
  - `effort_source` を `"explicit" | "standard" | "adaptive"` に拡張。
  - `model_family` 選定は従来どおり `recommendModelEffort` (task-size ベース、回帰なし)。
- `src/team/model-effort.ts`: model-policy への依存を `schema/team` (ReasoningEffort) +
  ローカル `EFFORT_LADDER` へ変更し、model-policy → model-effort の一方向依存に (循環回避)。
- tests (検証): sonnet-pinned engine の effort が旧 task-based 一律 high から model 標準
  (sonnet-5=medium) に是正されることを固定。observation 適応 (U-EFFORT-WIRE) を追加。

## 2. 対象外

- runtime での shallow / too-slow の自動検出 (observation は呼び出し側が渡す。自動収集は
  PLAN-L7-310 §4 carry の loop-effort-budget 連携で扱う)。
- recommendModelEffort (task-size→model_family) の置き換え。

## 3. 受入条件

- U-EFFORT-WIRE: 既定=model 標準、shallow→+1段、tooSlow→-1段、explicit override 最優先、
  effort_source が standard/adaptive/explicit を正しく返す (tests/team-model-policy.test.ts)。
- sonnet-pinned engine (pmo-sonnet) の critical タスクが medium (標準) を既定に返すことを、
  tests/team-model-policy.test.ts / team-launch-policy.test.ts で検証する。
- dependency-drift cycles 0 (model-effort ↔ model-policy 循環なし)。
- `bun run typecheck` green、影響対象 tests (affected tests) green、`helix doctor` green。
