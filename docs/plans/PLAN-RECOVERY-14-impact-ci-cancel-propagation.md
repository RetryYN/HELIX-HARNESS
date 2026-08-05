---
plan_id: PLAN-RECOVERY-14-impact-ci-cancel-propagation
title: "PLAN-RECOVERY-14 (recovery): Impact CI cancellation伝播"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 #93 CI高速化を優先する。2026-08-04観測のgh run cancel成功応答後もrequired harness-checkが継続する未伝播をRecoveryする"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: configure
ddd_modeling_decision: none
contract_preconditions: "full admissionがbulkとstatefulの2 laneをbackground起動しwaitで集約する。runner cancelはstep shellへINT/TERMを送る"
contract_postconditions: "TERM/INT受信時に両lane process groupをboundedに停止し、detached worktree cleanupを完了し、cancellation receipt（signal・latency・課金時間）を残す"
contract_invariants: "正常終了経路のlane status fail-close集約・full exact inventory・2 lane並列を変更せず、timeout延長・test除外・retry・job/runner追加を行わない"
contract_failures: "TERM/INT trap欠落、process group宛signal欠落、KILL escalation欠落、cancel時cleanup欠落、receipt欠落、cancel exitの0偽装をworkflow oracleで拒否する"
tdd_red_required: true
red_at: "2026-08-05T23:47:04Z"
green_at: "2026-08-05T23:47:37Z"
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-003でTERM/INT trap除去、group宛kill除去、KILL escalation除去、cancel時cleanup除去、receipt除去、exit 143の0置換の各mutationがcancel_propagation_invalidとなりRedへ戻る"
complexity_effect: net_neutral
complexity_justification: "既存2 lane構造とfail-close集約を変えず、cancel経路のsignal handler 1つとreceipt出力だけを追加し、workflow/job/dependencyを増やさない"
removal_trigger: "GitHub Actions runnerがstep子process groupへのcancel伝播とcleanup保証をnativeに提供し、同一oracleでhandler無しでもbounded停止が証明された時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-003, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — cancel未伝播の観測とlane process group原因分離" }
  - { role: se, slot_label: "SE — set -m＋TERM/INT handlerの最小workflow修正" }
  - { role: qa, slot_label: "QA — trap/kill/receipt除去mutationと正常経路不変確認" }
  - { role: tl, slot_label: "TL — Recovery境界（#388 stateful deadlineとの分離）" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-14-impact-ci-cancel-propagation.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
    - docs/plans/PLAN-RECOVERY-11-impact-ci-stateful-deadline.md
review_evidence: []
---

# PLAN-RECOVERY-14: Impact CI cancellation伝播Recovery

## 根本原因

Issue #93の2026-08-04観測で、run `30876565411` attempt 3とrun `30879207320`は`gh run cancel`の
成功応答後もrequired `harness-check`が長時間`in_progress`を継続した。full admissionの全回帰stepは
bulk/stateful laneをbackground subshellで起動して`wait`するが、runnerのcancel signalはstep shellにしか
届かず、lane配下のvitest/CLI子processへ伝播しないため、Vitest process終端までconcurrency slotと
課金時間を占有し続ける。

## 修復

full分岐で`set -m`によりlaneごとに独立process groupを作り、TERM/INT trapで両groupへ`kill -TERM`を送る。
最大20秒のbounded waitの後に`kill -KILL`へescalationし、detached worktree cleanupを完了してから
cancellation receipt（signal・cancel epoch・stop latency・課金step秒）を`GITHUB_STEP_SUMMARY`へ残し、
signalに対応する非0 status（TERM=143 / INT=130）で終了する。正常終了経路はtrapを解除してから既存の
lane status fail-close集約をそのまま使い、timeout延長・test除外・retry・job/runner追加は行わない。

## 検証

- `tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-003`が正例と6 mutation反例を機械検査する。
- local shell simulationで、2 background lane（子process含む）へのTERM送出後1秒で両process groupが
  停止し、exit 143で孤児processが残らないことを確認した（2026-08-06 JST）。

## 非対象

- 同一HEADのDraft/Ready遷移における重複full admission抑止（#93の別スライス）
- body-only是正時のtest receipt再利用
- #388のstateful deadline（`nice -n 10`）変更
