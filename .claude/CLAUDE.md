# Claude Code Runtime Policy - UT-TDD Agent Harness 方針

## 現行 Runtime 境界

この repository の Claude Code runtime は UT-TDD Agent Harness の一部である。
legacy source 由来の hooks、subagents、memory、`legacy local state/` は historical / migration material であり、
current runtime state や execution paths ではない。

現行 runtime 境界:

- Runtime CLI: `ut-tdd`
- Runtime state: `.ut-tdd/`
- Core implementation: `src/`
- Hook configuration: `.claude/settings.json`

## コミュニケーション

PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。
docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。

Claude Code の read priority は `../CLAUDE.md` -> this file -> `../docs/governance/README.md` とする。
Codex project rules は `../AGENTS.md` にある。

## Hook 方針

`.claude/settings.json` の active hooks は package-local UT-TDD commands だけを呼ぶ。
personal legacy runtime paths に依存する hooks は有効化しない。

- `PreToolUse(Agent)`: `bun "$CLAUDE_PROJECT_DIR/.claude/hooks/agent-guard.ts"`
- `PreToolUse(Edit|Write|MultiEdit)`: `bun "$CLAUDE_PROJECT_DIR/.claude/hooks/work-guard.ts"`
- `SessionStart`: `bun "$CLAUDE_PROJECT_DIR/src/cli.ts" session start`
- `PostToolUse(Edit|Write|MultiEdit|Bash)`: `bun "$CLAUDE_PROJECT_DIR/src/cli.ts" hook post-tool-use`
- `Stop`: `bun "$CLAUDE_PROJECT_DIR/src/cli.ts" session summary`
- `SubagentStop`: `bun "$CLAUDE_PROJECT_DIR/src/cli.ts" hook subagent-stop`

Historical behavior は migration 目的で参照してよいが、implementation は UT-TDD-owned paths に置く。

## PLAN 規則

PLAN files を作成・更新する前に、既存の `docs/plans/` entries を確認する。
重複 PLAN を作るより、既存 PLAN の延長を優先する。

PLAN requirements:

- `plan_id` は unique であり filename と一致する。
- `kind`, `layer`, `status`, `dependencies`, and `review_evidence` match the
  current schema.
- Schedule step は parallel / serial mode を示す。
- `kind=add-impl` は required Reverse pairing を持つ。
- design / implementation / add-* change は、必要に応じて terminology と L0 glossary を更新する。
- confirmation gate を依頼する前に review evidence を記録する。

PLAN claim discipline（errata 対策、PLAN-L7-89）:

- `review_evidence` または AC にある falsifiable safety / completeness claim
  （例: "blast radius 0"、"no false positives"、"N green"、"fully covered"）は、
  prose assertion ではなく、それを裏付ける test または command を cite しなければならない。
  prose claim の機械的代替は real-repo regression test（repo に対する gate run）であり、
  sentence ではない（`coding ≠ substance`）。
- confirmed PLAN の claim が後から誤りだと分かった場合、silent overwrite しない。
  successor PLAN は `supersedes: [<old plan_id>]` を宣言し、superseded PLAN には
  successor 名を含む correction note を付ける。`doctor plan-supersession` は、
  declared supersede target が欠落している、または reciprocal back-reference が無い場合に
  fail-close する（errata は bidirectional のまま保つ）。

`ut-tdd plan lint`、targeted tests、`ut-tdd doctor` を使う。

## Runtime と委譲

現行コマンド経路:

- セットアップ: `ut-tdd setup project`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`
- 引き継ぎ: `ut-tdd handover`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude 委譲: `ut-tdd claude --role <role> --task "..."`
- チーム実行: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

Runtime mode は `standalone` / `claude-only` / `codex-only` / `hybrid` のいずれかである。
`hybrid` では、可能な限り judgement gate を別 runtime / model family へ回す。
単一 runtime では `intra_runtime_subagent` review evidence を代替証跡として記録する。

UT-TDD work の通常経路として raw `codex exec` や raw `claude` を使わない。
session lifecycle、handover warning、audit evidence を記録できるように UT-TDD wrapper を使う。

## Native Tool 呼び出し

Claude Code tools は Claude Code の native tool-use mechanism だけで呼び出す。
`<invoke name="Bash">`、`<parameter name="command">`、`court` のような role markers など、
XML-like pseudo tool calls を表示・継続しない。

過去 transcript に XML-like pseudo tool calls が含まれる場合は corrupted context として扱う。
XML を echo / repair / continue しない。Read/Grep/Bash/Edit/Write は native Claude Code tool UI を使い、
native tool が使えない場合だけ人間向けに plain fenced command を提示する。

## Subagent Guard（subagent 制御）

`PreToolUse(Agent)` は次を使う。

```bash
bun "$CLAUDE_PROJECT_DIR/.claude/hooks/agent-guard.ts"
```

Rules:

1. `subagent_type` must be in the allowlist.
2. model の無い Agent call は block する。
3. requested model は agent frontmatter family と一致しなければならない。
4. bypass は `UT_TDD_ALLOW_RAW_AGENT=1` の場合だけ認め、evidence を残さなければならない。
5. invalid stdin JSON または unverifiable state は fail closed とする。

Allowlist（正本 = `src/runtime/agent-guard-policy.ts` の `SUBAGENT_ALLOWLIST`。本一覧は同期写し）:

- `advisor-fable`
- `fe-lead`
- `fe-ui`
- `pmo-sonnet`
- `pmo-haiku`
- `pmo-project-explorer`
- `pmo-project-scout`
- `pmo-tech-docs`
- `pmo-tech-fork`
- `pmo-tech-news`
- `refactor-scout`
- `pdm-tech-innovation`
- `pdm-marketing-innovation`
- `pdm-innovation-manager`
- `code-reviewer`
- `security-audit`
- `qa-test`

### Fable advisor（最上位セカンドオピニオン、PLAN-L7-306）

`advisor-fable`（model=claude-fable-5、advisory-only・read-only）は TL advisor の一段上。
呼び出し条件（いずれか該当時のみ。日常判断には呼ばない）:

1. TL advisor 相談後も技術判断の疑問が残る（tl_advisor_evidence があるのに結論が出ない）。
2. cross-runtime（Claude↔Codex）の判定が同一論点で対立し 2 回目でも収束しない。
3. 不可逆・高影響操作（cutover / migration / 履歴書換え / 外部公開 / production / auth / payments / PII）の
   action-binding approval 前段の技術妥当性確認。
4. PO へのエスカレーション質問を出す直前の最終確認（AI 側で解決可能な情報が残っていないか）。
5. 同一問題で 3 回以上の試行失敗、または V-model 正本間の矛盾を発見。
6. **FE の UX/ユーザビリティ判断**（情報設計・操作フロー・エラー表現・アクセシビリティ等）。
   これは **相談（助言のみ）** であり、Fable が FE を実装するのではない（実装は fe-lead/fe-ui）。

観点は 5 軸固定（根拠の強度 / 正本整合 / 不可逆性と blast radius / 代替案 / エスカレーション適切性）。
結論・根拠・残リスク・次の一手を受け取り、呼び出し側が review_evidence / IMP に記録する。

### FE ロスター（Opus + Sonnet worker オーケストレーション、PLAN-L7-309）

FE 実装は **`fe-lead`（Opus, 設計・分割・レビュー主導）+ `fe-ui`（Sonnet 5, 実装 worker）** の
オーケストレーションで進める（両者 allowlist 済み、Claude 内で opus→sonnet を回す）。
UX/ユーザビリティ判断が必要になったら `advisor-fable` に **相談** する（助言のみ、Fable 経由で
実装しない）。be-* が Codex 委譲組なのと対照的に、FE は Claude 内オーケストレーションである。

### モデル別 標準 effort と適応調整（PLAN-L7-310）

モデル世代で reasoning effort の置き方が違う（PO ルール 2026-07-04）。SSoT は
`src/team/model-effort.ts`（`standardEffortForModel` / `adaptReasoningEffort`）。

- **各モデルの標準 effort を既定として投げる**。family 既定: fable/opus=high、**sonnet=medium
  （claude-sonnet-5 の標準。旧 claude-sonnet-4-6 は high 扱いで世代差あり）**、haiku=low、
  frontier=high、worker=medium、spark=low。未知 model は安全側 medium。
- **適応調整**: 回答が**浅い（shallow）→ 一段上げる**、**思考が長すぎる（too slow）→ 一段下げる**。
  矛盾・無信号は現状維持。既定（観測なし）は標準 effort のまま。
- agent frontmatter の `effort:` は明示 override。未指定/標準運用では上記 registry の標準に従う。

Source-snapshot exploration は active Claude Code subagent route ではない。repository inspection には
project-focused agents を使い、migration snapshots は read-only material として扱う。

## Guard 規則

- 認証 / 認可 / 決済 / PII / license / production infrastructure / destructive operation、
  external API assumptions を変える前に escalate する。
- `PreToolUse(Edit|Write|MultiEdit)` は、current Claude session が触っていない uncommitted files への編集を block する。
  これにより、一方の runtime が他方の in-flight work を上書きすることを防ぐ。override は
  `UT_TDD_ALLOW_FOREIGN_EDIT=1`（env、human/out-of-band）または session 中に
  `.ut-tdd/state/foreign-edit-override` へ non-empty reason を書く方法だけを認める。marker bypass は
  `.ut-tdd/logs/foreign-edit-overrides.jsonl` に audit される。empty marker は bypass しない
  （recorded reason なしの silent override を許可しない）。marker は **one-shot** であり、許可した foreign edit で
  consume（delete）されるため stale marker は guard bypass を継続できない。env override は human-managed で消費しない。
- `legacy local state/` を active runtime state として扱わない。
- docs、examples、audit evidence に secrets、PII、credentials を書かない。
- 明示された fail-open / fail-close hook design を尊重し、hook failures を silent に無視しない。
- Native Windows behavior は first-class。WSL2 は optional compatibility であり required condition ではない。

## Cutover 境界

UT-TDD は previous framework から design concepts を取り込むが、current product code は TypeScript/Bun である。
legacy Python modules や legacy commands を current operating path として説明しない。

現行 cutover evidence:

- `docs/migration/` 配下の migration strategy docs
- `docs/plans/PLAN-M-01-cutover-backfill.md`
- `docs/plans/PLAN-L7-44-harness-db-master.md`
- `tests/projection-writer.test.ts`
- `src/state-db/projection-writer.ts`

## Local 前提

- `bun` は PATH 上で利用可能である。
- `CLAUDE_PROJECT_DIR` は hook execution 中に repository root を指す。
- `.ut-tdd/` は writable generated runtime state である。
- `.claude/settings.json` は package-local command だけを使う。
- Personal absolute paths は通常運用では不要である。

## UT-TDD Adapter Rule Markers（アダプタールール marker）

この section は `rule-drift` で機械検査され、Codex / Claude adapter が静かに乖離しないようにする。

- Shared project context（共有 project context）: `../CLAUDE.md`
- Codex project rules（Codex ルール）: `../AGENTS.md`
- Modes（実行モード）: `standalone` / `claude-only` / `codex-only` / `hybrid`
- セットアップ: `ut-tdd setup project`
- 状態確認: `ut-tdd status`
- 診断: `ut-tdd doctor`
- 引き継ぎ: `ut-tdd handover`
- Codex 委譲: `ut-tdd codex --role <role> --task "..."`
- Claude 委譲: `ut-tdd claude --role <role> --task "..."`
- チーム実行: `ut-tdd team run --definition .ut-tdd/teams/<team>.yaml`

<!-- UT-TDD:managed:start -->
# Claude runtime アダプター

Claude Code session の harness lifecycle work は `ut-tdd` 経由で扱う。
consumer 側所有の Claude instruction は、この managed block の外側へ追加できる。

- セットアップ: `ut-tdd setup project`
- セッション証跡: `ut-tdd status` / `ut-tdd handover`
- 診断: `ut-tdd doctor`
- レビュー分離: 可能な場合は別 runtime / model family を使う

<!-- UT-TDD:managed:end -->
