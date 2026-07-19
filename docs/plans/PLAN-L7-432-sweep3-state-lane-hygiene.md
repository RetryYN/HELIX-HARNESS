---
plan_id: PLAN-L7-432-sweep3-state-lane-hygiene
title: "PLAN-L7-432 (troubleshoot): 全体見直し第3巡の改善点 — レーン衛生 / 状態ストア肥大 / hook trust 検査 / テスト信頼性"
kind: troubleshoot
layer: L7
drive: agent
status: completed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-12 PO 指示「システムに全体を見直してプランとして起票してくれ」— 本日第 3 巡。第 1 巡 (PLAN-L7-425 / PLAN-L7-428)・第 2 巡 (PLAN-L7-431)・improvement-backlog の既出事項を除外し、機械的証拠で確定した新規 7 件を起票"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    reviewed_at: "2026-07-12T08:46:36Z"
    tests_green_at: "2026-07-12T08:46:36Z"
    verdict: pass
    scope: "lane status、明示DB compact、typed tmp GC、Codex hook trust、memory commit hygiene、test隔離を独立reviewした。cross-provider reviewerを利用できないため独立Codex subagentを用いた。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/sweep3-state-lane-hygiene.test.ts tests/cli-surface.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T08:40:00Z", evidence_path: tests/sweep3-state-lane-hygiene.test.ts, output_digest: "sha256:4d257a10927bbc8225f0826165059e1beaa43ed6b1515a17962d05c442c83ba9" }
backprop_decision: not_required
backprop_decision_reason: "既存実装・運用の欠陥修正と hygiene 改善であり、上位要求・設計の意味変更はない。lane surface 新設 (L1/L2) は既存 hybrid 協調ルール (CLAUDE.md Git Rules) の機械可視化、S/T/G 群は既存契約への追随・補修。契約変更が要ると判明した項目はその時点で個別 backprop を判断する。"
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot 分類の妥当性と G1 (hook trust 検査) の fail-close 境界の判定"
  - role: se
    slot_label: "SE — lane surface / VACUUM / trust 検査 / テスト入力固定の実装"
  - role: qa
    slot_label: "QA — 各所見の regression test と既存 gate 非退行の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-432-sweep3-state-lane-hygiene.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/lane-hygiene.ts
    artifact_type: source_module
  - artifact_path: src/state-db/state-hygiene.ts
    artifact_type: source_module
  - artifact_path: src/runtime/memory-commit-hygiene.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-trust.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/sweep3-state-lane-hygiene.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: .gitignore
    artifact_type: config
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-432: 全体見直し第3巡の改善点

## 背景

2026-07-12 の PO 指示「システムに全体を見直してプランとして起票してくれ」に基づく本日第 3 巡の点検。
計測基準は origin/main `1aea3500`（PR #13 merge 後）と、ローカル checkout `ace1c78d`
（内容は後述 L1 のとおり origin/main へ全量 patch-equivalent）。CI 同順ゲートは
`bun run typecheck` / `bun run lint`（Biome 519 files）/ `helix plan lint` / `helix doctor` すべて green。
`bun run test:fast` は 2285 passed / **1 failed**（この 1 件が T1 所見そのもの）。

第 1 巡（PLAN-L7-425 / PLAN-L7-428）・第 2 巡（PLAN-L7-431）と improvement-backlog の既出事項は
照合のうえ除外済み（lane 衛生 / DB freelist / hook trust / memory commit 規律は backlog・両 annex に
該当行なし。IMP-142 は destructive git guard の話であり本件 L1 とは別問題）。

## クラスタ L: マルチレーン git 衛生（新規・系統的）

### L1: landed 済みレーンの機械検出が無い（important）

- 事象: 現 checkout ブランチ `codex/system-review-triage` の全 23 commit は
  `git cherry origin/main HEAD` で全件 `-`（patch-equivalent。同内容は PR #12 の
  `codex/left-arm-carry-log` 名義で main へ着地済み）。それでも branch は upstream 比
  `[ahead 23]` を示し、in-flight に見える。ローカル 14 branch 中 12 が unmerged=0 のまま残存し、
  リモートにも同種の残存がある（例: `codex/system-review-425` と `425b` は同一 commit）。
- 影響: (a) 着地済みレーンを in-flight と誤認し、待機・二重実装・誤 rebase の温床になる
  （本レーンも第 3 巡の点検まで in-flight 扱いだった）。(b) hybrid の「相手の commit を守る」判断が
  人力の `git cherry` 照合に依存している。
- 対応: `helix lane status`（仮称）を新設し、ローカル branch を `git cherry` ベースで
  landed / in-flight / diverged に分類して表示する。doctor には informational な lane 衛生 surface
  を追加する（fail-close にしない。件数の閾値は設けず列挙のみ）。branch 削除などの掃除は
  既存の destructive 系 guard 経路に従う明示操作のままとし、本 PLAN で自動削除は実装しない。
- 受け入れ: landed 分類判定の fixture（equivalent 全量 / 部分 / ゼロ）unit test green。
  実 repo で `codex/system-review-triage` が landed と報告されること。

### L2: 残骸 worktree の蓄積（minor）

- 事象: `git worktree list` に 15 entry、うち 10 が `/tmp` 配下の過去セッション検証用
  （detached HEAD）残骸として残存する。
- 対応: L1 の lane surface に prunable worktree（path 消失または `/tmp` 配下 detached）を列挙し、
  `git worktree prune` 相当の明示掃除コマンドを案内する。
- 受け入れ: 列挙ロジックの unit test green。

## クラスタ S: 状態ストア衛生

### S1: state DB の 90% が freelist（important、実測確定）

- 事象: `.helix/harness.db` が 470,134,784 bytes に対し、`PRAGMA page_count` = 114,779 /
  `PRAGMA freelist_count` = 103,435（90.1% が空きページ。実データは約 44MB）。
  `src/state-db/` に VACUUM / retention の実装は無い
  （`grep -rln "vacuum\|retention\|prune\|compaction" src/state-db/` が 0 件）。
- 影響: rebuild のたびに肥大が進み、コピー・バックアップ・別 worktree での再構築コストが増える。
- 対応: `helix db rebuild` 完了時に VACUUM を実施する（`PRAGMA auto_vacuum` 採用可否は L5 で
  設計判断）。doctor に freelist 比の informational 表示を追加し、rebuild 後に freelist 比が
  閾値未満であることの regression test を追加する。
- 受け入れ: freelist 比検証 test green。実 DB のサイズ縮小を実測記録。

### S2: `.helix/tmp` の無期限蓄積（minor）

- 事象: 2026-07-09 以降の probe / summary 残骸が 50MB 残存（`du -sh` 実測）。保持方針が無い。
- 対応: state gc（仮称）で期限超過の tmp 生成物を掃除する方針を定義・実装する
  （明示 tracked な audit evidence は対象外と明記する）。
- 受け入れ: gc 対象判定の unit test green。

## クラスタ T: テスト信頼性

### T1: U-DDBREG-003 が共有 runtime state と checkout を突合して false fail（important、実測確定）

- 事象: `bun run test:fast` が本 checkout で 1 failed:
  `tests/drive-db-registration.test.ts` U-DDBREG-003 の `expectedPlanCount === planCount` 不一致。
  この test は `rebuildHarnessDb({ repoRoot: process.cwd() })` の結果（共有 runtime state 由来の
  登録 event を含む）と checkout の `docs/plans` 数を等値比較する。マルチレーン運用では、
  main へ先に着地した PLAN（例: PLAN-L7-431）の登録 event が共有 state 側に存在する一方、
  古い checkout の `docs/plans` には無いため、HEAD の正しさと無関係に fail する。
  CLAUDE.md の「検証の基準点 = HEAD（共有 tree を測るな）」原則のテスト版違反。
- 影響: ローカル fast suite が lane 位置により恒常的に赤になり、真の退行を隠す。
- 対応: test 入力を HEAD 整合に固定する（tracked fixture 化 / 一時 worktree 上での rebuild /
  比較対象を checkout 由来の入力に限定、のいずれかを L5 で設計判断）。
- 受け入れ: 「古い checkout + 新しい共有 state」fixture で fail しない regression test green。
  従来検出していた真の drift（docs/plans と registry の不一致）は引き続き fail すること。
- 2026-07-12 stale 再判定: 現行 `rebuildHarnessDb({ repoRoot, db })` は呼出側が渡す checkout の
  `repoRoot` から projection を再構築し、U-DDBREG-003 も in-memory DB を明示している。共有 persisted
  DB の登録 event と checkout を比較する旧経路は main `8d2ab178` 時点で再現せず、当初 failure は
  古い checkout 上の transient evidence だった。このため T1 は修正対象から除外し、再発時は
  `repoRoot` と DB path を同時記録して個別 incident として起票する。

### T2: fake-provider 残渣 `codex-env.txt` の repo root 漏出（minor、再発 2 回目）

- 事象: repo root に `codex-env.txt` が現存（untracked）。過去に誤って commit され
  （68998359）、削除された（e34c7023）後の再出現である。`tests/cli-surface.test.ts` は
  repo root 直下に生成して finally で削除する構造のため、中断・並行実行で漏れる。
  `.gitignore` にも未登録。
- 対応: fake provider の出力先を per-test tmpdir へ移す（PLAN-L7-431 H3 と同族・対象違い）。
  `.gitignore` へセーフティネットを追加する。
- 受け入れ: 生成先が tmpdir 化された test green と `.gitignore` 登録。

## クラスタ G: ガード・記憶の運用強靱化

### G1: Codex hook trust 失効の機械検査が無い（important）

- 事象: Codex CLI 0.144+ の hook trust gating では、`.codex/hooks.json` を編集すると user config の
  `[hooks.state]` trusted_hash が不一致になり、該当 hook が silent skip される
  （harness memory `codex-0144-hook-trust-gating`、2026-07-11 実機検証）。現状この一致を検査する
  gate は無く、`src/lint/codex-hook-adapter.ts` は entrypoint parity と `[features].hooks=true` のみ
  検査する。直近も hooks.json 変更（07-11 06:49）から trust 再登録（同日 22:00）までの間、
  無検査の時間帯があった（mtime 実測）。
- 影響: 不一致の間、Codex 側の git-command-guard / work-guard / agent-guard がすべて発火しない
  まま気づけない（沈黙の fail-open）。
- 対応: doctor gate を新設し、user config が読める環境では per-hook の trusted_hash と
  現 hooks.json の一致を検査する（不一致 = fail-close）。読めない環境（CI 等）は
  informational skip とする。hash 算出仕様は codex-rs 正本に従い、evidence には digest のみを
  書く（secret や機微値を evidence に書かない）。
- 受け入れ: 一致 / 不一致 / config 不在の 3 fixture regression test green。
- 実装根拠（2026-07-12）: installed `codex-cli 0.144.1` の
  `codex app-server hooks/list` を canonical oracle として使う。公式 app-server protocol は
  `hooks/list` が unmanaged hook ごとに `currentHash` と `trustStatus` を返し、trusted のみ実行可能と
  規定する（https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md#hooks）。HELIX 側で
  private hash normalization を複製せず、Codex 自身の `trustStatus` を fail-close 判定する。
  app-server/config が存在しない CI・read-restricted 環境だけは理由付き informational SKIP とする。
  実機では project hooks 7 件すべて `trusted`、返却 `currentHash` は user config の
  `hooks.state.*.trusted_hash` と一致した（digest のみ観測し設定内容は証跡化しない）。

### G2: harness memory 書き込みの commit 境界規律が無い（minor）

- 事象: `.helix/memory/harness.jsonl` に 9 entry（2026-07-10 21:34 〜 07-11 19:29 作成、
  PO 決定 record を含む）が 24 時間超 uncommitted のまま滞留している（`git diff --stat` で +9 行）。
  memory は両ランタイム共通の唯一の横断記憶（PO 決定 2026-07-11）だが、いつ commit するかの
  規律が無く、マシン喪失や他クローンからの不可視のリスクがある。
- 対応: doctor に「uncommitted memory 変更の経過時間が閾値超」の informational 警告を追加し、
  レーン終端 commit に memory 変更を含める運用規約を CLAUDE.md / AGENTS.md に明文化する。
- 受け入れ: 警告判定の unit test green と規約追記。

## Schedule

- step 1 (parallel): S1 VACUUM 実装 + test、T2 tmpdir 化 + `.gitignore`、G2 警告 + 規約明文化。
- step 2 (parallel): L1 / L2 lane surface 新設 + unit test。
- step 3 (parallel): T1 入力固定の設計判断（L5）→ 実装 + regression test。
- step 4 (serial, hash 仕様の裏取り後): G1 trust 検査 gate + 3 fixture regression test。

## 実装結果（2026-07-12、独立 review 前）

| 所見 | 実装結果 | 機械証拠 |
|---|---|---|
| L1 | `helix lane status` が `git cherry <base> HEAD` を landed / in-flight / diverged に分類する。empty/unborn/invalid base は完了と誤認せず `unknown`。削除は行わない。 | U-S3HY-001、実 repo `state=landed` |
| L2 | porcelain worktree を解析し、path missing または `/tmp` detached を prunable 候補として列挙する。 | U-S3HY-002 |
| S1 | 通常 `db rebuild` は非破壊のまま維持する。`db compact --execute` だけが free-space preflight、WAL TRUNCATE checkpoint 完了検証、既存path拒否の unique `VACUUM INTO` consistent backup、SQLite atomic `VACUUM` を行う。foreign writer/busy は fail-closeし、main DBへ手動copy restoreせず backup path と manual recovery finding を返す。独自 lock は同一 HELIX process coordination の補助で、SQLite lockをauthorityとする。 | U-S3HY-006〜010、projection-writer に VACUUM 非配線 |
| S2 | `db gc` は repo-owned name allowlist に一致する期限超過 tmp だけを列挙し、audit/evidence/receipt 名または保護 marker を再帰検出した subtree を除外する。`--apply` 明示時のみ削除する。 | U-S3HY-003 nested audit fixture |
| T1 | 現行 HEAD では checkout `repoRoot` 由来の in-memory projection へ固定済みで、共有 persisted state 比較は再現しないため stale。 | 本文 T1 stale 再判定、既存 U-DDBREG-003 |
| T2 | fake provider evidence を test ごとの `binDir` 配下へ隔離し、root leak の防御として `codex-env.txt` を ignore する。 | CLI adapter execute regression、root cleanup 不要化 |
| G1 | Codex 自身の `app-server hooks/list` が返す canonical `trustStatus` を doctor が fail-close 判定する。malformed/id欠落/cwd欠落/empty/nonzero は violation。typed CI/read-restricted のみ skip。 | U-S3HY-005 positive/negative fixtures、実機 checked=7 trusted |
| G2 | memory age warning の純判定を追加し、共有 memory は lane 終端 commit へ含める規約を両 runtime 正本へ同期した。 | U-S3HY-004、`CLAUDE.md` / `AGENTS.md` |

S1 の 470MB 実 DB に対する破壊的な再計測は concurrent runtime の正規 state を変更するため行わない。
同じ SQLite page lifecycle を使う隔離 fixture で before/after を固定する。production は通常 rebuild から
VACUUM を分離し、`db compact --execute` の action-binding 明示時だけ実行する。

## 完了条件（DoD）

- 各所見の regression / unit test green（実装ファイル確定時に `generates:` へ
  source_module / test_code を追記する）。
- T1 解消後、lane 位置に依存せず `bun run test:fast` が green。
- S1 は隔離 fixture の freelist before/after、compact dry-run、checkpoint、既存backup拒否、foreign writer busy、最新WAL rowを含む `VACUUM INTO` backup、VACUUM failure時original row不変が green。
- G1 は malformed JSON、id/cwd欠落、empty hooks、nonzero+stdout を fail-closeし、typed CI/read-restricted だけを skip。
- L1 は invalid base/unborn を `unknown`、S2 は nested audit/evidence/receipt を削除対象外にする。
- 各 step の green command を digest 付きで review_evidence に記録し、cross-runtime review
  （hybrid: 反対 runtime / model family）を経て confirm する。

## 引き継ぎメモ（Codex 向け）

- 本 PLAN は Claude の第 3 巡点検（2026-07-12、基準 = origin/main `1aea3500` +
  checkout `ace1c78d`）による問題提起 draft。実装・confirm・evidence 記録は Codex が行う。
- L1 の実測: `git cherry origin/main HEAD` → `-` 23 件 / `+` 0 件。`git branch -vv` と
  `git worktree list` の生出力は本文の数値どおり（2026-07-12 時点）。
- 任意メモ（起票不要）: sweep 系レビューが日次で重なってきたため、所見の機械可読台帳
  （finding id + 状態）を設ければ後続 sweep の既出照合を自動化できる。必要になったら別 PLAN で。
- 任意メモ 2（本レーンの実測、起票任意）: `branch-kind-check` の automation prefix は
  `codex` / `dependabot` / `renovate` のみで、hybrid のもう一方の runtime である Claude 用 prefix が
  未登録（`claude/...` は unknown_branch_prefix で block。本レーンは `docs/` へ改名して準拠）。
  `claude` を automation prefix へ登録するかは小さな policy 判断として Codex / PO に委ねる。
