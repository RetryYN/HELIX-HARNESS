---
plan_id: PLAN-RECOVERY-74-immutable-github-action-ref-registry
title: "PLAN-RECOVERY-74: immutable GitHub Action ref registry"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1339
behavior_contract_id: CI-IMMUTABLE-ACTION-REF-001
responsibility_owner: github-security-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1185 confirmed full-length Action SHA requirementとcurrent mutable usesの矛盾をP0 Recoveryする"
contract_preconditions: "#270 GitHub Security Admissionと#1174 Technology Environment Reconciliation authorityがcanonical mainでcompletedである"
contract_postconditions: "current workflow、consumer template、setup生成物の全外部usesがrequirements-owned registryのfull commit SHAとexact一致し、release tagは非authority metadataだけに残る"
contract_invariants: "logical action identityとimmutable execution refを混同せず、unknown action、tag、branch、short SHA、registry drift、旧green相殺を拒否する"
contract_failures: "registry欠落／重複／schema不正、unknown action、mutable ref、wrong SHA、release metadata driftをstable ruleでfail-closeする"
tdd_red_required: true
red_test: "tag、branch、short SHA、wrong registry SHA、unknown actionをcurrent toolchain-pinへ入力しても一部がgreenになる"
red_at: "2026-09-01T19:45:37+09:00"
green_at: "2026-09-01T19:45:46+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T19:45:37+09:00にsetup-node exact registry SHA比較を反転すると、npx --no-install vitest run tests/toolchain-pin.test.ts --reporter=dotで6 testsすべてfailedとなり、canonical ref受理とmutable／wrong ref拒否のoracleがmutationをkillした。直後に比較guardを復元し、先行targeted suite 4 files／77 tests greenのcanonical実装へ戻した。"
complexity_effect: justified_positive
complexity_justification: "Action refの許可値をlintやsetupへ複製せず、単一typed registryからcurrent workflowとconsumer生成物を検証する"
removal_trigger: "GitHub Security Admissionが同じimmutable action registryをnative projectionとして完全所有した時"
backprop_decision: not_required
backprop_decision_reason: "confirmed #270／#1174とcurrent mutable workflowの実矛盾を閉じるRecoveryであり、要求意味は変更しない"
parent_design: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md
pair_artifact: docs/test-design/helix/L8-immutable-github-action-ref-registry-unit-test-design.md
dependencies:
  parent: PLAN-L3-72-technology-environment-reconciliation
  requires:
    - docs/plans/PLAN-L3-72-technology-environment-reconciliation.md
  references:
    - "issue:1339"
    - "issue:1185"
    - "issue:270"
    - "issue:1174"
  blocks:
    - "issue:1340"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md, oracle_id: U-IAR-001, test_path: tests/toolchain-pin.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md, oracle_id: U-IAR-002, test_path: tests/toolchain-pin.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md, oracle_id: U-IAR-003, test_path: tests/toolchain-pin.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md, oracle_id: U-IAR-004, test_path: tests/toolchain-pin.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-74-immutable-github-action-ref-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/immutable-github-action-ref-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-immutable-github-action-ref-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/github-action-immutable-ref-registry.json, artifact_type: json_config }
modifies:
  - { artifact_path: config/universal-improvement-source-registry.v1.json, artifact_type: json_config }
  - { artifact_path: config/universal-improvement-source-registry.v1.integrity.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/lint/toolchain-pin.ts, artifact_type: source_module }
  - { artifact_path: tests/toolchain-pin.test.ts, artifact_type: test_code }
  - { artifact_path: src/setup/index.ts, artifact_type: source_module }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-lite-consumer-services.ts, artifact_type: source_module }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
  - { artifact_path: tests/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-acceptance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-services.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: .github/workflows/escalation-stale.yml, artifact_type: workflow_config }
  - { artifact_path: .github/workflows/issue-metadata-audit.yml, artifact_type: workflow_config }
  - { artifact_path: docs/templates/github/common/harness-check.yml, artifact_type: template }
  - { artifact_path: docs/templates/github/common/escalation-stale.yml, artifact_type: template }
  - { artifact_path: docs/templates/github/common/pack-harness-check.yml, artifact_type: template }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — P0 security driftの既存authority回復と非対象境界確認" }
  - { role: se, slot_label: "SE — immutable action identity／registry projection" }
  - { role: qa, slot_label: "QA — mutable ref／wrong SHA／unknown action mutation" }
  - { role: tl, slot_label: "TL — GitHub Security／TER再利用とconsumer surface収束" }
review_evidence: []
---

# immutable GitHub Action ref registry実装

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | current Action tagをGitHub APIでcommit SHAへ解決しregistry化 | action／release／SHA／source URLがexactに固定される |
| 2 | toolchain-pinをregistry authorityへ移行 | mutable／unknown／wrong SHAを個別拒否する |
| 3 | workflow、template、setup生成物を同一SHAへ収束 | current `uses:`のmutable refが0になる |
| 4 | mutation、targeted、typecheck、doctorを実行 | 必須反例と既存回帰がgreen |
| 5 | Claude exact-HEAD review、CI、main read-after | receiptとcanonical mainが一致する |

本PLANは#1339だけを所有し、runner／toolchain attestation #1340、GitHub実run終端 #1341、親#1185のcompletionを主張しない。
