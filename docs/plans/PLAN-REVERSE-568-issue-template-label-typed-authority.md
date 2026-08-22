---
plan_id: PLAN-REVERSE-568-issue-template-label-typed-authority
title: "PLAN-REVERSE-568: Issue templateのlabelとtyped authorityをcurrentへ収束する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206のIssue templateとsetup生成物が存在しないGitHub label、旧mode、旧L14をcurrent guidanceとして再出力している"
created: 2026-08-19
updated: 2026-08-19
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: ISSUE-TEMPLATE-LABEL-TYPED-AUTHORITY-001
responsibility_owner: issue-template-label-typed-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
backprop_decision: not_required
backprop_decision_reason: "Issue template／setup／doctorのconsumer projectionだけをcurrent typed authorityへ是正し、requirements registryやruntime identityの意味は変更しない"
contract_preconditions: "GitHub labelの実体がbug、feature、enhancement、updateであり、recoveryとincidentはworkflow/signal分類としてrequirementsに存在する"
contract_postconditions: "Issue template、setup生成元、doctor、governanceが現存labelだけを出力し、workflow/signal分類とlabelを混同せず、current L1-L12 guidanceへ接続する"
contract_invariants: "requirements registry、workflow classification、specialist drive、PLAN kind、GitHub labelを同一enumへ畳み込まず、legacy labelのgreenでcurrent guidanceの失敗を相殺しない"
contract_failures: "存在しないlabelの出力、Recovery modeやL14のcurrent案内、generated templateとdoctor oracleの不一致をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存templateと生成元のauthority文字列を一つのconsumer sliceで同期し、既存doctor/setup oracleを同一patchでcurrent値へ更新する"
complexity_effect: net_negative
complexity_justification: "存在しないlabelと旧layer案内を除去し、GitHub実体とcurrent typed分類の単一投影へ整理する"
removal_trigger: "Issue templateがrequirements registryから完全生成され、手書きlabel／分類文字列が0になった時点"
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — Issue templateとsetup生成元のcurrent projection" }
  - { role: qa, slot_label: "QA — 未登録label、旧mode、L14のnegative oracle" }
  - { role: tl, slot_label: "TL — GitHub label実体とrequirements typed axisの意味一致" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-568-issue-template-label-typed-authority.md, artifact_type: markdown_doc }
  - { artifact_path: .github/ISSUE_TEMPLATE/add-feature.md, artifact_type: template }
  - { artifact_path: .github/ISSUE_TEMPLATE/recovery.md, artifact_type: template }
  - { artifact_path: docs/templates/github/common/add-feature.md, artifact_type: template }
  - { artifact_path: docs/templates/github/common/recovery.md, artifact_type: template }
  - { artifact_path: docs/governance/github-operation-rules.md, artifact_type: markdown_doc }
  - { artifact_path: src/setup/templates.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/setup.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
  requires:
    - docs/plans/PLAN-L7-475-issue-hierarchy-contract.md
    - docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - docs/governance/github-operation-rules.md
  blocks: []
---

# PLAN-REVERSE-568: Issue templateのlabelとtyped authorityをcurrentへ収束する

## 目的

Issue #206のうち、GitHub Issue templateとsetup配布元をcurrent authorityへ再接着する。
GitHubに現存しない`recovery`／`incident`／`add-feature` labelを生成せず、`recovery`はworkflow/signal、
`add-feature`はdelivery routeおよびPLAN kindの文脈として扱う。Recovery templateの旧L14案内もcurrent
canonicalのL1-L12境界に合わせてcatalog route / capabilityへ置き換える。

このconsumer projectionはrequirements／workflow classification registry `1.1.4`（source digest
`sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f`）を参照し、compatibility-onlyの
旧mode／旧layer表現をcurrent labelやcurrent guidanceへ再出力しない。

## 是正契約

- recovery templateはGitHubに実在する`bug` labelを使い、recovery signalを本文で受け取る。
- add-feature templateは実在する`feature` labelを使い、specialist driveを別欄で受け取る。
- `.github`、`docs/templates`、`src/setup/templates.ts`、doctor oracleを同じ契約へ同期する。
- governanceはlabelとworkflow/signal分類を別軸として案内し、未登録labelの新設を暗黙に行わない。
- `tests/setup.test.ts`の配布template digestを実変更へ束縛し、生成物の不一致をfail-closeする。

## 非対象

GitHub labelの新規作成、Issue全件の再label、CLI／DB／runtimeのworkflow identity移行、README全体、
配布repoのtag／Release、PLAN-M-02 cutoverは後続sliceで扱う。

## 終端条件

対象templateと生成元、doctor、targeted tests、plan lint、全回帰、Claude exact-HEAD review、DB convergence、
main read-afterが同一HEADへ束縛されるまでcompletion claimを許可しない。
