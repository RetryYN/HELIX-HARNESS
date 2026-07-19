---
plan_id: PLAN-L7-437-historical-vpair-migration-authority
title: "PLAN-L7-437 (impl): historical Vペア migration authority"
kind: impl
layer: L7
drive: agent
status: completed
route_mode: forward
entry_signals: ["po_directive:2026-07-12 historical migration classifier実装"]
created: 2026-07-12
updated: 2026-07-12
owner: Codex
parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md
pair_artifact: docs/test-design/harness/historical-vpair-migration-authority.md
agent_slots: [{ role: se, slot_label: "SE - provenance classifier" }, { role: qa, slot_label: "QA - spoof/conservation review" }]
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-001, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-002, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-003, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-004, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-005, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-006, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-007, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-008, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-009, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-010, test_path: tests/historical-vpair-migration-authority.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-011, test_path: tests/historical-vpair-migration-adversarial.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, oracle_id: U-HVMA-012, test_path: tests/closure-authority-backfill-production-route.test.ts }
generates:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/policy/historical-vpair-migration-authority.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/historical-vpair-migration-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/historical-vpair-migration-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/historical-vpair-migration-adversarial.test.ts, artifact_type: test_code }
  - { artifact_path: tests/closure-authority-backfill-production-route.test.ts, artifact_type: test_code }
  - { artifact_path: config/historical-vpair-migration-authority.json, artifact_type: config }
  - { artifact_path: config/historical-vpair-migration-authority.manifest.json, artifact_type: config }
dependencies: { parent: docs/plans/PLAN-L6-75-historical-vpair-migration-authority.md, requires: [docs/plans/PLAN-L6-75-historical-vpair-migration-authority.md] }
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T06:52:00Z"
    reviewed_at: "2026-07-12T06:52:10Z"
    verdict: approve_after_fixes
    scope: "cutoff spoof、strict production input、manifest/authority/review full-prefix trust chain、DB termination、CAS/recovery、real child CLI read-only性を反復敵対監査した。最終B0/H0/M0/L0。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/historical-vpair-migration-authority.test.ts tests/historical-vpair-migration-adversarial.test.ts tests/closure-authority-backfill-production-route.test.ts tests/design-coverage.test.ts tests/design-language.test.ts tests/l6-completion.test.ts tests/plan-entry-routing.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T06:52:00Z", evidence_path: tests/historical-vpair-migration-adversarial.test.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-12T06:52:00Z", evidence_path: src/state-db/historical-vpair-migration-authority.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-437-historical-vpair-migration-authority.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T06:52:00Z", evidence_path: docs/plans/PLAN-L7-437-historical-vpair-migration-authority.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---
# PLAN-L7-437
U-HVMA-001..012、IT-HVMA-001/002、ST-HVMA-001を実装する。registry/closure mutationは非対象。
