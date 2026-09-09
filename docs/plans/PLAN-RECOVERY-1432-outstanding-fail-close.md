---
plan_id: PLAN-RECOVERY-1432-outstanding-fail-close
title: "outstandingのirreversible_impact schema不適合と未検証plan_idをfail-closeする"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-09-08
updated: 2026-09-09
owner: Cursor / TL
github_issue_id: 1432
behavior_contract_id: OUTSTANDING-FAIL-CLOSE-1432
responsibility_owner: outstanding-fail-close
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — cutover宣言とplan_id埋め込みのfail-close境界を照合" }
  - { role: tl, slot_label: "TL — version-up本文判定がS4/人承認を隠さないことを検収" }
  - { role: se, slot_label: "SE — outstanding loaderとscoped commandの拒否を修復" }
  - { role: qa, slot_label: "QA — cutOver・注入plan_id・S4+version-up本文の反例を検証" }
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-001, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-002, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-003, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-004, test_path: tests/completion-decision-packet.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1432", "issue:1418", "issue:1379"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1432-outstanding-fail-close.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/lint/outstanding.ts, artifact_type: source_module }
  - { artifact_path: tests/outstanding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/completion-decision-packet.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
review_evidence: []
---

# outstandingのfail-close修復

Issue #1432で実測された3つのfail-openを、既存`outstanding` surfaceの実装欠陥として修復する。
新しいcutover authority、新しいpacket command、docs/plans不在時のfail-openは追加しない。

## 受入境界

`irreversible_impact` が存在するのに schema 不適合なら `irreversible_migration_pending` を立てる。
`planIdSchema` 不適合の raw `plan_id` は scoped / runnable command に使わない。文字 allowlist だけ通る `foo` も受理しない。
不適合でも PLAN 行は outstanding 集計から消さない。文書ごとに決定的な command-safe な表示用識別子を与え、同一 sentinel で複数文書を潰さない。`frontmatter_schema_invalid` で阻止状態を可視化する。
`version_target` frontmatter が無い本文 only の version-up 語は `po_decision_pending` / `human_approval_pending` より下位にする。

## 現在の証拠

修正対象は `src/lint/outstanding.ts` と既存 outstanding / completion packet 回帰に限定する。
独立レビュー、CI green の完了主張、merge は本PLANの対象外であり、`completion_claim_allowed=false` のまま保持する。
