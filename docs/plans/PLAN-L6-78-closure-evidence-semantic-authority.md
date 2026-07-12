---
plan_id: PLAN-L6-78-closure-evidence-semantic-authority
title: "closure evidence semantic authority"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 collect_evidence materializer semantic fabrication remediation"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE - semantic authority delta設計" }
  - { role: qa, slot_label: "QA - authority非推測とVペアreview" }
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    reviewed_at: "2026-07-12T13:18:10Z"
    tests_green_at: "2026-07-12T13:17:58Z"
    verdict: pass
    scope: "semantic authority Vペアとcanonical oracle tableをreviewし、Blocker 0 / High 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/current-location.test.ts tests/closure-evidence-semantic-authority.test.ts --reporter=dot", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T13:17:58Z", evidence_path: docs/test-design/harness/closure-evidence-semantic-authority.md, output_digest: "sha256:06eaa79814015086d2c6563c7b34678e482bac4ad78eb894ae808cd9ae0948e2" }
pair_artifact: docs/test-design/harness/closure-evidence-semantic-authority.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-001, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-002, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-003, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-004, test_path: tests/closure-evidence-semantic-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, oracle_id: U-CESA-005, test_path: tests/closure-evidence-semantic-authority.test.ts }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/closure-evidence-semantic-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/closure-evidence-semantic-authority.md, artifact_type: test_design }
dependencies: { parent: docs/plans/PLAN-L6-72-closure-evidence-materialization.md, requires: [docs/plans/PLAN-L6-72-closure-evidence-materialization.md] }
---

# PLAN-L6-78

probeの物理process receiptと、review/test/runtimeの意味authorityを分離し、推測生成をfail-closeするdelta設計をfreezeする。
