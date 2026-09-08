---
plan_id: PLAN-RECOVERY-1670-pin-chain-derivation
title: "変更pathからのpin追従先事前導出"
kind: recovery
layer: cross
drive: ci
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-09
github_issue_id: 1670
behavior_contract_id: PIN-CHAIN-DERIVATION-001
responsibility_owner: pin-chain-derivation
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: domain_service
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "changed path集合と既存pin recordの実bytesを取得できる"
contract_postconditions: "対応pinのexact追従先を重いCI前にread-only導出し、未対応形式をDEGRADEDで示す"
contract_invariants: "既存gate・baseline・review判定を緩和せず、自動書換えを行わない"
contract_failures: "pin漏れ、記録値だけの照合、semantic pinの自動refresh、未対応surfaceのsilent無視を拒否する"
tdd_red_required: true
red_at: "2026-09-09T03:42:00+09:00"
green_at: "2026-09-09T03:46:54+09:00"
mutation_oracle_evidence: "U-PINCHAIN-001〜004でstale digest/count、semantic review pin、unknown surface、CLI未配線を独立拘束"
complexity_effect: justified_positive
complexity_justification: "既存pin形式ごとのread-only adapter一箇所へ追従推測を集約し、CI再走と手作業を削減する"
removal_trigger: "全pin ownerが共通relation graphから同等のexact逆引きを提供しconsumer移行が成立した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md
pair_artifact: docs/test-design/helix/L7-pin-chain-derivation-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-001, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-002, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-003, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-004, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-005, test_path: tests/pin-chain-derivation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/pin-chain-derivation.md, oracle_id: U-PINCHAIN-006, test_path: tests/pin-chain-derivation.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1323", "issue:1639", "issue:1675", "issue:1678"]
  blocks: []
generates:
  - { artifact_path: docs/design/helix/L6-function-design/pin-chain-derivation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L7-pin-chain-derivation-unit-test-design.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1670-pin-chain-derivation.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/pin-chain-derivation.ts, artifact_type: source_module }
  - { artifact_path: tests/pin-chain-derivation.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_catalog }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: governance_record }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: generated_projection }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
agent_slots:
  - { role: se, slot_label: "SE — pin adapterとread-only CLI" }
  - { role: qa, slot_label: "QA — stale／semantic／unknown反例" }
review_evidence: []
---

# 変更pathからのpin追従先事前導出

## 第一slice

Issue #1670で反復した追従漏れを、既存gateがredを出した後ではなくpush前に列挙する。対象は実測済みの
feedback test-owner manifestとreviewed-safe semantic pinから開始し、adapter単位で追加する。

## 未完了

- current main同期後のrepo-wide guard、fresh CI、独立review
- JSON generated surface、literal digest、集合／cross-table pin adapter
- Bugbot Aへの許可済みdeterministic refresh接続（別責務）
---
