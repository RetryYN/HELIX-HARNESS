---
plan_id: PLAN-L7-431-closure-auto-approval
title: "PLAN-L7-431 (impl): closure自走承認とbounded batch"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals: ["po_directive:2026-07-12 PLAN-L7-425 I8 closure自走化"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
agent_slots:
  - { role: se, slot_label: "SE - evidence authorityとatomic apply" }
  - { role: qa, slot_label: "QA - GitHub trust rootと361件敵対検証" }
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-71の機械証跡AND条件と不可逆境界を実装へ降下する。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-11T23:01:39Z"
  review_binding:
    reviewer: codex-independent-reviewer
    reviewed_at: "2026-07-11T23:01:40Z"
    evidence_digest: "sha256:58db919c819a6af633283ba1ac5e03b3767047f7ade5a50d4bc880c2f95ac486"
  entries: []
parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-001, test_path: tests/closure-auto-approval.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-002, test_path: tests/closure-auto-approval.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-003, test_path: tests/closure-auto-approval.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-004, test_path: tests/closure-auto-approval.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-005, test_path: tests/closure-auto-approval.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-006, test_path: tests/closure-auto-approval.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-431-closure-auto-approval.md, artifact_type: markdown_doc }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-auto-approval.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/closure-auto-approval.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-71-closure-auto-approval.md
  requires: [docs/plans/PLAN-L6-71-closure-auto-approval.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-11T23:01:33Z"
    reviewed_at: "2026-07-11T23:01:40Z"
    verdict: approve_after_fixes
    scope: "closure自走承認のrepo-owned evidence、GitHub required-check trust root、CAS、journal recovery、不可逆human境界、361件routeを反復敵対監査し全severity 0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/closure-auto-approval.test.ts tests/current-location.test.ts tests/enforcement-wiring-routes.test.ts tests/lint-wiring.test.ts tests/outstanding.test.ts tests/frontmatter.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: tests/closure-auto-approval.test.ts, output_digest: "sha256:527663340d7b1ac75ebd7e2ac5830ec7877fa39478080eff7d1063dd3b6f78e1" }
      - { kind: lint, command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-431-closure-auto-approval.md", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: docs/plans/PLAN-L7-431-closure-auto-approval.md, output_digest: "sha256:ef9ea35a29da2c8f808baba65bb45f4dbe2159680db1b367f070830b275726d2" }
      - { kind: lint, command: "bun run lint", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: src/state-db/closure-auto-approval.ts, output_digest: "sha256:10ac809aac6d655e10d534f0c8e5d76e2801cf20cd8a8d86ec8e3425097d897b" }
      - { kind: typecheck, command: "bunx tsc --noEmit", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-11T23:01:33Z", evidence_path: src/state-db/closure-auto-approval.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L7-431: closure自走承認とbounded batch

## 完了条件

`U-CAUTO-001..006`の真正adversarial fixture、PLAN lint、Biome、TypeScriptがgreenで、
実データへのexecuteは親レーンに残す。
