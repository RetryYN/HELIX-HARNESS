---
plan_id: PLAN-L7-440-closure-evidence-semantic-authority
title: "closure evidence semantic authority enforcement"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 collect_evidence candidate review REJECT blocker3 high2 remediation"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE - materializer fail-close実装" }
  - { role: qa, slot_label: "QA - semantic provenance独立review" }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-12T13:18:10Z"
  review_binding:
    reviewer: codex-independent-reviewer
    reviewed_at: "2026-07-12T13:18:10Z"
    evidence_digest: "sha256:4213648457c38eb01236a5fab80a156496e338618e93fc34a94945d3c615a896"
  entries: []
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    reviewed_at: "2026-07-12T13:18:10Z"
    tests_green_at: "2026-07-12T13:17:58Z"
    verdict: pass
    scope: "semantic authority、時刻provenance、Vペアexact citation、append-only compensationを再reviewし、Blocker 0 / High 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/current-location.test.ts tests/closure-evidence-semantic-authority.test.ts --reporter=dot", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T13:17:58Z", evidence_path: tests/closure-evidence-semantic-authority.test.ts, output_digest: "sha256:06eaa79814015086d2c6563c7b34678e482bac4ad78eb894ae808cd9ae0948e2" }
parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md
pair_artifact: docs/test-design/harness/closure-evidence-semantic-authority.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-78へsemantic authority欠損をbackpropしてpair-freeze済み。"
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-001, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-002, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-003, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-004, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-005, test_path: tests/closure-evidence-semantic-authority.test.ts }
generates:
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-evidence-semantic-authority.test.ts, artifact_type: test_code }
dependencies: { parent: docs/plans/PLAN-L6-78-closure-evidence-semantic-authority.md, requires: [docs/plans/PLAN-L6-78-closure-evidence-semantic-authority.md] }
---

# PLAN-L7-440

process receiptのみからsemantic evidenceを発明する経路を除去し、実authority receiptが無いcandidateをfail-closeする。
