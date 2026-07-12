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
