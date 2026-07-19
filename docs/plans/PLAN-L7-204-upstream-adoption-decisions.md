---
plan_id: PLAN-L7-204-upstream-adoption-decisions
title: "PLAN-L7-204 (add-impl): upstream A-146 semantic adoption decision contracts"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/helix/L6-function-design/upstream-substance-gap.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - upstream A-146 semantic adoption boundary"
  - role: se
    slot_label: "SE - pure upstream adoption decisions"
  - role: qa
    slot_label: "QA - U-UPSTREAM oracle coverage"
generates:
  - artifact_path: docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/upstream-adoption.ts
    artifact_type: source_module
  - artifact_path: tests/upstream-adoption.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-50-helix-orchestration-memory.md
  requires:
    - docs/plans/PLAN-REVERSE-204-upstream-adoption-decisions.md
    - docs/design/helix/L3-requirements/upstream-substance-gap.md
    - docs/design/helix/L4-basic-design/upstream-substance-gap.md
    - docs/design/helix/L5-detail/upstream-substance-gap.md
    - docs/design/helix/L6-function-design/upstream-substance-gap.md
    - docs/test-design/helix/upstream-substance-gap.md
  references:
    - docs/design/helix/L6-function-design/upstream-substance-gap.md
    - docs/test-design/helix/upstream-substance-gap.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:47:00+09:00"
    tests_green_at: "2026-06-30T02:47:00+09:00"
    verdict: approve
    scope: "Upstream A-146 semantic adoption L6 contracts now have pure L7 decision helpers and U-UPSTREAM-001..009 unit coverage. The implementation keeps runtime provenance and coverage-substance distinctions explicit."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/upstream-adoption.test.ts tests/vmodel-pair.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: tests/upstream-adoption.test.ts
        output_digest: "sha256:f876c2eda955c889739799ff506d6beface45cf4d19e810506f9941df565886c"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: src/runtime/upstream-adoption.ts
        output_digest: "sha256:1f9d0f1bdfc20996642a18c8215933bea595aa84536b651bf515a83d0eeb65b2"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: src/runtime/upstream-adoption.ts
        output_digest: "sha256:1f9d0f1bdfc20996642a18c8215933bea595aa84536b651bf515a83d0eeb65b2"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:47:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
---

# PLAN-L7-204: upstream A-146 semantic adoption decision contracts の判断契約

## 目的

`upstream-substance-gap.md` で L6 から下ろした upstream A-146 semantic adoption contracts について、
L7 slice を実装する。upstream の prose や runtime state はコピーせず、8 件の A-146 findings を
HELIX の adoption decision として実行可能にする。

## 対象範囲

- `src/runtime/upstream-adoption.ts` に `U-UPSTREAM-001..009` 向けの pure decision helpers を実装する。
- `tests/upstream-adoption.test.ts` に焦点を絞った unit tests を追加する。
- L7 unit-test design に implementation oracles を登録する。
- matcher evidence には既存の `run-debug` runtime surface vocabulary を再利用する。

## 対象外

- この PLAN では distribution artifacts の publish、release signing、external provider CLIs の実行は扱わない。
- この PLAN では database schema や public CLI surfaces を変更しない。
- この PLAN は L7.5 runtime verification log を置き換えない。upstream coverage/provenance decisions を
  テスト可能にすることで補完する。

## 受入条件

- `src/runtime/upstream-adoption.ts` は upstream A-146 L6 design が名指しした全 functions を実装する。
- `tests/upstream-adoption.test.ts` は `U-UPSTREAM-001..009` を網羅する。
- 未知の A-146 finding ids は黙って adopted にしない。
- Guard、evidence、telemetry、distribution、FE substance、drive entry、matcher coverage claims は、
  evidence が欠落または hollow な場合にすべて fail closed する。
- Typecheck、lint、targeted V-model tests、doctor、full test suite が pass する。
