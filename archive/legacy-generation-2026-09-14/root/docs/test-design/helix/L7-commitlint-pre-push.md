---
title: "commitlint push受付 単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-08
updated: 2026-09-08
owner: Codex / QA
plan: docs/plans/PLAN-RECOVERY-1652-commitlint-pre-push.md
pair_artifact: docs/design/helix/L6-function-design/commitlint-pre-push.md
---

# commitlint push受付 単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GITGUARD-016 | 不正subject | 実bare remoteに対する小文字`merge:`をpush前に拒否する。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-017 | 合法subject | Conventional subjectとGit既定`Merge `subjectを許可する。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-018 | shell/cwd | `git -C`とnested shellからpushの実効cwd・引数を保持する。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-019 | identity fail-close | 複数refspecを推測で通さず、commitを送らないremote deleteは対象外にする。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-020 | 集合fail-close | `--tags`／`--all`／`--repo`で実送信集合と検査集合を乖離させない。 | `tests/git-command-guard.test.ts` |
| U-GITGUARD-021 | upstream identity | local名と異なるpush upstreamをGitの実効設定から解決する。 | `tests/git-command-guard.test.ts` |

検出呼出しを外すmutationではU-GITGUARD-016が失敗し、CI側commitlintの変更ではgreen化できないことを確認する。
