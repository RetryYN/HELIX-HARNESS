---
plan_id: PLAN-L7-64-team-runner-launch
title: "PLAN-L7-64: shared Claude/Codex team runner launch flow"
kind: impl
layer: L7
drive: fullstack
parent_design: docs/design/harness/L6-function-design/agent-slots.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "team run launch plan and explicit execute path for shared Claude/Codex provider adapters"
agent_slots:
  - role: tl
    slot_label: "TL - shared team runner launch flow"
generates:
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/agent-slots.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L7-62
  requires:
    - docs/design/harness/L6-function-design/agent-slots.md
    - docs/governance/helix-harness-requirements_v1.2.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-64: Claude/Codex 共有 team runner launch flow

## 目的

`helix team run` を validate-only から進め、Claude と Codex の member が速度重視の委譲で同じ実行 flow を使えるようにする。

## 範囲

- `.helix/teams/*.yaml` の members から正規化済み launch plan を作る。
- dry-run を既定のままにし、provider CLI launch には `--execute` を必須にする。
- Claude / Codex の既存 provider adapter を使い、runtime 差分を adapter 境界の内側に閉じ込める。
- 明示実行の前後で `team_runner` slots を記録する。
- `strategy=parallel` / `max_parallel` を尊重し、直列化理由がある場合だけ sequential に固定する。

## 検証

- [x] `bunx vitest run tests\team-run.test.ts tests\cli-surface.test.ts`

## 完了条件

- [x] dry-run JSON が同じ team definition から Claude と Codex の launch plan を両方示す。
- [x] 明示実行 path が `team_runner` slots を通じて provider adapters を実行する。
- [x] parallel strategy が全 member を直列化せず、`max_parallel` 単位の batch で実行される。
- [x] CLI surface は `--execute` が指定されない限り非破壊のまま維持される。
