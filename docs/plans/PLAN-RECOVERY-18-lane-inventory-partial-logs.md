---
plan_id: PLAN-RECOVERY-18-lane-inventory-partial-logs
title: "PLAN-RECOVERY-18 (recovery): lane inventory恒等性と部分ログfail-close"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#352（bulk＋stateful laneが全テストinventoryと一致する保証、部分ログ出力、共有.git干渉の整理）を進める"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL
github_issue_id: 352
engineering_discipline_required: true
behavior_contract_id: U-IMPACTCI-WF-002
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "full admission laneはIMPACT_CI_TEST_FILESからbulkを導出し、cli-surfaceとslow projectをstateful laneで実行する。lane出力はlogへバッファされ終了後にcatされる"
contract_postconditions: "lane起動前にbulk ∪ {cli-surface} ∪ slow配下tracked testsがgit tracked全test inventoryと恒等であることをassertし、不一致ならlaneを起動せずfail-closeする。cancel/timeout時はterminate_lanesが両lane logのtailをkill後・receipt前に出力する"
contract_invariants: "lane分割・並列実行・fail-close集約・cancellation receipt・transition reuse経路の既存挙動を変えない。恒等assertはgreen時に出力へノイズを足さない"
contract_failures: "lane unionとtracked test inventoryの不一致、cancel時の部分ログ欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-08-06T14:01:45Z"
green_at: "2026-08-06T14:02:24Z"
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-005のit.each mutationで、恒等assertの削除・union成分（cli-surface/slow）の欠落・不一致時fail-close文言の削除・tail出力の削除・receipt後への移動が各violationを出すことを機械検査する"
complexity_effect: net_neutral
complexity_justification: "既存regression stepのshellへassertブロックとhandler内tail出力だけを追加し、step・job・CLI表面を増やさない"
removal_trigger: "lane分割がvitest shard等のrunner管理機構へ置換され、coverage恒等性がツール側で保証された時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: tests/harness-check-workflow.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-005, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — Issue #352 §1/§3 の hardening 分離" }
  - { role: se, slot_label: "SE — inventory恒等assertとterminate_lanes部分ログ" }
  - { role: qa, slot_label: "QA — 恒等assert/tail出力のmutation oracle" }
  - { role: tl, slot_label: "TL — 共有.git干渉監査の判定と lane 配置" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-18-lane-inventory-partial-logs.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T14:24:30Z"
    tests_green_at: "2026-08-06T14:21:28Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目はrequest changes: Important 1件（mutation_oracle_evidenceがciteする『tail出力のreceipt後への移動』mutationがit.eachに実在せず、PLAN claim discipline違反）。是正としてit.eachへ当該mutationケースを追加（tail blockをregex抽出しreceipt末尾直後へ移動、partial_lane_log_invalidを期待）し、reviewerは単体フィルタ実行green・mutationの実変更性（非vacuous）を独立に確認した。Minorのartifact_typeはworkflow_configへ統一。2回目はapprove（Critical/Important 0件）。残Minor（process substitution内失敗のset -e非伝播=既存idiom踏襲で下流の恒等比較がfail-closeに到達、handlerBody sliceロジックの重複=既存スタイル踏襲）は非ブロッキング記録。恒等assertはreviewer側でも独立に実測され366 fileでIDENTITY_OK、workflow shellはyaml抽出+bash -nで構文検査済み。§2の共有.git干渉監査はintra-runtime subagent（pmo-project-explorer）が実git commandを発行する全30 fileを検査し、repo自身の共有.gitへ書き込みうるtestは0件・現行lane配置で安全と判定した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/harness-check-workflow.test.ts tests/design-language.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T14:21:28Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:fbfd3ace47f72f3ecafec110ad77fa3256caaf35461753bf25a0b4acbe494185", result: "review是正後worktree: 3 files / 98 tests passed（U-IMPACTCI-WF-005本体+mutation 8件を含む）" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T14:21:26Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-RECOVERY-18: lane inventory恒等性と部分ログfail-close

## 根本原因（Issue #352）

PR #351のisolated lane分割は現状coverage等価だが、次の構造的リスクが残る。

1. §1: bulk laneは`IMPACT_CI_TEST_FILES`から導出され、full profileへ将来deferralが入ると
   full回帰がsilentに縮小する。`bulk_files`の空チェックだけでは検出できない。
2. §3: lane出力は`$RUNNER_TEMP/*.log`へバッファされ`wait`後にまとめて`cat`される。
   job timeout・cancel時に何も出力されず失敗原因を切り分けられない。
3. §2: 2 laneはlinked worktreeで`.git`を共有し、repo自身のgit stateを書き換えるtestが
   あればcross-lane干渉で flaky 化しうる（監査で確定させる）。

## 修復

- §1: lane起動前に `bulk_files ∪ {tests/cli-surface.test.ts} ∪ git tracked tests/slow/**` が
  `git ls-files` の全tracked test inventoryと恒等であることをassertし、不一致は差分を出して
  laneを起動せず `exit 1`（fail-close）。
- §3: `terminate_lanes` がkill完了後・cancellation receipt前に両lane logの
  `tail -n 100` を出力し、cancel/timeout時にも部分ログで切り分け可能にする。
- §2: tests/ 配下のrepo直git write監査を実施した（intra-runtime subagent
  pmo-project-explorer、2026-08-06）。実git commandを発行する全test（30 file）は例外なく
  `mkdtempSync(tmpdir())` 隔離fixtureをcwdに渡しており、`process.cwd()`（実worktree）を参照する
  少数箇所は `git ls-files` / `git check-ignore` / `git rev-parse` / `git show` /
  `git clone --shared` のsource参照などのread-onlyに限られる。**共有 .git へ書き込みうる test は
  0 件で、現行 lane 配置のままで安全**と判定した（詳細はIssue #352のevidenceコメント）。

## 非対象

- lane分割・profile決定ロジック（computeImpactDecision）の変更
- cancellation伝播（PLAN-RECOVERY-14）・transition reuse（PLAN-RECOVERY-15）の変更

- vitest project構成の変更
