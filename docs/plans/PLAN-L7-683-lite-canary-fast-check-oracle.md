---
plan_id: PLAN-L7-683-lite-canary-fast-check-oracle
title: "PLAN-L7-683 (test): Lite canary fast checkのclosure合成をmutation oracleで固定する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1067 Lite canary fast check closure aggregation oracle gap"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1067
behavior_contract_id: LITE-CANARY-FAST-CHECK-ORACLE-001
responsibility_owner: lite-canary-ci-orchestration
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
backprop_decision: not_required
backprop_decision_reason: "Issue #1067は既存L6契約のfail-close合成を固定するoracle gapであり、要求・production behaviorを変更しない"
contract_preconditions: "runLiteCanaryFastCheckがprimary distribution closure、coverage closure、coverage path存在を独立検査する"
contract_postconditions: "primary closureまたはcoverage closureのどちらか一方がfailした場合に、最終closure_okをtrueへ相殺できない"
contract_invariants: "profile／manifest／HEAD／path readの既存契約と、#1066のselector／workflow挙動を変更しない"
contract_failures: "closure.okまたはcoverageClosure.okを最終合成から除去してもテストがgreenになる"
tdd_red_required: true
red_test: "U-DISTCLOSE-019／020がprimary closureとcoverage closureの寄与を別々に固定し、各項を削除するmutationをkillする"
mutation_oracle_evidence: "2026-08-27T03:14:43+09:00にclosure.okを最終合成から一時除去し、U-DISTCLOSE-019がexpected closure_ok=false／received trueで1 failed、exit 1となるkillを実測。2026-08-27T03:15:02+09:00にcoverageClosure.okを一時除去し、U-DISTCLOSE-020が同じく1 failed、exit 1となる独立killを実測した。apply_patchで製品コードを復元し、同suite 15 tests green、git diffで製品コード差分0を確認した"
complexity_effect: net_neutral
complexity_justification: "production codeを増やさず、既存fixtureのisolated cloneへ反例を注入する2 oracleだけを追加する"
removal_trigger: "Lite canary fast checkがversioned closure receiptへ置換され、同じ二つのfailure contributionを別oracleが直接固定した時"
parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md
pair_artifact: docs/test-design/helix/L8-lite-canary-ci-parallelization-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-DISTCLOSE-019, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-DISTCLOSE-020, test_path: tests/distribution-dependency-closure.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-683-lite-canary-fast-check-oracle.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/test-design/helix/L8-lite-canary-ci-parallelization-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-dependency-closure.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-682-lite-canary-ci-parallelization.md
  requires:
    - docs/plans/PLAN-L7-682-lite-canary-ci-parallelization.md
    - docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md
  references:
    - issue:1067
    - pr:1066
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — closure contribution mutation oracle" }
  - { role: tl, slot_label: "TL — test-only scope／#1066 dependency確認" }
---

# PLAN-L7-683: Lite canary fast check closure合成oracle

## 目的

Issue #1067で確認した、`closure.ok`または`coverageClosure.ok`を最終`closure_ok`合成から
削除しても既存suiteがgreenになるoracle gapを閉じる。production behaviorは変更しない。

## 検証方法

1. current HEADのisolated cloneでLite配布entrypointへartifact ownership外の静的importを追加し、
   primary closureだけがfailする反例を作る。
2. 別cloneでWindows durability coverage entrypointへ未所有の相対dynamic importを追加し、
   coverage closureだけがfailする反例を作る。
3. 両ケースとも`analyzeDistributionDependencyClosure`単体ではなく、
   `runLiteCanaryFastCheck`の最終`closure_ok=false`を検査する。
4. 二つの合成項を個別に削除するmutationがそれぞれ対応oracleでredになることを実測する。

## 非対象

selector、workflow DAG、artifact builder、distribution profile、Full回帰、publish／releaseは変更しない。
