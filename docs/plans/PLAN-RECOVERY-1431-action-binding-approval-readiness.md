---
plan_id: PLAN-RECOVERY-1431-action-binding-approval-readiness
title: "action-binding approvalのplaceholder・文脈・snapshot判定をfail-closeする"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1431
behavior_contract_id: HR-NFR-P8-01
responsibility_owner: action-binding-approval-readiness
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — approval authorityと実行境界を照合" }
  - { role: tl, slot_label: "TL — pendingとconcreteの責務境界を検収" }
  - { role: se, slot_label: "SE — 共通判定とsnapshot fail-closeを修復" }
  - { role: qa, slot_label: "QA — placeholder・文脈・過大scopeを反例検証" }
parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md
pair_artifact: docs/test-design/helix/L8-action-binding-approval-readiness-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, oracle_id: U-ABR-001, test_path: tests/action-binding-approval-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, oracle_id: U-ABR-002, test_path: tests/action-binding-approval-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, oracle_id: U-ABR-003, test_path: tests/action-binding-approval-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, oracle_id: U-ABR-004, test_path: tests/action-binding-approval-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, oracle_id: U-ABR-005, test_path: tests/action-binding-approval-readiness.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, oracle_id: U-ABR-006, test_path: tests/action-binding-approval-readiness.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1431", "issue:1425", "issue:1411"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1431-action-binding-approval-readiness.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/action-binding-approval-readiness.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-action-binding-approval-readiness-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/design-coverage.ts, artifact_type: source_module }
  - { artifact_path: src/lint/shared.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/action-binding-approval-readiness.ts, artifact_type: source_module }
  - { artifact_path: src/lint/version-up-readiness.ts, artifact_type: source_module }
  - { artifact_path: src/lint/workflow-decision-packets.ts, artifact_type: source_module }
  - { artifact_path: tests/action-binding-approval-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# Action-binding承認準備判定Recovery

Issue #1431で実測された5つのfail-openを、既存`HR-NFR-P8-01`の実装欠陥として修復する。
新しい承認authority、実行surface、approval outcomeは追加しない。

## 受入境界

placeholderと広域scopeを具体値へ昇格させず、一般語「証跡」で承認要否を消さず、隣接文の
高影響要求を検出し、snapshot入力欠落を可視化する。pending PLANを承認済みへ変換せず、
既存のplan-only／must-not-apply境界を維持する。

## 現在の証拠

修正前のIssue実測では16組のplaceholderがfield-level `concrete`となり、「証跡」追記で
required=falseになった。修正後の局所回帰は76 tests green。これは現HEAD CI、独立レビュー、
main read-afterを代替しないため、PLANはdraftかつcompletion claim不可のまま保持する。
