# システム全体レビュー第2巡 全件 sweep 結果（2026-07-12、PLAN-L7-431 annex）

PO 指示「全件チェックして改善点を起票して」に基づく第 2 巡。workflow（CI 同順ゲート全走 + 6 視点
sweep + 全所見の敵対検証、26 agents）で発掘した改善点のうち、**反証で棄却されなかった確定 14 件**を
記録する。基準 HEAD = 第 1 巡（PLAN-L7-425/428）以降の origin/main。分類・検証は Claude の read-only
調査で、**実処置（修正・PLAN 分割）は Codex が本 annex を根拠に実施する**。

第 1 巡（PLAN-L7-425 の I1-I8、PLAN-L7-428 の W1-W3、annex system-review-triage-2026-07-12.md）で
既出の事項は本 sweep から除外済み。security 系 2 件（C8/C9）は Claude が実機再現を独立確認した。

## 確定所見（14 件、severity 順は PLAN-L7-431 本体のクラスタ参照）

### C1 [important] (code-quality) sha256/canonicalJson ヘルパーが10ファイル以上に逐語コピーされ、うち1本はNode crypto を使わず手書きSHA-256(約90行)を独自実装

- 根拠: `function sha256(value): string { return \`sha256:${createHash("sha256").update(value).digest("hex")}\`; }` と実質同一のラッパーが、共有モジュールを介さず少なくとも次の10ファイルで個別定義されている: src/runtime/continuation.ts:102, src/runtime/constitution-template-stack.ts:33, src/lint/handover-cutover-approval.ts:75, src/plan/lint.ts:198, src/runtime/retirement-preserve.ts:152, src/audit/handover-resurrection-source.ts:91, src/runtime/agent-observability-provenance.ts:53, src/lint/plan-specific-vpair-binding.ts:140, src/runtime/agent-ssot-runtime-projection.ts:51, src/runtime/change-package-delta-archive.ts:42 (加えて src/cli.ts:1088 の sha256Text、src/web/share.ts:71 も同系統)。付随する `canonicalJson` 決定的シリアライズ関数もほぼ同一のコードが continuation.ts:131 / handover-cutover-approval.ts:79 / retirement-preserve.ts:156 / audit/handover-resurrection-source.ts:95 など5ファイル以上に重複している。さらに src/lint/handover-resurrection.ts:197-257 は node:crypto を使わず SHA-256 を完全に手書き実装(ビット回転・パディングを含む約90行)しており、実際に本番ロジック(306/314/329/360/414/492/850/864行目)で使用されている。5種のテストベクタ(空文字/短い文字列/1000文字/JSON)で createHash("sha256") と完全一致することは検証したが、この手書き実装単体を対象にした専用テストは無く、tests/handover-resurrection.test.ts 側は自前で node:crypto から期待値を再計算しているだけで手書き実装の境界値(パディング境界など)を直接検証していない。
- 提案: sha256/canonicalJson を共有ユーティリティ(例: src/shared/digest.ts)へ集約し全箇所で import する。handover-resurrection.ts の手書きSHA-256は他の約10箇所と同様に node:crypto の createHash に置き換え、未使用に等しい約90行の自作crypto実装と監査対象の拡大を解消する。

### C2 [important] (test-quality) projection-writer.test.tsのrebuildHarnessDb系test 5件が5秒超（最大14.1秒）だがtests/slow未編入

- 根拠: 実測（同上vitest --reporter=verbose）。tests/projection-writer.test.ts（tests/slow配下ではない）: 'U-ROUTEMODE-001: rebuildHarnessDb deterministically projects plans, route_modes, and Phase3 outputs without source mutation' (L2151) 14091ms、'IMP-140: projects 15 screens and FR/BR→screen trace from doc source on rebuild' (L2104) 11402ms、'rebuildHarnessDb is atomic: a mid-rebuild failure rolls back, leaving the prior projection intact' (L641) 10589ms、'auto-populates relation, profile, document export, and test catalog projections on rebuild' (L734) 9210ms、'projects artifact progress rows as yellow until linked tests have passing runs' (L2026) 6964ms。5件とも実ファイルI/Oを伴うrebuildHarnessDbのフルスキャンが原因で、tests/slow/doctor.test.tsと同じ性質のコストを持つが分離されていない。
- 提案: 上記5 itをtests/slow/へ移動するか、rebuildHarnessDbのフィクスチャ規模を縮小して1秒未満に収める。少なくともCIのfast/slow分割の意図（速いフィードバックループ）を保つため、5秒超テストの棚卸しをvitest.workspace.tsのinclude/excludeに反映する。

### C3 [important] (test-quality) continuation-event-first.test.tsが実リポジトリの.helix/直下にmkdtempし、共有runtime stateを汚染しうる

- 根拠: tests/continuation-event-first.test.ts L224: `mkdtempSync(join(process.cwd(), ".helix", "continuation-race-"))`、L250: `mkdtempSync(join(process.cwd(), ".helix", "continuation-process-race-"))`、L760: `mkdtempSync(join(process.cwd(), ".helix", "delivery-terminal-race-"))`。他の219 test中で同様にprocess.cwd()配下（osのtmpdir()ではなく実repo直下）へ書き込むのはこの3箇所のみ（grep 'mkdtempSync(join(process.cwd()' tests/*.test.ts で確認）。cleanupはtry/finally内のrmSyncのみで、プロセスがtestTimeout超過やSIGKILL・クラッシュで終了した場合はfinallyが走らず実.helix/配下にcontinuation-race-*ディレクトリが残留する。L249のテストは子プロセスをspawnしておりrunBunのcwdはprocess.cwd()で説明できるが、L224・L760のテストは子プロセスを一切spawnしておらず（同期呼び出しのみ）、実.helix配下を使う技術的必然性がない。
- 提案: 3箇所とも `mkdtempSync(join(tmpdir(), ...))`（node:os の tmpdir）に統一する。L249のように子プロセスにcwd経由でモジュール解決させたい場合は、mkdtempのroot自体は通常tmpdirに置きつつ、spawnのcwdだけprocess.cwd()を渡せば足りる（rootとspawn cwdを分離する）。

### C4 [important] (docs-consistency) AGENTS.md の「正規コマンド」に実在しない helix task estimate を掲載（CLAUDE.md と不一致）

- 根拠: AGENTS.md:139 `- タスク分類: \`helix task classify --text "..."\` / \`helix task estimate --plan <path>\`` と現行コマンドであるかのように列挙している。しかし src/cli.ts の task サブコマンド登録 (grep 'command(' 結果) は classify / route / roster の3つのみで estimate は存在しない。docs/plans/PLAN-L7-72-task-classify-cli.md は『Scope 外 (fork plan §8(2) による re-scoped defer): helix task estimate』と明記し、docs/plans/PLAN-L7-419-skill-mythos-uplift.md は docs/skills/estimation.md にあった同種の誤記述を『実在しない helix task estimate 言及』として検出・是正済みと記録している。同一の『正規コマンド』節を持つ CLAUDE.md:221 は `helix task classify --text "..."` のみで estimate を含まず、AGENTS.md だけが取り残されている。
- 提案: AGENTS.md:139 から `helix task estimate --plan <path>` を削除するか、CLAUDE.md と同じ表記に揃える。将来実装予定として残したいなら『未実装 (deferred, PLAN-L7-72 scope外)』等の注記を付け、正規コマンドの列から外す。

### C5 [important] (docs-consistency) README.md の日常コマンド例が指す .helix/teams/team.yaml が実在しない

- 根拠: README.md:325 と 331 (「⌨️ 日常コマンド」節) はそのままコピー&ペースト可能な例として `helix team run --definition .helix/teams/team.yaml --mode hybrid --json` / `--execute` を提示しているが、`.helix/teams/` 配下には `.gitkeep` と `example-review-team.yaml` しか存在せず (`ls .helix/teams/` 確認済)、`team.yaml` というファイルは無い。README を素直に試した利用者はコマンドがファイル未検出で失敗する。
- 提案: README のコード例を実在する `.helix/teams/example-review-team.yaml` に差し替えるか、`.helix/teams/team.yaml` サンプルファイルを追加する。

### C6 [critical] (docs-consistency) docs/process/gates.md の横断検出ゲート表が実装のない4検出器を fail-close 稼働中と記述

- 根拠: docs/process/gates.md §4 (99-109行) は『helix doctor / helix plan lint に束ねられる横断検出器。いずれも fail-close で該当 mode への接続を強制する』とし、表に `drift-check` / `connection-deficiency` (§7.8.7 DEP-2) / `test-perspective-gate` (TST-2) / `doc-drift` を列挙する。同じく docs/process/forward/L07-implementation.md:48 も『重複・依存の機械検出は helix doctor の relation-graph / connection-deficiency を活用する』と現用扱いで書く。しかし src/ 全体 (grep -rin, camelCase/snake_case/kebab-case いずれも) にこの4語は一切出現せず、実装が存在しない (`relation-graph` のみ src/lint/relation-graph.ts に実在し表中では対比的に整合、他4件は皆無)。gates.md は文書冒頭で『正本化済 (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化)』と明記される運用正本であり、L1/L3/L4 設計層の同名 FR (functional-requirements.md:753 の `PLAN-L4-NN-test-perspective-gate` 等) では未起票の carry と明示されているのと対照的に、gates.md 自体にはこの4件が未実装である旨の注記が無い。
- 提案: gates.md §4 の該当4行に『未実装 (carry, 起票待ち PLAN-L4-NN-*)』等の状態注記を追加するか、実装済みの検出器のみを表に残し未実装分は別セクション (期待仕様/ロードマップ) へ移す。L07-implementation.md:48 の `connection-deficiency` 現用表現も同様に修正する。

### C7 [important] (docs-consistency) docs/skills/spec-driven-development.md / incremental-implementation.md が実在しない docs/design/L0-glossary.md を用語追加先として指示

- 根拠: docs/skills/spec-driven-development.md:62 『L0 glossary（`docs/design/L0-glossary.md`）に追加する。』、docs/skills/incremental-implementation.md:63 『同じ commit で `docs/design/L0-glossary.md` に追加する。』と具体パスを指示するが、そのパスは存在しない (test -e で不在確認)。実際の glossary SSoT は `docs/design/helix/L3-requirements/glossary-ssot.md` (git log 確認、262ddf47 で新設、リネームではなく別名で新規追加)。他の skill doc (context-engineering.md, design-tailoring.md, requirements-handover.md 等複数) は『L0 glossary』という概念参照のみで具体パスを書いておらず、この2ファイルだけが誤った具体パスを持つ。
- 提案: 該当2ファイルの `docs/design/L0-glossary.md` を `docs/design/helix/L3-requirements/glossary-ssot.md` に修正するか、他 skill doc と同様に概念参照のみに揃える。

### C8 [critical] (guard-coverage) helix loop run / loop receipt の --plan がサニタイズ無しで .helix/state/loop パス構築に使われ、path traversal で任意 JSON ファイルを読める（実機PoC済み）

- 根拠: loop-store.ts:16 `const pathFor = (planId: string) => join(deps.root, ".helix", "state", "loop", `${planId}.json`)` と autonomous-loop-run-receipts.ts:56 は同一パターンで、CLI `--plan <id>`（cli.ts:2372 `loop run`、cli.ts:2435 `loop receipt --json`）の生文字列をそのまま渡す。同ファイル内の他所（cli.ts:1071 `safeEvidenceFileName`、session-log.ts:153-155 `safeName`、PLAN_ID_RE 正規表現検証）が同種の値に対して行っているサニタイズ/正本ID検証がここだけ抜けている。実機PoC: `buildAutonomousLoopRunReceipt(repoRoot, "../../../../poc-outside/gcp-service-account")` を実行したところ、`.helix/state/loop/` の外にある任意JSON（実験用ダミーのサービスアカウント鍵形式ファイル）の全内容が `loop_state` フィールドと絶対パスが `evidence_paths` にそのまま出力された（ok:true, status:"present"）。write側（loop-store.ts:33 `write()`）も同じ `state.planId` を使うため、traversal先に読める形の既存JSONがあれば `helix loop run --plan <traversal>` の tick 更新で任意パスへの上書きも成立し得る。
- 提案: loop-store / autonomous-loop-run-receipts のファイルパス構築前に planId を canonical PLAN ID 正規表現（例: session-log.ts の PLAN_ID_RE 相当）または safeName 系のホワイトリスト文字集合で検証し、パス区切り文字を含む値は fail-close で拒否する。

### C9 [critical] (guard-coverage) git-command-guard は `bash -c "..."` / `sh -c "..."` / `eval "..."` で destructive git 検出を丸ごと回避できる（実機PoC済み）

- 根拠: shellTokens()（30-64行）はクォート内文字列を1つの不透明トークンとして扱い、gitSlices()（66-79行）はトークンが厳密に文字列 "git" と一致する箇所しか git 呼び出しとして認識しない。実行結果: `evaluateGitCommandGuard({command:'git reset --hard HEAD~3'})` → block/destructive-git だが、`evaluateGitCommandGuard({command:'bash -c "git reset --hard HEAD~3"'})` および `sh -c "git push --force origin main"` / `eval "git checkout -f main"` は全て pass/non-git として通過した（ガードが評価する tool_input.command 文字列に対して直接検証）。
- 提案: raw command 文字列全体に対して二次パス（例: `\b(?:bash|sh|zsh)\s+-c\s+|\beval\b` 検出時はクォート内文字列を再帰的に shellTokens/gitSlices へ渡す、または元文字列全体に対して destructive git subcommand の正規表現走査を追加）を実装し、subshell 経由の呼び出しでも検出できるようにする。

### C10 [important] (guard-coverage) PreToolUse(Bash) は git-command-guard 専用配線で、work-guard（foreign-uncommitted-file 保護）に一切繋がっていない

- 根拠: .claude/settings.json の PreToolUse は matcher="Agent"→agent-guard、matcher="Edit|Write|MultiEdit"→work-guard、matcher="Bash"→git-command-guard の3エントリのみで、Bash 用の work-guard 呼び出しが存在しない（.codex/hooks.json も同型: apply_patch|Write|Edit→work-guard、Bash→git-command-guard のみ）。したがって他ランタイムの uncommitted foreign file を `echo ... > path`、`sed -i`、`cp`、`mv`、`tee` 等の Bash 経由で上書き/削除しても、work-guard の block/override/audit 経路を一切通らない（git-command-guard は destructive git verb しか見ておらず、対象がファイルパスかどうかは判定しない）。work-guard の設計意図（CLAUDE.md Guard規則「他ランタイムの in-flight 成果を上書きすることを防ぐ」）そのものを Bash 経路だけ完全に回避できる。
- 提案: Bash tool_input.command からファイル書き込み・削除系コマンド（リダイレクト先、`sed -i`/`cp`/`mv`/`tee`/`rm` の対象パス等）を抽出し、既存の evaluateWorkGuard() へ渡す追加チェックを git-command-guard と同じ PreToolUse(Bash) フックに統合する。

### C11 [important] (guard-coverage) secret-scan の検出パターンが Stripe / Google / npm / Slack webhook / JWT / Azure 接続文字列などの一般的な token 形式を捕捉できない（scan対象範囲内で実測）

- 根拠: SECRET_SCAN_PATTERNS（narrow-secret-token/aws-access-key/github-token/private-key-block/authorization-bearer/secret-assignment の6marker）に対し9件の実例文字列を直接テストしたところ、Stripe live/restricted secret key (`sk_live_...`/`rk_live_...`)、npm auth token (`npm_...`)、Slack incoming webhook URL (`hooks.slack.com/services/...`)、Authorization ヘッダ外の単独 JWT (`eyJ...`)、Azure storage connection string (`AccountKey=...`) の5/9件が "NO MATCH" だった（Google API key `AIzaSy...` は偶然 secret-assignment に部分一致で検出、Slack bot token `xoxb-...` は narrow-secret-token で検出）。これらは docs/ や .helix/audit,logs,memory,handover の走査対象内であり、PLAN-L7-410 §2 が明記した既知の対象外事項（adapter設定ファイル走査・allow-marker同居のfalse negative・src/コード面）とは別の、marker 集合自体の網羅性ギャップである。
- 提案: SECRET_SCAN_PATTERNS に stripe-key (`\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b`)、npm-token (`\bnpm_[A-Za-z0-9]{36}\b`)、slack-webhook (`hooks\.slack\.com/services/[A-Za-z0-9/]+`)、jwt-like (`\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`) の marker を追加する。

### C12 [important] (guard-coverage) destructive-git-override / foreign-edit-override の one-shot marker は「実際にそのcallでbypassが必要だったか」を見ずに、次に来た無関係な呼び出しで消費されてしまう（実装読解＋純関数レベルで再現）

- 根拠: git-command-guard.ts の消費条件は `override.source === "marker" && command.trim()`（68行目）であり、`result.decision` が実際に block だったか（=このcallが本当にbypassを要したか）を問わない。resolveDestructiveGitOverride+evaluateGitCommandGuard を直接呼んで再現: marker理由を書いた直後に無関係な `git status` を評価すると `decision=pass, override.source=marker` となり（=hookはここでmarkerを削除する)、その後に本来意図していた `git reset --hard HEAD~3` を評価すると override無しで `decision=block` になった。つまり one-shot override は「意図した破壊的操作」ではなく「marker設置後にたまたま最初に来たBashコマンド」に浪費され得る。work-guard.ts も同型（145行目 `override.source === "marker" && targets.length > 0` が、targetが実際にforeign-uncommittedでblock対象だったかを問わずmarkerを消費）。
- 提案: marker消費を、bypass=falseで評価した場合に実際にblock判定になるケースに限定する（= 「今回のcallは本当にoverrideが必要だった」場合のみ消費・監査ログに記録する）よう両hookを修正する。

### C13 [important] (dx-performance) helix doctor は毎回 ~/.claude/projects と ~/.codex/sessions を repoRoot 非依存で全件スキャンしており、doctor 実行時間の4割を占める

- 根拠: `time bun src/cli.ts doctor` = real 1m3.723s。同一入力で checkDbProjectionIngestion(repoRoot, prebuiltDb) だけを単独計測すると 26076.3ms（プリビルド済み共有 DB を渡した状態でもこの値、doctor 全体の約41%）。内部で呼ぶ projectRuntimeModelTelemetryForDoctor（src/doctor/index.ts:1466、第1引数は `_repoRoot` で明示的に未使用）が loadRuntimeSessionUsage 経由で ~/.claude/projects（317 jsonl, 219M）と ~/.codex/sessions（11741 jsonl, 4.6G）を毎回 readFileSync+parse。単独計測: codex 側 17501.1ms/278794 run、claude 側 1043.2ms/37730 run。mtime 等によるキャッシュは無く、このコーパスは使うほど無限に増える。
- 提案: ファイル mtime+size ベースの増分キャッシュを loadRuntimeSessionUsage に追加し前回スキャン以降の差分のみ読む、または本 projection を doctor の hard gate 経路から外し `helix telemetry scan` 相当の任意コマンドへ切り出す（cross-project telemetry であって当該 repo の governance gate とは独立の関心事のため）。

### C14 [important] (known-delta) review-evidence.ts が ISO8601 timestamp を文字列比較しており timezone表記混在で誤検知する（既知事項に含まれない新規バグ）

- 根拠: src/lint/review-evidence.ts:252 `if (e.reviewed_at && e.tests_green_at > e.reviewed_at)` および同ファイル190-193行目 `command.completed_at > entry.tests_green_at` は ISO8601 文字列を素の `>` で比較している。調査開始時点のHEAD(commit 14b0d994)で PLAN-L7-430-left-arm-carry-log.md の review_evidence は tests_green_at="2026-07-12T06:14:58+09:00"(=UTC 21:14:58)、reviewed_at="2026-07-11T21:15:00Z"。実時刻順序は tests_green_at がreviewed_atより2秒早く正順だが、日付桁'12'>'11'により文字列比較では逆順と誤判定され、doctorが `review-evidence — ⚠ 定量テスト→定性レビュー順序違反 1件 (PLAN-L7-430-left-arm-carry-log)` を報告(doctor exit=1の一因、当時実測)。後続commit(4954b97f→ace1c78d、現HEAD)でtimestampをZ表記へ揃えたことで当該箇所は解消したが、コード自体は無修正のまま残存しており(現HEAD ace1c78dのsrc/lint/review-evidence.tsを確認済み)、offset表記混在の他PLANで再発しうる。
- 提案: `new Date(x).getTime()` で epoch 比較するよう L252 と L190-193 を修正し、mixed timezone notation でも正しい時系列判定になる regression test (Z と +09:00 混在ケース) を追加する。

## 参考: minor 所見（8 件、起票は任意）

- (code-quality) **宣言以外どこからも参照されていない dead export が9件(トークン頻度スキャンで確認済み)** — src/audit の既知3モジュール(pr-review-route.ts / ci-auto-fix-gate.ts / release-automation-decision.ts)を除外し、src/+tests/ 全体でexport名の出現回数を集計した結果、宣言行以外に1回も出現しない(=呼び出し元ゼロ)ものが9件確認できた(各々 `grep -rn '\\bNAME\\b' --inc
- (test-quality) **CLIサブプロセスspawnラッパー（bun起動+win32 cmd.exeフォールバック）が8ファイルに個別複製され、うち5ファイルはwin32分岐を欠いたまま複製されている** — 同一パターン `if (process.platform === "win32") { const cmdExe = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "cmd.exe"); return spawnSync(cmdExe, ["/d", "/c", "bun", ...]); } return spawnSync(
- (docs-consistency) **docs/process/gates.md:81 が既に存在するファイルを『将来』作成予定として記述（stale）** — docs/process/gates.md:81 『詳細メカニクス: `docs/process/forward/` 各 L 定義 (将来 L07-implementation.md §4) に委譲。』と書くが、`docs/process/forward/L07-implementation.md` は既に存在し (git log: 2026-07-05 15:41 作成)、その §4 は実際に『
- (docs-consistency) **effort-observation の閾値定数が『暫定』のまま追跡先 PLAN 番号が無い** — docs/design/harness/L6-function-design/effort-observation.md:25 『初期値は運用観測前の暫定で、調整は telemetry 突合の後続 PLAN。』、その実装 PLAN である docs/plans/PLAN-L7-343-effort-observation-full-wiring.md:171 も『閾値定数の実測ベース調整（tele
- (dx-performance) **db rebuild が CI 1 サイクルで最大 3 回実行されるが、on-disk 出力の実消費者は 1 check の小さな fast-path のみ** — `bun src/cli.ts db rebuild --json` 単独 = real 11.649s。実 CI (run 29167741850) は "db rebuild (deterministic projection)" 10s + "db rebuild (post-test projection refresh)" 10s の2ステップに加え、doctor 内部でも rebuil
- (dx-performance) **@biomejs が glibc/musl 両バイナリを重複インストールし、片方は当該環境で完全に未使用** — node_modules/@biomejs/cli-linux-x64 と cli-linux-x64-musl がともに 54M（計108M）存在するが、ホストは Ubuntu/glibc（`ldd --version` → GLIBC 2.39、`ldconfig -p` に musl libc 無し）。bun.lock 34行目は両方を @biomejs/biome の optionalDe
- (dx-performance) **checkHandoverResurrection が git subprocess を複数回 spawn しており、telemetry scan を除く単体 check の中で最も重い** — doctor の ~100 個の (repoRoot)-only check 関数を個別計測した際、checkHandoverResurrection が一貫して最上位（1728.9ms / 1799.5ms、2回の独立計測とも1.7秒台）。内部の analyzeHandoverResurrectionShadowRepo → verifyGitAuthority（src/audit/handov
- (known-delta) **PLAN-L6-70 の generates に無効な artifact_type `process_doc` が現HEADで残存し plan-governance が violation を報告する** — docs/plans/PLAN-L6-70-left-arm-carry-log.md:39 `{ artifact_path: docs/process/forward/L07-implementation.md, artifact_type: process_doc }`。`process_doc` は src/schema/index.ts:207-227 の VALID_ARTIFACT_

注: 末尾の minor「PLAN-L6-70 の process_doc」は最新 main で既に `doc_update` へ修正済み（解消）。
