---
plan_id: PLAN-RECOVERY-108-ci-isolation-backend-bounded
title: "PLAN-RECOVERY-108: CI isolation backendのrunner固定とapt境界を回復する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 806
behavior_contract_id: CI-ISOLATION-BACKEND-BOUNDED-001
responsibility_owner: ci-execution-environment
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_negative
complexity_justification: "Linux runnerとisolation backend導入の共通境界を一つのhelperへ集約し、runner/codename driftと無制限aptの再発検出を追加する。setup templateのlabel契約は別責務へ残し、CI責務を増やさない。"
backprop_decision: not_required
backprop_decision_reason: "既存のCIS-R-03／CIS-AC-003とWCCのrequired isolation oracleを回復する実行環境Recoveryであり、新しい要求意味や受入対象を追加しない。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "CIS-R-03／CIS-AC-003がrunner、system dependency、environment identityの欠落・driftをfail-closeし、既存U-WIB-018がrequired bubblewrap process oracleを要求している。"
contract_postconditions: "harness-checkのLinux jobはubuntu-24.04へ固定され、runnerの実効ID/codenameを検査し、preflight/statefulのbubblewrap導入は共通helperのtimeout付きapt呼出しだけを使う。"
contract_invariants: "required real bubblewrap process oracle、network/source pin、apt timeout、fail-close、Linux canonical gateを弱めず、continue-on-error、raw apt、別runner greenの流用を許可しない。"
contract_failures: "ubuntu-latest等のrunner alias、runner/codename mismatch、helper外のapt、timeout欠落、bubblewrap欠落、workflowからのraw apt、required isolation stepのskipを個別にfail-closeする。"
tdd_red_required: true
red_test: "U-CIISO-001／U-CIISO-002へrunner aliasまたはhelperのtimeout欠落を注入したとき、harness-check workflow oracleがexit 1になることを確認する。既存U-WIB-018はrequired isolation stepのskipを拒否する回帰oracleとして維持する。"
mutation_oracle_required: true
parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md
pair_artifact: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md
dependencies:
  parent: PLAN-L6-96-worker-isolation-broker
  requires:
    - docs/plans/PLAN-L6-96-worker-isolation-broker.md
  references:
    - "issue:806"
    - "issue:799"
    - "issue:802"
    - "issue:797"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-CIISO-001, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-isolation-broker.md, oracle_id: U-CIISO-002, test_path: tests/harness-check-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-108-ci-isolation-backend-bounded.md, artifact_type: markdown_doc }
  - { artifact_path: .github/scripts/install-bubblewrap.sh, artifact_type: script }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: docs/test-design/helix/L8-worker-isolation-broker-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — runner/codenameとisolation backendの責務境界監査" }
  - { role: se, slot_label: "SE — bounded apt helperとworkflow配線" }
  - { role: qa, slot_label: "QA — runner drift／raw apt／timeout mutation oracle" }
  - { role: tl, slot_label: "TL — CIS/WCC既存要求へのRecovery境界確認" }
review_evidence: []
---

# CI isolation backendのrunner固定とapt境界回復

## 目的

Issue #806のうち、CIの実行環境を正本へ固定する二つの残差を回復する。`ubuntu-latest`とUbuntu codenameの
乖離を防ぐため、`harness-check`の全Linux jobを`ubuntu-24.04`へ固定し、実行時にもUbuntu 24.04／`noble`
を確認する。preflightとstatefulに分散していたbubblewrap導入を共通helperへ集約し、全ての`apt-get update`
／`apt-get install`を180秒timeoutとbounded retry／HTTP timeoutの内側へ置く。

## 非対象

- `src/setup/templates.ts`とconsumer doctor間のlabel往復oracle。これは#797系の別責務として#806へ残し、本PLANでは実装しない。
- runner imageの自作、self-hosted runner、apt mirrorの無制限化、bubblewrap process oracleのskip／soft-pass。
- required test削除、timeout緩和、`continue-on-error`、別環境のgreenをcurrent証拠へ流用すること。
- release、tag、publish、配布、security broker、#1208 CI scheduler本体の変更。

## 実装方針

1. `harness-check.yml`のLinux jobを`ubuntu-24.04`へ固定し、source listのcodenameと一致する実効OS guardを置く。
2. `.github/scripts/install-bubblewrap.sh`を唯一のbubblewrap導入経路とし、preflight／statefulから同じhelperを呼ぶ。
3. helperはrunner OS/version/codename、source list、retry、HTTP/HTTPS timeout、aptの180秒上限、実体確認、AppArmor設定を保持する。
4. workflow oracleは全Linux jobのrunner pin、helperの利用、workflow内raw apt不在、helper内apt timeoutを反例付きで検査する。

## 受入条件

- [ ] U-CIISO-001／002がcurrent sourceでgreenになり、runner alias、codename guard、timeout欠落のmutationを個別にkillする。既存U-WIB-018のrequired isolation step skip拒否もgreenである。
- [ ] `bash -n .github/scripts/install-bubblewrap.sh`、typecheck、Biome、targeted test、PLAN lintがgreenになる。
- [ ] full `harness-check`でpreflight／statefulのrequired real bubblewrap process oracleが実行され、導入失敗をskipせずfail-closeする。
- [ ] current HEADのCIと独立Claude exact-HEAD review、main read-afterを取得するまでcompletion claimを許可しない。
- [ ] #806のlabel往復oracleが未実装であることをIssueへ明記し、本PLANのmergeで#806全体をclosed扱いにしない。

## 要求・要件の束縛

新しいL3要求は追加しない。既存`CIS-R-03`／`CIS-AC-003`、`WCC-FR-03`の実効runner／system dependency／
required isolation境界を具体化するRecoveryである。runner alias、unpinned package、environment driftが
reconciliation対象である`Technology Environment Reconciliation Authority`の意味とも一致する。
