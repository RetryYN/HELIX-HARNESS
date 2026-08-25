---
plan_id: PLAN-L7-672-current-location-summary-typed-output
title: "PLAN-L7-672 (impl): current-location summaryをtyped workflow identityへ収束する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #206 current-location summary consumer migration"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 1022
behavior_contract_id: CURRENT-LOCATION-SUMMARY-TYPED-OUTPUT-001
responsibility_owner: current-location-summary-consumer
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "current-location snapshotがlegacy route情報とregistry-backed typed identity境界を持つ"
contract_postconditions: "summary／frontier／textのprimary outputがtyped workflow identityとreceiptを返す"
contract_invariants: "requirements registryを意味authorityとし、legacy modelをcurrent outputへ再出力しない"
contract_failures: "authority欠落、stale、unknown、ambiguous、unsupportedを推測せずnull identityとreason付きreceiptで閉じる"
tdd_red_required: true
red_test: "U-CLSO-006でproject-current-location-summary.v2をv1へ変異させるとproduction-root current-location regressionが失敗する"
red_at: "2026-08-25T08:24:10Z"
green_at: "2026-08-25T08:16:57Z"
mutation_oracle_evidence: "2026-08-25T08:24:10Zにsrc/cli.tsのsummary schema v2をv1へ一時変異し、U-CLSO-006が1 failed / 93 skipped（exit 1）となることを実測した。変異を復元した後、U-CLSO-001〜006がgreenになった。"
complexity_effect: net_negative
complexity_justification: "summary projectionからlegacy primary fieldを除去し、typed identity projection helperへ集約する"
removal_trigger: "current-locationの全consumerがtyped identityへ移行しlegacy input adapterのretention期限が満了した時"
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-001, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-002, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-003, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-005, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-006, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-672-current-location-summary-typed-output.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/summary-surface-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-584-current-location-workflow-identity
  requires:
    - docs/plans/PLAN-L7-584-current-location-workflow-identity.md
  blocks: []
  references:
    - "issue:1022"
    - "issue:206"
    - "issue:204"
agent_slots:
  - { role: se, slot_label: "SE — current-location summary typed projection" }
  - { role: qa, slot_label: "QA — legacy output exclusion and mutation oracle" }
  - { role: tl, slot_label: "TL — #206 consumer migration boundary" }
---

# current-location summary の typed workflow 出力

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | authority-backed／missing-authorityのsummary回帰を固定 | typed identityまたはfail-close receiptを返す |
| 2 | frontier／text outputをv2契約へ移行 | 旧drive/model primary fieldを出力しない |
| 3 | summary surface auditを更新 | current-location navigationがtyped workflow routeを指す |
| 4 | typecheck／Biome／targeted test／PLAN lint | 全green |
| 5 | Claude exact-HEAD検収とmain read-after | blocker 0、DB／doctor／projection確認 |

本sliceは#206のsummary consumerだけを扱う。DB、schema、visualization tree、skill binding、
compatibility commandの全surface移行は後続PLANへ分離する。
