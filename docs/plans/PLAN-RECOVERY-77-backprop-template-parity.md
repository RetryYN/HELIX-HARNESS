---
plan_id: PLAN-RECOVERY-77-backprop-template-parity
title: "PLAN-RECOVERY-77: backprop decision templateをschema exact setへ回復する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1367
behavior_contract_id: PLAN-BACKPROP-DECISION-TEMPLATE-PARITY-001
responsibility_owner: plan-authoring-template-parity
engineering_discipline_required: true
change_slice: atomic
refactor_step: simplify
legacy_retirement_state: retired
backprop_decision: not_required
backprop_decision_reason: "schemaとtemplateの既存契約を一致させるRecoveryであり、新しい上位要求意味を追加しない。"
no_code_decision: add_code
ddd_modeling_decision: not_applicable
contract_preconditions: "current frontmatter schemaがbackprop_decisionのexact setをnot_requiredだけに制限する"
contract_postconditions: "PLAN templateがschema外値requiredを案内せず、上流意味変更はgenerates artifactで表す"
contract_invariants: "schemaを緩和せず、historical evidenceを書き換えず、要求還流をnot_requiredで相殺しない"
contract_failures: "templateがrequiredを再案内する、schema exact setがdriftする、上流artifact欠落を説明文で相殺する"
tdd_red_required: true
red_test: "templateがschemaで必ず拒否されるrequired値を有効な選択肢として案内している"
parent_design: docs/templates/plan/impl/template.md
pair_artifact: tests/plan-template-backprop-parity.test.ts
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:2026-09-02 要求／要件正本への還流漏れを防ぐgate是正中にtemplateとschemaの不一致を検出"
dependencies:
  parent: docs/templates/plan/impl/template.md
  requires: []
  references:
    - "issue:1367"
    - "issue:1354"
    - "issue:1348"
    - "issue:1351"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — authoring authorityと上流還流境界" }
  - { role: tl, slot_label: "TL — schema／template current authority整合" }
  - { role: qa, slot_label: "QA — exact set driftとrequired mutation oracle" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-77-backprop-template-parity.md, artifact_type: markdown_doc }
  - { artifact_path: tests/plan-template-backprop-parity.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/templates/plan/impl/template.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# backprop decision template parity Recovery

schemaで受理不能な値をauthoring templateから除去する。上流意味変更が必要な場合は
\`backprop_decision\`へ別値を発明せず、変更するL1〜L6 artifactを\`generates\`へ明示する。
