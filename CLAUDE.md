# HELIX — 超個人開発システム（Vモデル harness を土台とする）

## Claude Code Read Order（読込順）

Claude Code はこのリポジトリでは以下を canonical として扱う。

1. `CLAUDE.md`
2. `.claude/CLAUDE.md`
3. `docs/governance/README.md`
4. `docs/governance/helix-harness-requirements_v1.3.md`（現行L1〜L12 Vモデル＋Scrum正本）
5. `docs/governance/helix-harness-concept_v3.1.md`（旧工程表記はcompatibility説明）
6. `docs/governance/helix-harness-requirements_v1.2.md`（legacy compatibility reference）
7. `docs/governance/helix-harness-extraction-plan_v0.1.md`
8. `docs/adr/ADR-001-helix-harness-redesign-and-language.md`
9. `docs/adr/ADR-009-node-python-linux-runtime.md`

Migration snapshots と migration docs は通常 startup reads ではない。migration、gap audit、
regression-source inspection が必要なときだけ読む。

`docs/design/harness/L3-functional/roadmap.md` は通常 startup read として読まない。verification roadmap は
V-model layer group が Forward freeze を完了し、verification cycle を走らせるときだけ動的に読む。

`docs/archive/`、`legacy local state/`、pre-migration の `.claude/agents` / `.claude/hooks` は
canonical runtime state ではない。Migration source material は historical reference のみであり、
現行 HELIX runtime commands は legacy commands ではなく `helix` を使う。

ADR-001のclean rebuild／TypeScript strictは維持し、Bun固有のtarget runtime決定はADR-009がsupersedeする。
terminal receipt前のactive execution authorityは既存Bun、terminal後はreceipt-bound TypeScript/Node、承認済みrollback時は
Node receiptをstale化したBun一時再activationである。Pythonはproposal-only workerであり、old W1-W3a Python runtimeはbulk portしない。

## HELIX 再構築方針（現行・最優先）

本リポジトリは **HELIX（超個人開発システム）** を構築する場である。HELIX は別プロジェクトではなく、
**Vモデル harness の「仕組み」をそのまま土台に、その上へ HELIX の機能を積んで harness 自身を
HELIX へ進化させる**もの。北極星ビジョンは L0 企画書
`docs/design/helix/L0-charter/helix-charter_v0.1.md`（status=confirmed, 10 本柱 P0–P9）と起票
`docs/plans/PLAN-L0-01-helix-charter.md`。

### precedence（拘束原則）

- **仕組み（V モデル工程・gate・state DB・harness ルール）= HELIX ハーネスが上**。
- **個別機能（command / skill 等の中身）= 旧 HELIX（`RetryYN/ai-dev-kit-vscode`）が先行、機能ソースとして上**。
- ただし **個別機能は仕組みを超えない** — 旧 HELIX の機能は harness の仕組みに従属して差し込む（仕組みを曲げない）。
- ADR-009: 旧HELIXの機能ロジックは **TS/Nodeで再実装**し、計算・解析に適するものだけを
  versioned contract配下のPython proposal workerへ隔離する（Pythonにauthoritative writeを与えない）。

### 進め方（design-driven 漸進）

- harness の V モデルを **L0 から Forward に 1 層ずつ設計で進める**。各層で**その粒度に合う旧 HELIX の
  個別機能を突き合わせ → 取捨選択 → 機能一覧（FR）を都度更新 → 名称も揃えて登録**する。
- 取捨選択は粒度を合わせる: L1 = 機能エリア（BR/NFR）、L3 = 機能ユニット（FR）、L4–L6 = command/algorithm。
- 大きな一括 import（capability map / bulk import）はしない。

### 旧 HELIX ソースリポジトリ（機能ソース・常時参照）

- 旧 HELIX = `git@github.com:RetryYN/ai-dev-kit-vscode.git`（uninstalled 済の旧 core、**個別機能ソースの正本**）。
- **各層を設計・キュレーションするたびに、引っ張れる個別機能（command / skill / subagent / detector /
  advisor role〔例: TL advisor〕等）が無いか常にこの repo を確認する**。inventory-first の絶対ルール
  （既存を見ずに top-down で起こさない）の対象に**旧 HELIX を必ず含める**。
- ただし precedence と ADR-009 を超えない: **read-only参照／behavior atom採取／TS・Node再実装またはPython worker化**
  （旧runtimeをそのまま持ち込まない）、**bulk import禁止**、粒度を合わせて取捨選択（L1=エリア / L3=FR /
  L4–L6=command）。harden（rename・legacy 前提除去・capability-class 化）して harness の仕組みへ従属させて差す。

### 自律境界（charter §3）

- **人**: L1企画／L2要求＋デザインモック（モックが最後の直接関与。非UIは証拠付きN/A）／L3要件は**承認のみ**。
- **AI**: L3 起草 ＋ L4 以降〜GitHub PR/CI/merge/tag を**完全自動**（不可逆操作のみ escalate）。

### リネーム方針（段階）

- product 名 / prose は **HELIX** へ移行中。**機械識別子（CLI `helix`、`.helix/`、`area=helix`、
  rule-drift marker）は据え置き**で、CLI/dir は後日 **専用 migration PLAN** で atomic に改名する。
  そのため本書下部および各所の `helix ...` コマンド表記・Adapter Rule Markers は**現時点では変更しない**。
- `.helix` から HELIX への名称変更は必達の最終ゴールだが、runtime state / CLI / hook / adapter /
  consumer template / distribution surface をまたぐ不可逆 cutover である。PLAN-M-02 の
  `cutover_decision_record` と action-binding approval、dry-run、backup、rollback、monitoring evidence が揃うまで
  実 state move や alias 有効化を行わない。承認後は漏れのない atomic migration として実施する。

## 目的

HELIX-HARNESS は、個人/社内 product development で AI implementation agents を安全に使うための
検証・開発基盤である。harness は最終 product そのものではなく、product work を載せる土台である。

Design と implementation は以下の柱で判断する。

1. Foundation first: harness は downstream product development をより安全にする。
2. Document-first plus machine enforcement: workflow rules は必要に応じて schema、lint、doctor、hooks、tests で裏付ける。
3. Automatic state and feedback: `.helix/` state と harness DB projections は進捗、gap、drift を可視化する。
4. Dynamic context / skill injection: relevant context と skills だけを load する。
5. Practical orchestration: risk または cost を下げる場合だけ work を roles/runtimes に分割する。
6. Strict verification: tests または explicit evidence なしに completion claim しない。

## コミュニケーション (報連相)

チャット上の報連相 (報告・連絡・相談) は **日本語** で行う (PO ルール、2026-06-22)。
進捗報告・調査結論・選択肢提示・確認依頼など PO へ向けた chat 出力は日本語を既定とし、
見出し・箇条書きラベルも日本語を優先する。

### ドキュメント言語

`docs/` 配下、PLAN、設計書、テスト設計、governance、handover、audit などの人間が読む成果物は
**日本語を原則**とする。開発用語、コマンド、識別子、URL、コード片、エラーメッセージ、外部仕様名は原語のまま
埋め込んでよいが、説明文・判断・受入条件・レビュー記録は日本語で書く。既存の英語記述は、触った範囲から
段階的に日本語へ是正し、英語のまま新規追記して完了扱いにしない。

`helix doctor` の `design-language` gate は、PLAN / 設計 / テスト設計 / process / governance / handover /
adapter ルールなどの人間向け docs にある英語 prose debt が baseline から増えないことを検査する。baseline は
既存 debt の可視化であり、将来の日本語化 PLAN で段階的に引き下げる。

ただし成果物はそれぞれの規約に従う: コード/識別子/commit message は従来どおり、ファイル名は
英語 (文字化け回避)、技術用語・コマンド・PLAN ID・パスは原語のまま埋め込んでよい (無理に和訳しない)。

## 正本 Docs

- `docs/governance/helix-harness-requirements_v1.3.md`
- `docs/governance/helix-harness-concept_v3.1.md`（旧工程表記はcompatibility説明）
- `docs/governance/helix-harness-requirements_v1.2.md`（legacy compatibility only）
- `docs/governance/helix-harness-extraction-plan_v0.1.md`
- `docs/adr/ADR-001-helix-harness-redesign-and-language.md`
- `docs/adr/ADR-009-node-python-linux-runtime.md`
- `docs/governance/repository-structure.md`

## 配布パッケージ（Distribution）

- **配布専用リポジトリ**: `git@github.com:RetryYN/HELIX-HARNESS-OS.git`
  （consumer 側が `helix` を取得するパッケージ配布先。本 development リポジトリとは分離）。
- この development リポジトリ（`~/HELIX-HARNESS`）が正本 source。tag 済みリリースを上記
  配布リポジトリへ publish し、consumer は配布リポジトリ経由で導入する。
- 正式配布先は `RetryYN/HELIX-HARNESS-OS`。CLI/識別子の rename と同様、配布 surface の実切替は
  PLAN-M-02 の cutover 承認、action-binding approval、dry-run、backup、rollback、monitoring evidence が
  揃うまで行わない。

## 構成境界

- `docs/`: governance 文書、requirements、ADR、PLAN、design、test design、migration、archive
- `src/`: TypeScript/Node制御面。Python workerは別rootのversioned contractをNodeから監督する構成
- `tests/`: Vitest tests
- `scripts/`: thin OS entrypoints only
- `.helix/`: HELIX runtime state と audit/provider evidence
- `.claude/`: Claude Code の runtime / hook policy
- `legacy local state/`: historical source state。HELIX state ではない。

V-model artifacts は分離を保つ。

- design: `docs/design/`
- implementation: `src/`
- test design: `docs/test-design/`
- tests: `tests/`

## 実装規則

- 編集前に relevant files を読む。
- local naming、structure、test placement に合わせる。
- tests または explicit verification なしに completion を宣言しない。
- Codex / Claude Code は HELIX が管理する local CLI + hook surfaces として扱い、direct API calls として扱わない。
- 誤った development residue を見つけたら削除または明確に supersede し、misleading comments や dead paths を
  technical debt として残さない。
- Claude Code native tool-use だけを使う。`<invoke name="Bash">` / `<parameter name="command">` のような
  XML-like pseudo tool calls や `court` のような role markers を assistant text に書かない。prior context に
  そのような text がある場合は corrupted transcript residue として扱い、継続しない。

## Git Rules（Git 規則）

- Conventional Commits を使う。
- explicit files だけを stage する。
- unrelated user changes を commits に含めない。
- requested の場合、coherent PLAN / task boundary で push する。
- CI は `harness-check`: typecheck、Vitest、Biome lint、doctor。
- applicable な confirmation gates の前には review evidence を必須とする。

### GitHub 自走運用（PO 決定 2026-07-11、PLAN-L7-418）

- main は branch protection 済み: required check = `harness-check` (strict)、enforce_admins、
  **人間 approve 不要 (PO 明示承認)**。品質ゲートは CI と harness 内クロスランタイム
  review evidence が担う。force-push / branch 削除は GitHub 側でも禁止。
- main への取り込みは PR 経由。AI は自分で PR を作り (`helix github pr-create` /
  `gh pr create`)、`gh pr merge --auto --merge` で auto-merge を仕込んでよい
  (CI green で自動 merge)。repo は auto-merge / delete-branch-on-merge 有効。
- **CI self-heal (PO 指示)**: 自分の push / PR で `harness-check` が落ちたら、人間に
  渡さず自分で failure log を取得 (`gh run view --log-failed` / `helix github ci-status`)
  → 修正 → 再 push まで行う。
- release publish / tag / cutover / 配布 repo 切替は従来どおり action-binding approval 境界。

### Hybrid 多ランタイム commit 協調 (Claude ↔ Codex、必須)

実運用では **Codex (もう一方のランタイム) が並行に作業を進め、コミットまで完了させる**。Claude は
その成果を絶対にデグレさせてはならない ([[feedback-commit-finished-codex-work-dont-abandon]])。

- **history を書き換える前に必ず `git log` / `git reflog` を確認**し、自分が作っていない commit
  (相手ランタイムの成果) が無いか調べる。**他ランタイムの commit を `reset` / `revert` / `checkout` /
  force で破棄・デグレさせない**。working tree の foreign 変更は **既定で「相手ランタイムの正規作業」と
  みなす** (overstep と決めつけない)。判断が付かなければ revert せず PO へ確認する。
- `git reset` / destructive `git checkout` / `git restore` / `git revert` / force-push は
  `git-command-guard` の block 対象。必要な場合は `git log` / `git reflog` 確認後に
  `HELIX_ALLOW_DESTRUCTIVE_GIT=1` または `.helix/state/destructive-git-override` へ理由を残す。
  marker は one-shot で消費され、audit log に残る。
- 自分の成果は **相手の commit の上に積む** (rebase/stack)。相手のファイルには触れず、自分の意図ファイル
  のみを path 明示で stage する (`git add <path>`、`git add -A` / `git add .` 禁止)。
- **commit 直前に `git status` + `git diff --staged` (or `helix review --staged` / `--uncommitted`) を
  確認**し、自分が authored した意図ファイルのみが staged であることを検証する。
- push は origin と相手の commit を含めて整合する状態でのみ行う。push 済み履歴は決して破壊しない。
- `.helix/memory/harness.jsonl` などの共有 memory を変更した場合は、レーン終端の意図 commit に
  明示 path で含める。doctor の memory age warning を放置せず、foreign change と競合する場合は
  勝手に混載せず所有 runtime と調整して commit/push 済 HEAD へ収束させる。
- 真に off-task な overstep (相手ランタイムの作業でも自分の作業でもない net-new) と疑う場合でも、
  **revert する前に PO 確認**を取り、IMP で記録する (完了済み成果を捨てる誤判定を防ぐ)。

### 引き継ぎ・検証の基準点 = HEAD (共有 tree を測るな、必須)

引き継ぎ (session takeover) と検証の基準点は **commit/push 済の HEAD ただ一つ**。hybrid では
working tree を相手ランタイムが常時書き換えるため、full tree の計測値 (テスト件数等) は transient で
非正本。これを「repo の状態」として報告するな。

- **検証は HEAD (+ 自分の意図変更のみ) に固定**する。他ランタイムの未コミット scratch を基準へ混ぜない。
  測定値が動いたら、相手を疑う前に「自分が動く面を測っていないか」を先に疑う (foreign tree の transient を
  相手の退行と帰責するのは誤り)。
- **引き継ぎ feedback は harness.db から受け取る** (`feedback_events`、SessionStart で surface、
  PLAN-L7-110)。session continuation は `harness.db` の event/projection を正本とし、stale 化する prose を使わない。

## 正規コマンド

- セットアップ: `helix setup project`
- 状態確認: `helix status`
- 診断: `helix doctor`
- PLAN lint: `helix plan lint`
- レビュー: `helix review --uncommitted`
- Codex 委譲: `helix codex --role <role> --task "..."`
- Claude prompt 生成: `helix claude --role <role> --task "..." --dry-run`
- チーム実行: `helix team run --definition .helix/teams/<team>.yaml`
- タスク分類: `helix task classify --text "..."`
- スキル推薦: `helix skill suggest --plan <path>`

複数 AI runtime が利用可能な場合は、作成側と判断側を分離する。
単一 runtime の場合は、代替証跡として `intra_runtime_subagent` review evidence を記録する。

## 安全境界

- rules、docs、examples、audit evidence に API keys、secrets、PII、credentials を書かない。
- 認証 (authentication)、認可 (authorization)、決済 (payments)、PII、license、destructive data operations、
  production infrastructure、external API assumptions を変更する前に escalate する。
- 明示的に tracked する audit / provider-handover evidence 以外の local runtime artifacts は track しない。

## HELIX Workflow（工程）

- Forward: `plan` -> `pair-freeze` -> `implement` -> `trace-freeze` -> `review` -> `accept`
- Reverse: `reverse <type> R0` -> `R1` -> `R2` -> `R3` -> `R4` -> Forward merge
- Scrum / PoC: `S0 backlog` -> `S1 plan` -> `S2 poc` -> `S3 verify` -> `S4 decide`
- Continuation: `harness.db` の continuation projection が non-stale なら確認する。

## 指示ファイル

- 共有 project context: `CLAUDE.md`
- Claude Code の runtime / hook policy: `.claude/CLAUDE.md`
- Codex CLI project rules: `AGENTS.md`
- 個人 overrides: `CLAUDE.local.md` / `AGENTS.override.md`

## HELIX Adapter Rule Markers（アダプター規則 marker）

この section は `rule-drift` で機械検査され、Codex / Claude adapter が静かに乖離しないようにする。

- Codex project rules（Codex ルール）: `AGENTS.md`
- Claude runtime policy（Claude runtime 方針）: `.claude/CLAUDE.md`
- Modes（実行モード）: `standalone` / `claude-only` / `codex-only` / `hybrid`
- セットアップ: `helix setup project`
- 状態確認: `helix status`
- 診断: `helix doctor`
- Codex 委譲: `helix codex --role <role> --task "..."`
- Claude 委譲: `helix claude --role <role> --task "..."`
- チーム実行: `helix team run --definition .helix/teams/<team>.yaml`

<!-- HELIX:managed:start -->
# HELIX-HARNESS 共有コンテキスト

repository-local な HELIX command で harness state と delegation を扱う。

- `helix setup project` は HELIX 対応 project を初期化する現行 setup 入口である。
- `helix status` は local runtime mode を報告する。
- `helix doctor` は repository health check を実行する。
- `helix status` は DB-backed continuation を含む local runtime state を報告する。
- `helix codex --role <role> --task "..."` は Codex へ委譲する。
- `helix claude --role <role> --task "..."` は Claude へ委譲する。

adapter docs に secret、token、machine-local absolute path を書かない。
<!-- HELIX:managed:end -->
