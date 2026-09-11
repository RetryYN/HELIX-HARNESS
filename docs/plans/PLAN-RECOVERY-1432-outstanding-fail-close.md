---
plan_id: PLAN-RECOVERY-1432-outstanding-fail-close
title: "outstandingのirreversible_impact schema不適合と未検証plan_idをfail-closeする"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
irreversible_impact: none
created: 2026-09-08
updated: 2026-09-12
owner: Codex / TL
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
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-OUTSTANDING-1432-005, test_path: tests/outstanding.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1432", "issue:1418", "issue:1379", "pr:1683"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1432-outstanding-fail-close.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/lint/outstanding.ts, artifact_type: source_module }
  - { artifact_path: tests/outstanding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/completion-decision-packet.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# outstandingのfail-close修復

Issue #1432で実測されたfail-openを、現行main上の`outstanding` surfaceへ必要な正味挙動だけreplayする。
閉鎖済みPR #1683は実装・oracleの参照元であり、その古いHEADやreceiptを現行証拠として再利用しない。

## 受入境界

- `irreversible_impact` が存在するのにschema不適合なら`irreversible_migration_pending`を立てる。
- `planIdSchema`不適合のraw `plan_id`はscoped／runnable commandへ埋め込まない。
- 不適合PLAN行は集計から消さず、raw filename bytes由来の決定的な表示用identityへ置換する。
- `frontmatter_schema_invalid`をprimary blockerとして可視化する。
- `version_target` frontmatterが無い本文onlyのversion-up語は、`po_decision_pending`／`human_approval_pending`より下位にする。
- 後続mainで改善されたsemantic-frontier分類を旧実装で上書きしない。

## 非対象

- docs/plans不在時のfail-openとYAML parse例外（#1418）。
- 新しいcutover authority、packet command、DB authorityの追加。
- 旧PR #1683の履歴やreview receiptの再採用。

## 現在の証拠

`U-OUTSTANDING-1432-001..004`を現行テストへ再接続した。fresh CIと別runtimeのexact-HEAD reviewが
揃うまで`status: draft`と`completion_claim_allowed: false`を維持する。
