---
plan_id: PLAN-RECOVERY-80-claude-fable-5-1-provider-drift
title: "PLAN-RECOVERY-80: Claude Fable 5.1 provider drift"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1386
behavior_contract_id: CLAUDE-FABLE51-PROVIDER-DRIFT-001
responsibility_owner: provider-configuration-attestation
engineering_discipline_required: true
change_slice: atomic
refactor_step: replace
legacy_retirement_state: compatibility_only
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:2026-09-02 Claude Fable 5から5.1へのversion-upに伴う齟齬を整備する"
contract_preconditions: "Anthropic公式current ID、価格、migration差分を一次情報で確認できる"
contract_postconditions: "current model selectorとadvisor projectionが5.1へ一致し、旧5はhistorical pricing互換だけに残る"
contract_invariants: "native CLI経路、advisory-only、過去receipt不変、未知差分fail-closeを維持する"
contract_failures: "旧ID current再出力、agent drift、historical改変、API client無断追加、qualification無条件継承を拒否する"
tdd_red_required: true
red_test: "current MODEL_IDSとadvisor frontmatterがclaude-fable-5のためU-FABLE51-001/002が失敗する"
red_at: "2026-09-02T06:31:00+09:00"
green_at: "2026-09-02T06:28:58+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "current registryをclaude-fable-5へ戻すmutationでU-FEROSTER-001とU-MREG-001が2/2 failedし、復元後は4 files/24 tests green"
complexity_effect: neutral
complexity_justification: "current identityを置換し、historical lookupを互換入力として維持する最小変更"
removal_trigger: "なし。provider current identity追従の証拠"
backprop_decision: not_required
backprop_decision_reason: "既存Provider Config Attestationのcurrent identityを公式versionへ回復し、要求意味は変更しない"
parent_design: docs/design/helix/L6-function-design/claude-fable-5-1-provider-drift.md
pair_artifact: docs/test-design/helix/L8-claude-fable-5-1-provider-drift-unit-test-design.md
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-RECOVERY-67-claude-native-memory-isolation.md
    - "issue:1173"
    - "issue:1384"
    - "issue:1386"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-80-claude-fable-5-1-provider-drift.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/claude-fable-5-1-provider-drift.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-claude-fable-5-1-provider-drift-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: src/schema/model-registry.ts, artifact_type: source_module }
  - { artifact_path: .claude/agents/advisor-fable.md, artifact_type: markdown_doc }
  - { artifact_path: .claude/CLAUDE.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/model-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/fe-roster-orchestration.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — provider version driftとnative runtime互換境界の監査" }
  - { role: se, slot_label: "SE — current/historical model identity分離" }
  - { role: qa, slot_label: "QA — registry/agent/pricing drift oracle" }
  - { role: tl, slot_label: "TL — provider migration差分と非対象境界" }
review_evidence: []
---

# Claude Fable 5.1 provider drift Recovery

公式current IDへ更新し、過去evidenceは不変のままhistory lookupだけを維持する。API固有のforced tool choice、thinking、refusal、retention差分はnative CLI実測とProvider Attestationの後続fixtureへ送る。
