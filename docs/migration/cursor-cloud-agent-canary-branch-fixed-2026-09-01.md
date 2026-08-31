# Cursor Cloud Agent canary 実測証跡（Attempt 2 / branch-fixed）

status: worker-authored evidence（外部 receipt 待ち）

## 概要

Issue #1287（Attempt 2 authority addendum）に従い、Cursor Cloud Agent を HELIX 外部 worker 候補として bounded 実測した。Attempt 1 で観測した HELIX 発行 branch 固定と成果物内 self-HEAD 記録禁止の修復再試行である。

## Issue authority

- Issue: https://github.com/RetryYN/HELIX-HARNESS/issues/1287
- behavior_contract_id: `CURSOR-CLOUD-AGENT-CANARY-001`
- parent_issue: 819
- related: 826, 861

## 実行条件

| 項目 | 値 |
| --- | --- |
| runtime | Cursor Cloud Agent |
| 要求 model | `composer-2.5` |
| HELIX 発行 branch | `docs/1287-cursor-cloud-agent-canary-2` |
| base | canonical main |
| 変更許可 | 本ファイル（`docs/migration/cursor-cloud-agent-canary-branch-fixed-2026-09-01.md`）の新規 1 ファイルのみ |
| commit 方針 | exactly one authored commit を目標 |

## 遵守した rules

作業前に `AGENTS.md` および `CLAUDE.md` を読み、以下を遵守した。

- **write scope 固定**: 許可された新規 1 ファイルのみ追加。requirements、runtime、CI、DB、config、既存ファイル、secret、credential は変更しない。
- **branch 固定**: HELIX 発行 branch `docs/1287-cursor-cloud-agent-canary-2` を使用。`cursor/*` branch の作成・rename・切替は行わない。
- **非 Codex ランタイム境界（AGENTS.md）**: Codex 専用の hybrid commit 協調・正規 merge レーンは継承しない。canary 指示で許可された push と draft PR 作成のみ実施。merge は行わない。
- **ドキュメント言語**: `docs/` 配下の説明は日本語で記述。
- **git 規則**: 破壊的 git 操作は行わない。stage は明示 path のみ（`git add <path>`）。
- **PLAN 非作成**: PLAN ファイルは作成・編集しない。
- **外部 receipt 分離**: candidate HEAD、resulting HEAD、PR 番号、provider session ID、token usage、cost は成果物へ自己記録しない（後述）。

## 外部 receipt 責務（worker 非記載）

以下の identity は HELIX が commit 後に外部 read-after で seal する。本 worker は成果物へ記録しない。

- candidate HEAD / resulting HEAD
- PR 番号
- provider session ID
- token usage / cost
- CI 結果の最終確定値

## 実行した read-only コマンド（作業前）

```bash
git branch --show-current && git status --short && git log -1 --oneline
gh issue view 1287 --json title,body,labels
git branch -a | rg '1287|canary'
```

branch 確認結果: 作業開始時点で `docs/1287-cursor-cloud-agent-canary-2` に checkout 済み。working tree は clean。

## 実行した read-only 検査（commit 前）

```bash
git diff --name-only
git diff --cached --name-only
git status --short
rg -n '(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}|BEGIN (RSA |OPENSSH )?PRIVATE KEY)' docs/migration/cursor-cloud-agent-canary-branch-fixed-2026-09-01.md || true
```

期待: diff は本ファイル 1 件のみ。secret pattern ヒット 0 件。

## 後続ゲート（未完了）

- **Codex local verification**: PR を local worktree へ同期し、scope・diff・secret・rules を検収する（pending）。
- **Claude independent review**: exact-HEAD 独立レビューを実施する（pending）。
- **merge**: 実施しない（draft PR のみ）。

## worker 完了宣言

許可 scope 内で新規 1 ファイルを追加し、draft PR 作成まで完了した。Codex local verification と Claude independent review は HELIX 正規レーンへ引き渡し、本 worker の bounded 作業はここで終了する。
