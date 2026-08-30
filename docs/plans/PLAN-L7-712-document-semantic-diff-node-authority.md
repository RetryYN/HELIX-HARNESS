---
plan_id: PLAN-L7-712-document-semantic-diff-node-authority
title: "PLAN-L7-712: document semantic diffをNode transactional authorityへ収束する"
kind: refactor
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1260
behavior_contract_id: DOCUMENT-SEMANTIC-DIFF-RUNTIME-AUTHORITY-001
responsibility_owner: document-semantic-diff
change_slice: atomic
refactor_step: migrate_one_consumer
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "ADR-009/010の確定済みruntime authorityを既存document semantic diff L6/L8へ投影するRETROFITであり、意味diff契約や上位要求を変更しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1260 document semantic diffのcurrent TypeScript/Bun authorityをADR-009/010へ収束"
contract_preconditions: "ADR-009/010、既存document semantic diff L6/L8 pair、TypeScript/Node実装がcurrent authorityである"
contract_postconditions: "L6/L8がTypeScript/Node transactional boundaryとPython semantic coreの層別authorityを表し、Bun current guidanceを再出力しない"
contract_invariants: "semantic diff runtime behavior、CLI identity、artifact write契約、historical/compatibility evidenceを変更しない"
contract_failures: "TypeScript/Bun current authority、Pythonへのwrite authority移譲、Node再検証欠落、Bun command再出力をfail-closeする"
tdd_red_required: true
red_at: "2026-08-30T23:27:59+09:00"
green_at: "2026-08-30T23:28:40+09:00"
tdd_red_evidence: "tests/document-semantic-diff.test.ts U-DOCDIFF-009が旧L6のTypeScript/Bun authorityを検出して1 failed／3 passed"
tdd_green_evidence: "2026-08-30T23:28:40+09:00にU-DOCDIFF-001..004/006/007/009の4 tests greenを実測し、Node/Python layered authorityとBun current guidance不在を確認した"
mutation_oracle_required: true
mutation_oracle_evidence: "U-DOCDIFF-009がNode boundary、Python semantic core、strict JSONL、write authority非移譲、L8 citation、TypeScript/Bunおよびactive Bun commandを判別的に拘束する"
complexity_effect: net_negative
complexity_justification: "current TypeScript/Bun authority 1件を除去し、runtime authorityをADR-009/010へ一元化する"
removal_trigger: "document semantic diff設計がgenerated authority projectionへ完全移行し、同oracleがreplacementへ移った時"
parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md
pair_artifact: docs/test-design/helix/L8-document-semantic-diff-contracts.md
dependencies:
  parent: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
  requires:
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
  references:
    - issue:1260
    - issue:206
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/document-semantic-diff.md, oracle_id: U-DOCDIFF-009, test_path: tests/document-semantic-diff.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-712-document-semantic-diff-node-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/document-semantic-diff.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-document-semantic-diff-contracts.md, artifact_type: test_design }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/document-semantic-diff.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — document semantic diff runtime authority境界" }
  - { role: qa, slot_label: "QA — Bun再出力とPython/Node authority mutation" }
---

# document semantic diff Node authority収束

Issue #1260のdocument semantic diff責務だけを実施し、#1259、layer ledger、DB旧identity、Release/cutoverへ
責務を広げない。既存runtime挙動を変えず、L6、L8、targeted oracle、reviewed-safe digestを同一HEADへ束縛する。
PLANはpre-confirmのためdraftとcompletion claim falseを維持する。
