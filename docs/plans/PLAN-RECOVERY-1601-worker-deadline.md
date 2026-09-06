---
plan_id: PLAN-RECOVERY-1601-worker-deadline
title: "正規workerのbudgetを停止・回収へ接続する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1601
behavior_contract_id: WORKER-BUDGET-LIFECYCLE-1098
responsibility_owner: worker-runtime-lifecycle
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — worker budgetと継続運転の成立条件を照合" }
  - { role: tl, slot_label: "TL — process lifecycleと後続移管の責務境界を検収" }
  - { role: se, slot_label: "SE — deadline・process-tree停止・回収を実装" }
  - { role: qa, slot_label: "QA — timeout・orphan・late side effectの反例を検証" }
parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md
pair_artifact: docs/test-design/helix/L8-worker-budget-lifecycle.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: "1.1.6"
  registry_source_digest: "sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89"
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1098", "issue:1601", "PLAN-L3-69-worker-context-boundary-compiler"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1601-worker-deadline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-budget-lifecycle.md, artifact_type: test_design }
  - { artifact_path: src/runtime/provider-process-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: tests/provider-process-lifecycle.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-001, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-002, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-003, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-004, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-005, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-006, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-007, test_path: tests/provider-process-lifecycle.test.ts }
---

# 正規worker budget lifecycle Recovery

## 目的

sealed worker contextの`budget.time_ms`を、正規`helix codex/claude --execute`のdeadline、process-tree停止、回収、terminal出力へ接続する。

## 境界

- current authorityのprovider wrapperだけを本sliceで修復する。
- `team run`、`pair-agent`、legacy loopは同じhelperへ後続移管するcompatibility debtであり、本sliceへ混載しない。
- `token_limit`をprompt上のお願いで強制済みと扱わない。adapterが強制不能なら別のtyped unsupported/degraded責務として残す。

## 受入条件

- [ ] 正常終了するchildはdeadline前にexit codeを保持して回収される
- [ ] `time_ms`超過時にPOSIX process groupへSIGTERMし、grace超過時はSIGKILLする
- [ ] SIGTERMを無視する親と孫がreturn後に生存しない
- [ ] packet由来の異なるbudgetが実測終了時刻へ反映される
- [ ] JSON出力にtimeout・deadline・termination stage・signal・duration・reapedを含む
- [ ] timeout後のlate side effectが発生しない
- [ ] wrapperへのSIGINT・SIGTERM・SIGHUPでprovider treeが孤児化せず、割込み理由をterminal出力へ保持する
- [ ] targeted test、typecheck、full CI、独立exact-HEAD review、main read-afterがgreen
