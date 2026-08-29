---
plan_id: PLAN-RECOVERY-60-close-ready-readiness-projection
title: "PLAN-RECOVERY-60 (recovery): close_ready readiness projectionをtyped authorityへ復旧"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:2026-08-17 Issue #655のclose_ready 370件を一律human approval扱いにしない projection 欠陥を是正する"
  - "po_directive:close_ready候補の件数だけで human_required / automatable を決めず、typed evidence readinessへ到達させる"
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
github_issue_id: 655
engineering_discipline_required: true
behavior_contract_id: CLOSURE-READINESS-PROJECTION-001
responsibility_owner: closure-readiness-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "close_ready queue、typed evidence manifest、closure authority、current-location、vmodel fit、doctorが同一readinessを参照する"
contract_postconditions: "auto_approve_ready / human_approval_required / evidence_not_ready / noneを区別し、manifest未接続の候補を自動化可能にも人間承認にも昇格させず、review-bundleへ戻す"
contract_invariants: "不可逆・human-only・invalid authorityは自動化せず、legacy側のgreenでcanonical側のreadiness不足を相殺しない"
contract_failures: "typed manifest欠落、authority評価失敗、投影間のstatus・count・digest不一致はfail-closeする"
tdd_red_required: true
red_at: "2026-08-16T23:05:35Z"
green_at: "2026-08-16T23:05:59Z"
mutation_oracle_evidence: "tests/closure-auto-approval.test.ts::U-CAUTO-007でmanifest未接続分岐のstatusをevidence_not_readyからhuman_approval_requiredへ一時変更するseeded mutationを実測し、1 failedでkillした。実装を復元後、同suiteが7 passedになった。"
complexity_effect: net_neutral
parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CAUTO-007, test_path: tests/closure-auto-approval.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-CURRENT-LOCATION-001, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/closure-auto-approval.md, oracle_id: U-VVM-002, test_path: tests/visualization-view-model.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — close_ready projectionの誤判定再発を監視し、Recovery終端条件を確認する" }
  - { role: se, slot_label: "SE — closure authorityからtyped readinessを構築する" }
  - { role: qa, slot_label: "QA — manifest欠落・human-only・invalid authorityのfail-close oracle" }
  - { role: tl, slot_label: "TL — current-location／vmodel／doctor／CLIの投影一致を検証する" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-60-close-ready-readiness-projection.md, artifact_type: markdown_doc }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/closure-auto-approval.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/visualization-read-model.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/visualization-view-model.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/vmodel-fit.ts, artifact_type: source_module }
  - { artifact_path: src/schema/visualization-current-location-contract.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/closure-auto-approval.test.ts, artifact_type: test_code }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-read-model.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-view-model.test.ts, artifact_type: test_code }
  - { artifact_path: tests/visualization-treeview.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-433-closure-auto-approval.md
  requires:
    - docs/plans/PLAN-L7-433-closure-auto-approval.md
  blocks:
    - issue:655
review_evidence: []
---

# PLAN-RECOVERY-60: close_ready readiness projectionの復旧

## 復旧対象

既存のclosure auto-approval evaluatorは、実装済みのauthorityとgreen evidenceを満たした候補だけを自動化できる。しかし、current-location、Project view、vmodel fit、CLI、doctorのprojectionが候補件数や旧approval flagを参照すると、次の誤判定が起きる。

- typed evidence manifest未接続の候補をautomatableとして数える。
- evidence未準備の候補をhuman approval待ちとして表示する。
- auto-approve readinessと既存のapproval-record apply経路を同じ状態として返す。

## 正規状態

`closure-auto-approval.ts`のauthority evaluatorを意味正本とし、次の4状態を全surfaceへ投影する。

| status | 意味 | 次の経路 |
|---|---|---|
| `auto_approve_ready` | typed manifest、authority、HEAD、evidence、gateが全対象で成立 | auto-approve dry-run |
| `human_approval_required` | human-onlyまたは不可逆境界だけが残る | human approval review-bundle |
| `evidence_not_ready` | manifest欠落、証跡欠落、authority評価未成立 | readiness再計算／review-bundle |
| `none` | close_ready候補なし | current-location |

候補件数だけでは`automatable`も`human_only`も増やさない。canonical readinessが未確定の場合は`evidence_not_ready`としてfail-closeする。

## 検証境界

- current-location、closure overview、review bundle、vmodel fit、visualization、CLI、doctorのstatus・count・digest・next commandを同一readinessから生成する。
- `U-CAUTO-007`でmanifest未接続の候補がauto-approve／human approvalへ昇格しないことを検証する。
- 既存のmanual approval applyは`human_approval_required`の経路として保持し、evidence未準備を人間承認で迂回させない。
- 実データへの`closure auto-approve --execute`、外部GitHub操作、不可逆なPLAN status変更はこのRecoveryの対象外とする。

## 完了条件

- [ ] typed readinessの4状態がcurrent-location、vmodel fit、visualization、CLI、doctorで一致する。
- [ ] manifest未接続候補が`automatable=0`、`human_only=0`、`invalid_escalated=0`、`evidence_not_ready`になる。
- [ ] auto-ready以外の状態でauto-approve execute commandを提示しない。
- [ ] `U-CAUTO-007`、current-location、visualization、CLI、doctorのtargeted testsがgreenになる。
- [ ] exact-HEADの独立レビューとmain read-afterを完了する。
- [ ] Issue #655へ証拠を接続し、実データのclosure apply／executeは別途明示承認境界で扱う。
