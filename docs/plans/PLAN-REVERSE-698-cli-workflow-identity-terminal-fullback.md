---
plan_id: PLAN-REVERSE-698-cli-workflow-identity-terminal-fullback
title: "PLAN-REVERSE-698: CLI typed workflow identityをcurrent mainへ再接着する終端fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L3
promotion_strategy: reuse-as-is
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1125
behavior_contract_id: CLI-TYPED-WORKFLOW-IDENTITY-TERMINAL-001
responsibility_owner: workflow-output-cli-projection
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: consumer_migration
entry_signals:
  - "po_directive:Issue #1125のmerge済みCLI typed projectionをmain反映後確認へ束縛し、Issue #206の依存を解放する"
contract_preconditions: "PR #1159がcurrent mainへmergeされ、PLAN-L7-698の実装、negative oracle、同一HEAD独立review receiptが存在する"
contract_postconditions: "CLI JSON／summary／textのworkflow primary identityがregistry version、digest、target_axis、target_idへ統一されたことをcurrent mainで再照合し、Issue #1125を終端可能にする"
contract_invariants: "provider model、specialist drive、skill applicabilityをworkflow identityへ畳み込まず、旧selected_model／default_model／available_models／drive_modelをcurrent outputへ戻さない"
contract_failures: "main反映後CI未完了、旧field再出現、partial tuple、stale registry digest、独立review receipt不一致、DB projection不収束をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "PLAN-L7-698のU-CLIWI-001〜005と実測mutationを再利用するdocs-only R4照合であり、新しいRed時刻を捏造しない"
mutation_oracle_evidence: "PLAN-L7-698でtarget_id exact照合除去とemit_legacy_identity条件除去を個別にkill済み。本Reverseはcurrent mainで同じoracle群と全回帰を再実行する。"
complexity_effect: net_neutral
complexity_justification: "実装済みprojectionを再実装せず、PR、CI、review、DB、Issueの分散証拠を単一終端契約へ束縛する"
removal_trigger: "Issue #1125がmain反映後確認付きでcloseされ、Issue #206の全surface終端監査へ統合された時点"
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "typed workflow identityとlegacy input-only境界は現行requirementsが所有し、本Reverseは新しい意味を追加しない。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "CLI外部契約はPLAN-L7-698のForward実装で確定済みであり、本Reverseは挙動を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "value objectとconsumer接続はcurrent mainに存在し、本Reverseはschemaやtransaction境界を変更しない。"
  - layer: verification-design
    decision: not_impacted
    reason: "既存L8とU-CLIWI-001〜005を再利用し、新しいoracle責務を追加しない。"
parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md
pair_artifact: docs/test-design/helix/L8-cli-workflow-identity-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-001, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-002, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-003, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-004, test_path: tests/cli-workflow-identity-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cli-workflow-identity-projection.md, oracle_id: U-CLIWI-005, test_path: tests/cli-surface.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-698-cli-workflow-identity-projection.md
  requires:
    - docs/plans/PLAN-L7-698-cli-workflow-identity-projection.md
  references:
    - "issue:1125"
    - "issue:206"
    - "pr:1159"
  blocks: []
agent_slots:
  - { role: tl, slot_label: "TL — typed identity終端境界とIssue依存解放" }
  - { role: qa, slot_label: "QA — legacy field再出現、digest drift、未成立証拠の反例" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-698-cli-workflow-identity-terminal-fullback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
---

# CLI typed workflow identityの終端Reverse fullback

## R0 現状採取

PR #1159はHEAD `8533536b488c3d5a81aecba8ad21ac9997f026c1`で全回帰とClaude Code Opusの
同一HEADレビューを通過し、merge commit `9c6bf0ae5bf01711aad4548576900c7555025e7c`としてmainへ入った。
一方、Issue #1125とPLAN-L7-698は非終端であり、Issue #206の依存解放に必要なmain反映後確認が未接着である。

## R1 観測契約

PLAN-L7-698のU-CLIWI-001〜005を再利用し、drive model、recovery、completion frontier、Project
frontier、tree viewのJSON／summary／textをcurrent mainで観測する。過去branchのgreenやproseだけで
main成功を推測しない。

## R2 As-Is照合

current outputはregistry version、registry source digest、`target_axis`、`target_id`の完全tupleをprimary
identityとする。provider model、specialist drive、skill applicabilityは別軸のまま保持し、旧workflow fieldを
compatibility adapter外へ再出力しない。

## R3 意図照合

Issue #1125の目的は名称置換ではなく、CLI consumerのprimary identityをrequirements-owned typed tupleへ
移行することである。current mainの実装とoracleはこの意図に一致しており、本Reverseではruntimeを変更しない。

## R4 Forward再入・終端条件

次を同じcurrent mainへ束縛した後だけ、本PLANとPLAN-L7-698を終端化する。

1. PR #1159のmerge commitを基準にrequired CIがterminal successである。
2. U-CLIWI-001〜005、typecheck、DB rebuild／replay、doctorがgreenである。
3. Claude Code Opusが本Reverse PRの同一HEADを独立reviewし、blocker 0を記録する。
4. Issue #1125、PLAN-L7-698、本PLAN、PR、main HEADの参照が一致する。
5. canonical merge後にmain反映後確認を行い、Issue #1125をcloseする。

現時点ではmain required CIのterminal確認と本Reverseの独立reviewが未成立のため、draft、
`pending_reverse`、`completion_claim_allowed: false`を維持する。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | PR #1159のmerge／review／CI証拠を採取 | [並列] | HEADとreceipt一致 |
| 2 | current mainでtargeted oracle、DB、doctorを再実測 | [並列] | 全green |
| 3 | PLAN-L7-698と本PLANを終端状態へ遷移 | [直列] | completion claim成立 |
| 4 | Claude Opus同一HEADレビューとReady CI | [review] | blocker 0、required CI green |
| 5 | merge後にmain反映を確認しIssue #1125をclose | [直列] | #206依存解放 |
