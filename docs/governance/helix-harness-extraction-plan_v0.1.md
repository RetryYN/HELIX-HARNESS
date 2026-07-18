# HELIX-HARNESS 切り出し計画 v0.1

> **ADR-001/009/010連動（2026-07-18再基準化）**: 旧Python runtimeの無差別code-portとTypeScript全面書き直しはともにsupersededである。HELIX snapshotをbehavior atomへ分解し、意味判断・生成はPython恒久意味コア、harness.db・Git/GitHub副作用はTypeScript/Node単一commit境界へ配置する。OS native化、`.helix/` state、mode検出、docs主語差し替えの方針は引き続き有効。正本構想/要件は`concept_v3.1` / `requirements_v1.3`、runtime authorityはADR-009/010を参照する。

## 目的

HELIX は個人プロジェクトとして、WSL2 / Linux / 個人作業ログ前提で発展してきた参照 snapshot である。本計画では、HELIX の設計資産を素材として、社内展開できる **HELIX-HARNESS** 配布パッケージへ再設計する。

目標は単なる名称変更ではない。社内開発チームが Windows / macOS / Linux ネイティブ環境で導入でき、Claude Code 単体、Codex 単体、Claude Code × Codex 連携のいずれでも状態把握と検証ができる開発基盤にする。

## 基本方針

| 項目 | HELIX 側 | HELIX-HARNESS 側 |
|---|---|---|
| 位置付け | 個人プロジェクト / 参照原稿 | 社内展開向け配布パッケージ |
| 対応 OS | WSL2 / Linux 寄り | Windows / macOS / Linux ネイティブ |
| CLI 名 | `helix` | `helix` |
| 状態管理 | `.helix/` | `.helix/` |
| hook | HELIX runtime hook | HELIX-HARNESS 用 hook guard / audit |
| docs 主語 | HELIX workflow | HELIX-HARNESS workflow |
| 配布単位 | 個人 workspace | repo template / setup script / VSCode 設定 |

## 合流の考え方

HELIX 原稿をそのまま差し替えるのではなく、以下の順で取り込む。

1. **概念差し替え**: 構想書・要件定義書の主語を HELIX-HARNESS に固定する。
2. **OS 前提差し替え**: WSL2 必須を廃止し、Windows / macOS / Linux のネイティブ実行を第一級経路にする。
3. **runtime 境界差し替え**: 旧 runtime state / 旧 CLI 前提は参照 snapshot 扱いにし、現行 `.helix/` と `helix` CLI を正本にする。
4. **hook / agent 差し替え**: Claude / Codex 設定内の絶対パスと HELIX 名を package-local な HELIX-HARNESS 名へ置換する。
5. **検証差し替え**: `helix doctor` が Windows / macOS / Linux の導入状態を検証する。

## 初期パッケージ範囲

Phase 0 の配布パッケージは以下に絞る。

- `helix doctor`
- `helix setup`
- `helix status`
- `helix plan lint`
- `helix review`
- Claude Code hook guard
- Codex / Claude role policy
- runtime mode detection (`standalone` / `claude-only` / `codex-only` / `hybrid`)
- GitHub Actions `harness-check`
- VSCode / Claude / Codex 用 project rules template
- Windows PowerShell shim + POSIX shell entrypoint + 必要時の Git Bash bridge

Reverse / Scrum / V-model 全層 DB / detailed telemetry は、初期パッケージの必須範囲から外し、設計資産として後続再実装に回す。

ただし、HELIX snapshot にはHELIX-HARNESSの中核へほぼ直結する設計・実装が多い。Phase 0では旧runtimeを
一括復活させず、ADR-010に従ってPython意味コアとTypeScript/Node実行境界へ責務分解する。既存資産は以下の4区分で扱う。

| 区分 | 対象 | 方針 |
|---|---|---|
| **実行境界へ再配置** | `cli/helix-*`、hook guard / lint / runtime判定、DB/Git/GitHub副作用 | `src/**` と `helix` subcommandのTypeScript/Node境界へ配置し、lease/fence/audit/transactionを一元化する |
| **Python意味コアとしてcurate** | `cli/lib/**`の要件抽出、typed spec、trace、検出、impact、review、文書生成 | behavior atomとversioned semantic contractを保持する。DB path・credential・repository・`.helix/`は渡さない |
| **文書・templateとしてcurate** | `.claude/agents/*.md`、`vendor/helix-source/skills/**/SKILL.md`、`docs/commands/*.md`、plan/team templates | HELIX-HARNESS正本へ取り込み、role、command名、絶対path、旧用語、OS前提を修正する |
| **無修正参照可 (runtime 転用不可)** | `vendor/helix-source/**`、`docs/v2/**`、旧 PLAN / audit evidence | evidence / regression idea として参照のみ。正本要件・実行時入力にしない |

旧runtime全体を無修正の実行経路として転用できるものは0件である。ただし動作済みPython意味能力は
意味コアとして保持し、versioned contractとNode commit境界を追加して採用する。

責務分解時の機能参照は以下を優先する。

- PLAN / frontmatter / schema / lint
- V-model lint / trace validator 機能
- task classify / effort classify / skill suggest 機能
- team runner / model registry / budget policy 機能
- handover / transcript summary
- doctor / setup / recovery check 機能
- Claude hook / agent templates
- GitHub workflow / hook snippets 機能

詳細な段階採用順は `docs/migration/helix-source-inventory.md` のHigh-impact Reuse Backlog、実行単位の能力参照は `docs/migration/helix-porting-map.md` を参照する。同mapはcode-port計画ではなく、Python意味コア／Node実行境界を決める機能inventoryとしてのみ使う。

## 切り出し順

| 手順 | 作業 | 完了条件 |
|---|---|---|
| 1 | docs 正本を HELIX-HARNESS 主語へ修正 | `docs/governance/*concept*` と `*requirements*` に HELIX runtime 前提が残らない |
| 2 | HELIX source snapshot を隔離 | `vendor/helix-source/` に除外対象以外の現物があり、棚卸し doc が存在する |
| 3 | `.helix/` state layout を確定 | `.helix/` なしでも doctor が成立する |
| 4 | CLI shim を作成 | `helix doctor` / `helix setup` / `helix status` が Windows PowerShell と POSIX shell から実行できる |
| 5 | hook 設定を package-local 化 | `.claude/settings.json` から個人 PC の絶対パスが消える |
| 6 | CI smoke を追加 | Windows smoke + Ubuntu harness-check が通る |
| 7 | 旧 runtime 参照を参照 snapshot リストへ隔離 | runtime docs / setup docs では旧 CLI・旧 state path を正本として案内せず、現行 `helix` と `.helix/` だけを正本 surface とする |

## 差し替え対象

優先して差し替える。

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- `.claude/settings.json`
- `.claude/hooks/*`
- `.helix/config.yaml`
- `docs/governance/helix-harness-concept_v3.1.md`
- `docs/governance/helix-harness-requirements_v1.3.md`

過去レビュー・監査ログ・archive は historical evidence として残す。そこに出る HELIX 名は削除対象にしない。

## 受入条件

- clean checkout 後、Windows PowerShell と Linux/macOS POSIX shell で `helix doctor` が実行できる。
- `helix status --json` が `standalone` / `claude-only` / `codex-only` / `hybrid` のいずれかを返す。
- WSL2 が無くても setup / doctor / docs lint が通る。
- Git Bash が必要な hook は PowerShell shim から明示的に呼び出される。
- `.claude/settings.json` に個人 PC の絶対パスが残らない。
- 社内利用者向け docs で HELIX が製品名として出ない。
- HELIX は「設計概念参照」「historical evidence」としてのみ記述される。

## 関連棚卸し

- `docs/migration/helix-source-inventory.md`
- `docs/migration/helix-porting-map.md`
