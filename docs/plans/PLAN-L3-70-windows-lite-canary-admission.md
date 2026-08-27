---
plan_id: PLAN-L3-70-windows-lite-canary-admission
title: "PLAN-L3-70 (add-design): Windows Lite canary PR横断 bounded admissionを正本化する"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1106 Windows Lite canaryのPR横断bounded admissionとp95/p99を要求へ分解する"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1106
behavior_contract_id: WINDOWS-LITE-CANARY-ADMISSION-001
responsibility_owner: windows-lite-canary-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "#1002/#1066のprofile closure selector、Linux artifact authority、Windows same-artifact smoke、Full/Lite aggregate、既存scheduler／event journal／measurement historyが存在する"
contract_postconditions: "WLCA-FR-001..002、WLCA-R-01..08、WLCA-AC-001..010とL6/L8/L9接合境界がrequirementsから追跡可能になる"
contract_invariants: "Linux artifact authority、Full/Lite aggregate、source/profile/artifact/attempt binding、既存queue／lease／measurement authority、fail-closeを弱めない"
contract_failures: "policy欠落、unbounded queue、lease expiry、stale owner/fence、wrong HEAD/artifact/attempt、state uncertainty、measurement母集団混在、unauthorized skip、外部queue追加を受理しない"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3要求、L6設計、L8/L9/L10 oracleだけを追加し、実行可能kernel／Actions adapter／DB変更はL3確認後の後続PRへ分離する"
complexity_effect: net_neutral
complexity_justification: "既存slot scheduler、work-graph lease、event journal、measurement history、Impact CI、aggregateを再利用し、PR横断Windows bindingの契約だけを追加する"
removal_trigger: "Windows lane admissionとmeasurementが既存の単一scheduler／aggregateへ完全統合され本PLANの独自contract consumerが0になった時"
parent_design: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
pair_artifact: docs/test-design/helix/windows-lite-canary-admission-acceptance.md
agent_slots:
  - { role: tl, slot_label: "TL — #1002既存artifact authorityとcross-PR lease責務境界" }
  - { role: se, slot_label: "SE — typed policy／queue／Actions adapterのL3→L6降下" }
  - { role: qa, slot_label: "QA — stale fence、same-artifact、p95/p99母集団、mutation oracle" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/windows-lite-canary-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-windows-lite-canary-admission-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/windows-lite-canary-admission-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-progression-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/vmodel-pair.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-22-github-ci-performance-recovery.md
  requires:
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
    - docs/plans/PLAN-L7-682-lite-canary-ci-parallelization.md
    - docs/design/helix/L5-detail/slot-scheduler-quota-handover.md
  references:
    - issue:1002
    - issue:1106
  blocks: []
---

# PLAN-L3-70: Windows Lite canary PR横断 bounded admission

## §0 目的

Issue #1106の設計差分を、#1002で既に成立したprofile closure／Linux artifact／Windows smoke／Full aggregateへ
安全に接続するためのL3入口とする。Windows runnerの待機を隠すだけの変更、timeout緩和、未検査skipは対象外とする。

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | #1002、既存CI性能要件、slot／lease、measurement historyの差分棚卸し | 新規authorityと重複責務がない |
| 2 | L3 requirementとL10 acceptanceを作成 | WLCA-FR／R／ACのexact pairがdraftとして成立 |
| 3 | L6 kernel、L8 unit、L9 integrationの境界を作成 | policy／queue／lease／measurement／aggregateの接合が一意 |
| 4 | catalog／outstanding projectionを同期 | PLAN、design、test artifactが機械追跡可能 |
| 5 | targeted lintと独立レビュー | L3確認前の実装・Actions変更が混入していない |

## §1 実装分割

L3確認後の後続PRを次へ分割する。

1. typed policy／lease receipt schema の実装
2. deterministic queue／backpressure／expiry evaluator の実装
3. GitHub Actions Windows lane adapter の実装
4. concurrent PR／timeout／stale completion E2E の実装
5. main／nightly measurement projectionとp95／p99 read-after の実装

各PRは同じsource／profile／artifact／attempt bindingと既存aggregateを引き継ぐ。実装PRが未完の間は本PLANの
`completion_claim_allowed: false`を維持し、main／nightlyの実測がない状態で性能達成や#1002終端を主張しない。

## §2 非対象

新外部queue、#819 Notification Fabric、resident lane、#188 routing／allocation、Lite builder、Linux authority、
tag／publish／DevOS cutover、GitHub settingsのaction-binding外変更は本PLANへ混載しない。
