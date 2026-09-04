---
plan_id: PLAN-RECOVERY-107-lite-consumer-npm-install-determinism
title: "PLAN-RECOVERY-107: Lite consumer npm installの決定性を回復する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1508
behavior_contract_id: LITE-CONSUMER-NPM-DETERMINISM-001
responsibility_owner: distribution-lite-consumer-canary
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: domain_service
backprop_decision: not_required
backprop_decision_reason: "既存DIST-LITE-R-04のinstall／lockfile受入意味を変更せず、受入対象外のadvisory network待ちを抑制する実行境界だけを回復する。Lite機能範囲、artifact authority、scheduler、resource admissionの新規要求は追加しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "DIST-LITE-R-04、PLAN-L7-657、既存consumer artifact／lockfile／integrity契約がcurrent authorityとして存在する"
contract_postconditions: "consumer setupのlockfile生成とLite受入installがadvisory network待ちに依存せずboundedに完走し、Full acceptanceの宣言済み依存解決とintegrity／artifact digest検証を維持する"
contract_invariants: "npm依存解決、package-lock authority、npm ci、artifact／doctor／completionのrequired判定を弱めず、skip／soft-pass／timeout無制限緩和を行わない"
contract_failures: "lockfile生成失敗、依存解決失敗、integrity／artifact digest不一致、timeout、受入対象外のadvisory network待ちを成功へ丸めない"
tdd_red_required: true
red_test: "main／PRのU-DISTCAN-006、U-DISTPKG-012、U-SETUP-013でspawnSync status=null／ETIMEDOUTが発生する再現条件を、対象Node 24のfresh consumerで固定する"
mutation_oracle_required: true
complexity_effect: net_negative
complexity_justification: "受入対象外のnpm advisory network副作用を明示的に除去し、Lite／profileのoffline境界とFull acceptanceの宣言済み依存解決を一つのbounded consumer install policyへ収束する"
removal_trigger: "consumer install policyが共通実行adapterへ統合され、同一のbounded npm policyを全consumer surfaceが参照できるようになった時"
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
dependencies:
  parent: PLAN-L7-657-distribution-lite-consumer-canary
  requires:
    - docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  references:
    - "issue:1508"
    - "issue:856"
    - "issue:1002"
    - "issue:1106"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-107-lite-consumer-npm-install-determinism.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/setup/index.ts, artifact_type: source_module }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-acceptance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-profile-package.test.ts, artifact_type: test_code }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md, oracle_id: U-DISTCAN-006, test_path: tests/distribution-lite-consumer-canary.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — consumer install timeoutの再現条件と責務境界監査" }
  - { role: se, slot_label: "SE — consumer npm lockfile／install execution boundary" }
  - { role: qa, slot_label: "QA — Lite canary／profile package／clean acceptance timeout regression" }
  - { role: tl, slot_label: "TL — DIST-LITE-R-04 integrity and fail-close boundary" }
review_evidence: []
---

# PLAN-RECOVERY-107: Lite consumer npm installの決定性回復

## 目的

既存のDIST-LITE-R-04受入契約を変更せず、consumer setupが生成するpackage-lockとLite clean consumer検証のfresh npm child processを、受入対象外のaudit／fund／update notification待ちから分離する。Lite／profile artifactのfresh installはregistry egressを禁止し、required preflightで復元したcacheの欠落を即時fail-closeする。Full clean distribution acceptanceはsetupが生成する宣言済みGitHub package specの解決を検査対象に含めるためofflineを強制せず、fetch retry／timeoutだけをboundedにする。依存解決、lockfile、integrity、artifact digest、doctor、completion、Windows same-artifactの判定は引き続きrequiredとする。

## 実装範囲

- `setup project` 内部の `npm install --package-lock-only` にboundedなconsumer install flagsを付与する。
- Lite canary、profile package、clean distribution acceptanceのnpm child processへ、advisory抑制と責務ごとのoffline／bounded-fetch境界を含む受入用環境ポリシーを渡す。
- 既存テストのexact command／environment境界を更新し、production setupと受入テストが別の挙動にならないようにする。

## 非対象

- `npm ci` のlockfile検証、artifact integrity、doctor、completion、Windows same-artifact契約の緩和。
- #1002のprofile closure選択・CI並列化、#1106のbounded admission・resource control、runner timeout全体の変更。
- Lite artifact範囲、配布repository、tag、publish、promotion、DevOS cutover、外部credential／API write。

## 受入条件

1. setup unit、Lite canary、profile package、clean distribution acceptanceが対象Node 24でterminal greenになる。
2. `npm install --package-lock-only`の依存解決とlockfile生成を維持する。
3. advisory network、fund、update notificationを抑制し、Lite／profile fresh installのregistry egressを禁止してもintegrity／lockfile／artifact digestの検証を弱めない。Full acceptanceの宣言済み依存解決はfetch retry／timeoutをboundedにし、いずれのcache miss／依存解決失敗もsuccessへ丸めない。
4. timeout到達をexit failureと混同せず、required canaryをskip／soft-passへ変更しない。
5. current HEADのCI、Claude exact-HEAD review、main read-afterが揃うまでcompletion claimを許可しない。

## 検証バインディング

- U-DISTCAN-006: `tests/distribution-lite-consumer-canary.test.ts`
- U-DISTPKG-012: `tests/distribution-lite-profile-package.test.ts`
- U-SETUP-013: `tests/distribution-acceptance.test.ts`
- U-SETUP-037／038: `tests/setup.test.ts`

## 用語更新

なし。consumer install policyは既存DIST-LITE-R-04の実行境界を明確化するもので、新しいworkflow意味を導入しない。

## 機能要求更新

なし。既存のDIST-LITE-R-04を満たすためのRecoveryであり、Lite capabilityや配布契約の意味を変更しない。
