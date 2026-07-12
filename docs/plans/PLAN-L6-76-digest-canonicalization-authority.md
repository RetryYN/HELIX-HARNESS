---
plan_id: PLAN-L6-76-digest-canonicalization-authority
title: "PLAN-L6-76 (add-design): digest canonicalization authority"
kind: add-design
layer: L6
drive: be
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:2026-07-12 PLAN-L7-431 H1 authority補完"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    reviewed_at: "2026-07-12T08:46:36Z"
    tests_green_at: "2026-07-12T08:46:36Z"
    verdict: pass
    scope: "typed digest contract、意味差inventory、L6/L8 Vペアのfreezeを独立reviewした。"
    green_commands:
      - { kind: lint, command: "bun run src/cli.ts plan lint docs/plans/PLAN-L6-76-digest-canonicalization-authority.md", runner: bun, scope: gate, exit_code: 0, completed_at: "2026-07-12T08:40:00Z", evidence_path: docs/plans/PLAN-L6-76-digest-canonicalization-authority.md, output_digest: "sha256:0d67734358b76c1f5016ec08b0babc3863baffb887f5fef7db5f1cbd97ea8285" }
parent_design: docs/design/harness/L5-detailed-design/internal-processing.md
pair_artifact: docs/test-design/harness/digest-canonicalization-authority.md
agent_slots: [{ role: se, slot_label: "SE - digest contract design" }, { role: qa, slot_label: "QA - V-pair review" }]
verification_bindings: []
generates:
  - { artifact_path: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/digest-canonicalization-authority.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-03-internal-processing.md
  requires: [docs/plans/PLAN-L5-03-internal-processing.md]
---

# PLAN-L6-76

typed digest variantと全面移行inventoryの設計・検証設計をpair-freezeする。
