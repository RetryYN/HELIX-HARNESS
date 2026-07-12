---
plan_id: PLAN-L7-436-closure-authority-production-route
title: "PLAN-L7-436 (impl): closure authority production route"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-12 PLAN-L6-74 confirmed production route implementation"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "confirmed L6 contractを同型production loader/CLIへ降下する。"
parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md
pair_artifact: docs/test-design/harness/closure-authority-production-route.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-011, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-012, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-013, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-014, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-015, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-016, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-017, test_path: tests/closure-authority-backfill-production-route.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-authority-production-route.md, oracle_id: U-CABF-018, test_path: tests/closure-authority-backfill-production-route.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-436-closure-authority-production-route.md, artifact_type: markdown_doc }
  - { artifact_path: src/state-db/closure-authority-backfill-production.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-authority-backfill-verifier.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/closure-gate-allowlist.yaml, artifact_type: yaml_config }
  - { artifact_path: tests/closure-authority-backfill-production-route.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-74-closure-authority-production-route.md
  requires: [docs/plans/PLAN-L6-74-closure-authority-production-route.md]
agent_slots:
  - { role: se, slot_label: "SE - production loader/CLI実装" }
  - { role: qa, slot_label: "QA - source provenance/read-only検証" }
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T04:35:00Z"
    reviewed_at: "2026-07-12T04:36:00Z"
    verdict: approve_after_fixes
    scope: "production routeを実Git/bare origin/persistent DB/real CLIで敵対監査した。初回B0/H4/M3/L1、再review B0/H2/M2/L1、allowlist false-green M1を順次是正し、固有source errorへ到達する低位API fixture後にB0/H0/M0/L0を確認した。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/closure-authority-backfill-production-route.test.ts tests/closure-authority-backfill.test.ts tests/plan-descent.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T04:35:00Z", evidence_path: tests/closure-authority-backfill-production-route.test.ts, output_digest: "sha256:ac88a8ebea0215e9655a1b4e16ecf267f7aaa8eb23fdcdcfd1bcddcd97cd4d9e" }
      - { kind: typecheck, command: "bunx tsc --noEmit", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-12T04:35:00Z", evidence_path: src/state-db/closure-authority-backfill-production.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: lint, command: "bunx biome check src/cli.ts src/lint/plan-descent.ts src/policy/closure-authority-backfill.ts src/state-db/index.ts src/state-db/closure-authority-backfill-loader.ts src/state-db/closure-authority-backfill-verifier.ts src/state-db/closure-authority-backfill-production.ts tests/closure-authority-backfill-production-route.test.ts tests/plan-descent.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T04:35:00Z", evidence_path: src/state-db/closure-authority-backfill-production.ts, output_digest: "sha256:4d85dac9a308c3e014c1be2d8537f982459e0802d79598ca0070cf52ccca3867" }
      - { kind: lint, command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-436-closure-authority-production-route.md", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T04:35:00Z", evidence_path: docs/plans/PLAN-L7-436-closure-authority-production-route.md, output_digest: "sha256:a4b466f7331fd4d2478a9a00973e19392fff4915321bf8152907bfdec629f2db" }
---

# PLAN-L7-436: closure authority production route

## 1. 目的

confirmed `PLAN-L6-74`を実装し、current mainから全候補bundleをread-only生成する正規入口を提供する。

## 2. 完了条件

- public builder/loader/runが同じcandidate builderを共有する。
- CLIが必須option、persistent DB、HEAD/blob provenanceをfail-closeする。
- `U-CABF-011..018`がgreenである。
