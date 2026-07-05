---
plan_id: PLAN-L7-215-hosted-preflight
title: "PLAN-L7-215 (add-impl): hosted API preflight enforcement"
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
    slot_label: "TL - HC-AC hosted/API preflight enforcement"
  - role: qa
    slot_label: "QA - hosted preflight evidence regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-215-hosted-preflight.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/hosted-preflight.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/hosted-preflight.test.ts
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
    - docs/plans/PLAN-REVERSE-215-hosted-preflight.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:20:00+09:00"
    tests_green_at: "2026-07-01T07:20:00+09:00"
    verdict: approve
    scope: "HC-AC hosted/API preflight: direct Claude/Codex hook surfaces and hosted/API preflight-only surfaces now have a pure adapter parity decision. Hosted/API edits require hook non-enforcement acknowledgement, git status preflight, target paths, work-guard decision, preflight command, and audit evidence. The CLI JSON surface exposes hostedPreflight with apiToolPathEnforced=false so repo hook coverage is not overstated. This closes the core hosted/API preflight gap but does not close whole-program approval or all-agent memory/rule generalization."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/hosted-preflight.test.ts tests/work-guard.test.ts tests/codex-hook-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:20:00+09:00"
        evidence_path: tests/hosted-preflight.test.ts
        output_digest: "sha256:766166f6df5163bb6cc964b8307a37f0139633fefd1b79be5265fb92c1aaf98b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:20:00+09:00"
        evidence_path: src/runtime/hosted-preflight.ts
        output_digest: "sha256:48f085cf1bd5ad251e641b68ad6bc9a5a1d3c2d04a27cfb5c0b4340b70296964"
---

# PLAN-L7-215: hosted API preflight 強制

## 目的

hosted API と developer-tool surface が preflight-only と説明されていた一方で、
first-class な pure contract を持っていなかった HC-AC / HR-FR-P2-03 /
HR-NFR-AC-02 gap を閉じる。実装は hosted/API edit が repo hook covered と
分類されることを防ぎ、その surface を受け入れる前に具体的な preflight evidence
を必須にする。

## 範囲

- `src/runtime/hosted-preflight.ts` を追加し、次を持たせる。
  - direct hook と hosted preflight-only を分類する
    `validateAdapterParityMap`。
  - hook が強制されないことの確認、`git status`、対象 path、
    work-guard、実行 command、audit evidence を要求する
    `requireHostedSurfacePreflight`。
- `helix guard preflight --json` を接続し、adapter parity と hosted
  preflight decision を `apiToolPathEnforced=false` とともに出力する。
- direct hook が covered と判定されること、hosted preflight-only の分類、
  unknown surface の drift/defer、evidence 欠落の reject、dry-run no-target、
  work-guard block propagation のテストを追加する。
- L1/L3/L6 と対応する test-design 文書を更新し、hosted/API preflight を
  open P2 core gap として列挙しない状態にする。

## 非範囲

- この PLAN は hosted/API developer tool を機械的な hook-covered 状態にはしない。
- この PLAN は rule-drift と shared-memory enforcement を将来のすべての
  agent surface へ一般化しない。
- この PLAN は `旧 state path -> .helix` cutover を有効化しない。

## 設計メモ

Hosted/API tool は repo-local の `.codex/hooks.json` を実行しない。したがって
正しい状態は "covered by hook" ではなく "preflight required" である。CLI は
JSON で `apiToolPathEnforced=false` を維持し、downstream review が
manual/preflight discipline を機械的な hook interception と誤認しないようにする。

## DoD

- [x] Hosted/API surface は `preflight_required` に分類され、
      `covered_by_hook` には分類されない。
- [x] Direct Claude/Codex の既知 hook surface は `covered_by_hook` に分類される。
- [x] Hosted/API edit は hook non-enforcement acknowledgement、git status、
      target path、work-guard、command、audit evidence の欠落を reject する。
- [x] Hosted/API dry-run は no-target を許容できるが、edit は許容しない。
- [x] `helix guard preflight --json` は `hostedPreflight` と
      `apiToolPathEnforced=false` を公開する。
- [x] L1/L3/L6 design と対応する test-design は whole program completion を
      主張せずに更新されている。
