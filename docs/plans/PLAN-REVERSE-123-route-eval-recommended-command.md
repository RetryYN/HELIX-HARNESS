---
plan_id: PLAN-REVERSE-123-route-eval-recommended-command
title: "PLAN-REVERSE-123: route eval RecommendedCommandV1 の fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-07-01
owner: Codex
forward_routing: L4
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: concept
    decision: updated
    evidence_path: docs/governance/helix-harness-concept_v3.1.md
    reason: "L0 signal-to-mode table は pair-agent TDD add-feature routing の語彙を保持する。"
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "route eval の受入項目と pair-agent TDD recommendation contract は実装済みで検査済み。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "public route eval surface、add-feature mode classification、pair-agent planning recommendation は L4 command and routing design の一部。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "実装は既存の schema module と workflow contracts boundary を再利用する。"
agent_slots:
  - role: tl
    slot_label: "TL - route eval fullback 担当"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-123-route-eval-recommended-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-123-route-eval-recommended-command.md
  requires:
    - docs/plans/PLAN-L7-123-route-eval-recommended-command.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T09:28:59+09:00"
    tests_green_at: "2026-07-01T09:28:59+09:00"
    verdict: approve
    scope: "pair-agent TDD route recommendation を concept、requirements、L4 design、L7 route oracles へ戻す R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/governance/helix-harness-concept_v3.1.md
        output_digest: "sha256:1ccc4cb9d537607641dadf71bf4e281f39fbbde6e45970543d8ee70f2c3f3244"
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/governance/helix-harness-requirements_v1.2.md
        output_digest: "sha256:6654449488882155e7da27407fc44ddc81419452ddc7cc492ed214670001d8f3"
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/design/harness/L4-basic-design/function.md
        output_digest: "sha256:8725842f63f6be27697b164d41f93ad4d0422f6e3fd06a1e467f78e4273b1aa7"
      - kind: unit_test
        command: "npm test tests/workflow-contracts.test.ts tests/cli-surface.test.ts --test-name-pattern \"pair-agent TDD|implements routing\""
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T09:28:59+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T15:30:00+09:00"
    tests_green_at: "2026-06-23T15:30:00+09:00"
    verdict: approve
    scope: "route eval 実装から requirements と L4 design へ戻す R4 fullback。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\workflow-contracts.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: doctor
        command: "npm run src\\cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T15:30:00+09:00"
        evidence_path: src/workflow/contracts.ts
        output_digest: "sha256:fff49252866a549ac96498c868bc193410867829a119f1a93d9d52e36551e791"
---

# PLAN-REVERSE-123: route eval RecommendedCommandV1 の fullback

## 目的

実装済みの route evaluation CLI surface を requirements と L4 function design へ back-fill する。

## スコープ

- Requirements §7.8.2 acceptance は、実装済み CLI と contract を記録する。
- L4 function design は public command を列挙し、それを routing surface として明示する。
- Human approval resolution は別個の §7.8.3 acceptance item として残す。

## 受入条件

- Requirements と L4 design はどちらも `helix route eval --format json` を指す。
- Pair-agent TDD route signals は、新しい mode や completion claim ではなく、pair-agent planning recommendation を伴う add-feature mode として記録する。
- Reverse record は approval-policy execution をこの slice の外に置き、次の route-safety scope として残す。
