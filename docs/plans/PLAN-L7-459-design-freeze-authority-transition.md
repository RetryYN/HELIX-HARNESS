---
plan_id: PLAN-L7-459-design-freeze-authority-transition
title: "PLAN-L7-459: Design Freeze authority transition実装"
kind: retrofit
layer: L7
drive: agent
parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md
pair_artifact: docs/test-design/helix/L8-design-freeze-authority-transition.md
status: confirmed
route_mode: retrofit
entry_signals: ["po_directive:2026-07-16 CHAT-AUTH-001の7/7 activation後、既存Design Freeze v2実装をL6/L8 Vペアへ正規収容するtrace修復"]
created: 2026-07-16
updated: 2026-07-16
owner: Codex
review_evidence:
  - reviewer: node_evidence_audit
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-16T17:59:25Z"
    tests_green_at: "2026-07-16T17:59:21Z"
    verdict: pass
    scope: "operation-bound outbox、partial final recovery、terminal evidence repair、directory-fd capability、assert後publish直前のparent symlink race、非Linux fail-closeを独立監査。Blocker/High 0。"
    green_commands:
      - { kind: integration_test, command: "bunx vitest run authority/state-db targeted set --reporter=dot", runner: bun, scope: targeted, exit_code: 0, evidence_path: docs/evidence/design-freeze-authority-green.md, output_digest: "sha256:b54f5422979aa21dd456d09b627f52e9447575a8d0b009fc376ae3015c7be891" }
agent_slots:
  - { role: se, slot_label: "SE — authority transactionとschema trace" }
  - { role: qa, slot_label: "QA — CAS・rollback・replay反例" }
dependencies:
  parent: docs/plans/PLAN-L4-05-workflow-orchestration.md
  requires: []
  references:
    - docs/governance/post-po-design-freeze-transition-contract-v1.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-001, test_path: tests/design-denominator-observer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-002, test_path: tests/po7-decision-activation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-003, test_path: tests/post-po-design-freeze-transition-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-004, test_path: tests/post-po-design-freeze-transition-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-005, test_path: tests/post-po-design-freeze-transition-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-006, test_path: tests/state-db.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, oracle_id: U-DFA-006, test_path: tests/authority-cli.test.ts }
backprop_decision: not_required
backprop_decision_reason: "既存PO7/Design Freeze v2実装を、その実装前提から抽出したL6/L8ペアへ正規収容するtrace修復である。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-459-design-freeze-authority-transition.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-freeze-authority-transition.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-freeze-authority-transition.md, artifact_type: test_design }
  - { artifact_path: docs/governance/post-po-design-freeze-transition-contract-v1.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli/commands/authority.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design-freeze.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design-freeze-v2.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-po7.ts, artifact_type: source_module }
  - { artifact_path: src/shared/digest.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/design-denominator-observer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/po7-decision-activation.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/po7-sealed-authority.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/post-po-design-freeze-transition.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/post-po-design-freeze-transition-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/authority-cli.test.ts, artifact_type: test_code }
  - { artifact_path: tests/design-denominator-observer.test.ts, artifact_type: test_code }
  - { artifact_path: tests/po7-decision-activation.test.ts, artifact_type: test_code }
  - { artifact_path: tests/post-po-design-freeze-transition-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
---

# Design Freeze authority transition実装

## 目的

既存authority transaction sourceは本PLAN以前の実装を含むため一括生成済みとclaimしない。本PLANが変更するCLI adapter、
path boundary、専用oracleだけを`generates`へ収容し、独立reviewが閉じるまで検証対象として扱う。

PO7 sealed authorityからDesign Freeze v2への遷移を、設計分母、Git観測、append-only DB、CLI transaction/evidence投影まで一つの
Vペアへ収容する。baseline追加ではなく、本PLANで是正するCLI adapterと専用oracleを設計へ逆接続する。

## 完了条件

- L6のDbCとL8の反例表が相互参照される。
- `generates`に列挙したsourceの実装—PLAN孤児が0になる。
- U-DFA-001〜006がgreenで、authority CLIがproject外pathをDB変更前に拒否する。
- Vpair、plan governance、typecheck、Biomeがgreenになる。
