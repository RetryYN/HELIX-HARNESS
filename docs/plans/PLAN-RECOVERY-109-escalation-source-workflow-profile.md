---
plan_id: PLAN-RECOVERY-109-escalation-source-workflow-profile
title: "PLAN-RECOVERY-109: source escalation workflow の doctor profile 混線を是正する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 153
behavior_contract_id: ESCALATION-SOURCE-WORKFLOW-PROFILE-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
backprop_decision: not_required
backprop_decision_reason: "既存のsource escalation workflowとconsumer distribution workflowのprofile境界を回復する。新しいrequirements意味、GitHub書込み権限、通知サービス、consumer capabilityは追加しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "開発リポジトリのscheduled escalation workflowと、clean consumerへ生成するconsumer escalation templateが別の実行profileを持つ。consumer doctorはsetup投影済みartifactを前提とする。"
contract_postconditions: "source repositoryのscheduled escalation workflowはsourceに存在するread-only status／completion／review bundle／toolchain doctorだけを実行し、consumer templateはconsumer doctorを維持する。"
contract_invariants: "source checkoutへconsumer profileを直接適用しない。consumer templateのclean consumer受入条件、read-only permission、checkout credential非保持、secret非使用を緩和しない。"
contract_failures: "source workflowがconsumer doctorを実行する、consumer templateがsource profileへ変わる、command setが順序またはprofile境界から逸脱する場合はfail-closeする。"
tdd_red_required: true
red_test: "source workflowにdoctor --profile consumerを戻す、またはconsumer templateをdoctor --scope toolchainへ変更したmutationが専用oracleでredになる。"
red_at: "2026-09-04T23:44:37+09:00"
green_at: "2026-09-04T23:45:08+09:00"
mutation_oracle_evidence: "2026-09-04T23:44:37+09:00にsource workflowのdoctor --scope toolchainをdoctor --profile consumerへ反転し、npx --no-install vitest run --project fast tests/escalation-stale-source-workflow.test.tsを実測した。U-ESC-SRC-001が1 failed／1 passed・exit 1（出力digest ec1b85b3e27402575ea40c80a3fe9f99fb2154bcd74ad986993ddd434bb8cc51）となり、sourceへのconsumer profile混入をkillした。2026-09-04T23:44:55+09:00にはconsumer templateのdoctor --profile consumerをdoctor --scope toolchainへ反転し、U-ESC-SRC-002が1 failed／1 passed・exit 1（出力digest a5d3c8996cf9d699ca283ff1a5ccc36345c8c51332dc53e1f1a524e8d25e0beb）となり、consumer側のprofile退行をkillした。両mutationを復元後、2026-09-04T23:45:08+09:00に同target testが2 passed・exit 0（出力digest a09f3f7256f11bd27f72eaeb02be38ee114fbfef2283e370dfb15b361d6b3c06）であることを確認した。"
mutation_oracle_required: true
mutation_oracle: "U-ESC-SRC-001/U-ESC-SRC-002がsource workflowとconsumer templateのprofile反転・混線を個別に検出する。"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-ESC-SRC-001, test_path: tests/escalation-stale-source-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-ESC-SRC-002, test_path: tests/escalation-stale-source-workflow.test.ts }
dependencies:
  parent: docs/plans/PLAN-L6-92-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
  references:
    - "issue:153"
    - "issue:93"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — source／consumer doctor profileの意味境界を監査" }
  - { role: tl, slot_label: "TL — source workflowとconsumer templateの責務境界を確認" }
  - { role: se, slot_label: "SE — source／consumer command profileの実装接合を修正" }
  - { role: qa, slot_label: "QA — profile反転・consumer混線mutationを検証" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-109-escalation-source-workflow-profile.md, artifact_type: markdown_doc }
  - { artifact_path: tests/escalation-stale-source-workflow.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .github/workflows/escalation-stale.yml, artifact_type: workflow_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# PLAN-RECOVERY-109: source escalation workflow の doctor profile 混線を是正する

## 目的

Issue #153で観測された scheduled `escalation-stale` failure の実行内容を、source repositoryと
consumer distributionの責務へ分離する。開発リポジトリには `helix setup project` が生成したconsumer
artifact一式が存在しないため、source workflowから `doctor --profile consumer` を呼び出してはならない。

source workflowは、既存のstatus、completion decision packet、completion review bundleに加え、
source checkoutで成立するread-onlyの `doctor --scope toolchain --json` を実行する。これにより、
stale escalationの観測経路を維持したまま、consumer setup stateを要求する誤ったprofile適用を除去する。

## 責務境界

- `.github/workflows/escalation-stale.yml`: 開発リポジトリ自身のscheduled source audit。
- `docs/templates/github/common/escalation-stale.yml`: clean consumerへ生成するconsumer audit。
- `runConsumerDoctor`: setup投影済みconsumerのadapter、workflow、state、templateを検査する。
- `doctor --scope toolchain`: source checkoutのNode、lockfile、workflow install policyをread-only検査する。

consumer templateを書き換えてsource workflowへ合わせること、source repositoryへconsumer setup artifactを
常設すること、consumer doctorをgreenにするために検査を緩めることは禁止する。

## 非対象

- `issues: write`、PAT、GitHub App、外部通知サービスの追加。
- `workflow_dispatch`／PR triggerの設計変更。
- consumer distribution artifactの再生成・公開・cutover。
- `doctor --profile consumer` 自体の検査内容の緩和。
- scheduled failureの自動Issue起票・既存Issueコメント（別の観測性責務として後続判断）。

## 実装・検証

1. source workflowのdoctor profileを`toolchain`へ修正する。
2. source workflowとconsumer templateを同一profileにしない専用oracleを追加する。
3. Impact CI RecoveryのL6/L8設計へsource／consumer境界を記録する。
4. target test、typecheck、PLAN lint、source command実測、全回帰、CIをcurrent HEADへ束縛する。
5. Issue #153へ、原因、修正HEAD、consumer templateを維持したこと、残る通知性の非対象をread-after記録する。

## 完了条件

- [ ] source `escalation-stale` のrun command exact setが status、completion packet、review bundle、toolchain doctorの順序で一致する。
- [ ] source workflowに`doctor --profile consumer`が存在しない。
- [ ] consumer templateに`doctor --profile consumer --json`が残り、source用profileへ退行しない。
- [ ] source workflowとconsumer templateのprofile混線をU-ESC-SRC-001/002が反例付きで検出する。
- [ ] source toolchain doctorがexit 0で完走し、consumer doctorのgreen偽装を行わない。
- [ ] current HEADのCI、独立review、DB projection／replay、Issue #153 read-afterを取得する。
