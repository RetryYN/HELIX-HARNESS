---
plan_id: PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback
title: "PLAN-REVERSE-704: execution policyをcurrent-mainへ再接着する終端fullback監査"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
forward_routing: L3
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-POLICY-TERMINAL-FULLBACK-001
responsibility_owner: workflow-execution-policy-terminal-fullback
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: consumer_migration
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-25T06:23:29Z"
    tests_green_at: "2026-08-25T06:20:41Z"
    verdict: approve
    worker_model: codex:gpt-5.4-codex
    reviewer_model: claude-opus-5
    scope: "PR #1020 current HEAD 215f84e411dad9a86bb02fdfa1e4f94b0569d92eのR0〜R4証拠を独立再検収。4 verification bindingの実在性、L4/L5 not_impacted判断、full regression、doctor、DB projection/replay、checkpoint/replay、Issue/PLAN snapshotを確認し、blocker 0。"
    green_commands:
      - kind: smoke
        command: "gh run view 32814825028 --repo RetryYN/HELIX-HARNESS --json status,conclusion,jobs"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-25T06:20:42Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:7c691d34e4ee0a8be68fd0623ef34f91a85c3a4f4a29e15782b6675d2e8e0e73"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1020#issuecomment-5406400649"
    reviewer_session_id: "c7895aff-da7e-47a0-944a-36c68bb4f251"
    receipt_digest: "sha256:229893a76f50162090f8fb1064d93c6daea10b096234f5b0fec34e5ab24a1f29"
parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-routing-consumer-runtime-unit-test-design.md
entry_signals:
  - "po_directive:Issue #704のrequirements-owned execution policy実装をReverse fullbackで終端し、#635/#188の解放条件へ接続する"
contract_preconditions: "requirements v1.3.13、classification registry v1.1.5、execution policy registry v1.2.2と、#704所有の8 PLANに対応する実装PRがmainへmerge済みである"
contract_postconditions: "8 Forward PLANのrequirements／registry／projection／resolver／consumer／CLI実装をcurrent-mainへ再照合し、旧mode／route-mapを意味authorityへ戻さず、Issue #704のterminal claimへ束縛する"
contract_invariants: "requirements-owned registryのversion／digest／typed axis／IDを唯一の意味基準とし、旧mode、旧15-route catalog、raw command、legacy identityをcurrent outputへ再出力しない。未成立のCI／review／DB／main read-after証拠はcompletion claimへ昇格しない"
contract_failures: "Forward sliceのmerge／HEAD／CI／review evidence欠落、registry digest drift、typed negative oracle退行、DB projection不一致、current-main未測定、Issue／PLAN参照不一致をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存の8 Forward sliceのnegative oracleとterminal harness-checkを再利用するdocs-onlyのR4照合であり、新しいRed timestampを捏造しない"
mutation_oracle_evidence: "既存PLAN-L3-56/57/59、PLAN-L7-563/565/566/567のnegative oracleと、PRごとのharness-checkをR1入力として再利用する。Reverse固有のscope／current-main／digest不一致はplan lint、DB rebuild、doctor、Issue dependency auditでfail-closeする"
complexity_effect: net_neutral
complexity_justification: "既存のrequirements registry、policy projection、runtime consumer、CLI、CI、DB projectionを再実装せず、8 PLANの分散evidenceをR4の単一終端契約へ束ねる"
removal_trigger: "Issue #704の8 Forward PLANがcompletion receiptとmain read-afterへ束縛され、#204の全surface収束監査へ統合された時点"
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "execution policyの意味authorityはrequirements v1.3.13にあり、Reverseは新しい分類語彙を追加しない。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "current mainにはこのexecution policyについて独立したL4設計artifactが存在せず、今回のdocs-only ReverseはL4のbehaviorを変更しない。実在するL6 function designを設計照合のauthorityとして使用する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "current mainにはこのexecution policyについて独立したL5設計artifactが存在せず、今回のdocs-only ReverseはL5のschemaやbehaviorを変更しない。実装に対応するL6 function designと既存Forward PLANを照合する。"
  - layer: verification-design
    decision: updated
    evidence_path: docs/test-design/helix/L8-workflow-execution-routing-consumer-runtime-unit-test-design.md
    reason: "既存のregistry／projection／resolver／consumer／CLI negative oracleをcurrent-mainの再接着証拠として使用する。"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-001, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, oracle_id: U-WFEPOLRES-003, test_path: tests/workflow-execution-policy-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-001, test_path: tests/workflow-execution-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-001, test_path: tests/cli-surface.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  requires:
    - docs/plans/PLAN-L3-56-execution-policy-classification-boundary.md
    - docs/plans/PLAN-L3-57-workflow-execution-policy-registry.md
    - docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md
    - docs/plans/PLAN-L3-59-workflow-execution-disposition-map.md
    - docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
    - docs/plans/PLAN-L7-565-workflow-execution-policy-resolution.md
    - docs/plans/PLAN-L7-566-workflow-execution-routing-consumer.md
    - docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  references:
    - docs/plans/PLAN-L3-56-execution-policy-classification-boundary.md
    - docs/plans/PLAN-L3-57-workflow-execution-policy-registry.md
    - docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md
    - docs/plans/PLAN-L3-59-workflow-execution-disposition-map.md
    - docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
    - docs/plans/PLAN-L7-565-workflow-execution-policy-resolution.md
    - docs/plans/PLAN-L7-566-workflow-execution-routing-consumer.md
    - docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  blocks: []
agent_slots:
  - { role: tl, slot_label: "TL — requirements authorityと#704 terminal境界" }
  - { role: qa, slot_label: "QA —旧identity再出力、digest drift、未検収evidenceの反例" }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
---

# PLAN-REVERSE-704: execution policyの終端Reverse fullback

## R0 現状採取

Issue #704が所有する8 PLANは、requirements-owned execution policyの設計、registry、projection、resolver、typed routing consumer、CLIを分担している。実装PRはそれぞれmainへmerge済みだが、R4 fullbackが成立するまで8 PLANは `completion_claim_allowed: false` / `backfill_state: pending_reverse` を維持していた。本PRでcurrent candidateのR4証拠を受理し、8 PLANと本PLANを終端状態へ遷移させる。

main read-afterの基準点は、PR #1019 merge後の `f5d70356cfadfc0f2880d9dbcf80295cc7c4225b` とする。current authorityはrequirements v1.3.13、classification registry v1.1.5、execution policy registry v1.2.2であり、旧15-route catalogと旧modeはcompatibility-onlyである。

## R1 観測契約

新しい実装を起こさず、各Forward PLANに記録された次の既存oracleを再利用する。

- requirements／registry境界：legacy identity昇格、unsupported、duplicate、injection、approval downgrade
- generated projection：三重digest、raw command、旧identity、manual drift
- resolver／consumer：`policy_unsupported`、`policy_ambiguous`、承認要求、7種類の処理結果と終了コード対応
- CLI：typed JSON、execution form、4 boolean、raw command／legacy identity非出力

R1の採否は、Forward PLANの実測review evidence、merge済みHEAD、required harness-check、current-main read-afterで行い、proseや過去のdraft状態から成功を推測しない。

## R2 As-Is照合

8 PLANの責務境界は一つのpolicy enumへ潰さず、次の軸分離を維持する。

```text
requirements meaning authority
  → typed workflow identity
  → execution policy registry / generated projection
  → resolver disposition / exit mapping
  → runtime consumer / route eval CLI
```

`mode`、`model`、旧`route_mode`、`config/drive-route-catalog.json`のcompatibility inventoryをcurrent identityやpolicyへ再昇格させない。legacy inputは一方向adapterの入力に限定し、current output、DB authority、PR契約へ再出力しない。

## R3 意図照合

Issue #704の意図は、signal textから旧modeを推測することではなく、requirements正本に登録されたtyped identityからexecution policyを導出し、未登録・曖昧・approval不足・digest driftをfail-closeすることである。8 PLANの実装は既にmainへ到達しているため、本Reverseは追加のruntime／CLI／DB実装を含めない。

## R4 Forward再入・終端条件

以下を同一candidate mainへ束縛した後にだけ、本PLANと8 Forward PLANを終端化する。

1. 8 Forward PLANのmerge／HEAD／required CI／独立review receiptが相互に一致する。
2. current requirements／registry／projection versionとsource digestがmain read-afterで一致する。
3. targeted negative oracle、full regression、typecheck、DB rebuild/replay、doctor、Issue dependency auditがgreenである。
4. `mode`／`model`／旧15-route identityのcurrent output再出現がない。
5. Claude Code OpusがこのReverse PRのcurrent HEADを独立reviewし、blocker 0のreceiptを残す。

初回candidateでは証拠未封緘のためdraft／pending_reverseを維持した。current-HEAD CI、Claude blocker 0 receipt、DB convergence、8 Forward PLANとのbindingが揃ったため、本PRの原子的更新で8 Forward PLANと本PLANを `status: confirmed` / `backfill_state: complete` / `completion_claim_allowed: true` へ遷移させる。canonical merge後のmain read-afterとIssue #704 closeは別の終端手順で実施し、未実施の証拠を先取りしない。

## R4 current-candidate evidence

PR #1020のcurrent HEAD `215f84e411dad9a86bb02fdfa1e4f94b0569d92e` は、PR #1019 merge後のmain `f5d70356cfadfc0f2880d9dbcf80295cc7c4225b` を祖先に持つ。harness-check `32814825028` はLite consumer、Windows durability、全回帰、Biome、doctor、full admissionをsuccessで完了し、Claude Code Opusのexact-HEAD receiptはblocker 0である。

同receiptで、live decision count 28、committed snapshotとの一致、DB projection／replay digest `sha256:f44a5cdf7f96f1b08784655443be7735a0b646dfd79334cd7c2586ed870ddbfa`、checkpoint／replay digest `sha256:9d6bf2f5440af9f82a46c2c3a50aba5f4a0955cccd354c94eb5c6df80e961276`、`converged=true`を確認した。canonical merge後はmain read-afterで同じ条件を再取得し、Issue #704を終端化する。
