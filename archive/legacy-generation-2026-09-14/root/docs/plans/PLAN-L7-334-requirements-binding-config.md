---
plan_id: PLAN-L7-334-requirements-binding-config
title: "PLAN-L7-334 (impl): requirements-binding config — 閾値と観点表を .helix/config へ移す"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L3-07 Step 2 後半で要求済みの config/schema 化であり、新規 product requirement は追加しない。refactor candidate detector と L1/L2 gap-check の既存閾値を外部化し、repo config 欠落・破損を doctor hard gate で検出する。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/requirements-binding-config.test.ts
agent_slots:
  - role: qa
    slot_label: "Copernicus - Step 6 refactor actionable 化の副作用監査"
  - role: tl
    slot_label: "TL - requirements-binding config/schema 実装"
generates:
  - artifact_path: docs/plans/PLAN-L7-334-requirements-binding-config.md
    artifact_type: markdown_doc
  - artifact_path: .helix/config/requirements-binding.yaml
    artifact_type: config
  - artifact_path: src/config/requirements-binding.ts
    artifact_type: source_module
  - artifact_path: src/state-db/refactor-candidate-policy.ts
    artifact_type: source_module
  - artifact_path: src/state-db/refactor-candidates.ts
    artifact_type: source_module
  - artifact_path: src/state-db/feedback-projections.ts
    artifact_type: source_module
  - artifact_path: src/lint/l1-l2-gap-check.ts
    artifact_type: source_module
  - artifact_path: src/lint/shared.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/requirements-binding-config.test.ts
    artifact_type: test_code
  - artifact_path: tests/l1-l2-gap-check.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/design/harness/L6-function-design/function-spec.md
  requires:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/plans/PLAN-L7-333-l1-l2-gap-check-readonly.md
  references:
    - docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T01:25:35+09:00"
    tests_green_at: "2026-07-06T01:25:35+09:00"
    verdict: approve
    scope: "PLAN-L3-07 Step 2 後半の threshold / viewpoint config 化を実装した。`.helix/config/requirements-binding.yaml` を zod schema で読み、refactor candidate detector と L1/L2 gap-check が config を消費する。doctor は requirements-binding-config を hard gate とし、repo config 欠落・破損を fail-close する。Step 6 の refactor actionable 化は別 commit の小粒度 slice として残す。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T01:25:35+09:00"
        evidence_path: src/config/requirements-binding.ts
        output_digest: "sha256:a7c6842dd686acc57cd4431ca1bc9d2f4086f31ea374fe7e2277d1135117c35b"
      - kind: unit_test
        command: "bun test tests/requirements-binding-config.test.ts tests/l1-l2-gap-check.test.ts tests/projection-writer.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T01:25:35+09:00"
        evidence_path: tests/requirements-binding-config.test.ts
        output_digest: "sha256:ace43eaf412d1811e3d58c6e43667a9172c9263f3df4dcaefd779f5d2c26417b"
      - kind: unit_test
        command: "bun test tests/doctor.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T01:25:35+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:2683a5fe6ab032ea257282cea94fabe2bb9b209ecfd5b2bfe3afc53ba31f5126"
      - kind: lint
        command: "bun src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-06T01:25:35+09:00"
        evidence_path: docs/plans/PLAN-L7-334-requirements-binding-config.md
        output_digest: "sha256:0d38550ef52dea3aaa0f87446dfcf3e9040a76b89210274a694558868061a1d5"
---

# PLAN-L7-334: 要件拘束 config

## 目的

`PLAN-L3-07` Step 2 後半として、refactor candidate detector と L1/L2 gap-check の閾値・観点表を
source hardcode から `.helix/config/requirements-binding.yaml` へ移す。

## 実装

- `.helix/config/requirements-binding.yaml`: refactor candidate の scan root / threshold / policy term と
  L1/L2 gap-check の maxRounds / 観点表を保持する。
- `src/config/requirements-binding.ts`: YAML loader と zod schema。通常 API は config 未配置の isolated test
  repo では default を使い、repo config を要求する doctor では欠落・破損を fail-close する。
- `src/state-db/refactor-candidates.ts` / `src/state-db/feedback-projections.ts`: detector が config の
  threshold / scan root / policy term を消費する。
- `src/lint/l1-l2-gap-check.ts`: gap-check packet が config の maxRounds / viewpoints を消費する。
- `src/doctor/index.ts`: `requirements-binding-config` hard gate を追加する。
- `src/lint/shared.ts` / `docs/design/harness/L4-basic-design/architecture.md`: 新規 `src/config` module を
  architecture / source-boundary に登録する。

## 受入条件

- config が valid な場合、doctor は `requirements-binding-config - OK` を出す。
- config の shape が壊れている場合、schema violation として fail-close する。
- refactor candidate detector は config の threshold を使い、source hardcode のみに依存しない。
- L1/L2 gap-check packet は config の maxRounds / viewpoints を使う。
- 既存の `.helix` / HELIX rename 境界は変更しない。PLAN-M-02 cutover apply も行わない。

## 残件

- `PLAN-L3-07` Step 6 の refactor candidate actionable 化は、DB schema 変更なしの warning/actionable surface から
  別 commit で進める。N 回連続 surface の厳密履歴は現行 projection DB では保持していないため、必要なら別 PLAN で
  runtime state table を設計してから扱う。
