# HELIX — 超個人開発システム（UT-TDD Agent Harness を土台とする）

## Claude Code Read Order（読込順）

Claude Code はこのリポジトリでは以下を canonical として扱う。

1. `CLAUDE.md`
2. `.claude/CLAUDE.md`
3. `docs/governance/README.md`
4. `docs/governance/ut-tdd-agent-harness-concept_v3.1.md`
5. `docs/governance/ut-tdd-agent-harness-requirements_v1.2.md`
6. `docs/governance/ut-tdd-agent-harness-extraction-plan_v0.1.md`
7. `docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md`

Migration snapshots と migration docs は通常 startup reads ではない。migration、gap audit、
regression-source inspection が必要なときだけ読む。

`docs/design/harness/L3-functional/roadmap.md` は通常 startup read として読まない。verification roadmap は
V-model layer group が Forward freeze を完了し、verification cycle を走らせるときだけ動的に読む。

`docs/archive/`、`legacy local state/`、pre-migration の `.claude/agents` / `.claude/hooks` は
canonical runtime state ではない。Migration source material は historical reference のみであり、
現行 UT-TDD runtime commands は legacy commands ではなく `ut-tdd` を使う。

ADR-001 は拘束力を持つ。source concepts は design source material として使ってよいが、
UT-TDD implementation は TypeScript/Bun である。old W1-W3a Python は current product runtime ではない。

## HELIX 再構築方針（現行・最優先）

本リポジトリは **HELIX（超個人開発システム）** を構築する場である。HELIX は別プロジェクトではなく、
**UT-TDD Agent Harness の「仕組み」をそのまま土台に、その上へ HELIX の機能を積んで harness 自身を
HELIX へ進化させる**もの。北極星ビジョンは L0 企画書
`docs/design/helix/L0-charter/helix-charter_v0.1.md`（status=confirmed, 10 本柱 P0–P9）と起票
`docs/plans/PLAN-L0-01-helix-charter.md`。

### precedence（拘束原則）

- **仕組み（V モデル工程・gate・state DB・harness ルール）= UT-TDD ハーネスが上**。
- **個別機能（command / skill 等の中身）= 旧 HELIX（`RetryYN/ai-dev-kit-vscode`）が先行、機能ソースとして上**。
- ただし **個別機能は仕組みを超えない** — 旧 HELIX の機能は harness の仕組みに従属して差し込む（仕組みを曲げない）。
- ADR-001 継続: 旧 HELIX の機能ロジックは **TS/Bun で再実装**（Python を runtime に持ち込まない）。

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
- ただし precedence と ADR-001 を超えない: **read-only 参照／設計概念のみ採取／TS・Bun 再実装**（Python・旧
  runtime をそのまま持ち込まない）、**bulk import 禁止**、粒度を合わせて取捨選択（L1=エリア / L3=FR /
  L4–L6=command）。harden（rename・legacy 前提除去・capability-class 化）して harness の仕組みへ従属させて差す。

### 自律境界（charter §3）

- **人**: L0 企画 / L1 要求 / L2 デザインモック（モックが最後の直接関与）／ L3 要件は**承認のみ**。
- **AI**: L3 起草 ＋ L4 以降〜GitHub PR/CI/merge/tag を**完全自動**（不可逆操作のみ escalate）。

### リネーム方針（段階）

- product 名 / prose は **HELIX** へ移行中。**機械識別子（CLI `ut-tdd`、`.ut-tdd/`、`area=harness`、
  rule-drift marker）は据え置き**で、CLI/dir は後日 **専用 migration PLAN** で atomic に改名する。
  そのため本書下部および各所の `ut-tdd ...` コマンド表記・Adapter Rule Markers は**現時点では変更しない**。
- `.ut-tdd` から HELIX への名称変更は必達の最終ゴールだが、runtime state / CLI / hook / adapter /
  consumer template / distribution surface をまたぐ不可逆 cutover である。PLAN-M-02 の
  `cutover_decision_record` と action-binding approval、dry-run、backup、rollback、monitoring evidence が揃うまで
  実 state move や alias 有効化を行わない。承認後は漏れのない atomic migration として実施する。

## Purpose（目的）

UT-TDD Agent Harness は、社内 product development で AI implementation agents を安全に使うための
verification and development foundation である。harness は最終 product ではなく、他の product work を載せる土台である。

Design と implementation は以下の pillars で判断する。

1. Foundation first: harness は downstream product development をより安全にしなければならない。
2. Document-first plus machine enforcement: workflow rules は必要に応じて schema、lint、doctor、hooks、tests で裏付ける。
3. Automatic state and feedback: `.ut-tdd/` state と harness DB projections は progress、gaps、drift を可視化する。
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

`ut-tdd doctor` の `design-language` gate は、PLAN / 設計 / テスト設計 / process / governance / handover /
adapter ルールなどの人間向け docs にある英語 prose debt が baseline から増えないことを検査する。baseline は
既存 debt の可視化であり、将来の日本語化 PLAN で段階的に引き下げる。

ただし成果物はそれぞれの規約に従う: コード/識別子/commit message は従来どおり、ファイル名は
英語 (文字化け回避)、技術用語・コマンド・PLAN ID・パスは原語のまま埋め込んでよい (無理に和訳しない)。

## Canonical Docs（正本）

- `docs/governance/ut-tdd-agent-harness-concept_v3.1.md`
- `docs/governance/ut-tdd-agent-harness-requirements_v1.2.md`
- `docs/governance/ut-tdd-agent-harness-extraction-plan_v0.1.md`
- `docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md`
- `docs/governance/repository-structure.md`

## Architecture Boundary（構成境界）

- `docs/`: governance、requirements、ADRs、plans、design、test design、migration、archive
- `src/`: TypeScript/Bun harness core
- `tests/`: Vitest tests
- `scripts/`: thin OS entrypoints only
- `.ut-tdd/`: UT-TDD runtime state と audit/handover evidence
- `.claude/`: Claude Code runtime / hook policy
- `legacy local state/`: historical source state。UT-TDD state ではない。

V-model artifacts は分離を保つ。

- design: `docs/design/`
- implementation: `src/`
- test design: `docs/test-design/`
- tests: `tests/`

## Coding Rules（実装規則）

- 編集前に relevant files を読む。
- local naming、structure、test placement に合わせる。
- tests または explicit verification なしに completion を宣言しない。
- Codex / Claude Code は UT-TDD が管理する local CLI + hook surfaces として扱い、direct API calls として扱わない。
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

### Hybrid 多ランタイム commit 協調 (Claude ↔ Codex、必須)

実運用では **Codex (もう一方のランタイム) が並行に作業を進め、コミットまで完了させる**。Claude は
その成果を絶対にデグレさせてはならない ([[feedback-commit-finished-codex-work-dont-abandon]])。

- **history を書き換える前に必ず `git log` / `git reflog` を確認**し、自分が作っていない commit
  (相手ランタイムの成果) が無いか調べる。**他ランタイムの commit を `reset` / `revert` / `checkout` /
  force で破棄・デグレさせない**。working tree の foreign 変更は **既定で「相手ランタイムの正規作業」と
  みなす** (overstep と決めつけない)。判断が付かなければ revert せず PO へ確認する。
- `git reset` / destructive `git checkout` / `git restore` / `git revert` / force-push は
  `git-command-guard` の block 対象。必要な場合は `git log` / `git reflog` 確認後に
  `UT_TDD_ALLOW_DESTRUCTIVE_GIT=1` または `.ut-tdd/state/destructive-git-override` へ理由を残す。
  marker は one-shot で消費され、audit log に残る。
- 自分の成果は **相手の commit の上に積む** (rebase/stack)。相手のファイルには触れず、自分の意図ファイル
  のみを path 明示で stage する (`git add <path>`、`git add -A` / `git add .` 禁止)。
- **commit 直前に `git status` + `git diff --staged` (or `ut-tdd review --staged` / `--uncommitted`) を
  確認**し、自分が authored した意図ファイルのみが staged であることを検証する。
- push は origin と相手の commit を含めて整合する状態でのみ行う。push 済み履歴は決して破壊しない。
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
  PLAN-L7-110)。stale 化する prose handover を現状把握の正本にしない。CURRENT.json / prose は補助。

## 正規コマンド

- セットアップ: `ut-tdd setup project`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`
- PLAN lint: `ut-tdd plan lint`
- レビュー: `ut-tdd review --uncommitted`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude prompt 生成: `ut-tdd claude --role <role> --task "..." --dry-run`
- チーム実行: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`
- タスク分類: `ut-tdd task classify --text "..."`
- スキル推薦: `ut-tdd skill suggest --plan <path>`

複数 AI runtime が利用可能な場合は、作成側と判断側を分離する。
単一 runtime の場合は、代替証跡として `intra_runtime_subagent` review evidence を記録する。

## Safety Boundaries（安全境界）

- rules、docs、examples、audit evidence に API keys、secrets、PII、credentials を書かない。
- authentication、authorization、payments、PII、licenses、destructive data operations、
  production infrastructure、external API assumptions を変更する前に escalate する。
- 明示的に tracked する audit / provider-handover evidence 以外の local runtime artifacts は track しない。

## UT-TDD Workflow（工程）

- Forward: `plan` -> `pair-freeze` -> `implement` -> `trace-freeze` -> `review` -> `accept`
- Reverse: `reverse <type> R0` -> `R1` -> `R2` -> `R3` -> `R4` -> Forward merge
- Scrum / PoC: `S0 backlog` -> `S1 plan` -> `S2 poc` -> `S3 verify` -> `S4 decide`
- Handover: `.ut-tdd/handover/CURRENT.json` が存在し non-stale なら確認する。

## Instruction Files（指示ファイル）

- 共有 project context: `CLAUDE.md`
- Claude Code runtime / hook policy: `.claude/CLAUDE.md`
- Codex CLI project rules: `AGENTS.md`
- Personal overrides: `CLAUDE.local.md` / `AGENTS.override.md`

## UT-TDD Adapter Rule Markers

この section は `rule-drift` で機械検査され、Codex / Claude adapter が静かに乖離しないようにする。

- Codex project rules: `AGENTS.md`
- Claude runtime policy: `.claude/CLAUDE.md`
- Modes: `standalone` / `claude-only` / `codex-only` / `hybrid`
- セットアップ: `ut-tdd setup project`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`
- 引き継ぎ: `ut-tdd handover`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude 委譲: `ut-tdd claude --role <role> --task "..."`
- チーム実行: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

<!-- UT-TDD:managed:start -->
# UT-TDD Agent Harness 共有コンテキスト

repository-local な UT-TDD command で harness state と delegation を扱う。

- `ut-tdd setup project` は HELIX 対応 project を初期化する現行 setup 入口である。
- `ut-tdd status` は local runtime mode を報告する。
- `ut-tdd doctor` は repository health check を実行する。
- `ut-tdd handover` は cross-runtime handover state を読み書きする。
- `ut-tdd codex --role <role> --task "..."` は Codex へ委譲する。
- `ut-tdd claude --role <role> --task "..."` は Claude へ委譲する。

adapter docs に secret、token、machine-local absolute path を書かない。
<!-- UT-TDD:managed:end -->
