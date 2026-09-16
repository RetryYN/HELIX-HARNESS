---
plan_id: PLAN-L7-135-dynamic-skill-injection-materialization
title: "PLAN-L7-135: 動的 skill injection の materialization"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
agent_slots:
  - role: tl
    slot_label: "TL - 動的 skill injection の materialization"
generates:
  - artifact_path: docs/plans/PLAN-L7-135-dynamic-skill-injection-materialization.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-135-dynamic-skill-injection-materialization.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: src/skills/recommend.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/team/run.ts
    artifact_type: source_module
  - artifact_path: src/task/tier-router.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/skill-recommend.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/team-run.test.ts
    artifact_type: test_code
  - artifact_path: tests/tier-router.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-134-tdd-drive-fit-classification.md
  requires:
    - docs/plans/PLAN-L7-134-tdd-drive-fit-classification.md
    - docs/plans/PLAN-REVERSE-135-dynamic-skill-injection-materialization.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T18:42:32+09:00"
    tests_green_at: "2026-06-23T18:42:32+09:00"
    verdict: approve
    scope: "skill recommendation manifest を Claude/Codex adapter stdin と team-run adapters へ materialize する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\skill-recommend.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: tests/skill-recommend.test.ts
        output_digest: "sha256:5ff2a93bed92158fd45d452d57bc26f9594b9051bf00947f6f918b4aeb1f4df1"
      - kind: unit_test
        command: "bun run vitest run tests\\skill-recommend.test.ts tests\\runtime-adapter.test.ts tests\\team-run.test.ts tests\\tier-router.test.ts tests\\doctor.test.ts tests\\cli-surface.test.ts -t \"routeToAdapterPlan|codex-wrapper-parity|skill|inject|shared Claude/Codex launch plan|provider-neutral|stdin|task route\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:6d4c1257b646c3a744c0fc374bbb071ab2617deb86c63a49bcb44d69dd23681e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: src/runtime/adapter.ts
        output_digest: "sha256:eb35c437e2188f32e5725b86e884e0b831ac721dc4f335279817934ca20a1c08"
      - kind: lint
        command: "bunx biome check src\\runtime\\adapter.ts src\\team\\run.ts src\\task\\tier-router.ts src\\doctor\\index.ts src\\cli.ts src\\skills\\recommend.ts tests\\runtime-adapter.test.ts tests\\team-run.test.ts tests\\tier-router.test.ts tests\\doctor.test.ts tests\\skill-recommend.test.ts tests\\cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T18:42:32+09:00"
        evidence_path: src/skills/recommend.ts
        output_digest: "sha256:d8e9694551877c339a13b30e725366febb8ed15edf21308b56a8caf11a21c0bc"
---

# PLAN-L7-135: 動的 skill injection の materialization

## 目的

動的 skill injection の gap を閉じる。recommendation rows と `skill suggest`
output は、agent が手動で覚えておく report ではなく、Claude と Codex の実際の provider context
になる必要がある。

## スコープ

- skill recommendations から、path のみを持つ `SkillInjectionSet` manifest を追加する。
- provider-neutral consumers 向けに `helix skill suggest --inject --json` を追加する。
- `contextInjection` を `buildAdapterPlan` へ渡し、scoped skill paths を provider stdin へ追記する。
- `helix codex|claude --plan` と `helix team run --plan` を配線し、rebuilt harness DB projection
  から同じ injection を解決する。
- `task route --plan ... --execute` を `routeToAdapterPlan` 経由で配線し、difficulty/cost-tier
  routing と動的 skill injection が同じ adapter plan に合流するようにする。

## 受入条件

- Manifest は skill paths/reasons のみを含み、skill bodies を copy しない。
- Claude と Codex adapters は同じ injection format を受け取る。
- Prompt text と skill paths は stdin に留め、argv は固定 command flags のままにする。
- Team-run はすべての runtime member adapter に同じ injection を適用する。
