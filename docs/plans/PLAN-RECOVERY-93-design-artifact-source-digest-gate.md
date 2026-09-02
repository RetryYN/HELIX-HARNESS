---
plan_id: PLAN-RECOVERY-93-design-artifact-source-digest-gate
title: "PLAN-RECOVERY-93: 設計書artifact_path source_digest照合gate"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1468
behavior_contract_id: DESIGN-ARTIFACT-SOURCE-DIGEST-DRIFT-001
responsibility_owner: design-artifact-source-digest
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "設計実在性bindingがcurrent designのruntime assetをartifact_pathとsource_digestで記録している"
contract_postconditions: "全current authority pinが実ファイルbyte digestと照合され、新規driftと欠落targetがdoctorで拒否される"
contract_invariants: "既存のDesign Reality parser、Node transaction boundary、baseline縮小運用を再利用し、別manifest／DB／workflowを追加しない"
contract_failures: "新規source digest drift、pin先欠落、unsafe path、repo外target、不正baseline、baseline拡張をfail-closeする"
tdd_red_required: true
red_test: "baseline外のstale pinを一件追加したfixtureがdesign_artifact_source_digest_driftで失敗することを実測"
red_at: "2026-09-02T19:19:52Z"
green_at: "2026-09-02T19:20:14Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/design-artifact-source-digest.test.ts の U-DASD-002/U-DASD-003 で actualDigest 比較を無効化する seeded mutation (if true) を注入したところ 2 tests failed (exit 1, 2026-09-02T19:19:52Z)。実装復元後は同コマンドが6 tests passed (exit 0, 2026-09-02T19:20:08Z)。U-DASD-001〜006は一致、new drift、baseline debt、missing target、compatibility、baseline expansionを個別に検査する"
complexity_effect: net_neutral
complexity_justification: "既存design-reality-binding parser／digest実装へ全design走査とbaseline縮小判定を追加し、設計書pinの手作業照合漏れを除く"
removal_trigger: "なし。current design authorityと実装byteの恒久的な整合契約"
backprop_decision: not_required
backprop_decision_reason: "既存のDesign Reality Bindingを補強するgovernance Recoveryであり、新しいユーザー要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/design-reality-binding.md
pair_artifact: docs/test-design/helix/L8-design-artifact-source-digest-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
  requires:
    - docs/plans/PLAN-RECOVERY-09-design-reality-binding.md
    - src/lint/design-reality-binding.ts
  references:
    - "issue:1402"
    - "issue:1466"
    - "issue:1468"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-93-design-artifact-source-digest-gate.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-artifact-source-digest.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-artifact-source-digest-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/design-artifact-source-digest-baseline.json, artifact_type: config }
  - { artifact_path: src/lint/design-artifact-source-digest.ts, artifact_type: source_module }
  - { artifact_path: tests/design-artifact-source-digest.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/doctor-cause-digest-contract.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — 設計書pinと実ファイルauthorityの境界監査" }
  - { role: se, slot_label: "SE — 全design binding走査とbaseline validator" }
  - { role: qa, slot_label: "QA — new drift／missing target／baseline expansion反例" }
  - { role: tl, slot_label: "TL — #1468 Recovery収束と#1466後続同期" }
review_evidence: []
---

# 設計書artifact digest照合 Recovery

設計書が `current_authority: true` と宣言する実装assetを、実ファイルの現在byteへ毎回照合する。
既知の6件はbaseline debtとして残し、新規の静かな腐敗だけを止める。baselineの縮小は、該当設計書pinを
実測digestへ更新したPRで行う。
