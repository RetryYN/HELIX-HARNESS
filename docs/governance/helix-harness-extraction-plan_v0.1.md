<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **L3進行authority**: 層・pair・runtime判断は docs/governance/l3-progression-authority-rebaseline-2026-07-19.md を正とする。本文の旧layer/runtime表現はdomain contentだけを保持するcompatibility debtであり、L3 freeze条件へ使用しない。

# HELIX-HARNESS 切り出し計画 v0.1

> **ADR-001/009/010 連動（2026-07-19更新）**: clean rebuildとbulk import禁止は維持する。旧HELIXはbehavior atomの採否に使い、採用分はADR-010の **Python semantic core + TypeScript/Node transactional boundary** へ再実装する。本書 §初期パッケージ範囲〜§切り出し順の旧Python code-port、TS単一core、Bun target、および`helix-porting-map.md` / `PLAN-001..004`のcode-port計画はsupersededである。OSネイティブ化・`.helix/` state・mode検出・docs主語差し替え等の方針は引き続き有効。runtime正本はADR-009/010とする。

> **L12 canonical override（2026-07-19）**: 工程層はL1-L12をcurrent canonicalとし、L0 charterは層外anchor、
> L0-L14成果物はcompatibility projection/source materialとして扱う。切り出し中に旧層体系を新規schema、gate、trace、
> fixture、CI期待値へ再固定してはならない。詳細は`l12-canonical-vmodel-direction-directive_v0.1.md`を正とする。

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

ただし、HELIX snapshot には HELIX-HARNESS の中核へほぼ直結する設計・実装アイデアが多い。Phase 0でもbulk portは行わず、behavior atomを抽出して **ADR-010の責務境界（Python semantic core / TypeScript・Node transactional boundary）で再実装**する。既存資産は以下の3区分で扱う。

| 区分 | 対象 | 方針 |
|---|---|---|
| **責務境界に沿う再実装が必要** | `cli/lib/**`、`cli/helix-*`、hook guard / lint / runtime 判定などの実行ロジック | semantic coreはPython、transactional boundaryは`src/**`と`helix` subcommandへTypeScript/Nodeで作り直す。旧state、固定model名、bulk portを除去する |
| **TS 化せず修正転用 / curate** | `.claude/agents/*.md`、`vendor/helix-source/skills/**/SKILL.md`、`docs/commands/*.md`、plan/handover/team templates | markdown / docs / templates を HELIX-HARNESS 正本へ取り込み、role→capability class、command 名、絶対パス、HELIX 用語、Windows 前提を修正する。registry / catalog / injector / CLI 実行部は TS |
| **無修正参照可 (runtime 転用不可)** | `vendor/helix-source/**`、`docs/v2/**`、旧 PLAN / audit evidence | evidence / regression idea として参照のみ。正本要件・実行時入力にしない |

**runtime として修正せず転用できるものは 0 件**。無修正で使えるのは historical evidence / reference だけである。

ADR-010責務境界への再実装時の機能参照は以下を優先する。

- PLAN / frontmatter / schema / lint
- V-model lint / trace validator 機能
- task classify / effort classify / skill suggest 機能
- team runner / model registry / budget policy 機能
- handover / transcript summary
- doctor / setup / recovery check 機能
- Claude hook / agent templates
- GitHub workflow / hook snippets 機能

詳細な段階再実装順は `docs/migration/helix-source-inventory.md` の High-impact Reuse Backlog、実行単位の能力参照は `docs/migration/helix-porting-map.md` を参照する。同 map は ADR-001 により code-port 計画としては superseded であり、TS 再実装時の機能インベントリとしてのみ使う。

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
- `docs/governance/helix-harness-requirements_v1.2.md`

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
