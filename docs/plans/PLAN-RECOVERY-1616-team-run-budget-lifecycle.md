---
plan_id: PLAN-RECOVERY-1616-team-run-budget-lifecycle
title: "旧team runを正規worker budget lifecycleへ収束する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1616
responsibility_owner: worker-runtime-lifecycle
behavior_contract_id: TEAM-RUN-BUDGET-LIFECYCLE-1616
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — team互換経路を正規worker lifecycleへ収束する境界を照合" }
  - { role: tl, slot_label: "TL — deadline・回収・旧engine退役方向の責務境界を検収" }
  - { role: se, slot_label: "SE — 共通provider process lifecycleへの接続を実装" }
  - { role: qa, slot_label: "QA — timeout・exit code・bounded captureの反例を検証" }
parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md
pair_artifact: docs/test-design/helix/L8-worker-budget-lifecycle.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: "1.1.6"
  registry_source_digest: "sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89"
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [PLAN-RECOVERY-1601-worker-deadline]
  references: ["issue:865", "issue:1616"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1616-team-run-budget-lifecycle.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-budget-lifecycle.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/provider-process-lifecycle.ts, artifact_type: source_module }
  - { artifact_path: src/team/run.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/provider-process-lifecycle.test.ts, artifact_type: test_code }
  - { artifact_path: tests/team-run.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-011, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-012, test_path: tests/team-run.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-013, test_path: tests/team-run.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-014, test_path: tests/team-run.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-015, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-016, test_path: tests/cli-surface.test.ts }
review_evidence: []
---

# 旧team runのbudget lifecycle収束

`team run --execute`の独自`spawn`を、正規workerが使用する
`runBudgetedProviderProcess`へ収束する。sealed worker contextの`budget.time_ms`を
memberごとのdeadline、process-tree停止、回収、terminal JSONへ接続する。
team memberのlifecycle返却値は必須契約とし、欠落、deadline不一致、timeout、未reapを
fail-closeする。`PostToolUse`も同じ判定へ揃え、exit 0だけで成功を記録しない。

follow-upでは、provider-neutralなterminal admissionを正本化し、direct
`helix codex/claude --execute`とteam compatibility projectionの双方へ接続する。
`status=0`でもtimeout、残存tree、中断、未reap、launch errorがあれば失敗とし、
PostToolUse、consult receipt、terminal JSON、CLI exit codeを同じ判定へ揃える。

新しいteam固有process lifecycleや恒久schedulerは作らない。stderr永続化、DB schema拡張、
tracked instance policyは独立責務とし、mutation、独立review、CI、main read-after完了まで
confirmed化しない。

旧pair-agentの`runCapturedProviderProcess`接続と、Claude review verdictのstdout／stderr連結解析は
本follow-upへ混載しない。前者は旧engine退役・後継worker移管、後者はtyped output receiptの
独立sliceで閉じ、本PLANの「唯一の成功判定」はdirect wrapperとteam compatibility facadeに限定する。
