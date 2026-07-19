---
plan_id: PLAN-L7-164-agent-slots-roster-split
title: "PLAN-L7-164: agent slots roster resolver split"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "Behavior-invariant split of roster capability resolution from agent slot lifecycle state. No CLI/API behavior, persisted schema, or workflow semantics changed."
agent_slots:
  - role: se
    slot_label: "SE - agent slots roster resolver split"
  - role: tl
    slot_label: "TL - runtime roster invariant review"
generates:
  - artifact_path: docs/plans/PLAN-L7-164-agent-slots-roster-split.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/agent-slots.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-slots-roster.ts
    artifact_type: source_module
  - artifact_path: tests/agent-slots.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-163-workflow-contracts-policy-extraction.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T20:26:50+09:00"
    tests_green_at: "2026-06-25T20:26:50+09:00"
    verdict: approve
    scope: "Split roster capability resolution from the agent slot lifecycle module while preserving the legacy agent-slots re-export."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\agent-slots.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:26:25+09:00"
        evidence_path: tests/agent-slots.test.ts
        output_digest: "sha256:2c90f1df8bda38848baf626da364b9c5a4891e99834f56134c8ed6f452cef977"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\agent-slots.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:26:25+09:00"
        evidence_path: src/runtime/agent-slots.ts
        output_digest: "sha256:d1f4edb6684c79b5dcce88d2f6ba14c315b9575e448b9b599fbd04abf8c54172"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\agent-slots.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:26:25+09:00"
        evidence_path: src/runtime/agent-slots-roster.ts
        output_digest: "sha256:2ed9b18fb43b81f4b551db6e694a517bc46367a154b027b8487a7cf1165eee4e"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:26:37+09:00"
        evidence_path: src/runtime/agent-slots.ts
        output_digest: "sha256:d1f4edb6684c79b5dcce88d2f6ba14c315b9575e448b9b599fbd04abf8c54172"
---

# PLAN-L7-164: agent slots roster resolver 分離

## 目的

`src/runtime/agent-slots.ts` に残る `split-module` 圧を下げるため、roster capability resolution を
slot lifecycle state management から分離する。

## スコープ

- `resolveRosterCapability` と roster result/input types を
  `src/runtime/agent-slots-roster.ts` へ移動する。
- 既存の `src/runtime/agent-slots.ts` public surface は、resolver と types を再 export して維持する。
- 既存の `tests/agent-slots.test.ts` oracle を維持し、roster unit は sidecar module を直接参照する。

## 受入基準

- agent slot lifecycle behavior は変更しない。
- roster capability resolution は exact-match role/capability semantics を維持する。
- `tests/agent-slots.test.ts`、typecheck、lint、DB rebuild、doctor が pass する。
