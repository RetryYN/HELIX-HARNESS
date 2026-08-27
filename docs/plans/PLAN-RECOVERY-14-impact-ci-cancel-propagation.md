---
plan_id: PLAN-RECOVERY-14-impact-ci-cancel-propagation
title: "PLAN-RECOVERY-14 (recovery): Impact CI cancellation伝播"
kind: recovery
layer: cross
drive: agent
status: confirmed
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
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: configure
ddd_modeling_decision: none
contract_preconditions: "full admissionがbulkとstatefulの2 laneをbackground起動しwaitで集約する。runner cancelはstep shellへINT/TERMを送る"
contract_postconditions: "TERM/INT受信時に両lane process groupをboundedに停止し、detached worktree cleanupを完了し、cancellation receipt（signal・latency・課金時間）を残す"
contract_invariants: "正常終了経路のlane status fail-close集約・full exact inventory・2 lane並列を変更せず、timeout延長・test除外・retry・job/runner追加を行わない"
contract_failures: "TERM/INT trap欠落、process group宛signal欠落、KILL escalation欠落、cancel時cleanup欠落、receipt欠落、cancel exitの0偽装をworkflow oracleで拒否する"
tdd_red_required: true
red_at: "2026-08-05T23:47:04Z"
green_at: "2026-08-06T02:25:58Z"
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-003でTERM/INT trap除去、group宛kill除去、KILL escalation除去、cancel時cleanup除去、receipt除去、exit 143の0置換、正常経路trap解除の除去の各mutation（7カテゴリ8件）がcancel_propagation_invalidとなりRedへ戻る。正常経路trap解除はhandler内trap - TERM INT EXITとの部分文字列衝突を避けるためwait以降の領域で判定する"
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
  - { artifact_path: tests/impact-ci-recovery-detail-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
    - docs/plans/PLAN-RECOVERY-11-impact-ci-stateful-deadline.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T02:27:00Z"
    tests_green_at: "2026-08-06T02:25:58Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit（2026-08-08まで利用不可、byl4isxc3実行証跡）のためcross-runtime reviewを実施できず、規定代替のintra_runtime_subagentとしてClaude code-reviewer（claude-sonnet-5, read-only）が2026-08-06T00:05Z頃にmaterial implementation HEAD 6f2b6d4c06a601b8d4fb1c9e4483e3738b416437をadversarial review した。verdictはrequest changes 1件（正常経路trap - TERM INTの削除mutationがhandler内trap - TERM INT EXITとの部分文字列衝突で恒真となるoracle穴。reviewerはboundedTimeViolations等価ロジックのNode複製と該当行除去mutantで非Redを実測）で、wait以降領域判定への修正と正常経路trap解除欠落mutation追加で解消した。Minor所見（trap設置前の極小窓、二重signal時のreceipt重複、mutation件数表記）はPLAN非対象節と表記修正で反映済み。修正後suite green（CI rerunで検出したL8 oracle件数pair test U-IMPACTCI-DESIGN-006の14件更新とgreen_commands時刻整合もself-healとして本evidenceへ反映）、typecheck exit 0、reviewerはbash EXIT trap発火・nested trap再入・process group停止の実測実験も実施した。本PLAN receiptを含むcandidate HEADは自己参照させず、merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/harness-check-workflow.test.ts tests/goal-evidence-audit.test.ts tests/design-language.test.ts tests/review-evidence.test.ts tests/impact-ci-recovery-detail-design.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T02:25:58Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:8574a12bb19369cf543ca02c09268ef2d083d31fcc5d3030d700f203ab947f0d", result: "CI red self-heal反映後worktree: 5 files / 99 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T02:25:40Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
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

- `tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-003`が正例と8 mutation反例（7カテゴリ）を機械検査する。
- local shell simulationで、2 background lane（子process含む）へのTERM送出後1秒で両process groupが
  停止し、exit 143で孤児processが残らないことを確認した（2026-08-06 JST）。

## 非対象（cancel経路の既知極小残余含む）

- lane pid確定からtrap設置までの1命令未満の極小窓でのsignal到達（既存EXIT trapによるworktree cleanupは維持される）
- 同一signalの二重配送時にcancellation receiptがstep summaryへ重複追記される可能性（exit非0は維持され、pass/fail判定に影響しない）
- 同一HEADのDraft/Ready遷移における重複full admission抑止（#93の別スライス）
- body-only是正時のtest receipt再利用
- #388のstateful deadline（`nice -n 10`）変更

## 訂正・後継（2026-08-27）

本PLANが固定した同一step内のTERM/INT trap、process group停止、local cancellation receiptは、
独立GitHub Actions job DAGへ移行した現行workflowの契約ではない。GitHub Actions jobの
cancel／timeout／起動失敗は成功receiptを生成できず、finalizeのreceipt exact set検証で
fail-closeする。`U-IMPACTCI-WF-003` と本PLANの過去evidenceは履歴としてのみ保持し、
local process-group signal伝播の現行実装を証明するものとして扱わない。
現行の後継は `PLAN-L7-685-full-regression-shard-jobs` である。
