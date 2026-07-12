# 品質改善第 4 巡 sweep 記録（2026-07-12）

PO 指示「品質改善は？」を受けた品質専用レビュー。基準 = origin/main `616720ac`。
構成: 6 視点（重複 / 簡素化 / 境界 / テスト品質 / 性能 / エラー処理）の並列 finder →
所見ごとに実在反証 + 既出照合の 2 verifier（多 agent workflow、計 90 agents 起動）。

結果: 所見 42 件 → 敵対検証を完走して確定 8 件（Q1〜Q8、全て重複・乖離クラスタ）。
検証フェーズ途中で月間利用上限に到達し 68 agents が失敗、**30 件が未検証（棄却ではない）**のまま残った。
未検証分のうち高価値 3 件は Claude が実測でインライン検証して確定へ昇格（C1〜C3）。
確定 11 件の詳細と対応は `docs/plans/PLAN-L7-433-quality-sweep4-improvements.md` を正本とする。

## 1. 確定所見（機械敵対検証済み 8 件）の検証記録

各件とも「実在反証 verifier（該当ファイルを行単位照合）」と「既出照合 verifier
（improvement-backlog + PLAN-L7-425/428/431/432 + 両 sweep annex を照合）」の両方を通過した。
evidence の要点は PLAN 本文に転記済み。verifier の生 verdict は workflow 記録
（run `wf_8a0c472e-2c0`、session-local）にあり、repo には本 annex の要約を残す。

| # | impact | 所見 | 位置 |
| --- | --- | --- | --- |
| Q1 | high | `markdownFrontmatter` が 8 箇所複製、CRLF 許容性が 4 系統に分裂（doctor 版は consumer の CRLF checkout で誤 violation） | `src/doctor/index.ts:5430` ほか 7 箇所 |
| Q2 | medium | `isSqliteBusy` 三重複 — job-queue 版のみ node:sqlite の `database is locked` を検知しない | `src/orchestration/job-queue.ts:63` |
| Q3 | medium | readiness 系 gate の PLAN 読込（readdirSync+parsePlan）が 18 箇所で構造重複、filter 述語 3 系統 | `src/lint/action-binding-approval-readiness.ts:204` ほか |
| Q4 | medium | frontmatter スカラー読取りが shared `fmValue` と別に 4 実装、quote/comment 解釈が乖離 | `src/state-db/projection-writer.ts:459` ほか |
| Q5 | low | `readRepoHeadSha` ×3 / `readPackageVersion` ×3 複製、version-up 版のみ sha 形式検証欠落 | `src/lint/version-up-readiness.ts:911` ほか |
| Q6 | low | `shellQuote` 完全同一コピー ×3（quoting の将来乖離リスク） | `src/cli.ts:663` ほか |
| Q7 | low | 再帰 markdown/file walk 7+ 実装、posix 正規化の有無が乖離（Windows で path 区切り不一致） | `src/lint/readability.ts:94` ほか |
| Q8 | low | micro util 共通化漏れ: `isRecord` ×12（1 箇所は配列通過の乖離）/ `nowIso` ×5 / `escapeRegExp` ×4 / `uniqueSorted` ×4 | `src/state-db/test-report-parser.ts:329` ほか |

## 2. Claude インライン検証で確定した 3 件（C1〜C3）

- **C1（high・契約バグ）**: consumer 配布 hook 契約が実在しない `helix hook work-guard` を配線。
  実測: `src/setup/templates.ts:229,326` と `src/setup/index.ts:183,214` が同 command を宣言する一方、
  `src/cli.ts:3417` の hook group の subcommand は `agent-guard` / `git-command-guard` /
  `post-tool-use` / `subagent-stop` のみで、`bun src/cli.ts hook work-guard` は
  `error: unknown command 'work-guard'` を返す。
- **C2（medium・三面不一致）**: agent-guard の matcher が dev repo `.claude/settings.json` では
  `"Agent"` のみ、policy 正本 `src/runtime/agent-guard-policy.ts:60` は `{Agent, Task}`、
  consumer template `src/setup/templates.ts:213` は `"Agent|Task"` — 三面で不一致。
- **C3（medium・構造）**: `computeOutstandingWork()` の呼び出しが src 内 13 箇所（定義除く、実測 grep）で
  共有 snapshot なしに独立再計算される。加えて `src/cli.ts` 12,463 行 / `src/doctor/index.ts` 7,150 行
  （実測 wc）の monolith に複数 finder 視点が独立に到達した。

## 3. 未検証残 30 件（検証中断 — 棄却ではない）

月間利用上限による検証中断のため、以下は**実在・既出の判定が未了**。着手時は 1 件ずつ検証してから
採否を記録する（無検証のまま実装しない）。既出疑いの注記付き。

| lens | 所見（タイトル） | 備考 |
| --- | --- | --- |
| simplification | runFullDoctor の 3 重ボイラープレートと未活用の check registry | |
| simplification | completion-decision-packet.ts と outstanding.ts の packet schema 期待値表の完全重複 | |
| simplification | buildProjectCurrentLocationView が単一 1,572 行関数 | C3 と同族 |
| simplification | cli.ts 12,463 行 / 204 command の単一ファイル monolith と型の二重記述 | 行数は C3 で実測済み |
| simplification | lint 群の小 utility 重複と既に発生している実装 drift | Q8 と重複の可能性 |
| duplication | markdown テーブルパーサが 6 つの lint モジュールへ copy-paste | |
| simplification | runtime-capability-matrix.ts の unsupported 全項目ブロック 3 連重複 | |
| simplification | ProjectCurrentLocationView (1,430 行 interface) の無名 inline 化 | |
| boundaries | cli.ts にドメインロジックが埋没（export なし・直接テスト不能） | C3 と同族 |
| boundaries | doctor/index.ts 7,150 行 + check-registry 形骸化（125 check 直列封入） | C3 と同族 |
| boundaries | state-db ⇄ vscode のモジュール間相互依存（両 gate とも検出不能） | |
| boundaries | 循環依存 grandfather baseline の陳腐化（12 件中 4 件解消済み残存） | |
| boundaries | src/lint に file-write / 長時間プロセス実行の端点が混入 | |
| boundaries | module-boundary / no-circular-dependency gate が re-export と dynamic import を追跡不能 | PLAN-L7-428 W2 と同族の可能性 |
| boundaries | source-boundary matrix は 30 module 中 27 が EMPTY_BOUNDARY | |
| test-quality | work-guard の one-shot marker が非 foreign 編集でも消費される欠陥を negative test 欠落が隠す | PLAN-L7-431 S4 既出の可能性大 |
| test-quality | git-command-guard の override marker が安全コマンドで燃える | PLAN-L7-431 S4 既出の可能性大 |
| test-quality | git-command-guard の bypass 回避経路（push -f 短形 / git -C / 複合 / quote）未 test | PLAN-L7-431 S1 と要突合 |
| test-quality | temp-repo / PLAN fixture / CLI spawn ヘルパの大量重複 | |
| test-quality | git clean / branch -D / stash drop の判定 fence 欠落 | |
| test-quality | schemaDdl determinism テストが自己比較トートロジー | |
| performance | doctor 1 実行で docs/plans 638 files を gate ごと独立再読込 | Q3 の共有 loader で同時解決可 |
| performance | plan-entry-routing が plan file ごとに harness.db を open/close | インライン grep では未裏取り |
| performance | 全 519 TS files が 1 doctor run 内で 4 回フルパース | |
| performance | buildIdentifierRenameCutoverPlan が毎 doctor run で full-repo audit | |
| performance | checkCompletionReviewBundle が bridgeDeps 未注入で input を再構築 | |
| performance | computeOutstandingWork の独立再計算 | C3 で確定済み |
| performance | vpair gate が test file ごとに ts.createProgram を生成 | |
| error-handling | doctor gate の匿名 catch が例外原因を全破棄 | |
| error-handling | autonomous loop state の非 atomic 書込みと破損時 silent reset | |
| error-handling | agent-guard hook matcher "Agent" のみ問題 | C2 で確定済み |
| error-handling | marker bypass の audit 書込失敗が握りつぶされる | |

（注: 表は rejectedSummary の 34 件から、C1〜C3 で確定昇格した項目と PLAN-431 S4 同一と判定済みの重複行を
整理した実質 30 件。原本 42 件の生データは workflow run `wf_8a0c472e-2c0` の journal にある。）
