---
plan_id: PLAN-RECOVERY-1693-g10-chromium-apt-isolation
title: "G10 Chromium導入を無関係なGoogle apt sourceから隔離"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-10
github_issue_id: 1693
behavior_contract_id: CI-G10-CHROMIUM-ADMISSION-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "独立PR #1691/#1683のbulk-3がGoogle Chrome apt indexのHash Sum mismatchでtest前に停止した"
contract_postconditions: "無関係なGoogle Chrome apt sourceを限定退避した後にPlaywright Chromium依存導入とG10検証へ到達する"
contract_invariants: "Chromium実導入、G10 browser evidence、bulk-3 receipt、finalize fail-closeを維持する"
contract_failures: "source退避欠落、対象外apt source変更、Chromium/G10 skip、導入失敗のtest failure偽装を許可しない"
tdd_red_required: true
red_at: "2026-09-10T02:51:25+09:00"
green_at: "2026-09-10T02:54:55+09:00"
mutation_oracle_evidence: "U-G10CHROMIUM-001はgoogle-chrome.listまたはgoogle-chrome.sourcesの各退避行を除去するmutation、およびPlaywright導入を退避前へ移すmutationを拒否する。実run 34382980036 attempt 2/3と34383205122 attempt 1では退避なしの経路が同じHash Sum mismatchでRedとなった。"
complexity_effect: net_neutral
complexity_justification: "bulk-3の既存導入step内で無関係なrunner sourceを限定退避し、新jobやretry engineを追加しない"
removal_trigger: "hosted runnerがGoogle Chrome apt sourceを同梱しなくなるかPlaywright側が無関係sourceを参照しない導入へ固定された時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [docs/plans/PLAN-L7-685-full-regression-shard-jobs.md]
  references: ["issue:1693", "pr:1683", "pr:1691"]
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-G10CHROMIUM-001, test_path: tests/harness-check-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1693-g10-chromium-apt-isolation.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: ci_workflow }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
review_evidence: []
---

# G10 Chromium導入のapt source隔離

## 目的

G10 browser evidenceに不要なGoogle Chrome apt repositoryのpublication raceが、Playwrightの
`--with-deps`内部で行われるapt updateへ混入してbulk-3全体を停止する経路を閉じる。

## 範囲

hosted runnerで既知のGoogle Chrome source 2形式だけをrunner tempへ移し、既存Playwright導入を続行する。
retry、skip、別browser、G10検査削減は導入しない。

## 残義務

- targeted workflow oracle、PLAN lint、fresh CIを実行する。
- bulk-3がChromium導入、G10 test、receipt生成まで完走することを実runで確認する。
- independent exact-HEAD review、merge/read-afterを閉じる。
