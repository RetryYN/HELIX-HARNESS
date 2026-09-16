---
plan_id: PLAN-RECOVERY-17-pr-create-contract-fail-close
title: "PLAN-RECOVERY-17 (recovery): pr-create原子契約fail-close"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-06 Design HARNESS未ブロックタスクとして#381（pr-createが原子契約placeholderを残したままPRを作成し初回CIを無駄にredにする問題）を進める"
created: 2026-08-06
updated: 2026-08-06
owner: Claude / TL
github_issue_id: 381
engineering_discipline_required: true
behavior_contract_id: U-CPRCONV-001
responsibility_owner: claude-pr-convergence
change_slice: atomic
refactor_step: not_applicable
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: none
contract_preconditions: "pr-create --applyはPLAN metadataとchanged pathsからbody draftを生成する。changed PLANが1件でない等でatomic scopeを解決できない場合、templateのplaceholderが残る"
contract_postconditions: "apply直前にbodyの原子契約5フィールド（placeholder残存・空・行欠落）、Expected changed pathsとbase..head diffのexact set一致（canonical sort・順序非依存）、bare Closes #を検証し、違反があればPRを作成せずfail-closeする。作成成功後はread-after-GitHubで現物bodyを再検証し、違反があればok=falseで報告する"
contract_invariants: "解決可能な場合のcanonical値生成（既存動作）は変更しない。dry-run経路の出力契約とGithubPrCreateResultのschemaを変えない"
contract_failures: "placeholder残存、空フィールド、契約行欠落、exact set不一致、bare Closes #、作成後body読み戻し不能・drift をfail-closeする"
tdd_red_required: true
red_at: "2026-08-06T12:26:55Z"
green_at: "2026-08-06T12:57:50Z"
mutation_oracle_evidence: "tests/github-merge-readiness.test.ts::U-PRCREATE-381-002/003でplaceholder残存・空フィールド・契約行欠落・bare Closes #・exact set不一致の各mutationが対応violationを出し、順序違いのexact setは誤検知しないことを機械検査する"
complexity_effect: net_neutral
complexity_justification: "純粋なvalidate関数1つとapply前後の検証呼び出しだけを追加し、body生成・schema・CLI表面を増やさない"
removal_trigger: "CI側issue-closure-contract/pr-contextの検証がpr-create時点のpre-flightとしても呼べる共通契約に統合された時"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: tests/github-merge-readiness.test.ts
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-PRCREATE-381-002, test_path: tests/github-merge-readiness.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — PR #380 run 30849870062の無駄red経路の分離" }
  - { role: se, slot_label: "SE — validateAtomicContractBodyとapply前後検証" }
  - { role: qa, slot_label: "QA — placeholder/空/欠落/不一致mutationと順序非依存確認" }
  - { role: tl, slot_label: "TL — CI側contract検査との役割分担（pre-flight vs required gate）" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-17-pr-create-contract-fail-close.md, artifact_type: markdown_doc }
  - { artifact_path: src/audit/github-merge-readiness.ts, artifact_type: source_module }
  - { artifact_path: tests/github-merge-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/plans/PLAN-L7-473-claude-pr-convergence.md
review_evidence:
  - reviewer: "Claude code-reviewer subagent (intra-runtime)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-06T12:58:30Z"
    tests_green_at: "2026-08-06T12:57:50Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "Codex CLIがusage limit継続中のため規定代替のintra_runtime_subagentとして、Claude code-reviewer（claude-sonnet-5, read-only）が2ラウンドでレビューした。1回目（HEAD 876b3593）はrequest changes: Important 3件（--claude-converge dispatchがpost-create contract違反のok=falseで発火せず生きたPRが取り残される、runGithubPrCreate統合分岐のテスト欠如、同一契約フィールド重複行の未検知=CI側analyzePrContextとの非整合）。是正としてdispatch条件をok非依存化（exitCode非0で異常は通知）、read-after-GitHub検証を純関数verifyCreatedPrBodyへ抽出しU-PRCREATE-381-005で3分岐を直接検証、fieldValueをmatchAll化して重複行をfail-close（U-PRCREATE-381-004）。2回目はapprove（Critical/Important 0件）で、reviewerはdigest束縛3ファイルの再生成値をsha256sum実測・行番号実測と突き合わせて確認した。是正報告とdocコメントの記録乖離（Minor）は該当コメント追記で解消。残Minor=apply前early-returnのspawnSyncモック統合テスト未整備（検証済み純関数の単純分岐でありリスク低、非ブロッキング記録）。cli-surface全87中85 greenの残2 failは、既知のlocal Node 22 runtime rejectionと、confirm遷移のsnapshot commit前ギャップによる想定内red（commit後にU-OUTSTANDING-012単体green実測）。本PLAN receiptを含むcandidate HEADは自己参照させず、merge admissionはGitHub Actions required checkの同一HEAD full CIを外部receiptとする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/github-merge-readiness.test.ts tests/design-language.test.ts tests/review-evidence.test.ts tests/ci-governance-self-heal.test.ts tests/goal-evidence-audit.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-06T12:57:50Z", evidence_path: tests/github-merge-readiness.test.ts, output_digest: "sha256:954787699f36fc9331b90be5de1e111216166cd108c5941959c4a7495c1997d5", result: "review是正commit後worktree: 5 files / 77 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-06T12:57:50Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-RECOVERY-17: pr-create原子契約fail-close

## 根本原因

PR #380で`helix github pr-create --claude-converge --apply`が、PLAN metadataと21 changed pathsを
取得できていたにもかかわらず、原子契約5フィールドをtemplate placeholderのままGitHubへ作成した。
atomic scopeはchanged PLANが1件のときだけ解決され、解決不能時にfail-closeせず作成を続行するため、
初回required CIが`issue-closure-contract`で必ずredになり、手動body補完と再実行を要した
（run 30849870062 attempt 1）。

## 修復

`validateAtomicContractBody(markdown, changedPaths)`を追加し、apply直前に以下をfail-closeする。

- 原子契約5フィールドのplaceholder（`<!--`）残存・空値・行欠落
- `Expected changed paths`とbase..head diffのexact set一致（canonical sort比較で順序非依存、重複除去）
- bare `Closes #`（issue番号placeholder）

違反時はPRを作成せず`pr_body_contract_incomplete`をstderrへ返す。作成成功後は
read-after-GitHubで現物bodyを`gh pr view --json body`で読み戻して同じ検証を行い、
読み戻し不能は`pr_body_contract_unverified`、違反残存は`pr_body_contract_drift_after_create`として
`ok=false`で報告する。dry-run経路と解決可能時のcanonical値生成は変更しない。

## 非対象

- CI側`issue-closure-contract`／`pr-context`検証の変更（required gateはそのまま二重の安全網）
- atomic scope解決ロジック（changed PLAN 1件条件）の拡張
- PR body templateの変更
