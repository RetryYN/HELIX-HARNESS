# HELIX 運用ルール強制ギャップ監査 2026-08-12

status: draft（PO レビュー待ち）
scope: 要件正本 `docs/governance/helix-harness-requirements_v1.3.md` を基準に、運用ルールが
(a) 曖昧なまま prose に留まる箇所、(b) エージェント（Claude subagent / Codex / Kimi 等ワーカー）へ
機械的に引き込まれない箇所、(c) 忘却しやすい位置にある箇所を横断監査し、
強制または仕組み化できるポイントをイシューとして列挙する。
method: pmo-sonnet ×1 + pmo-project-explorer ×3 の 4 レーン並列監査
（①要件v1.3×enforcement 突合 / ②Claude ランタイム面 / ③Codex・Kimi ワーカー面 / ④CLI・doctor・VSCode 面）。
各所見は file:line 根拠付き。推測を含むものは明記。

## 総評

- 堅牢な系統: allowlist（`allowlist-sync`）、judgment_core marker（`judgment-core-coverage`）、
  agent-model（`agent-model-ssot`）、および Authoring Admission Transaction（`tests/infinity-loop-strict-design-contract.test.ts`）は機械強制が効いている。
- 最大の構造的穴は 3 つ:
  1. **native subagent へのルール非注入**（Task/Agent tool 経由には memory recall・skill 注入が届かない）。
  2. **要件正本と稼働 lint の食い違い**（NFR 台帳、PLAN 物理 path）— 「正本を読んでも実態と違う」状態。
  3. **rule-drift の検査範囲が literal marker 9 個のみ**で、effort 表・Fable 条件・FE ロスター等が
     Codex 面へ非伝播でも green のまま。

## P1: 実害が大きい・早期仕組み化推奨

### ISSUE-01 native subagent に harness memory recall / skill 注入が届かない
- 分類: 非伝播（構造的）
- 根拠: `src/runtime/memory-injection.ts:12-16`（`MEMORY_ENABLED_SURFACES = delegation/team_run/task_route` のみ）。
  `composeDelegationInjection` の呼び出し元は `src/cli.ts:850-880`（CLI wrapper 専用）で、
  Claude Code ネイティブ Task/Agent tool 経路には注入導線が無い。全 Claude subagent に共通。
- 提案: `MemoryInjectionSurface` に `native_subagent` を追加し、agent-guard hook（PreToolUse(Agent|Task)）で
  prompt へ memory recall を合成する。少なくとも非到達である事実を `.claude/CLAUDE.md` に明記する。

### ISSUE-02 `.claude/agents/*.md` の `memory: project` frontmatter が死んだ宣言
- 分類: 忘却位置（誤認誘発）
- 根拠: consumer が `src/` `.claude/hooks/` に 0 件（独自フィールド、Claude Code 標準スキーマにも無い）。
- 提案: フィールド削除 or 実 consume する hook 実装。doctor に「frontmatter 未知フィールド検出」を追加。

### ISSUE-03 要件正本と稼働 lint の矛盾: NFR 台帳（HR-NFR-REG-001〜007）
- 分類: 食い違い（正本権威毀損）
- 根拠: v1.3.md:220-230 は「`nfr-grade.md` の placeholder projection を NFR 正本とみなさない」と明記するが、
  `src/lint/l3-progression-authority.ts:21` / `src/lint/g3-trace.ts:40` は同ファイルを canonical L3 NFR として参照中。
- 提案: AI 自走で解消する（PO 判断不要、Sol T0 壁打ち 2026-08-12 で確定）。要件は既に「typed registry へ収束」と
  決めているため、registry 契約の実装 PLAN 化 → projection との一致検査・fail-close oracle 追加 → dual-green 期間は
  既存 projection を互換 trace 入力として扱う。PO gate が要るのは registry を正式 authority へ昇格する
  authority receipt（v1.3.md:232 が自ら要求）の 1 点のみ。
- 補足（Sol 指摘）: 「lint が canonical 扱いしている」は表現過剰。実態は blocker manifest 対象／trace 入力としての
  参照であり、authority 宣言ではない。

### ISSUE-04 §5.1 PLAN 物理 path 拘束が全面未実装（実運用は flat 配置）
- 分類: 食い違い（要件は write 前 fail-close を明記、実装ゼロ）
- 根拠: v1.3.md:320-341 vs `docs/plans/` サブディレクトリ 0 件（実測）。`plan-entry-routing.ts` は別目的。
  `.claude/CLAUDE.md` PLAN 規則節も本要件に触れない。
- 提案: AI 自走で実装 PLAN を起票し通常 review/CI で進める（PO 判断不要、Sol T0 壁打ち 2026-08-12 で確定）。
  順序: 新規 PLAN の path/schema/write guard を先に fail-close 化 → recursive scanner + plan_id identity →
  既存 flat PLAN は即時 rename せず transition receipt/DB/trace/digest/test を揃えて別 cutover。
  PO 承認が要るのは (a) 要件本文の意味変更、(b) 既存 PLAN の物理移行（不可逆 cutover、dry-run/backup/rollback 付き）のみ。

### ISSUE-05 `helix codex/claude --role` の top-level CLI 委譲が 4-marker guard の適用範囲外
- 分類: 未強制
- 根拠: `src/cli.ts:11129-11278`（marker 検証なし）vs `src/runtime/agent-guard.ts:236-268`
  （`DELEGATION_BRIEF_MARKERS` は Agent/Task tool_input 専用）。
- 提案: `buildAdapterPlan`（`src/runtime/adapter.ts`）に marker 検証を追加、または CLI action に
  `agentGuardDecision` 相当を通す。

### ISSUE-06 Codex `spawn_agent` 分岐に委譲 4 点セット検査が無い
- 分類: 非伝播（judgment-core §5 は「全ランタイム共通」と謳う）
- 根拠: `src/runtime/agent-guard.ts:95-139`（Codex 分岐に `missingDelegationBriefMarkers` 呼び出し無し）。
- 提案: Codex 分岐にも同一 marker 検査を追加し、AGENTS.md Hooks 節に同一強制の明文を追記。

### ISSUE-07 rule-drift の検査範囲が literal marker 9 個のみ
- 分類: 未強制（意味的差分を検出しない構造的穴）
- 根拠: `src/lint/rule-drift.ts:16-32`。`.claude/CLAUDE.md:172` のモデル別 effort 節・Fable advisor 条件・
  FE ロスター節は AGENTS.md に不在（`model-effort` grep 0 件）でも doctor green。
- 提案: セクション見出し集合の相互包含チェック、または節単位ハッシュ突合を追加。
  意図的差分は `<!-- rule-diff: intentional reason=... -->` 規約で明示し、コメント無き差分のみ violation とする。

### ISSUE-08 worker-common-contract（WCC-FR/AC）が機械強制ゼロ、Kimi 禁則が空規則
- 分類: 忘却位置（PoC 止まり）
- 根拠: `docs/design/helix/L3-requirements/worker-common-contract.md`（status: draft）、
  `WCC-FR|WCC-AC` の src/tests 参照 0 件。`WCC-FR-09`（broker 経由必須・raw spawn 禁止）は
  broker も raw spawn を止める guard も未実装。`helix kimi` コマンド不在（`src/cli.ts` に kimi 0 件）。
- 提案: `agent-guard-policy.ts` に `kimi*` を forbidden entry として先行登録し raw 起動を fail-close。
  acceptance（`docs/test-design/helix/worker-common-contract-acceptance.md`）を実 gate 化するまで
  Kimi 実装 PLAN 着手不可とする lint を追加。

### ISSUE-09 model effort 表の SSoT⇄prose 同期 lint が無い ＋ 未知 model のサイレント medium fallback
- 分類: 未強制
- 根拠: `src/team/model-effort.ts:28-53`・`standardEffortForModel`（69-76 行、未知→medium）に対し
  `src/lint/` に effort-sync 相当なし。Kimi 系 model id 未登録で無審査 medium 固定になる。
- 提案: `allowlist-sync.ts` と同パターンの `effort-sync` lint を追加。未知 model 解決時は
  warning + harness.db へ `effort_source=fallback` 記録を必須化。

### ISSUE-10 Claude Code 外の commit 経路が guard を素通り（実 git hook 不在）
- 分類: enforcement gap（実行経路依存）
- 根拠: `.git/hooks/` に sample のみ、husky 等未導入。guard は `.claude/settings.json` の PreToolUse のみ。
  hosted API surface は AGENTS.md 自身が「repo hooks は機械的に intercept できない」と self-declared gap。
- 提案: 軽量 pre-commit hook（`helix doctor --scope toolchain` 等）を追加。hosted surface 向けには
  preflight wrapper（git status/reflog 確認強制）を用意。

## P2: 仕組み化推奨（中優先）

### ISSUE-11 HR-FR-HYB-001〜010 の ID citation が src/tests に 0 件
- 根拠: v1.3.md:189-200。backfill 要件自身が「野良実装」状態という逆説。
- 提案: 各 ID に最低 1 箇所の citation を義務付ける lint ＋ 棚卸し PLAN 起票。

### ISSUE-12 GOP-FR-01〜14 / GOP-T-01〜11（§6 GitHub 工程投影）の trace ゼロ
- 根拠: v1.3.md:374-382、src/tests に 0 件（GH-FR 系は trace 済みと対照的）。
- 提案: ID ベース test 追加、または既存実装への ID citation 後付け。

### ISSUE-13 route 判定 6 軸 receipt（HR-AC-ROUTE-01）と判定基準の曖昧さ
- 根拠: v1.3.md:96-104。「見積り分布」「過去実装速度」の算出式・閾値が本文に無く判定不能。receipt schema 未実装。
- 提案: L4 で 6 軸の重み・閾値を数値化し、receipt schema + fail-close lint を実装。

### ISSUE-14 verification_measurement_contract の staleness 閾値未定義
- 根拠: v1.3.md:151-157。「未測定・stale・非代表環境」の許容差が未定義、対応 lint 未確認。
- 提案: staleness window を明文化し lint 実装。

### ISSUE-15 §8 実行権限境界（Python ワーカー制約）の直接検査 gate が特定できない
- 根拠: v1.3.md:394-400 は「doctor gate または test で検査可能な AC として接続する」と自己要求するが、
  network default deny / DB path 非付与 / Node 再検証を名指しで検査する gate が `src/lint/` から特定できず（要追加確認）。
- 提案: 該当 gate の存在確認 → 無ければ AC 直結の test を追加。

### ISSUE-16 doctor の canonical / compatibility 層別が実装に無い
- 根拠: `src/doctor/index.ts:7400-7530`（約 150 check を単一 ok に集約、tier 属性なし）。
  CLAUDE.md の「dual-green 分離」原則と不整合。OS 別 gate 区分も `DoctorScope`（full/toolchain のみ）に無い。
- 提案: `DoctorCheckDefinition` に `tier` を追加し `doctor-summary.v1` に tier 別 pass/fail を分離出力。
  `compatibility` プロファイルを追加し CI windows job を doctor 経由に配線。

### ISSUE-17 doctor の `check_failed`（検査自体のクラッシュ）と規約違反が区別不能
- 根拠: `src/doctor/index.ts:2157` ほか約 150 check に反復する catch→`doctorFailure(id,"check_failed")` パターン。
- 提案: `check_failed` を別 severity として JSON 出力に個別カウント。

### ISSUE-18 one-shot override marker の残留を doctor が検査しない
- 根拠: `foreign-edit-override` / `destructive-git-override` は `src/runtime/*` にのみ出現、doctor 対象外。
- 提案: 残留 marker（生存期間超過）検知 check を doctor に追加。

### ISSUE-19 CLAUDE.md 記載コマンドの実行不能ドリフト（`--dry-run` 等）
- 根拠: CLAUDE.md:244 の `helix claude ... --dry-run` は未登録オプション（実装は `--execute` 省略が dry-run 既定、
  `src/cli.ts:11129-11178`）。
- 提案: doc 内 `helix ...` 片を commander 定義と突合する doc-consistency check を追加。

### ISSUE-20 VSCode 拡張（HR-FR-HYB-009）はプロトタイプ止まりで実配布・IDE 実動作検証なし
- 根拠: `src/vscode/extension.ts:1-36`、拡張用 package.json / .vsix / vsce ステップ不在。
  doctor `vscode-extension-dynamic-binding`（`src/doctor/index.ts:2094-2153`）はデータ構造整合のみ。
  `helix vscode find` は CLI からのみで IDE 統合経路が無い。
- 提案: AC を「read-model 契約のみ」に絞る要件修正、または vsce dry-run packaging を CI に追加し
  拡張 e2e（@vscode/test-electron）検証 PLAN を起票。

### ISSUE-21 CI branch-kind → gate マッピングが YAML ベタ書きで SSoT 分裂
- 根拠: `.github/workflows/harness-check.yml:88-102`（shell case 分岐）。
- 提案: マッピングを src 側から JSON 出力させ YAML は読むだけにする。

### ISSUE-22 SessionStart 等 fail-open hook の失敗が累積可視化されない
- 根拠: `.claude/hooks/session-log.ts:11,40-50`（catch 握りつぶし）。memory surface が毎回失敗しても気づけない。
- 提案: doctor に「直近 N session の SessionStart hook 失敗率」項目を追加（harness.db event ログ再利用）。

### ISSUE-23 worker runtime security 指示書が research 止まりで要件正本へ未昇格
- 根拠: `docs/research/worker-runtime-security-requirements-instruction-2026-07-19.md:88-166`
  （L1/L3 差し込み指示のまま、反映痕跡なし）。
- 提案: l3-progression-authority 系の正規化リストに反映有無を追跡項目として登録。

### ISSUE-24 draft PoC 成果物の正本 cite を検査する lint が無い（WCC-AC-06 相当）
- 根拠: `worker-common-contract.md:94`、`PLAN-DISCOVERY-13-kimi-worker-cli-poc.md:9`（status: draft）。
- 提案: status=draft/poc の成果物が Forward 正規 PLAN から「採用済み」cite されていないかを検査する
  plan-supersession 系の兄弟 lint を追加。

### ISSUE-25 repo root の runtime artifact 管理漏れ
- 根拠: root 直下 `harness.db`（0 byte、gitignore 対象外・untracked）、`bin/helix`（壊れた symlink）、
  持ち込みファイル群（`HELIX_CHAT_...md` 等）がどの gate にも掛からない。`.gitignore:24-26` は `.helix/harness.db` のみ。
- 提案: `.gitignore` に `/harness.db*` `/bin/` を追加し、doctor に root 直下許可リスト check を追加。

### ISSUE-26 `settings.local.json` が機械検査の構造的盲点（個人絶対パス hook 等）
- 根拠: `.claude/settings.local.json` の Stop hook が worktree 絶対パスをハードコード、
  gitignore 対象のため rule-drift / doctor の対象外。「Personal absolute paths 不要」原則と乖離。
- 提案: local 実行時のみの軽量 check（絶対パス pattern を redact 判定）を doctor に追加。

## P3: 低優先・advisory 相当

- **ISSUE-27** effort override（agent frontmatter `effort: high` 乱立）の妥当性検査なし → doctor advisory で件数可視化
  （根拠: `.claude/agents/security-audit.md:6` 等）。
- **ISSUE-28** `CODEX_AGENT_TYPE_ALLOWLIST` 値が AGENTS.md に非列挙（Claude 側と非対称）→ rule-drift marker に追加
  （根拠: `src/runtime/agent-guard-policy.ts:65-69`）。
- **ISSUE-29** judgment-core §7「判断コア節 5 行以内」が未検査 → advisory 止まりで可
  （根拠: `src/lint/judgment-core-coverage.ts:91-112`）。
- **ISSUE-30** `.claude/CLAUDE.md` の `PreToolUse(Agent)` 表記と settings.json matcher `"Agent|Task"` の字面差
  → rule-drift に settings.json 突合を追加。
- **ISSUE-31** 統合 guard hook（`.claude/hooks/git-command-guard.ts:31-51`）の catch でどの guard 起因か消失
  → エラーメッセージへ原因併記（軽微）。
- **ISSUE-32** green-command-digest は digest 照合のみで再実行なし（確度中・要実装確認）→ 生成時刻・再現性記録を追加検討。
- **ISSUE-33** decision ledger（§3.1）・SR0〜SR4 receipt（§4.1）・Design HARNESS registry（§4.9）・
  Universal Workflow envelope（§4.4）・implemented/ux_verified 分離（§4.5）は L4/L5 未着手由来の未実装
  → 「バグ」ではなく進行段階の可能性が高い。PLAN 進捗と併読し、要件側へ既知 gap 注記を推奨。
- **ISSUE-34** Kimi 実装時の重複実装リスク: `adapterExecutionEnv`（`src/runtime/adapter.ts:347`）の
  allow-list scrub が provider 固定 → provider-agnostic に抽出し、Kimi PLAN に reuse required を明記。
- **ISSUE-35** Fable advisor 呼び出し 6 条件は「呼ばない方向」が fail-open → 機械化は過剰、session summary への
  自己申告欄程度が現実的。

## 推奨アクション（Sol T0 壁打ち 2026-08-12 反映済み）

### PO 介入が本当に必要なもの（charter §3 基準、これのみ）

- ISSUE-03 のうち、typed NFR registry を正式 authority へ**昇格**する時点の authority receipt（v1.3.md:232 が要求）。
- ISSUE-04 のうち、既存 flat PLAN の**物理移行**（不可逆 cutover。dry-run/backup/rollback 付きで承認へ）。
- 要件正本 v1.3 の**意味・authority・受入条件を変更**する場合の L3 承認（通常ゲートであり個別相談ではない）。

上記以外はすべて AI 自走（実装 PLAN 起票 → 通常 PR/CI/レビュー経路）。初版が ISSUE-03/04 を
「PO 判断待ち」としたのは過剰エスカレーションであり、本版で訂正した。

### AI 自走アクション

1. **正本整合の実装解消**: ISSUE-03（registry 契約の PLAN 化 + 一致検査 oracle）、ISSUE-04（新規 PLAN の
   write guard fail-close 先行）。
2. **委譲 contract surface parity**: ISSUE-05/06 を 1 PLAN に統合（同一 policy module の適用面拡張）。
3. **rule-drift 拡張**: 全文 hash ではなく shared obligation の差分 registry に限定して拡張（Sol 修正案、ISSUE-07）。
   sync-lint の過度な一般化はしない。
4. **ワーカー先行防御**: ISSUE-08（kimi forbidden entry 先行登録）は実装前でも低コストで fail-close 化。
5. **native subagent 注入（ISSUE-01/02）**: agent-guard へ即注入せず、まず admission surface matrix を作成し、
   未対応 surface は明示 deny または wrapper 経由へ振り分けてから設計する（Sol 指摘）。

### Sol 壁打ちでの追加所見（追補イシュー候補）

- **ISSUE-36（P1 候補）**: Codex version propagation 不整合 — AGENTS.md は Codex 0.128 / SubagentStop N/A 記載、
  `.codex/hooks.json` と現行 policy は 0.144 前提。
- **ISSUE-37**: 発見済み gap（missing-test-plan-id / missing-test-oracle-id 等 harness.db 蓄積）を実装・検証へ運ぶ
  経路が弱く、監査 → PLAN → oracle の閉路が未接続。
- **ISSUE-38**: canonical L1-L12 と legacy compatibility projection の dual-green を DB identity / digest / trace /
  fixture / CI 期待値まで一枚の surface matrix で追えていない。
- 本監査書自体の snapshot binding（observed HEAD / tree digest / green command）が無く、件数を canonical evidence と
  して扱うには不足 — commit 時に付記する。
- P1 の再序列: ISSUE-02/08/09/10 は P2 降格候補。ISSUE-09 の medium fallback は「意図的な安全側 fallback」であり
  表現を修正（可観測性の追加のみ提案として維持）。
