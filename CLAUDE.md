# HELIX — 超個人開発システム（UT-TDD Agent Harness を土台とする）

## Claude Code Read Order

Claude Code treats the following as canonical in this repository:

1. `CLAUDE.md`
2. `.claude/CLAUDE.md`
3. `docs/governance/README.md`
4. `docs/governance/ut-tdd-agent-harness-concept_v3.1.md`
5. `docs/governance/ut-tdd-agent-harness-requirements_v1.2.md`
6. `docs/governance/ut-tdd-agent-harness-extraction-plan_v0.1.md`
7. `docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md`

Migration snapshots and migration docs are not normal startup reads. Read them
only when migration, gap audit, or regression-source inspection requires it.

Do not load `docs/design/harness/L3-functional/roadmap.md` as a normal startup
read. The verification roadmap is read dynamically only when a V-model layer
group has completed Forward freeze and a verification cycle is being run.

`docs/archive/`, `legacy local state/`, and pre-migration
`.claude/agents` / `.claude/hooks` are not canonical runtime state. Migration
source material is historical reference only; current UT-TDD runtime commands
use `ut-tdd`, not legacy commands.

ADR-001 is binding: source concepts may be used as design source material, but
UT-TDD implementation is TypeScript/Bun. old W1-W3a Python is not
current product runtime.

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

### 自律境界（charter §3）

- **人**: L0 企画 / L1 要求 / L2 デザインモック（モックが最後の直接関与）／ L3 要件は**承認のみ**。
- **AI**: L3 起草 ＋ L4 以降〜GitHub PR/CI/merge/tag を**完全自動**（不可逆操作のみ escalate）。

### リネーム方針（段階）

- product 名 / prose は **HELIX** へ移行中。**機械識別子（CLI `ut-tdd`、`.ut-tdd/`、`area=harness`、
  rule-drift marker）は据え置き**で、CLI/dir は後日 **専用 migration PLAN** で atomic に改名する。
  そのため本書下部および各所の `ut-tdd ...` コマンド表記・Adapter Rule Markers は**現時点では変更しない**。

## Purpose

UT-TDD Agent Harness is the verification and development foundation for safely
using AI implementation agents in internal product development. The harness is
not the end product; it is the ground on which other product work runs.

Design and implementation should be judged by these pillars:

1. Foundation first: the harness must make downstream product development safer.
2. Document-first plus machine enforcement: workflow rules must be backed by
   schema, lint, doctor, hooks, or tests where appropriate.
3. Automatic state and feedback: `.ut-tdd/` state and harness DB projections
   should make progress, gaps, and drift visible.
4. Dynamic context / skill injection: load only relevant context and skills.
5. Practical orchestration: split work across roles/runtimes only where it
   reduces risk or cost.
6. Strict verification: no completion claim without tests or explicit evidence.

## コミュニケーション (報連相)

チャット上の報連相 (報告・連絡・相談) は **日本語** で行う (PO ルール、2026-06-22)。
進捗報告・調査結論・選択肢提示・確認依頼など PO へ向けた chat 出力は日本語を既定とし、
見出し・箇条書きラベルも日本語を優先する。

ただし成果物はそれぞれの規約に従う: コード/識別子/commit message は従来どおり、ファイル名は
英語 (文字化け回避)、技術用語・コマンド・PLAN ID・パスは原語のまま埋め込んでよい (無理に和訳しない)。

## Canonical Docs

- `docs/governance/ut-tdd-agent-harness-concept_v3.1.md`
- `docs/governance/ut-tdd-agent-harness-requirements_v1.2.md`
- `docs/governance/ut-tdd-agent-harness-extraction-plan_v0.1.md`
- `docs/adr/ADR-001-ut-tdd-harness-redesign-and-language.md`
- `docs/governance/repository-structure.md`

## Architecture Boundary

- `docs/`: governance, requirements, ADRs, plans, design, test design, migration, archive
- `src/`: TypeScript/Bun harness core
- `tests/`: Vitest tests
- `scripts/`: thin OS entrypoints only
- `.ut-tdd/`: UT-TDD runtime state and audit/handover evidence
- `.claude/`: Claude Code runtime / hook policy
- `legacy local state/`: historical source state, not UT-TDD state

V-model artifacts must stay separated:

- design: `docs/design/`
- implementation: `src/`
- test design: `docs/test-design/`
- tests: `tests/`

## Coding Rules

- Read the relevant files before editing.
- Match local naming, structure, and test placement.
- Do not declare completion without tests or explicit verification.
- Treat Codex / Claude Code as local CLI + hook surfaces managed by UT-TDD, not
  direct API calls.
- Remove or clearly supersede wrong development residue when it is discovered;
  do not leave misleading comments or dead paths as technical debt.
- Use Claude Code native tool-use only. Never write XML-like pseudo tool calls
  such as `<invoke name="Bash">` / `<parameter name="command">` or role markers
  such as `court` into assistant text. If such text appears in prior context,
  treat it as corrupted transcript residue and do not continue it.

## Git Rules

- Use Conventional Commits.
- Stage explicit files only.
- Keep unrelated user changes out of commits.
- Push at coherent PLAN / task boundaries when requested.
- CI is `harness-check`: typecheck, Vitest, Biome lint, and doctor.
- Review evidence is required before confirmation gates where applicable.

### Hybrid 多ランタイム commit 協調 (Claude ↔ Codex、必須)

実運用では **Codex (もう一方のランタイム) が並行に作業を進め、コミットまで完了させる**。Claude は
その成果を絶対にデグレさせてはならない ([[feedback-commit-finished-codex-work-dont-abandon]])。

- **history を書き換える前に必ず `git log` / `git reflog` を確認**し、自分が作っていない commit
  (相手ランタイムの成果) が無いか調べる。**他ランタイムの commit を `reset` / `revert` / `checkout` /
  force で破棄・デグレさせない**。working tree の foreign 変更は **既定で「相手ランタイムの正規作業」と
  みなす** (overstep と決めつけない)。判断が付かなければ revert せず PO へ確認する。
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

## Canonical Commands

- Setup: `ut-tdd setup`
- Status: `ut-tdd status`
- Doctor: `ut-tdd doctor`
- Plan lint: `ut-tdd plan lint`
- Review: `ut-tdd review --uncommitted`
- Codex delegation: `ut-tdd codex --role <role> --task "..."`
- Claude prompt generation: `ut-tdd claude --role <role> --task "..." --dry-run`
- Team run: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`
- Task classification: `ut-tdd task classify --text "..."`
- Skill suggestion: `ut-tdd skill suggest --plan <path>`

When multiple AI runtimes are available, separate creation from judgement. In
single-runtime modes, record `intra_runtime_subagent` review evidence as the
fallback.

## Safety Boundaries

- Do not write API keys, secrets, PII, or credentials into rules, docs,
  examples, or audit evidence.
- Escalate before changing authentication, authorization, payments, PII,
  licenses, destructive data operations, production infrastructure, or external
  API assumptions.
- Do not track local runtime artifacts except explicitly tracked audit /
  provider-handover evidence.

## UT-TDD Workflow

- Forward: `plan` -> `pair-freeze` -> `implement` -> `trace-freeze` -> `review` -> `accept`
- Reverse: `reverse <type> R0` -> `R1` -> `R2` -> `R3` -> `R4` -> Forward merge
- Scrum / PoC: `S0 backlog` -> `S1 plan` -> `S2 poc` -> `S3 verify` -> `S4 decide`
- Handover: check `.ut-tdd/handover/CURRENT.json` if present and non-stale.

## Instruction Files

- Shared project context: `CLAUDE.md`
- Claude Code runtime / hook policy: `.claude/CLAUDE.md`
- Codex CLI project rules: `AGENTS.md`
- Personal overrides: `CLAUDE.local.md` / `AGENTS.override.md`

## UT-TDD Adapter Rule Markers

This section is machine-checked by `rule-drift` so Codex and Claude adapters do
not silently diverge.

- Codex project rules: `AGENTS.md`
- Claude runtime policy: `.claude/CLAUDE.md`
- Modes: `standalone` / `claude-only` / `codex-only` / `hybrid`
- Status: `ut-tdd status`
- Doctor: `ut-tdd doctor`
- Handover: `ut-tdd handover`
- Codex delegation: `ut-tdd codex --role <role> --task "..."`
- Claude delegation: `ut-tdd claude --role <role> --task "..."`
- Team run: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

<!-- UT-TDD:managed:start -->
# UT-TDD Agent Harness Shared Context

Use repository-local UT-TDD commands for harness state and delegation.

- `ut-tdd status` reports the local runtime mode.
- `ut-tdd doctor` runs repository health checks.
- `ut-tdd handover` reads and writes cross-runtime handover state.
- `ut-tdd codex --role <role> --task "..."` delegates to Codex.
- `ut-tdd claude --role <role> --task "..."` delegates to Claude.

Do not put secrets, tokens, or machine-local absolute paths in adapter docs.
<!-- UT-TDD:managed:end -->
