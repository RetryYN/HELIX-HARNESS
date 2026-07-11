---
plan_id: PLAN-L6-71-closure-auto-approval
title: "PLAN-L6-71 (design): closure自走承認"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: forward
created: 2026-07-12
updated: 2026-07-12
owner: Codex
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE - closure authorityとtransaction契約" }
  - { role: qa, slot_label: "QA - replay/TOCTOU/rollback敵対検証" }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/closure-auto-approval.md, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L6-70-left-arm-carry-log.md
  requires: [docs/plans/PLAN-L6-70-left-arm-carry-log.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-11T23:01:33Z"
    reviewed_at: "2026-07-11T23:01:40Z"
    verdict: approve_after_fixes
    scope: "L6/L8の機械evidence AND、GitHub trust root、journal recovery、不可逆human境界を敵対監査した。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/closure-auto-approval.test.ts tests/current-location.test.ts tests/enforcement-wiring-routes.test.ts tests/lint-wiring.test.ts tests/outstanding.test.ts tests/frontmatter.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: tests/closure-auto-approval.test.ts, output_digest: "sha256:527663340d7b1ac75ebd7e2ac5830ec7877fa39478080eff7d1063dd3b6f78e1" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: docs/design/harness/L6-function-design/closure-auto-approval.md, output_digest: "sha256:10ac809aac6d655e10d534f0c8e5d76e2801cf20cd8a8d86ec8e3425097d897b" }
      - { kind: typecheck, command: "bunx tsc --noEmit", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: src/state-db/closure-auto-approval.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L6-71: closure自走承認

POが明示した機械evidence条件と、不可逆操作のhuman境界をL6契約として凍結する。
