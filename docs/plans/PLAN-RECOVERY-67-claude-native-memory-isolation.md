---
plan_id: PLAN-RECOVERY-67-claude-native-memory-isolation
title: "PLAN-RECOVERY-67: Claude native memoryを共有memory authorityから隔離する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1173 provider native memory second-control-plane recovery"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1173
behavior_contract_id: CLAUDE-NATIVE-MEMORY-ISOLATION-001
responsibility_owner: provider-native-config-adapter
engineering_discipline_required: true
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
backprop_decision: not_required
backprop_decision_reason: "HR-FR-P7-01／HAC-P7-01bがper-agent siloを正本にしない既存要求を所有する。本sliceはClaude adapterとdoctorを既存正本へ追従させ、provider共通attestationはIssue #1172へ分離する。"
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "project Claude settings、consumer template、全.claude/agents frontmatterが読める"
contract_postconditions: "auto memoryが明示無効で、current agentにnative memory宣言がなく、doctorが再出現をfail-closeする"
contract_invariants: "HELIX shared memoryとprovider delegation evidenceの正本境界を維持し、native hook防御層は撤去しない"
contract_failures: "autoMemoryEnabled欠落／true、agent memory project／user／local、consumer template driftを拒否する"
tdd_red_required: true
red_test: "U-PNCM-001／002を先行追加し、loader欠落、auto memory未隔離、agent memory宣言未検出の3 failを確認する"
red_at: "2026-08-29T05:07:56+09:00"
green_at: "2026-08-29T05:08:43+09:00"
mutation_oracle_evidence: "2026-08-29T05:17:38+09:00に.claude/settings.jsonのautoMemoryEnabledをfalseからtrueへ変更し、U-PNCM-001が1 fail／5 passでkillした。05:17:58+09:00にsecurity-audit.mdへmemory: projectを再注入し、U-PNCM-002が1 fail／5 passでkillした。両seedを除去して再green化する。"
complexity_effect: net_negative
complexity_justification: "21個のprovider-native memory silo入口を除去し、既存project-hook doctorへ単一検査として集約する"
removal_trigger: "Provider Native Configuration Attestation #1172が同一検査をeffective runtime attestationとして置換した時"
parent_design: docs/design/helix/L6-function-design/claude-native-memory-isolation.md
pair_artifact: docs/test-design/helix/L8-claude-native-memory-isolation-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/claude-native-memory-isolation.md, oracle_id: U-PNCM-001, test_path: tests/project-hook.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-native-memory-isolation.md, oracle_id: U-PNCM-002, test_path: tests/project-hook.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-native-memory-isolation.md, oracle_id: U-PNCM-003, test_path: tests/project-hook.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/claude-native-memory-isolation.md, oracle_id: U-PNCM-004, test_path: tests/setup.test.ts }
dependencies:
  parent: null
  requires: []
  blocks: []
  references:
    - "issue:1173"
    - "issue:1172"
    - "requirement:HR-FR-P7-01"
    - "acceptance:HAC-P7-01b"
agent_slots:
  - { role: aim, slot_label: "AIM — provider native stateとshared memory authorityの競合監査" }
  - { role: qa, slot_label: "QA — native memory再出現mutation" }
  - { role: tl, slot_label: "TL — HELIX shared memory authority境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-67-claude-native-memory-isolation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/claude-native-memory-isolation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-claude-native-memory-isolation-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: .claude/settings.json, artifact_type: json_config }
  - { artifact_path: .claude/agents/advisor-fable.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/be-api.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/be-logic.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/code-reviewer.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/db-schema.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/devops-deploy.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/fe-lead.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/fe-ui.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pdm-innovation-manager.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pdm-marketing-innovation.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pdm-tech-innovation.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-haiku.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-project-explorer.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-project-scout.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-sonnet.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-tech-docs.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-tech-fork.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/pmo-tech-news.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/qa-test.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/refactor-scout.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/agents/security-audit.md, artifact_type: markdown_doc }
  - { artifact_path: config/specialist-agent-registry.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: src/lint/project-hook.ts, artifact_type: source_module }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook.test.ts, artifact_type: test_code }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
---

# Claude native memory隔離

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | current settings／21 agent／consumer templateをinventory | native memory入口のexact setが固定される |
| 2 | U-PNCM-001／002 Red→Green | 設定欠落とagent宣言を個別検出する |
| 3 | doctorへ接続 | native memory再出現をhard failureにする |
| 4 | mutation／全回帰／Claude exact-HEAD review | #1173をcanonical merge可能にする |

provider全体のuser／managed／envを含むeffective configuration attestationは#1172が所有し、本Recoveryへ混載しない。
