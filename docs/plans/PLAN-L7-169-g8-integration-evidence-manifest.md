---
plan_id: PLAN-L7-169-g8-integration-evidence-manifest
title: "PLAN-L7-169: G8 integration evidence manifest"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-26
updated: 2026-06-26
owner: Codex
parent_design: docs/test-design/harness/L8-integration-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL - G8 evidence manifest wiring"
  - role: qa
    slot_label: "QA - IT-MODULE/IT-STATE evidence review"
generates:
  - artifact_path: docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
  - artifact_path: .helix/evidence/g8-integration/20260626-it-module-state-minimum.json
    artifact_type: json_config
  - artifact_path: src/lint/g8-integration-workflow.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-slots.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts-extras.ts
    artifact_type: source_module
  - artifact_path: tests/g8-integration-workflow.test.ts
    artifact_type: test_code
  - artifact_path: tests/agent-slots.test.ts
    artifact_type: test_code
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-168-g8-integration-workflow.md
  requires:
    - docs/plans/PLAN-L7-168-g8-integration-workflow.md
    - docs/plans/PLAN-REVERSE-169-g8-integration-evidence-manifest.md
    - docs/test-design/harness/L8-integration-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-26T21:20:00+09:00"
    tests_green_at: "2026-06-26T21:20:00+09:00"
    verdict: approve
    scope: "G8 は機械可読な integration evidence を必須とする。verification で見つかった IT-MODULE と IT-STATE の deficiency は、evidence を manifest 化する前に schema と partition isolation test を追加して扱った。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\dependency-drift.test.ts tests\\lint-wiring.test.ts tests\\agent-slots.test.ts tests\\workflow-contracts.test.ts tests\\g8-integration-workflow.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T21:20:00+09:00"
        evidence_path: tests/g8-integration-workflow.test.ts
        output_digest: "sha256:2eab00f92a5bda76ff43a4b215d4620c117939e3221f808603492b5c7ed77d91"
---

# PLAN-L7-169: G8 integration evidence manifest の証跡 manifest

## 目的

G8 は L8 workflow の文言だけでなく、実行可能な integration evidence に対して fail-close する。
最初に選択する L8 slice は IT-MODULE + IT-STATE の boundary family とする。

## 範囲

- `g8-integration-workflow` から `.helix/evidence/g8-integration/*.json` を読み込む。
- mandatory IT coverage、evidence path、command exit code、digest shape、exit criteria を検証する。
- 最初の IT-MODULE + IT-STATE manifest を追加する。
- evidence mapping 中に見つかった verification deficiency を解消する。
  - `agent-slots` state は Zod によって slot shape を検証し、fail-close する。
  - drive state partition evidence は、許可されていない cross-drive artifact contamination を検出する。

## DoD

- [x] G8 workflow が存在し、evidence manifest が無い場合は Doctor が失敗する。
- [x] mandatory selected IT case が passed でない場合は Doctor が失敗する。
- [x] IT-MODULE-01/02 と IT-STATE-01/02 は manifest coverage を持つ。
- [x] 新たに見つかった IT-STATE evidence gap は実行可能な test で裏付ける。
- [x] この slice は L8 を前進させるが、L8 全体の close は主張しない。
