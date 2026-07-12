---
plan_id: PLAN-L7-433-quality-sweep4-improvements
title: "PLAN-L7-433 (troubleshoot): 品質改善第4巡 — 重複・乖離の解消 / 配布 hook 契約バグ / 構造債務"
kind: troubleshoot
layer: L7
drive: agent
status: draft
route_mode: incident
entry_signals:
  - "po_directive:2026-07-12 PO 指示「品質改善は？」— 品質専用の第 4 巡 sweep (6 視点並列 finder + 所見ごとの実在反証・既出照合 verifier、90 agents)。42 所見中、敵対検証完走 8 件 + Claude インライン実測 3 件の計 11 件を確定起票。検証途中で利用上限に到達した未検証 30 件は annex に留保"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存実装内の重複・乖離解消 (behavior-invariant な共通化 + 片側バグの是正) と、既宣言契約への実装追随 (C1/C2) であり、上位要求・設計の意味変更はない。分割方針など設計判断が要る項目 (C3) は L5 判断を経て、契約変更が要ると判明した時点で個別 backprop を判断する。"
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot 分類の妥当性と C1 (配布 hook 契約) の優先度・是正方向の判定"
  - role: se
    slot_label: "SE — 共有 util 集約 / hook subcommand 実装 / matcher 整合の実装"
  - role: qa
    slot_label: "QA — 挙動変化を伴う統一 (Q1/Q2/Q4/Q5/Q8) の回帰 fence と既存 gate 非退行の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-433-quality-sweep4-improvements.md
    artifact_type: markdown_doc
  - artifact_path: docs/reference/quality-sweep4-2026-07-12.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/consumer-hook-command.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-433: 品質改善第4巡の改善点

## 背景

2026-07-12 の PO 指示「品質改善は？」に基づく品質専用の第 4 巡点検（基準 = origin/main `616720ac`）。
6 視点（重複 / 簡素化 / 境界 / テスト品質 / 性能 / エラー処理）の並列 finder が 42 所見を出し、
所見ごとに「実在反証」+「既出照合」の 2 verifier をかけた。検証を完走して確定した 8 件（Q1〜Q8）に、
検証中断分から Claude が実測でインライン確定した 3 件（C1〜C3）を加えた **計 11 件**を起票する。
検証フェーズ途中で月間利用上限に到達したため、**未検証 30 件は棄却ではなく留保**として annex
`docs/reference/quality-sweep4-2026-07-12.md` §3 に列挙した（無検証のまま実装しない）。

第 1〜3 巡（PLAN-L7-425 / 428 / 431 / 432）と improvement-backlog の既出事項は verifier が照合済み
（例: PLAN-L7-431 H1 の sha256 重複、S4 の marker 消費は本 PLAN から除外）。

## クラスタ D: 重複・乖離の解消（機械敵対検証済み Q1〜Q8）

共通の性質: 同一機能の複製に**片側だけ修正が入って乖離**しており、単なる整理ではなく
「どちらかにバグが残っている」状態。統一先（正本）は各項に明記した。

### Q1: `markdownFrontmatter` 8 箇所複製、CRLF 許容性が 4 系統に分裂（high）

- 事象: 同名関数が 8 箇所（`src/lint/branch-kind.ts:186`、`src/lint/skill-assignment.ts:82`、
  `src/plan/lint.ts:152`、`src/lint/plan-descent.ts:72`、`src/state-db/projection-writer.ts:483`、
  `src/doctor/index.ts:5430`、`src/lint/plan-entry-routing.ts:69`、`src/assets/catalog.ts:57`）。
  実装は 4 系統に分裂し、doctor 版は `startsWith("---\n")` で CRLF 不許容。doctor 版は
  `runConsumerDoctor`（同 5716-5723）の consumer `.claude/agents/*.md` 検査に使われるため、
  CRLF checkout の consumer で frontmatter が null になり template を誤 violation 判定する
  （Native Windows first-class 方針と矛盾）。`src/lint/shared.ts` 冒頭の A-120「frontmatter 単一正本化」
  宣言に対し block 抽出はコピペのまま。
- 対応: CRLF 許容の branch-kind 形を正本として共有 module へ export し 8 箇所を差し替える。
  CRLF 入力で挙動が変わる 3 箇所（doctor / plan-descent / plan-entry-routing）は CRLF fixture の
  回帰テストを併設する。
- 受け入れ: 定義が 1 箇所になり、CRLF fixture 回帰テスト green、既存 gate 非退行。

### Q2: `isSqliteBusy` 三重複 — job-queue 版のみ node:sqlite の busy を検知しない（medium）

- 事象: `src/orchestration/job-queue.ts:63` は `SQLITE_BUSY` 文字列のみ判定。
  `src/runtime/session-log.ts:634` / `src/feedback/lifecycle-node.ts:14` は
  `/database is locked|SQLITE_BUSY/i` へ拡張済み（片側だけ修正済みのコピペ乖離）。実測で
  node:sqlite の busy は message=`database is locked` / code=`ERR_SQLITE_ERROR` のため、
  node driver では `claimNextJob` の busy→null 契約が throw に化ける（現状 production caller は
  tests のみで blast radius 小）。
- 対応: 拡張版を単一 util へ抽出して 3 箇所から import。`database is locked` を模擬する
  単体テストで node driver の契約を固定する。
- 受け入れ: 共有化後 test green、busy 模擬テスト green。

### Q3: readiness 系 gate の PLAN 読込が 18 箇所で構造重複、filter 述語 3 系統（medium）

- 事象: `readdirSync(docs/plans)` 系走査が src 内 18 箇所。`parsePlan` 同型複製が
  cutover / s4-decision / version-up / action-binding の 4 readiness gate にあり、走査 filter が
  `PLAN-*.md` / `.md` のみ / 正規表現の 3 系統に分裂。現状 638 件全てが `PLAN-*.md` のため差は
  潜在的だが、README 等の追加で gate ごとに対象集合が割れる。
- 対応: `src/lint/shared.ts` に `loadPlanDocs(repoRoot)` を新設し、各 gate は結果を自分の型へ
  map するだけにする。これは未検証留保の performance 所見「638 files の gate ごと独立再読込」の
  解消経路も兼ねる（共有 loader に単一パス snapshot を持たせられる）。
- 受け入れ: filter 述語が単一化され、既存 readiness 系 test 全 green。

### Q4: frontmatter スカラー読取りが `fmValue` と別に 4 実装、quote/comment 解釈乖離（medium）

- 事象: 正本 `shared.ts` の `fmValue` は comment 除去のみ。別実装 4 箇所のうち
  `projection-writer.ts:459` が最も堅牢（comment 除去 + unquote）、`assets/catalog.ts:52` /
  `state-db/drive-registration.ts:20` は comment 除去なし、`ddd-tdd-rules.ts:296` は quote 除去のみ。
  同じ `status: "confirmed" # note` が実装ごとに別解釈になる。
- 対応: projection-writer 版を正本として shared へ昇格し 4 箇所を置換。解釈が変わる呼び出し元が
  あるため、対象 doc を入力にした snapshot テストで挙動変化を可視化してから移行する。
- 受け入れ: 実装 1 本化、snapshot テスト green。

### Q5: `readRepoHeadSha` ×3 / `readPackageVersion` ×3 複製、version-up 版のみ検証欠落（low）

- 事象: 40-hex 検証付きが 2 箇所（identifier-rename / action-binding）、
  `version-up-readiness.ts:911` のみ無検証で raw 返し（片側 hardening の乖離）。
- 対応: 検証付き版を git-info 系共有 util へ抽出し 3+3 箇所から import。version-up 側の
  非 40-hex 分岐テストを 1 本追加。
- 受け入れ: 共有化後 test green。

### Q6: `shellQuote` 完全同一コピー ×3（low・quoting の将来乖離リスク）

- 事象: `src/cli.ts:663` / `src/lint/version-up-readiness.ts:2123` /
  `src/audit/github-merge-readiness.ts:141` が body まで完全同一。quoting は allowlist 変更 1 つで
  injection 面が変わるため、片側だけ修正される乖離が最も危険な種類の重複。
- 対応: 共有 util へ 1 本化（behavior-invariant）。用途が異なる `shellQuotePath` は対象外と明記。
- 受け入れ: 共有化後 test green。

### Q7: 再帰 walk 7+ 実装、posix 正規化の有無が乖離（low）

- 事象: `walkMarkdown` ×5 + `walkFiles` ×3。うち 2 組は逐語一致。readability 版は OS 区切りのまま、
  secret-scan 版は `toPosix` 正規化 — Windows で path 表現が割れる。
- 対応: 正規化 + statSync race skip を備えた共有 walk util に集約。readability の path 期待値を
  既存テストで fence。
- 受け入れ: 共有化後 test green。

### Q8: micro util の共通化漏れ — `isRecord` ×12 ほか（low）

- 事象: `isRecord` 12 箇所中 `test-report-parser.ts:329` のみ `!Array.isArray` 欠落で配列が型ガードを
  通過。`nowIso` ×5 / `escapeRegExp` ×4 / `uniqueSorted` ×4 は逐語一致。
- 対応: 共有 module へ集約。test-report-parser の array 入力回帰テストを付けて意図的差分でないことを
  確認してから置換。
- 受け入れ: 集約後 test green。

## クラスタ C: 契約バグ・構造債務（Claude インライン実測で確定）

### C1: consumer 配布 hook 契約が実在しない `helix hook work-guard` を配線（high・最優先）

- 事象: `src/setup/templates.ts:229,326` と `src/setup/index.ts:183,214` は consumer 向け hook 設定に
  `helix hook work-guard` を宣言するが、`src/cli.ts:3417` hook group の subcommand は
  `agent-guard` / `git-command-guard` / `post-tool-use` / `subagent-stop` のみ。実行実測で
  `error: unknown command 'work-guard'`。つまり **配布先 repo では foreign-edit 保護 hook が
  一度も機能しない**（PLAN-L7-428 W1 と同族の「宣言済み契約の実装欠落」、対象は配布面）。
- 対応: (1) `helix hook work-guard` subcommand を実装する（dev repo の work-guard entrypoint と
  同一ロジックを CLI 経由で提供）。(2) setup template が宣言する全 hook command が CLI に実在する
  ことを突合する契約テストを新設し、再発を封じる。
- 受け入れ: `helix hook work-guard` が動作する regression test green + template↔CLI 突合テスト green。

### C2: agent-guard matcher の三面不一致（medium）

- 事象: dev repo `.claude/settings.json` は matcher=`"Agent"` のみ、policy 正本
  `src/runtime/agent-guard-policy.ts:60` は `{Agent, Task}`、consumer template
  `src/setup/templates.ts:213` は `"Agent|Task"`。`Task` 呼称の runtime では dev repo だけ
  agent-guard が発火しない。
- 対応: dev repo の matcher を `"Agent|Task"` へ揃え、三面（settings / policy / template）の
  一致を検査する契約テストを追加する。
- 受け入れ: 三面一致テスト green。

### C3: outstanding 再計算と巨大ファイルの構造債務（medium・設計判断込み）

- 事象: `computeOutstandingWork()` が src 内 13 call site（実測 grep、定義除く）から共有 snapshot
  なしに独立再計算される。また `src/cli.ts` 12,463 行 / `src/doctor/index.ts` 7,150 行（実測 wc）の
  monolith に複数 finder 視点が独立に到達した（command handler がドメインロジックを export なしで
  抱え、直接テスト不能）。
- 対応: (1) outstanding の 1 run 内 memoize（または doctor 実行 context での共有 snapshot）を導入。
  (2) cli.ts / doctor の分割は影響が広いため、本 PLAN では**分割方針の L5 設計判断まで**を scope と
  し、実装は successor PLAN に分ける（`coding ≠ substance`、一括完了を claim しない）。
- 受け入れ: (1) の memoize regression test green。(2) は分割方針の設計 doc 化と successor 起票判断の
  記録まで。

## 留保: 未検証 30 件（annex §3）

検証フェーズが利用上限で中断したため、30 件は実在・既出の判定が未了のまま annex に列挙した。
着手条件: **1 件ずつ実在反証 + 既出照合を行い、採否を annex に記録してから**実装する
（無検証実装の禁止）。既出疑いの注記（PLAN-L7-431 S1/S4 との重複可能性など）は annex 参照。

## Schedule

- step 1 (serial): C1 の実装 + template↔CLI 突合テスト（配布面の保護欠落のため最優先）。
- step 2 (parallel): C2 matcher 整合 + 三面一致テスト、Q2 / Q5 / Q6 / Q8 の共有化（小粒・独立）。
- step 3 (parallel): Q1 frontmatter 正本化 + CRLF fixture、Q4 fmValue 昇格 + snapshot テスト。
- step 4 (parallel): Q3 `loadPlanDocs` 集約 + Q7 walk 集約、C3-(1) memoize。
- step 5 (serial, step 1-4 の後): C3-(2) 分割方針の L5 設計判断。annex §3 未検証分の逐次検証と
  採否記録（必要なら successor PLAN 起票）。

## 完了条件（DoD）

- Q1〜Q8: 各正本 1 本化と、挙動変化を伴う箇所（Q1 CRLF / Q2 busy / Q4 解釈 / Q5 sha / Q8 array）の
  回帰テスト green（実装ファイル確定時に `generates:` へ source_module / test_code を追記する）。
- C1: `helix hook work-guard` regression test green + template↔CLI 突合テスト green。
- C2: 三面一致テスト green。
- C3: memoize テスト green + 分割方針の設計判断記録。
- annex §3 の未検証 30 件について、検証済み採否（採用 / 棄却 / 既出）の記録が残っている
  （全消化は claim しない）。
- 各 step の green command を digest 付きで review_evidence に記録し、cross-runtime review
  （hybrid: 反対 runtime / model family）を経て confirm する。

## 引き継ぎメモ（Codex 向け）

- 検証記録と未検証一覧の正本 = `docs/reference/quality-sweep4-2026-07-12.md`。
- Q1〜Q8 は「複製 + 片側修正の乖離」なので、統一時は**どちらの挙動が意図か**を必ず判定してから
  正本を選ぶ（本文に正本候補を明記済み）。
- C1 は配布面の保護欠落であり本 PLAN 最優先。`helix setup project` の出力を実 consumer 相当の
  temp repo で検証する経路が既存 tests/setup.test.ts にあるため、そこへ契約テストを足すのが近道。
