# Cursor Cloud Agent worker canary 実測証跡（2026-09-01）

## 0. scope authority

| 項目 | 値 |
|---|---|
| Issue | [#1287](https://github.com/RetryYN/HELIX-HARNESS/issues/1287)（**唯一の scope authority**） |
| behavior_contract_id | `CURSOR-CLOUD-AGENT-CANARY-001` |
| 目的 | Cursor Cloud Agent を HELIX 外部 worker 候補として 1 回 bounded 実測し、Issue scope → 専用 branch → PR → Codex local verification → Claude independent review の導線を検証する |
| 変更許可 | 本ファイル `docs/migration/cursor-cloud-agent-canary-2026-09-01.md` の新規 1 ファイルのみ |
| 変更禁止 | requirements、runtime、workflow、DB、CI、secret、credential、既存ファイル |

## 1. runtime / model

| 項目 | 値 |
|---|---|
| provider | Cursor Cloud Agent |
| run URL | https://cursor.com/agents/bc-6abb9412-2786-49e8-9ea0-bbc0634cbcf9 |
| bcId | `bc-6abb9412-2786-49e8-9ea0-bbc0634cbcf9` |
| run name | HELIX Cursor worker canary #1287 |
| source | `api` |
| Issue 指定 model | `composer-2.5` |
| run 記録 model | `composer-2.5-fast`（`cursor-cloud-run-info` が報告した `originalModelName`） |
| repository | `github.com/RetryYN/HELIX-HARNESS` |
| environment | Personal（`environmentPublicId`: `3becd7b5-a551-11f1-a7d1-d6b4613131ce`） |
| build | `no_finished_builds`（JIT 起動） |

## 2. git 基準点

| 項目 | SHA / 値 |
|---|---|
| candidate base（canonical main） | `f1fd9853885c37ef79aef179525601b2551371bf` |
| base commit message | `Merge pull request #1279 from RetryYN/docs/1206-verification-plan-terminal-closure` |
| 作業 branch | `cursor/helix-cursor-worker-canary-1287-a362` |
| worker 作業開始時 HEAD | `f1fd9853885c37ef79aef179525601b2551371bf`（base と同一） |
| resulting HEAD | `de0da4c34fb9fde11d11d7d635f1340a929ea54a` |

## 3. 遵守した AGENTS.md / CLAUDE.md ルール（要約）

作業前に `AGENTS.md` および `CLAUDE.md` を全文読了し、以下を遵守した。

1. **scope 拘束**: Issue #1287 が唯一の authority。許可された 1 ファイル以外は作成・編集しない。
2. **非 Codex ランタイム境界**（`AGENTS.md` §非 Codex エージェント）: Codex 専用の TL / hybrid commit 協調権限は継承しない。共通ルール（日本語報連相、docs 日本語、安全境界、破壊的 git 禁止、explicit path stage）のみ適用。
3. **main 直接操作禁止**: main への direct push、merge、release、publish、cutover は行わない（Issue PoC scope と一致）。
4. **provider session 非正本**: notification 本文および provider session を作業正本にしない。repo-owned sources（Issue、branch diff、本 canary 文書）を正本とする。
5. **secret / credential 境界**: secret、credential、PII を読み取らず、成果物へ書き込まない。
6. **ドキュメント言語**: `docs/` 配下の説明は日本語で記述（`AGENTS.md` / `CLAUDE.md` ドキュメント言語規約）。
7. **V-model authority**: current canonical は L1–L12。L0–L14 へ戻す変更や compatibility projection の混在は行わない。
8. **Git 規約**: Conventional Commits、`git add <path>` の explicit path stage のみ（`-A` / `.` 禁止）。
9. **PLAN 非作成**: PLAN ファイルは作成・編集しない（Issue 非対象）。
10. **requirements / runtime / CI / DB / config 非変更**: 該当 path 族への write を行わない。

## 4. 実施コマンドと結果

以下は本 canary セッションで **実際に実行した** read-only / write 前検証コマンドのみを記録する。未実行コマンドの成功は主張しない。

### 4.1 作業前（read-only）

| コマンド | exit | 結果要約 |
|---|---|---|
| `git fetch origin main && git log -1 --oneline origin/main && git branch -a && git status` | 0 | `origin/main` = `f1fd98538`、branch = `cursor/helix-cursor-worker-canary-1287-a362`、working tree clean |
| `git rev-parse HEAD && git rev-parse origin/main && git log -1 --format='%H %s' HEAD && git log -1 --format='%H %s' origin/main` | 0 | HEAD と `origin/main` が同一 SHA |
| `gh issue view 1287 --json title,body,url,state` | 0 | Issue OPEN、title = `test(orchestration): Cursor Cloud Agent worker canaryを実測する` |
| `gh pr list --head cursor/helix-cursor-worker-canary-1287-a362 --json number,url,state` | 0 | 既存 PR なし（`[]`） |
| `ls -la docs/migration/cursor-cloud-agent-canary-2026-09-01.md` | 2 | 対象ファイル未存在（新規作成前の確認） |
| `rg -l 'cursor-cloud-agent-canary-2026-09-01' .` | 0 | マッチなし |
| `rg -i '(api[_-]?key\|secret\|password\|token\|credential\|BEGIN (RSA \|OPENSSH )?PRIVATE)' docs/migration/` | 0 | 既存 migration 文書内の歴史的記述のみ（本 canary 新規ファイル外） |
| `date -u +"%Y-%m-%dT%H:%M:%SZ"` | 0 | `2026-08-31T15:33:29Z` |
| `cursor-cloud-run-info`（MCP） | — | bcId / branch / model / run URL を §1 に転記 |
| `cursor-cloud-environment-info`（MCP） | — | environment / build 情報を §1 に転記 |

### 4.2 作業後（read-only）

| コマンド | exit | 結果要約 |
|---|---|---|
| `git status --porcelain`（commit 直後） | 0 | 出力なし（clean） |
| `git rev-parse HEAD` | 0 | `de0da4c34fb9fde11d11d7d635f1340a929ea54a` |
| `git diff --name-only origin/main...HEAD` | 0 | `docs/migration/cursor-cloud-agent-canary-2026-09-01.md` のみ |
| `rg -c 'secret\|credential\|password\|api_key\|BEGIN PRIVATE' docs/migration/cursor-cloud-agent-canary-2026-09-01.md` | 0 | 5 件（すべて境界宣言・検証手順の prose。実 secret 値なし） |
| `git add docs/migration/cursor-cloud-agent-canary-2026-09-01.md && git diff --staged --stat` | 0 | staged 1 file / 107 insertions（初回 commit 前確認） |

CI 結果の read-after は PR 作成後に Codex / Claude レーンで実施する。

## 5. 明示宣言（canary 境界）

1. **provider session / notification は非正本**: Cursor Cloud Agent の chat session、dashboard notification、MCP 応答は作業 authority として扱わない。正本は Issue #1287、git diff、本証跡文書である。
2. **main 直接操作なし**: main への direct push、merge、release、publish、cutover は実施していない。作業は専用 branch のみ。
3. **secret 非接触**: repository 内の secret、credential、`.env`、private key、token ファイルを意図的に読み取らず、本証跡へも書き込んでいない。
4. **merge 保留**: 本 canary に伴う PR は **merge しない**。Codex local verification と Claude independent review 待ちである。

## 6. 受入条件トラッキング（Issue #1287）

| 受入条件 | worker 側状態 |
|---|---|
| AGENTS.md / CLAUDE.md 読了と遵守記録 | 本 §3 |
| 専用 branch で exactly one file 追加 | 完了（1 file / 107 lines） |
| PR 作成（merge しない） | PR 作成後に URL 追記 |
| PR が Issue / HEAD / runtime / model へ追跡可能 | PR body に記載 |
| Codex local verification | **未実施**（後続レーン） |
| Claude exact-HEAD 独立 review | **未実施**（後続レーン） |
| CI read-after / Cursor usage evidence | **PR 作成後 read-after** |

## 7. 関連 Issue

- #819（parent）
- #826、#861（related）

---

*本書は migration / verification evidence である。runtime state、requirements、または workflow の正本ではない。*
