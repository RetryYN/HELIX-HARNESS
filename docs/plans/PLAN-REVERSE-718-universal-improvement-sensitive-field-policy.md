---
plan_id: PLAN-REVERSE-718-universal-improvement-sensitive-field-policy
title: "PLAN-REVERSE-718: sensitive field token-family policyのpost-main fullback"
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
github_issue_id: 1308
behavior_contract_id: UIL-SENSITIVE-FIELD-POLICY-001
responsibility_owner: universal-improvement-sensitive-field-policy
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: policy
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
  - "po_directive:Issue #1244 sensitive field policyのpost-main Reverse fullback"
contract_preconditions: "PR #1301のcanonical merge、exact-head Claude receipt、draft／Ready CI、L3／L6／L8／runtimeが存在する"
contract_postconditions: "policy/version、U-UILSFP-001〜003、raw key/value非漏洩を要求正本とmain実装へ再接着する"
contract_invariants: "token family、policy version、UIL route、DB schema、要求意味を変更せず、raw credential／PIIを証拠へ書かない"
contract_failures: "wrong HEAD、stale receipt、policy/version drift、raw leakage、companion欠落、premature close／completion claimをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装とU-UILSFP-001〜003を再利用するdocs-only Reverseであり、新しいRedを捏造しない"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/universal-improvement-source-registry.test.tsのU-UILSFP-001〜003が結合key／numeric suffix通過、benign誤拒否、raw key/value漏洩を個別に検出する"
complexity_effect: net_neutral
complexity_justification: "Forward実装を複製せず、要求／設計／検証／main証拠の再接着だけを所有する"
removal_trigger: "Universal Improvement Loop全体のterminal Reverseが本fullbackを統合した時"
parent_design: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
    reason: "UIL-R-01のversioned registry／redaction／fail-close意味を局所policyとして具体化し、source authorityや観測契約を変更しない。"
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/helix/L6-function-design/universal-improvement-source-registry.md
    reason: "version付きtoken family、固定reason、raw field非展開の設計とruntimeが一致する。"
  - layer: verification-design
    decision: not_impacted
    evidence_path: docs/test-design/helix/L8-universal-improvement-source-registry-unit-test-design.md
    reason: "U-UILSFP-001〜003がboundary分類、benign許可、raw leakage拒否を個別に検出する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "Universal Improvementの外部boundary、route、provider interfaceを変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "field分類policyは既存L6 source registry責務へ閉じ、DB schemaやtransaction境界を変更しない。"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-718-universal-improvement-sensitive-field-policy.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/universal-improvement-sensitive-field-policy-terminal-fullback-evidence.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L3-74-universal-improvement-loop.md
  requires:
    - docs/plans/PLAN-L3-74-universal-improvement-loop.md
  references:
    - issue:1244
    - issue:1308
    - pull:1301
    - docs/plans/PLAN-L7-718-universal-improvement-sensitive-field-policy.md
    - src/runtime/universal-improvement-source-registry.ts
    - tests/universal-improvement-source-registry.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — policy/version、negative oracle、raw leakageのmain再照合" }
  - { role: tl, slot_label: "TL — #1244同一レーン終端とcompanion境界" }
---

# Sensitive field token-family policyのpost-main fullback

## R0 現状採取

Forward PR #1301は最終candidate HEAD `3b7c6e334e227efb4be5a7ed3b57dc15a3bc4077`からmerge commit
`898bf66333c47155bd251228d1945ecf8b8d4485`へcanonical mergeされた。Claude exact-head receiptはreview対象
`6415e1a6d8bb21f34cac9c7838dbd0d295b97d46`、receipt
`sha256:f85959723502c8d304f5fb35b7b45181d62aeb16bc4f52cdbccf69812080374c`へ束縛される。最終candidateの
draft CI `33436421318`とReady CI `33438369682`はsuccessである。review receiptと最終candidate CIを同一HEADと偽装しない。

## R1 観測契約

policy version、token family exact set、separator／camel／concatenation／numeric suffix、benign key、固定finding reasonを
観測する。raw key/value、credential、PIIはreceipt、failure、commentへ展開せず、familyと固定reasonだけを証拠化する。

## R2 As-Is照合

UIL-R-01、L6、L8、runtime、U-UILSFP-001〜003は、versioned policyによる機密field拒否とraw leakage禁止を同じ責務として
返す。U-UILSFP-004はpolicy versionとfamily exact setの補助fenceであり、001〜003の受入意味を置換しない。

## R3 意図照合

要求、L4、L5、L6、L8の意味変更は不要である。既存UIL-01のredaction／fail-close要求をtoken-family policyへ局所化した
refactorであり、Universal Improvement route、source authority、観測schema、DB schemaへbackpropする変更はない。

## R4 候補終端条件

本Reverse PRではbranch-kind authorityに従いForward refactor PLANを変更しない。current-HEAD targeted検証、PLAN gate、
CI、独立review、canonical mergeを成立させた後、同一#1244レーンの原子的companion PRでPLAN-L7-718へReverse link、
terminal status、review／CI／merge evidenceを追加する。companion mergeとmain read-afterで双方向linkを確認するまで、
Forward／Reverseのcompletion claimと親Issue #1244 closeを禁止する。
