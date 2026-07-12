---
plan_id: PLAN-L7-438-digest-canonicalization-authority
title: "digest / canonical JSON実装のtyped共通化"
kind: refactor
layer: L7
drive: agent
status: completed
route_mode: refactor
entry_signals: ["po_directive:2026-07-12 PLAN-L7-431 H1 digest重複の全面解消"]
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
    scope: "AST scanner、exact hit inventory、typed disposition、public digest byte compatibility、純lint境界を独立reviewし、blocker/high/medium/low所見なし。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/digest.test.ts tests/digest-consumer-compatibility.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T08:40:00Z", evidence_path: tests/digest.test.ts, output_digest: "sha256:4d257a10927bbc8225f0826165059e1beaa43ed6b1515a17962d05c442c83ba9" }
      - { kind: lint, command: "bunx biome check .", runner: bun, scope: gate, exit_code: 0, completed_at: "2026-07-12T08:45:00Z", evidence_path: src/runtime/digest.ts, output_digest: "sha256:6a61690addbbfa1b538a741821f42e3f7365ba2562a245f844aefc2e36067e4e" }
parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md
pair_artifact: docs/test-design/harness/digest-canonicalization-authority.md
agent_slots: [{ role: se, slot_label: "SE - typed digest migration" }, { role: qa, slot_label: "QA - byte compatibility review" }]
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: U-DIGEST-001, test_path: tests/digest.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: U-DIGEST-002, test_path: tests/digest.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: U-DIGEST-003, test_path: tests/digest.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: IT-DIGEST-001, test_path: tests/change-package-delta-archive.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: IT-DIGEST-001, test_path: tests/agent-ssot-runtime-projection.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: IT-DIGEST-001, test_path: tests/spec-driven-constitution-template-stack.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: IT-DIGEST-001, test_path: tests/retirement-preserve.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: ST-DIGEST-001, test_path: tests/digest.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/digest-canonicalization-authority.md, oracle_id: ST-DIGEST-002, test_path: tests/handover-resurrection.test.ts }
generates:
  - { artifact_path: src/runtime/digest.ts, artifact_type: source_module }
  - { artifact_path: tests/digest.test.ts, artifact_type: test_code }
  - { artifact_path: tests/digest-consumer-compatibility.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
backprop_decision: required
backprop_decision_reason: "production digest契約の全面移行は意味差分類とVペア固定が必要"
dependencies:
  parent: docs/plans/PLAN-L6-76-digest-canonicalization-authority.md
  requires: [docs/plans/PLAN-L6-76-digest-canonicalization-authority.md]
---

# PLAN-L7-438: digest canonicalization authority

## Authority

- L6: `docs/design/harness/L6-function-design/digest-canonicalization-authority.md`
- L8: `docs/test-design/harness/digest-canonicalization-authority.md`

## 完了条件

1. production digest/canonical JSON hitを全件inventory化する。
2. byte-level互換testを先に固定してtyped utilityへ移行する。
3. bare/truncated/domain-specific digestを誤ってprefixed digestへ統合しない。
4. handover resurrection純lint境界を維持する。
5. targeted tests、typecheck、Biome、design/test-design coverageをgreenにする。
