---
plan_id: PLAN-RECOVERY-1601-worker-deadline
title: "正規workerのbudgetを停止・回収へ接続する"
kind: recovery
layer: cross
drive: agent
status: confirmed
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
  - { artifact_path: .helix/evidence/review-1602/npm-ci.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1602/vitest-targeted.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1602/tsc.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1602/biome.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1602/plan-lint.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1602/doctor.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1602/head.txt, artifact_type: other }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-001, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-002, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-003, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-004, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-005, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-006, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-007, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-008, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-009, test_path: tests/provider-process-lifecycle.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/worker-budget-lifecycle.md, oracle_id: U-WBL-010, test_path: tests/cli-surface.test.ts }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-06T19:35:17Z"
    tests_green_at: "2026-09-06T19:32:58Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 9867601a-a3ad-4369-980c-11757d63a7de
    reviewed_head_sha: c192c7a6412170e4e1d470246be7168db8447bd9
    scope: "独立reviewとclean clone実測は https://github.com/RetryYN/HELIX-HARNESS/pull/1602#issuecomment-5561649330 。doctor exit 1は環境起因4件を含むためgreen commandへ昇格しない。Issue #1098全体完了や最終receiptを代替しない。"
    green_commands:
      - kind: install
        command: "npm ci --no-audit --no-fund"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:26:52Z"
        evidence_path: .helix/evidence/review-1602/npm-ci.log
        output_digest: "sha256:f3b8b436cfc104feb0c4222bcbe9429e218fe711a57025a5454ea253354eef72"
      - kind: test
        command: "npx vitest run tests/provider-process-lifecycle.test.ts tests/cli-surface.test.ts tests/digest.test.ts tests/feedback-refactor-disposition.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/review-evidence.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-06T19:32:39Z"
        evidence_path: .helix/evidence/review-1602/vitest-targeted.log
        output_digest: "sha256:05014ba751e9c557e1ead4c538a60ed53c05949e237c90b132207c10e150bc85"
      - kind: typecheck
        command: "npx tsc --noEmit -p ."
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:32:51Z"
        evidence_path: .helix/evidence/review-1602/tsc.log
        output_digest: "sha256:ce35c3291c2599cd0781c05a42f5a208eecb91a1d7df11a10c4e3fed38c9422e"
      - kind: lint
        command: "npx biome check src tests"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:32:52Z"
        evidence_path: .helix/evidence/review-1602/biome.log
        output_digest: "sha256:c722ccfb21301b59e0758d0d7a2e9837b5fdc5a270c6503083127c1d8a626d12"
      - kind: plan_lint
        command: "npx tsx src/cli.ts plan lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-09-06T19:32:58Z"
        evidence_path: .helix/evidence/review-1602/plan-lint.log
        output_digest: "sha256:db827b33d67fde3579300cffa3dc6f714c9260b4ed5c47d1bcce75f5791f9267"
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
- [ ] cleanup中のsignal再送を冪等に吸収し、provider treeのreap前にwrapperを既定終了させない
- [ ] direct child正常終了後に残るtreeは`tree_lingered=true`としてbounded cleanupし、deadline超過へ誤分類しない
- [ ] 割込み理由をCLI JSONへ保持し、終了codeをsignal慣例へ投影する
- [ ] targeted test、typecheck、full CI、独立exact-HEAD review、main read-afterがgreen
