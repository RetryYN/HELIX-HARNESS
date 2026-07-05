---
plan_id: PLAN-L7-230-destructive-git-command-guard
title: "PLAN-L7-230 (troubleshoot): hybrid destructive git command guard"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-142 は既存の hybrid Git Rules と Codex/Claude hook parity を機械強制へ落とす troubleshoot であり、新規 product requirement や外部 API contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L4-basic-design/architecture.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - hybrid Git workflow discipline and requirement alignment"
  - role: tl
    slot_label: "TL - hybrid destructive git operation guard"
generates:
  - artifact_path: docs/plans/PLAN-L7-230-destructive-git-command-guard.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/git-command-guard.ts
    artifact_type: source_module
  - artifact_path: .claude/hooks/git-command-guard.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: .claude/settings.json
    artifact_type: config
  - artifact_path: .codex/hooks.json
    artifact_type: config
  - artifact_path: src/lint/project-hook.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter-policy.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: docs/templates/adapter/.claude/settings.json
    artifact_type: config
  - artifact_path: docs/templates/adapter/.codex/hooks.json
    artifact_type: config
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/git-command-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/codex-hook-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-REVERSE-139-codex-hook-adapter.md
  requires:
    - docs/improvement-backlog.md
    - docs/design/harness/L4-basic-design/architecture.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
---

# PLAN-L7-230: 破壊的 git command guard（destructive git command guard）

## 0. 目的

hybrid runtime では Claude と Codex が同じ repository 上で別々に commit / push する。IMP-142 は、
一方の runtime がもう一方の commit 済み成果を foreign 変更または overstep と誤認し、`git reset`、
`git checkout`、`git revert`、force push で破壊し得る穴を扱う。

この slice の目的は、運用注意だけに依存していた Git Rules を hook と consumer setup template へ落とし、
destructive git operation を理由付き override なしに fail-close することである。

## 1. スコープ（Scope）

対象:

- `src/runtime/git-command-guard.ts` に shell command payload の抽出、destructive git 判定、override 判定を実装する。
- `helix hook git-command-guard` と `.claude/hooks/git-command-guard.ts` を追加し、Claude `Bash` と Codex
  `exec_command|local_shell` の双方から同じ判定を使う。
- `.claude/settings.json` / `.codex/hooks.json` / setup template / consumer doctor baseline に guard を配布する。
- `project-hook` と `codex-hook-adapter` gate が guard 欠落を fail-close する。
- `AGENTS.md` / `CLAUDE.md` の hybrid Git Rules に「相手 runtime の commit を破壊しない」規律を明文化する。

対象外:

- 既存履歴の rewrite、branch 分離戦略、force push policy の変更。
- GitHub branch protection / rulesets の remote apply。これは action-binding approval の対象であり、本 slice では扱わない。

## 2. 受入条件

- `git reset`、destructive `git checkout`、`git restore`、`git revert`、`git push --force` /
  `--force-with-lease` は hook で exit 2 になる。
- `git status`、`git diff`、`git log`、通常 `git push`、`git checkout -b` は通常 workflow を阻害しない。
- `.helix/state/destructive-git-override` は非空理由を持つ場合だけ one-shot bypass になり、
  `.helix/logs/destructive-git-overrides.jsonl` に audit を残す。
- direct Claude / direct Codex / consumer setup template / consumer doctor baseline のすべてで guard が配布・検査される。

## 3. テスト設計接続

対応 oracle は `docs/test-design/harness/L7-unit-test-design.md` の `U-GITGUARD-001` と
`U-GITGUARD-002`。実テストは `tests/git-command-guard.test.ts` に ID citation を持ち、
hook parity は `tests/codex-hook-adapter.test.ts`、setup 配布は `tests/setup.test.ts`、
consumer doctor baseline は `tests/doctor.test.ts` で固定する。

## 4. 完了条件

- [x] runtime 判定と CLI / hook entrypoint が実装されている。
- [x] Claude / Codex hook と consumer setup template が guard を含む。
- [x] U-GITGUARD oracle が実テストに citation されている。
- [x] `doctor` の impl-plan-trace / oracle-test-trace が本 PLAN とテスト citation を追える。
