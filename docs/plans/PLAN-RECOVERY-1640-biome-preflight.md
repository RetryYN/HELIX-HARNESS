---
plan_id: PLAN-RECOVERY-1640-biome-preflight
title: "PLAN-RECOVERY-1640: Biomeの早期検出と重複実行除去"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex
created: 2026-09-08
updated: 2026-09-08
github_issue_id: 1640
behavior_contract_id: CI-BIOME-FAIL-FAST-001
responsibility_owner: ci-validation-order
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: not_applicable
no_code_decision: configure
ddd_modeling_decision: policy
contract_preconditions: "依存導入済みpreflightと既存lintコマンド、全shardのneedsを照合する"
contract_postconditions: "既存lintをpreflightで一回実行し、不備をshard起動前に拒否する"
contract_invariants: "対象src/tests、検査強度、required aggregate、receipt、DB、doctorを維持する"
contract_failures: "lint削除、finalizeへの逆戻し、shard後への移動、重複、別command、条件付きskip、continue-on-errorを拒否する"
tdd_red_required: true
complexity_effect: net_neutral
complexity_justification: "既存検査の配置変更と退行oracleに限定し、別検査機構を作らない"
removal_trigger: "後継のCI計画が同じ早期検査義務を引き継ぎ、独立検収した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-BIOMEFAST-001, test_path: tests/harness-check-workflow.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1640
    - issue:93
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1640-biome-preflight.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — 検査義務を維持して既存lintの実行順を修復" }
  - { role: qa, slot_label: "QA — 早期拒否と合法入力通過・配置反例を検証" }
  - { role: aim, slot_label: "AIM — Recoveryの責務境界と必須検証の非緩和を照合" }
review_evidence: []
---

# 既存CIの検査順修復

基準main: `97150245e5df08bed316ff4aca19895889d59f60`。
INV-019は本Issueへの入力参照であり、新要求ID・実行許可として使わない。

## 原因と対象

Biomeが全shard完了後のfinalizeにあるため、数秒で検出できる不備が全回帰の後まで遅延する。
既存workflow oracleもその順序を固定している。両者を同一sliceで修復する。

## 不変条件

`npm run lint`、対象src/tests、error判定、Node/toolchainは変えない。
continue-on-error・条件付きskipを追加せず、shardはpreflight成功後にだけ起動する。
最終receipt照合・DB・doctor・独立review・merge条件を維持する。

## 受入と反例

- preflightの依存導入直後にlintが一回だけ存在し、shard起動stepより前に置かれる。
- finalizeと各shard jobに`npm run lint`が存在しない。
- lintをfinalizeへ戻す、preflightから除く、shard後へ移すmutationを個別に検出する。
- 重複・条件付き化・コマンド変更・fail-openも個別に検出する。
- 実Biomeが整形不備fixtureを拒否し、正しいfixtureを受理する。
- 配置の局所テストとdiff-checkだけを完了根拠にする。全CI・独立reviewは自己申告しない。
- 過去runの推定削減時間を今回の実測効果として報告しない。

## 工程表

1. R0: Issueと現行workflow/testを照合（確認済み）。配置移動はPR #1648でmainへ入済み。
2. R1/R2: 配置oracleと反例を更新し、旧配置でRedを採取（exit 1、biome_preflight_invalid）。
3. R3: 同じlintをpreflightへ移動済み。本sliceはU-BIOMEFAST-001へfinalize逆戻し・preflight除去・shard後移動の明示mutationを追加した。
   Node v24.15.0。`npx vitest run tests/harness-check-workflow.test.ts` は 64 passed / exit 0。
   `npm run lint` は 27 warnings / 1 info / exit 0。整形不備fixtureは exit 1、撤去後 exit 0。
   `git diff --check` は exit 0。対象PLANの `plan lint` と `--gate governance` は exit 0。
   全CI・独立reviewは未実施であり、自己申告しない。
4. R4: 独立review・全CI・効果観測（未実施。本sliceでは自己申告しない）。

## 完了境界

workflow配置そのものはmain既存。本sliceは配置契約のmutation閉鎖を明示化し、targeted testとdiff-checkだけを記録する。
全CI・独立review・削減効果の実測は未完了であり、完了主張しない。
撤回は正規PRで元の順序へ戻せるが、今回追加する配置契約との整合を再検収する。
