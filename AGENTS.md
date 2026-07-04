# Codex CLI — HELIX（UT-TDD Agent Harness 土台）

このファイルは、このリポジトリにおける Codex CLI 向け project ルールである。

責務分離:

- `CLAUDE.md`: 共有 project context。
- `.claude/CLAUDE.md`: Claude Code runtime / hook 方針。
- `AGENTS.md`: Codex CLI project rules。

## コミュニケーション (報連相)

チャット上の報連相 (報告・連絡・相談) は **日本語** で行う (PO ルール、2026-06-22)。
進捗報告・調査結論・選択肢提示・確認依頼など PO へ向けた chat 出力は日本語を既定とし、
見出し・箇条書きラベルも日本語を優先する。これは Claude / Codex 両ランタイム共通のルール
(`CLAUDE.md` / `.claude/CLAUDE.md` と同一)。

ただし成果物はそれぞれの規約に従う: コード/識別子/commit message は従来どおり、ファイル名は
英語 (文字化け回避)、技術用語・コマンド・PLAN ID・パスは原語のまま埋め込んでよい (無理に和訳しない)。

### ドキュメント言語

`docs/` 配下、PLAN、設計書、テスト設計、governance、handover、audit などの人間が読む成果物は
**日本語を原則**とする。開発用語、コマンド、識別子、URL、コード片、エラーメッセージ、外部仕様名は原語のまま
埋め込んでよいが、説明文・判断・受入条件・レビュー記録は日本語で書く。既存の英語記述は、触った範囲から
段階的に日本語へ是正し、英語のまま新規追記して完了扱いにしない。

`ut-tdd doctor` の `design-language` gate は、PLAN / 設計 / テスト設計 / process / governance / handover /
adapter ルールなどの人間向け docs にある英語 prose debt が baseline から増えないことを検査する。baseline は
既存 debt の可視化であり、将来の日本語化 PLAN で段階的に引き下げる。

## Core Reads（必読正本）

このリポジトリで作業するときは、下記の repo-owned sources を読み、その workflow に従う。

- `docs/governance/helix-agent-harness-concept_v3.1.md` - 内部展開向け concept
- `docs/governance/helix-agent-harness-requirements_v1.2.md` - requirements と acceptance criteria
- `docs/governance/helix-agent-harness-extraction-plan_v0.1.md` - source snapshot からの extraction / cutover plan
- `docs/adr/ADR-001-helix-harness-redesign-and-language.md` - redesign policy と TypeScript/Bun 実装言語
- `docs/governance/README.md` - governance 配下の canonical / reference / archive 境界

## 配布パッケージ（Distribution）

- **配布専用リポジトリ**: `git@github.com:RetryYN/HELIX-HARNESS-OS.git`
  （consumer 側が `ut-tdd` を取得するパッケージ配布先。本 development リポジトリとは分離）。
- この development リポジトリが正本 source。tag 済みリリースを上記配布リポジトリへ publish し、
  consumer は配布リポジトリ経由で導入する。
- 正式配布先は `RetryYN/HELIX-HARNESS-OS`。配布 surface の実切替は PLAN-M-02 cutover 承認まで
  action-binding approval、dry-run、backup、rollback、monitoring evidence を揃えて行う。

Migration snapshots と inventories は Core Reads ではない。`docs/migration/` は migration、gap audit、
regression-source inspection が必要なときだけ読む。UT-TDD runtime state や execution paths として扱わない。

`docs/design/harness/L3-functional/roadmap.md` は通常 startup read として読まない。verification roadmap は
V-model freeze 境界で verification cycle を走らせるときだけ動的に読む。通常作業は L0 から L14 への
Forward descent path に従う。

ADR-001 は拘束力を持つ。previous framework は design source のみであり、UT-TDD core implementation は
TypeScript/Bun とする。old W1-W3a Python は product runtime として port しない。薄い `.ps1` / `.sh`
entrypoint は compiled または Bun-based TypeScript core を呼んでよい。UT-TDD が govern する repository の言語は、
harness implementation language とは独立である。

`docs/archive/` は canonical ではなく historical material のみ。fork 完了に伴い HELIX vendor snapshot は削除済み
（`docs/migration/helix-fork-completion-plan.md` §11）。

## HELIX 再構築方針（現行・最優先 / Claude と共通）

本リポジトリは **HELIX（超個人開発システム）** を構築する場であり、**UT-TDD Agent Harness の
「仕組み」を土台に harness 自身を HELIX へ進化させる**。北極星は L0 企画書
`docs/design/helix/L0-charter/helix-charter_v0.1.md`（confirmed, P0–P9）。詳細は `CLAUDE.md`
同名セクションと同一。要点のみ:

- **precedence**: 仕組み（V モデル・gate・state DB・harness ルール）= UT-TDD ハーネスが上。個別機能
  （command/skill の中身）= 旧 HELIX が機能ソースとして上。ただし **個別機能は仕組みを超えない**
  （harness の仕組みに従属して差し込む）。ADR-001 継続で旧ロジックは **TS/Bun 再実装**。
- **進め方**: L0 から Forward に 1 層ずつ。各層で粒度を合わせて旧 HELIX 機能を取捨選択し、機能一覧を
  都度更新・名称を揃えて登録（一括 import はしない）。L1=機能エリア / L3=機能ユニット / L4–L6=command。
- **旧 HELIX ソース（機能ソース・常時参照）**: 旧 HELIX = `git@github.com:RetryYN/ai-dev-kit-vscode.git`
  （個別機能ソースの正本）。各層の設計・キュレーション時に **引っ張れる個別機能（command / skill /
  subagent / detector / advisor role〔例: TL advisor〕等）が無いか常にこの repo を確認**（inventory-first の
  絶対ルールに旧 HELIX を必ず含める）。ただし read-only 参照・設計概念のみ採取・**TS/Bun 再実装**・
  **bulk import 禁止**で、harden（rename・legacy 前提除去・capability-class 化）して仕組みに従属させて差す。
- **自律境界**: 人＝L0/L1/L2（モックが最後）＋ L3 承認のみ。AI＝L3 起草＋L4 以降〜GitHub を完全自動。
- **リネーム（段階）**: prose は HELIX へ移行中。**機械識別子（CLI `ut-tdd`・`.ut-tdd/`・`area=harness`・
  rule-drift marker）は据え置き**、後日 専用 migration PLAN で atomic 改名。よって下部 Adapter Rule
  Markers と `ut-tdd ...` 表記は現時点では変更しない。
- `.ut-tdd` から HELIX への名称変更は必達の最終ゴールだが、runtime state / CLI / hook / adapter /
  consumer template / distribution surface をまたぐ不可逆 cutover である。PLAN-M-02 の
  `cutover_decision_record` と action-binding approval、dry-run、backup、rollback、monitoring evidence が揃うまで
  実 state move や alias 有効化を行わない。承認後は漏れのない atomic migration として実施する。

## Session Start（開始確認）

1. 上記 Core Reads が存在することを確認する。
2. `.ut-tdd/handover/CURRENT.json` が存在する場合は確認し、stale でない next action に従う。
3. `legacy local state/` が存在する場合は historical source state として扱い、UT-TDD state とは扱わない。
4. active handover が無ければ通常開始し、次を宣言する。
   `OK: UT-TDD session initialized`.

## TL Driven Mode（TL 主導）

Codex CLI が別の active runtime なしで使われる場合、現在の slice の technical lead として動作する。
これは Claude Code の置換ではない。`codex-only` または `standalone` mode で Codex が実行、検証、
gate decision まで担えるという意味である。

- feasible な範囲で design、implementation、review、tests、verification を一気通貫で行う。
- 編集前に relevant existing files を読む。
- 既存の structure、naming、test placement に合わせる。
- 変更規模が必要とする場合は final response で gate outcomes を明示する。
- production infrastructure、authentication、authorization、payment、PII、secrets、licensing など、
  external APIs、その他 high-impact environment assumptions を変える前に escalate する。

## UT-TDD Workflow（工程）

- Forward: `plan` -> `pair-freeze` -> `implement` -> `trace-freeze` -> `review` -> `accept`
- Reverse: `reverse <type> R0` -> `R1` -> `R2` -> `R3` -> `R4` -> Forward merge
- Scrum / PoC: `S0 backlog` -> `S1 plan` -> `S2 poc` -> `S3 verify` -> `S4 decide`
- Additive change: 既存 design を保ち、`add-design` / `add-impl` で delta を追加する。
- Handover: `.ut-tdd/handover/` を session / cross-runtime handover source として使う。

## Codex / Claude Code Harness（実行面）

Codex と Claude Code は、contract plans、local CLIs、hooks を通じて UT-TDD Agent Harness が管理する。
この product では direct API call ではない。

Runtime modes（実行モード）:

- `standalone`
- `claude-only`
- `codex-only`
- `hybrid`

正規コマンド:

- セットアップ: `ut-tdd setup project`
- Codex 実行: `ut-tdd codex --role <role> --task "..."`
- Claude prompt 生成: `ut-tdd claude --role <role> --task "..." --dry-run`
- チーム委譲: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`
- タスク分類: `ut-tdd task classify --text "..."` / `ut-tdd task estimate --plan <path>`
- スキル推薦: `ut-tdd skill suggest --plan <path>`
- レビュー packet: `ut-tdd review --uncommitted`
- 引き継ぎ: `ut-tdd handover`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`

複数 AI runtime が利用可能な場合は、作成側と判断側を分離する。
設計判断、judgement gate、R4 merge 判断は、可能な限り別 runtime / model family へ回す。
単一 runtime では `intra_runtime_subagent` を review substitute として記録し、証跡を残す。

legacy command を現行 company/product execution path として追加しない。

## Hooks（Codex orchestrator parity の方針）

Codex は repo-local `.codex/hooks.json`（PLAN-L7-139）を通じて Claude と同じ guardrails を強制する。
これは **repo-relative only** であり、global `~/.codex/` に hook config を書かない。Claude と同じ
TypeScript hook entrypoints（`.claude/hooks/work-guard.ts`、`src/cli.ts session ...`）を再利用し、
logic fork は作らない。guard logic は `src/runtime/*.ts` にあり runtime-agnostic である。

Codex tool names は Claude と異なるため、matcher は copy ではなく map する。

- `Edit|Write|MultiEdit`（Claude） -> `apply_patch|write_file`（Codex）:
  foreign-edit `work-guard` 用。Codex の `apply_patch` は **freeform** で `file_path` field を持たず、
  edited paths は patch body（`*** Update File:` / `*** Add File:` / `*** Delete File:` /
  `*** Move to:`、multi-file）にある。`work-guard` はこれらの header を parse し、`write_file` だけでなく
  Codex の primary edit tool である `apply_patch` でも foreign-edit block が発火する。
- `Bash`（Claude） -> `exec_command|local_shell`（Codex）: `PostToolUse` session logging 用。
- `Bash`（Claude） -> `exec_command|local_shell`（Codex）: `PreToolUse` `git-command-guard` 用。
  明示的な one-shot override reason が記録されていない destructive git reset/restore/revert/checkout/force-push を block する。
- `subagent-stop`（`SubagentStop`）は **Codex surface が無く** 本当に N/A。codex.exe 0.128.0 は
  `PreToolUse` / `PostToolUse` / `SessionStart` / `Stop` / `UserPromptSubmit` hook events だけを exposed し、
  `SubagentStop` はない。
- `agent-guard`（`Agent`）は Codex `spawn_agent|spawn_agents_on_csv` へ map する。Codex `spawn_agent`
  semantics は Claude `subagent_type` と異なるため、shared guard は Codex payload を別途 normalize する。
  `agent_type` は explicit かつ allowlisted、direct model override は block、task body は必須、bulk spawn は
  team/pair-agent workflow 経由でなければ deny する。

`.codex/hooks.json` と `.claude/settings.json` の parity は `doctor` の `codex-hook-adapter` が機械検査する。
guard が diverge する、`blockOnFailure` を落とす、`$CLAUDE_PROJECT_DIR` に依存する、global `~/.codex/` を参照する場合は
fail closed する。

Scope boundary（適用境界）: `.codex/hooks.json` が guard するのは direct Codex CLI / Codex IDE sessions のみ。
この chat runtime が提供する hosted API/developer tools（この環境の `apply_patch` など）は Codex hook engine を通らないため、
repo hooks は機械的に intercept できない。この surface では Codex は hook を non-enforcing と扱い、編集前に明示的な
git/status preflight を行う。API tool calls について mechanical hook coverage を主張しない。

## Skills（スキル）

- matching triggers に該当する relevant `SKILL.md` だけを読む。
- 全 skills を bulk-load しない。
- `references/` は skill directory からの相対パスとして解決する。
- Legacy-derived skill material は migration source material。UT-TDD skill docs は `docs/skills/` 配下に置く。

## Editing Rules（編集規則）

- 編集前に target files を読む。
- 既存の code structure、naming、test placement に合わせる。
- 既存 uncommitted changes と **other runtime（Claude）が作った commits** は正規作業として扱う。
  明示指示なしに revert/reset/checkout しない。
- docs、rules、examples、audit evidence に secrets、PII、credentials を書かない。

## Git Rules (hybrid 多ランタイム協調)

- Conventional Commits を使う。stage は explicit paths のみとする (`git add <path>`; `git add -A` /
  `git add .` は使わない)。
- **history を書き換える前に `git log` / `git reflog` を確認**し、もう一方のランタイム
  (Claude) の commit を `reset` / `revert` / `checkout` / force で破棄・デグレさせない。
  working tree の foreign 変更は既定で「相手ランタイムの正規作業」とみなす。判断不能なら
  revert せず PO 確認。
- `git reset` / destructive `git checkout` / `git restore` / `git revert` / force-push は
  `git-command-guard` の block 対象。どうしても必要な場合だけ、`git log` / `git reflog` 確認後に
  `UT_TDD_ALLOW_DESTRUCTIVE_GIT=1` または `.ut-tdd/state/destructive-git-override` へ理由を残して
  one-shot override する。
- 自分の成果は相手の commit の上に積み、相手のファイルに触れない。
- **commit 直前に `git status` + `git diff --staged` (or `ut-tdd review --staged` /
  `--uncommitted`)** で、authored した意図ファイルのみが staged であることを検証する。
- push 済み履歴は破壊しない。
- **引き継ぎ・検証の基準点は commit/push 済 HEAD ただ一つ**。hybrid では working tree を
  相手ランタイムが常時書き換えるため、full tree の計測値は transient で非正本。検証は HEAD
  (+ 自分の意図変更のみ) に固定し、測定値が動いたら相手を疑う前に自分の baseline を疑う
  (foreign tree の transient を相手の退行と帰責しない)。引き継ぎ feedback は harness.db
  (`feedback_events`、PLAN-L7-110) から受け取り、stale 化する prose handover を正本にしない。

## Test Rules（検証規則）

- Docs changes: `rg` で WSL2-required wording、migration-source-as-current wording、personal absolute paths、
  mojibake markers などの古い前提を確認する。
- Bash changes: `bash -n <changed-script>`。
- PowerShell changes: `powershell -NoProfile -ExecutionPolicy Bypass -File <changed-script>`。
- TypeScript core changes: `tsc --noEmit` と targeted `vitest`。
- CLI / hook changes: relevant な場合は Windows PowerShell と POSIX shell paths を smoke test する。

## Local Overrides（個人設定）

個人 overrides は `AGENTS.override.md` に置く。これは Git 追跡対象ではない。

## UT-TDD Adapter Rule Markers（アダプター規則 marker）

この section は `rule-drift` で機械検査され、Codex / Claude adapter が静かに乖離しないようにする。

- 共有 context: `CLAUDE.md`
- Claude runtime policy（Claude runtime 方針）: `.claude/CLAUDE.md`
- Modes（実行モード）: `standalone` / `claude-only` / `codex-only` / `hybrid`
- セットアップ: `ut-tdd setup project`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`
- 引き継ぎ: `ut-tdd handover`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude 委譲: `ut-tdd claude --role <role> --task "..."`
- チーム実行: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

<!-- UT-TDD:managed:start -->
# UT-TDD Agent Harness アダプター

この project は local orchestration surface として UT-TDD Agent Harness command を使う。

- セットアップ: `ut-tdd setup project`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`
- 引き継ぎ: `ut-tdd handover`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude 委譲: `ut-tdd claude --role <role> --task "..."`
- チーム実行: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

この managed block の外側にある project-owned instruction は consumer 側所有として扱う。
<!-- UT-TDD:managed:end -->
