---
plan_id: PLAN-L7-111-reverse-fullback-claimed-artifact-gate
title: "PLAN-L7-111: Reverse fullback claimed artifact gate の実装"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - claimed artifact gate 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-111-reverse-fullback-claimed-artifact-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-111-reverse-fullback-claimed-artifact-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/plan-lint.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
  requires:
    - docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
    - docs/plans/PLAN-REVERSE-111-reverse-fullback-claimed-artifact-gate.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T23:20:00+09:00"
    tests_green_at: "2026-06-23T23:18:00+09:00"
    verdict: approve
    scope: "Reverse fullback の claimed artifact path lint と regression test。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests\\plan-lint.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T23:17:00+09:00"
        evidence_path: tests/plan-lint.test.ts
        output_digest: "sha256:ba64ea807951fdf6b3c3d0891e5525afe5b32e9599129db35e6870da0706826d"
      - kind: lint
        command: "npm run src\\cli.ts plan lint --gate governance"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-06-23T23:18:00+09:00"
        evidence_path: src/plan/lint.ts
        output_digest: "sha256:40c960d0d4d0b49ef3aff27e12291b7a5851077e6fdcf7aca1868bdf0d964510"
---

# PLAN-L7-111: Reverse fullback claimed artifact gate の実装

## 目的

Reverse/fullback PLAN が、backprop artifact path を更新したと記述しながら、
同じ artifact を `generates` から漏らす状態を防ぐ。

## スコープ

- `reverse_fullback_claimed_artifact_missing` を `plan-governance` に追加する。
- rule の対象は PLAN body 内の literal な `docs/design/`、`docs/governance/`、
  `docs/test-design/` path に限定する。
- 既存 PLAN を retroactive に fail させず、legacy natural-language claim は audit document で可視化したままにする。

## 受入条件

- body が generated ではない backprop artifact path を引用する新規 R4 fullback は fail する。
- current PLANs に対する live governance lint run が pass する。
- `npm test tests\plan-lint.test.ts` が pass する。
