---
plan_id: PLAN-REVERSE-717-ci-deferred-obligation-recovery
title: "PLAN-REVERSE-717: CI deferred obligation回収を正本へ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1208
behavior_contract_id: CI-DEFERRED-OBLIGATION-RECOVERY-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
forward_routing: L5
promotion_strategy: reuse-as-is
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1208 deferred obligation回収のReverse fullback"
contract_preconditions: "PLAN-L7-717、L6／L8 pair、PR #1290 exact-HEAD review、canonical merge、Ready CIが存在する"
contract_postconditions: "deferred obligationのexactly-once回収、origin backprop、quarantine境界をL3／L6／L8／runtimeへ再照合する"
contract_invariants: "要求意味を変更せず、failureを要求変更へ自動昇格せず、publish／cutoverを混載しない"
contract_failures: "wrong HEAD、stale review、双方向link欠落、profile相殺、selector mutation未検出をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "独立レビューでfailed terminal runのoracle欠落がfail-openになる反例を実測し、corrective regression U-CIDEFER-013と最小runtime修正を同一Reverseへ追加した。事後にRedを捏造せず、レビュー反例をfailure evidenceとして保持する。"
mutation_oracle_required: true
mutation_oracle_evidence: "U-CIDEFER-001〜013がmissing、duplicate、expired、wrong profile、stale HEAD、quarantine、selector edge削除、failed runのoracle欠落を個別にkillする。"
complexity_effect: net_neutral
complexity_justification: "実装を複製せず、要求・設計・検証・main証拠の再接着だけを所有する"
removal_trigger: "CI System Synthesis全体のterminal Reverseが個別fullbackを統合した時"
parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
pair_artifact: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
    reason: "CIS-R-13〜15のdeferred recovery、backprop、quarantine意味と実装が一致する。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
    reason: "exactly-once recoveryとorigin receiptの責務境界がruntimeと一致する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
    reason: "U-CIDEFER-001〜013がfail-close境界を個別に検出する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "外部system boundaryとprovider interfaceを変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "typed recovery schemaはForward L6実装に閉じる。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-717-ci-deferred-obligation-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/ci-deferred-obligation-recovery-terminal-fullback-evidence.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-deferred-obligation-recovery.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-deferred-obligation-recovery.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
    - docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md
  references:
    - issue:1208
    - issue:1206
    - issue:1207
    - issue:1304
    - pull:1290
    - docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md
    - src/runtime/ci-deferred-obligation-recovery.ts
    - tests/ci-deferred-obligation-recovery.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — exactly-once回収とmutation証拠のmain再照合" }
  - { role: tl, slot_label: "TL — CI System Synthesis終端接着" }
---

# CI deferred obligation回収のReverse fullback

## R0 現状採取

Forward PR #1290のexact HEAD `1e312e8027bfc686f15bc8325eb55fa1ea373aa7`、CI run `33429356878`、Claude review receipt `sha256:5b6bf73ec4c42a47aca8eb9b0e77714e2386dcb484b53d93a2136f149a29f882`、merge `2799d499cec2b9c2d6b5fab0e1e2036f240f470b`を事実基準とする。

## R1 観測契約

deferred obligation、origin PR、candidate HEAD、terminal recovery profile、first terminal run、finding dispositionをexact receiptへ束縛し、missing／duplicate／wrong profile／expiredを相殺しない。

## R2 As-Is照合

CIS-R-13〜15、L6／L8、runtime、U-CIDEFER-001〜013は同じexactly-once recovery責務を返す。failed runのoracle欠落をfail-closeし、selector mutationはorigin decisionへbackpropしてauthorityを直接変更しない。

## R3 意図照合

requirements／L4／L5／L6／L8の意味変更は不要である。Forward再入先をL5とし、公開・release cutoverは非対象を維持する。

## R4 候補終端条件

Forward／Reverse双方向link、targeted oracle、PLAN gate、current-HEAD CI、Claude exact-HEAD reviewを揃える。Reverse merge後のmain read-afterまでcompletion claimとIssue closeを先取りしない。
