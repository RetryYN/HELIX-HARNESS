---
plan_id: PLAN-RECOVERY-1652-commitlint-pre-push
title: "PLAN-RECOVERY-1652: 非規約commit件名のpush前拒否"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
owner: Codex
created: 2026-09-08
updated: 2026-09-08
github_issue_id: 1652
behavior_contract_id: GIT-COMMITLINT-PRE-PUSH-001
responsibility_owner: git-command-guard
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: not_applicable
no_code_decision: configure
ddd_modeling_decision: policy
contract_preconditions: "既存commitlint判定器、repo-local Git hook、remote追跡refを照合する"
contract_postconditions: "push対象の新規commit件名をremote write前に既存判定器で拒否する"
contract_invariants: "CI判定、force-push拒否、履歴非破壊、正常なGit生成件名を維持する"
contract_failures: "不正件名、push identity不明、比較range不明をfail-closeする"
tdd_red_required: true
red_at: 2026-09-08T01:48:18Z
green_at: 2026-09-08T01:49:22Z
mutation_oracle_evidence: "tests/git-command-guard.test.ts::U-GITGUARD-021で@{push}解決を旧local branch既定へ戻したisolated detached worktreeが1 failed / 40 skipped（exit 1、2026-09-08T01:48:18Z）。復元済みcurrent treeで同oracleが1 passed / 40 skipped（exit 0、2026-09-08T01:49:22Z）となることを作成側が再採取。U-GITGUARD-018のgit -C cwd反例もtestへ保持する"
complexity_effect: net_neutral
complexity_justification: "既存hookと判定器を接続し、新しいlint engineやGit writerを作らない"
removal_trigger: "正規push wrapperが同じ事前検査を全consumerへ提供し、旧hook consumerがゼロになった時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md
pair_artifact: docs/test-design/helix/L7-commitlint-pre-push.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md, oracle_id: U-GITGUARD-016, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md, oracle_id: U-GITGUARD-017, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md, oracle_id: U-GITGUARD-018, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md, oracle_id: U-GITGUARD-019, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md, oracle_id: U-GITGUARD-020, test_path: tests/git-command-guard.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/commitlint-pre-push.md, oracle_id: U-GITGUARD-021, test_path: tests/git-command-guard.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1652
    - issue:1634
    - issue:1635
  blocks: []
generates:
  - { artifact_path: docs/design/helix/L6-function-design/commitlint-pre-push.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-commitlint-pre-push.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1652-commitlint-pre-push.md, artifact_type: markdown_doc }
  - { artifact_path: src/shared/commit-subject.ts, artifact_type: source_module }
  - { artifact_path: .helix/evidence/review-1652/vitest-git-command-guard.json, artifact_type: other }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard-hook.ts, artifact_type: source_module }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — push対象rangeを既存commitlintへ接続" }
  - { role: qa, slot_label: "QA — 実remoteで拒否・合法入力・mutationを検証" }
  - { role: aim, slot_label: "AIM — CI判定非緩和と履歴非破壊を照合" }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-08T01:32:48Z"
    tests_green_at: "2026-09-08T01:24:51Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 9867601a-a3ad-4369-980c-11757d63a7de
    reviewed_head_sha: 4d4f6c97cee619805d10688fb9aaaa9fd48b50de
    scope: "exact-HEAD evidence reviewは https://github.com/RetryYN/HELIX-HARNESS/pull/1660#issuecomment-5577733109 。portable JSON evidenceの実bytes digest、41 tests、machine-local path 0、PR scope expansion形式を判断側が照合し、approve / blockers 0 / important 0。full harness-check、実hook自動介入、main到達は未成立として除外する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/git-command-guard.test.ts --reporter=json --outputFile=.helix/evidence/review-1652/vitest-git-command-guard.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-08T01:24:51Z"
        evidence_path: .helix/evidence/review-1652/vitest-git-command-guard.json
        output_digest: "sha256:654be3bc1e1632d715cf0541ebf1e2aecf08b01d91ae00357996ee0137524319"
        result: "41 passed (1 file)"
---

# push前commitlint接続

Issue #1652で同じ非規約merge subjectが二度remoteへ送られ、公開履歴非破壊のためbranch／PR再作成が必要になった。
人間GOはIssue comment 5576844490に記録済みだが、実装・検収の完了を意味しない。

## 工程

1. 既存`guard commitlint`が不正subjectをexit 1、正当な二形式をexit 0にすることを実測した。
2. 共通Git hookで通常pushの実効cwd・source・remote baselineを解決する。
3. outgoing subjectだけを既存`analyzeCommitSubjects`へ渡す。
4. 実bare remoteを使い、不正subject拒否と正当な二形式の通過を検証する。
5. 独立review、fresh CI、merge admission、main read-afterを行う。

## 現在地

通常pushの初期実装後、独立監査で特殊pushの検査集合乖離を検出した。`--tags`／`--all`／`--repo`を
fail-closeし、`--mirror`／short option cluster内のforce／先頭`+`refspecをdestructive扱いへ追加した。
local名とupstream名が異なる合法pushは`@{push}`から解決する。局所41 testsは成功した。
`@{push}`解決を旧local名既定へ戻す隔離mutationではU-GITGUARD-021だけが失敗し、
`git -C`の実効cwdから不正subjectを拒否する反例もU-GITGUARD-018へ追加した。
独立review、full CI、main到達、実運用での不正push拒否は未完了。
