---
plan_id: PLAN-L7-431-sweep2-improvements
title: "PLAN-L7-431 (troubleshoot): 全件チェック第2巡の改善点 — guard bypass / docs乖離 / 重複 / 順序比較バグ"
kind: troubleshoot
layer: L7
drive: agent
status: completed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-12 PO 指示「全件チェックして改善点を起票して」— 第 2 巡 sweep (CI 同順ゲート + 6 視点 + 敵対検証、26 agents) で確定 14 件を発掘"
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
    scope: "S1-S5、D1-D4、H2-H3、X1-X2を実装し、H1全面移行は意味差を保つVペア PLAN-L6-76 / PLAN-L7-438へ降ろした。cross-provider reviewerを利用できないため独立Codex subagentでseverity-first reviewを実施した。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/git-command-guard.test.ts tests/work-guard.test.ts tests/autonomous-loop-run-receipts.test.ts tests/secret-scan.test.ts tests/token-tracker.test.ts tests/review-evidence.test.ts tests/continuation-event-first.test.ts tests/sweep3-state-lane-hygiene.test.ts tests/digest.test.ts tests/digest-consumer-compatibility.test.ts tests/cli-surface.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T08:40:00Z", evidence_path: tests/git-command-guard.test.ts, output_digest: "sha256:4d257a10927bbc8225f0826165059e1beaa43ed6b1515a17962d05c442c83ba9" }
      - { kind: unit_test, command: "bunx vitest run tests/slow/projection-writer.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T08:40:00Z", evidence_path: tests/slow/projection-writer.test.ts, output_digest: "sha256:5ac9621676d668aac84b10d43859955bc956761b4085b4ef26d763b145876e3a" }
backprop_decision: not_required
backprop_decision_reason: "既存実装・docs の欠陥修正と品質改善であり、要求・設計の意味変更はない。guard 強化 (S1/S2) は防御網羅性の補修、docs 乖離 (D群) は実装への追随、重複・バグ (H/X群) は hygiene。契約自体の変更が要る項目はその時点で個別 backprop を判断する。"
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot 分類の妥当性と security 2 件 (S1/S2) の優先度判定"
  - role: se
    slot_label: "SE — guard 補修 / docs 追随 / digest 共有化 / 順序比較修正の実装"
  - role: qa
    slot_label: "QA — guard bypass の regression test と既存 gate 非退行の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-431-sweep2-improvements.md
    artifact_type: markdown_doc
  - artifact_path: docs/reference/system-review-sweep2-2026-07-12.md
    artifact_type: markdown_doc
  - { artifact_path: .claude/hooks/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: .claude/hooks/work-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/git-command-guard.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/work-guard.ts, artifact_type: source_module }
  - { artifact_path: src/orchestration/loop-store.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/autonomous-loop-run-receipts.ts, artifact_type: source_module }
  - { artifact_path: src/lint/secret-scan.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/digest.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/token-tracker.ts, artifact_type: source_module }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: tests/git-command-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/work-guard.test.ts, artifact_type: test_code }
  - { artifact_path: tests/autonomous-loop-run-receipts.test.ts, artifact_type: test_code }
  - { artifact_path: tests/secret-scan.test.ts, artifact_type: test_code }
  - { artifact_path: tests/token-tracker.test.ts, artifact_type: test_code }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
  - { artifact_path: tests/continuation-event-first.test.ts, artifact_type: test_code }
  - { artifact_path: docs/process/gates.md, artifact_type: process_doc }
  - { artifact_path: docs/process/forward/L07-implementation.md, artifact_type: process_doc }
  - { artifact_path: AGENTS.md, artifact_type: markdown_doc }
  - { artifact_path: README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/spec-driven-development.md, artifact_type: markdown_doc }
  - { artifact_path: docs/skills/incremental-implementation.md, artifact_type: markdown_doc }
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-431: 全件チェック第2巡の改善点

## 背景

2026-07-12 の PO 指示「全件チェックして改善点を起票して」に基づく第 2 巡 sweep。workflow
（CI 同順ゲート全走 + code-quality / test-quality / docs-consistency / guard-coverage /
dx-performance / known-delta の 6 視点 + 全所見の敵対検証、26 agents）で発掘し、反証で棄却
されなかった **確定 14 件**を本 PLAN に集約する。全件詳細（根拠・提案の逐語）は annex
`docs/reference/system-review-sweep2-2026-07-12.md`（C1〜C14 で番号対応）。

第 1 巡（PLAN-L7-425 / PLAN-L7-428）と既存 improvement-backlog で既出の事項は除外済み。
security 系 2 件（S1/S2）は Claude が実機再現を独立確認した（下記）。

## クラスタ S: guard 網羅性の穴（防御補修・最優先）

### S1: git-command-guard が subshell 経由で完全回避できる（critical、Claude 再現確認済み・annex C9）

- 事象: `src/runtime/git-command-guard.ts` の `shellTokens` はクォート内文字列を 1 トークンとして
  扱い、`gitSlices` は厳密に `git` トークンにしか反応しない。このため
  `bash -c "git reset --hard"` / `sh -c "git push --force"` / `eval "..."` は destructive git 検出を
  すり抜ける。Claude が HEAD で直接実行し、直の `git reset --hard` = block、subshell 経由 = pass
  を確認した。hybrid 運用で相手ランタイムの commit を守るはずの guard が subshell で無力化する。
- 対応: raw command 全体に二次パスを追加し、`bash -c` / `sh -c` / `eval` のクォート内を再帰的に
  再トークナイズして destructive git 検出へ通す。regression test（subshell 各形が block になる）を追加。
- 受け入れ: subshell 3 形態が block になる regression test green。既存の直コマンド判定は非退行。

### S2: loop の `--plan` 未検証によるパストラバーサル（critical、Claude 再現確認済み・annex C8）

- 事象: `src/orchestration/loop-store.ts` と `src/runtime/autonomous-loop-run-receipts.ts` は
  CLI `--plan <id>` の生文字列を `join(root, ".helix/state/loop", `${planId}.json`)` に渡し、
  ID 検証が無い。`--plan "../../..（省略）/x"` でループ state ディレクトリ外の任意 JSON を読める
  （write 側も同 planId を使う）。Claude が `join` の解決先が state ディレクトリ外へ脱出することを
  確認した。脅威モデルはローカル自己入力だが、autonomous loop が ID を外部由来で受け取る経路では
  実害になり得る。I5（`plan use` の plan_registry 照合）と同じ canonical ID 検証を横展開すべき。
- 対応: パス構築前に planId を canonical PLAN ID 正規表現 / safeName ホワイトリストで検証し、
  パス区切りを含む値は fail-close で拒否する。regression test を追加。
- 受け入れ: traversal 文字列が拒否され、正規 ID が通る regression test green。

### S3: PreToolUse(Bash) が work-guard に繋がっていない（important・annex C10）

- 事象: `.claude/settings.json`（と `.codex/hooks.json`）の Bash 用 PreToolUse は
  git-command-guard のみで、work-guard（foreign-uncommitted-file 保護）に配線されていない。
  相手ランタイムの未コミット foreign file を `sed -i` / `cp` / `mv` / `tee` / リダイレクトで
  Bash 経由 上書きしても block/override/audit 経路を通らない。Edit/Write は守られているのに
  Bash 経路だけ抜けている。
- 対応: Bash command からファイル書き込み・削除対象パスを抽出し、既存 `evaluateWorkGuard()` へ
  渡す追加チェックを Bash フックへ統合する。regression test を追加。
- 受け入れ: Bash 経由の foreign 上書きが block される regression test green。

### S4: override marker の one-shot 消費が的外れな call で浪費される（important・annex C12）

- 事象: destructive-git-override / foreign-edit-override の marker 消費条件は「このコマンドが
  実際に block 対象だったか」を見ず、marker 設置後に最初に来た無関係な Bash（例: `git status`）で
  消費される。意図した破壊的操作の前に marker が消え、本命が override 無しで block される
  （＝安全側に倒れるが UX/監査の意図と食い違う）。work-guard も同型。
- 対応: marker 消費を「bypass=false で評価したら実際に block になる call」に限定する。
- 受け入れ: 無関係 call で marker が消費されない regression test green。

### S5: secret-scan の marker が一般的な token 形式を捕捉しない（important・annex C11）

- 事象: `SECRET_SCAN_PATTERNS` の 6 marker では Stripe（`sk_live_`/`rk_live_`）、npm token、
  Slack webhook URL、単独 JWT、Azure connection string が走査対象範囲内でも未検出（9 例中 5 例が
  no match）。PLAN-L7-410 §2 の既知対象外とは別の、marker 集合自体のギャップ。
- 対応: 上記 token 形式の marker を追加する（annex C11 に候補正規表現）。
- 受け入れ: 追加 marker が該当例を検出し、既存 allow-marker 同居の false negative を増やさない
  regression test green。

## クラスタ D: docs と実装の乖離（実装への追随）

### D1: gates.md が未実装の検出器 4 本を「fail-close 稼働中」と記述（critical・annex C6）

- 事象: `docs/process/gates.md` §4 は `drift-check` / `connection-deficiency` / `test-perspective-gate`
  / `doc-drift` を「fail-close で強制」と現用扱いで列挙するが、これら 4 語は src/ 全体に実装が
  存在しない（`relation-graph` のみ実在）。`L07-implementation.md:48` も同様。PLAN-L7-428 W1
  （prose が未実装を実装済みと称する）と同じ family の docs 版で、運用正本での虚偽記述。
- 対応: 該当行に「未実装（carry, 起票待ち）」の状態注記を付けるか、未実装分を期待仕様/ロードマップ
  セクションへ移す。L07-implementation.md:48 の現用表現も是正。
- 受け入れ: gates.md / L07-implementation.md の記述が実装状態と一致。

### D2〜D4: 個別の docs 誤記（important・annex C4/C5/C7）

- D2（C4）: `AGENTS.md:139` が実在しない `helix task estimate` を正規コマンドに掲載
  （CLAUDE.md は既に除去済み、AGENTS.md だけ取り残し）。→ 削除 or 「未実装（PLAN-L7-72 scope外）」注記。
- D3（C5）: `README.md` の日常コマンド例が指す `.helix/teams/team.yaml` が不在（実在は
  `example-review-team.yaml` のみ）。→ 実在ファイルに差し替え。
- D4（C7）: `docs/skills/spec-driven-development.md` / `incremental-implementation.md` が
  実在しない `docs/design/L0-glossary.md` を用語追加先に指示（正は
  `docs/design/helix/L3-requirements/glossary-ssot.md`）。→ パス修正 or 概念参照に統一。
- 対応/受け入れ: 3 件とも参照先を実在パス/コマンドへ是正し、doc-consistency gate green 維持。

## クラスタ H: コード・テスト hygiene

### H1: sha256 / canonicalJson が 10+ ファイルに逐語重複、うち 1 本は手書き SHA-256（important・annex C1）

- 事象: `sha256:${createHash(...)}` ラッパーが共有モジュールを介さず 10+ ファイルに個別定義。
  `canonicalJson` も 5+ ファイルに重複。さらに `src/lint/handover-resurrection.ts` は node:crypto を
  使わず SHA-256 を約 90 行手書きし本番使用（IMP-103 で lint 共通化した前例の同カテゴリ再発）。
- 対応: `sha256`/`canonicalJson` を共有ユーティリティへ集約し全箇所 import。手書き SHA-256 は
  createHash へ置換（ただし `handover-resurrection.ts` は「純 lint 境界（runtime capability を持たない）」
  という意図設計の可能性があるため、置換可否は node:crypto 依存が境界テスト U-HRET-015 に抵触しないか
  確認したうえで判断する）。
- 受け入れ: 集約後も digest 系 test 全 green、監査対象の手書き crypto が縮小。

### H2/H3: テスト衛生（important・annex C2/C3）

- H2（C2）: `tests/projection-writer.test.ts` の rebuildHarnessDb 系 5 test が 5 秒超（最大 14.1 秒）
  だが tests/slow 未編入。fast/slow 分割の意図に反する。→ tests/slow へ移動 or fixture 縮小。
- H3（C3）: `tests/continuation-event-first.test.ts` の 3 箇所が os の tmpdir でなく実 repo の
  `.helix/` 直下に mkdtemp し、クラッシュ時に残渣が共有 runtime state を汚染し得る（他 219 test は
  tmpdir 使用）。→ tmpdir へ統一（spawn cwd だけ必要なら root と分離）。
- 対応/受け入れ: H2 は fast スイートの重量 test が解消、H3 は実 `.helix/` を汚さない構成へ。両者 test green。

## クラスタ X: 正確性・DX

### X1: review-evidence の順序判定が ISO タイムスタンプの文字列比較（important, 正確性バグ・annex C14）

- 事象: `src/lint/review-evidence.ts:193, 252` が ISO8601 を素の `>` で比較。timezone 表記が
  混在すると（`+09:00` と `Z`）日付桁の大小で誤判定し、正順の evidence を「順序違反」と誤検知する。
  第 1 巡調査時に PLAN-L7-430 で実際に doctor exit=1 を誘発（その後 Z 表記統一で表面上は解消したが、
  コードは無修正で他 PLAN での再発リスクが残る）。
- 対応: `new Date(x).getTime()` の epoch 比較へ修正。Z と +09:00 混在の regression test を追加。
- 受け入れ: 混在ケースで正しい時系列判定になる test green。

### X2: doctor が毎回 cross-project telemetry を全件スキャン（important, 性能・annex C13）

- 事象: `helix doctor` が repoRoot 非依存で `~/.claude/projects`（317 jsonl）と
  `~/.codex/sessions`（11741 jsonl, 4.6G）を毎回 readFileSync+parse し、doctor 実行時間（実測 ~64 秒）の
  約 41%（~26 秒）を占める。キャッシュ無しでコーパスは無限増加。当該 repo の governance gate とは
  独立の関心事。
- 対応: mtime+size 増分キャッシュを `loadRuntimeSessionUsage` に追加、または本 projection を
  doctor hard gate から外し任意コマンド（`helix telemetry scan` 相当）へ切り出す。
- 受け入れ: doctor 実行時間が短縮し、telemetry の実消費者が明示経路で取得できる。

## Schedule

- step 1 (serial): S1/S2 の AIM 優先度判定（security 補修を最優先で着手してよいか）を記録。
- step 2 (parallel): S1〜S5 の guard 補修 + regression test。
- step 3 (parallel): D1〜D4 の docs 追随。
- step 4 (parallel): H1〜H3 の hygiene、X1 の順序比較修正、X2 の telemetry 切り出し。

## 完了条件（DoD）

- S1/S2 の subshell bypass / traversal が block される regression test green（Claude の再現を test 化）。
- S3〜S5 / X1 各々の regression test green。
- D1〜D4 の docs 記述が実装状態と一致（doc-consistency gate green 維持）。
- H1〜H3 / X2 の改善後も全 gate 非退行。
- 各 step の green command を digest 付きで review_evidence に記録し、cross-runtime review を経て confirm。

## 実装結果（2026-07-12）

- S1–S5: subshell/eval destructive Git、loop path traversal、Bash foreign write、override消費、credential markerを補修し、敵対fixtureを追加した。
- D1–D4: 未実装detector、存在しないcommand/team/glossary pathの現用記述を実状態へ是正した。
- H1: typed digest utilityへ意味同一consumerを移行し、純lint境界は維持した。H2はprojection writer 30 oracleをslow projectへ移し、H3はOS tmpdir内の`.helix`へ隔離した。
- X1: ISO文字列比較をepoch比較へ変更しtimezone混在fixtureを追加した。X2はmtime/size keyed cacheと明示clear surfaceを追加した。
- 独立reviewと全gate再実行を完了し、digest全面移行は意味差を固定した後続Vペアへ接続した。

## 引き継ぎメモ（Codex 向け）

- 全件詳細は annex `docs/reference/system-review-sweep2-2026-07-12.md`（C1〜C14）。minor 8 件も末尾に
  記載（起票任意、うち PLAN-L6-70 の process_doc は最新 main で解消済み）。
- S1/S2 は Claude が実機再現済み。着手時は annex の PoC 手順を regression test の骨子に使える。
- 大きい項目（H1 の全面集約、X2 の telemetry 切り出し）は本 PLAN で一括完了を claim せず、必要なら
  successor PLAN へ分割してよい（`coding ≠ substance`）。
