---
plan_id: PLAN-REVERSE-674-terminal-fullback-bundle-admission
title: "PLAN-REVERSE-674: terminal fullback bundle admissionの要件逆流反映"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1031
behavior_contract_id: GWID-TERMINAL-BUNDLE-BACKFILL-001
responsibility_owner: github-workflow-identity-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1031のadd-implをL3要件とG3 freezeへReverse fullbackする"
contract_preconditions: "PLAN-L7-674がterminal bundle admissionをL3／L6／L8／adapter／testへ実装し、current digestを取得できる"
contract_postconditions: "add-implとReverseを双方向に接続し、terminal bundle contractとL3 freeze digestを同一Issueの候補HEADへ束縛する"
contract_invariants: "Reverseはmigration bundleを再定義せず、通常PRのexactly-one原則を弱めず、未成立のCI／review／main read-afterを完了証拠として先取りしない"
contract_failures: "Forward／Reverse双方向link欠落、Issue不一致、L3 digest drift、candidate HEADのCI／Claude receipt欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "新しいruntime挙動を追加しないReverse接着であり、全回帰が検出したbackfill orphanとL3 digest driftを既存oracleとして再利用する"
mutation_oracle_evidence: "tests/backfill-pairing.test.ts U-BACKFILL-006がReverse欠落時にPLAN-L7-674をreverseOrphansとして検出し、tests/l3-g3-freeze-packet-v2.test.ts U-DESIGNCOV-016が旧digestを拒否した実測を再利用する"
complexity_effect: net_neutral
complexity_justification: "既存のrequired add-impl fullback規律へ一つのReverse PLANを接続し、新しいruntime分岐を追加しない"
removal_trigger: "PLAN-L7-674と本PLANがcurrent-main read-afterを含む終端証拠でconfirmedになった時点で履歴証拠として保持する"
parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-admission-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    reason: "terminal fullback bundleをmigration bundleと分離したstrict admissionとして要件化した。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "GitHub provider境界や外部interfaceは変更せず、既存admissionのbundle種別を追加する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "既存のGitHub workflow identity admission adapter内でstrict schemaを再利用する。"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-019, test_path: tests/github-workflow-identity-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-workflow-identity-admission.md, oracle_id: U-GWIDADM-020, test_path: tests/github-workflow-identity-admission.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-674-terminal-fullback-bundle-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
modifies:
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-674-terminal-fullback-bundle-admission.md
  requires: []
  references:
    - docs/plans/PLAN-L7-674-terminal-fullback-bundle-admission.md
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — backfill orphanとG3 digest drift反例" }
  - { role: tl, slot_label: "TL — L3要件逆流と終端証拠境界" }
---

# terminal fullback bundle admissionのReverse fullback

## 目的

`PLAN-L7-674-terminal-fullback-bundle-admission`で追加したstrict bundle契約をL3要件へ逆流反映し、
required `add-impl`を孤立させない。L3変更後のdigestはG3 freeze packetと対応oracleへ同時に伝播する。

## R0〜R3

- R0: 通常PR、migration bundle、terminal bundleの既存境界と全回帰failureを採取した。
- R1: terminal bundleは同一Issueのtyped Forward／Reverse PLANだけを明示manifestで束ねる。
- R2: 各PLANのidentityを保持し、owner、Issue、registry digest、changed PLAN exact setを照合する。
- R3: L3要件、L6設計、L8テスト設計、adapter、oracle、freeze digestを同一候補HEADへ接続する。

## R4境界

本PRではReverse PLANの契約をconfirmedにする一方、`pending_reverse`／`completion_claim_allowed: false`を維持する。
current HEADの全CI、Claude exact-HEAD review、canonical merge、main read-afterが揃う前に完了へ遷移しない。

## 受入条件

- Forward PLANと本Reverse PLANが双方向に参照され、backfill orphanが0になる。
- L3要件の実digestとG3 freeze packet／oracleのdigestが一致する。
- terminal bundle markerが本PRのchanged PLAN exact setを保持し、migration markerと併記されない。
- current HEADのCIと独立reviewが成立するまで完了を主張しない。
