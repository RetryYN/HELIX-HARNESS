---
plan_id: PLAN-L7-138-quality-branch-audit
title: "PLAN-L7-138 (add-impl): read-only quality and branch audits"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
backprop_decision: not_required
backprop_decision_reason: "This adds read-only audit surfaces for existing quality and maintenance concerns; no new product requirement or destructive operation is introduced."
agent_slots:
  - role: tl
    slot_label: "TL - quality and branch audit implementation"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-138-quality-branch-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: src/audit/quality.ts
    artifact_type: source_module
  - artifact_path: src/audit/branches.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/quality-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/branch-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-137-feedback-surface-taxonomy.md
  requires:
    - docs/plans/PLAN-L7-137-feedback-surface-taxonomy.md
    - docs/plans/PLAN-REVERSE-138-quality-branch-audit.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T22:15:00+09:00"
    tests_green_at: "2026-06-23T22:15:00+09:00"
    verdict: approve
    scope: "Read-only quality and branch audit surfaces; no destructive branch operation."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\quality-audit.test.ts tests\\branch-audit.test.ts tests\\cli-surface.test.ts -t \"quality audit|branch audit\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T22:03:46+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:b1ce2029859c515432ffde27fa0853f77baedd271ebbb7ea0c3ce74561487309"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T22:03:49+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T22:05:10+09:00"
        evidence_path: src/audit/quality.ts
        output_digest: "sha256:21df0de2a64028799e47b02f30e38b0221895cce18d09c07240e577b96874b22"
      - kind: smoke
        command: "npm run src\\cli.ts audit quality --limit 10"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T22:06:00+09:00"
        evidence_path: tests/quality-audit.test.ts
        output_digest: "sha256:67ff3c7faa901eb99914661b2b5b16fdc8c7ffee66d028c6e362891631b10c58"
      - kind: smoke
        command: "npm run src\\cli.ts branch audit --limit 20"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T22:06:00+09:00"
        evidence_path: tests/branch-audit.test.ts
        output_digest: "sha256:83860fcceb15d570c46c5e156b1345fddc5170685f10ff1c99b35fa66aee33a1"
---

# PLAN-L7-138 (add-impl): read-only quality / branch audit の追加

## 0. Objective

次の対象に対する実用的な read-only surface を追加する。

- hardcoded values、security risks、technical debt markers の検出対象。
- 大量の local branch cleanup inventory。

branch surface は何も削除してはならない。human review の候補を分類するだけに留める。

## 1. Scope

- Add `helix audit quality`.
- Add `helix branch audit`.
- 既存の `gate` / `actionable` / `telemetry` display discipline に従って findings を分類する。
- 破壊的な branch deletion は scope 外に保つ。

## 2. Acceptance Criteria（受入条件）

- [x] Secret-like literals と危険な shell execution を gate findings として扱う。
- [x] Hardcoded path、local endpoint、model/provider literals、legacy runtime references を
      actionable findings として扱う。
- [x] TODO/FIXME/HACK/XXX を telemetry findings として扱う。
- [x] branches を current/protected/gone/merged/stale evidence から keep、delete-candidate、review に分類する。
- [x] CLI が text output と JSON output をサポートする。
- [x] どの command も branches deletion や history rewrite を行わない。

## 3. Verification

- `npx --no-install vitest run tests\quality-audit.test.ts tests\branch-audit.test.ts`
- `npx --no-install vitest run tests\cli-surface.test.ts -t "quality audit|branch audit"`
- `npx --no-install tsc --noEmit`
- `npm run lint`
- `npx --no-install tsx src\cli.ts audit quality --limit 10`
- `npx --no-install tsx src\cli.ts branch audit --limit 20`
