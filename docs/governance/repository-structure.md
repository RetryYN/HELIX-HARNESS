# HELIX リポジトリ構成ルール (Repository Structure)

- **Status**: accepted
- **Date**: 2026-05-27
- **正本**: 本書がリポジトリ配置の **canonical 正本**。`requirements_v1.3`と`CLAUDE.md`のディレクトリ節は本書を参照する。v1.2 §9.1はlegacy Phase 0 compatibility referenceである。
- **前提**: ADR-001（clean rebuild／TypeScript strict）/ ADR-009（Node 24 LTS、脱Bun、Linux-primary）/ ADR-010（Python意味コア＋Node単一commit境界）/ ADR-005（配布 = GitHub-pull、Web UI = 中央・全project横断、plugin = 補助チャネル）/ V-model 4 artifact（concept v3.1 §2.3）。
- **要件同期**: `docs/process/` / `src/web/` はlegacy requirements_v1.2 §9.1 Phase 0-A存在チェックから実体化済みで、現在はrequirements_v1.3へ従属する。`workers/python/`はADR-010の意味コアtarget配置だが未実体化であり、HDS-HIL-12/14 pair-freezeとForward PLAN前に作らない。
- **本 repo の位置づけ (ADR-005)**: 本 repo は **harness engine repo（= 配布の単一真実）**。各 project は本 repo を **git dependency（tag-pin）で pull** し、`helix setup` が adapter を投影する。下記 canonical ツリーは **engine repo の構成**。consume 側 project への投影レイアウトは §9 を参照。

## 1. canonical ツリー

```text
HELIX-HARNESS/
├── CLAUDE.md                     # Claude Code project context (正本ナビ)
├── AGENTS.md                     # Codex CLI project rules
├── .codex/                       # Codex CLI project-local config / hooks (trusted project layer)
│   ├── config.toml               #   enables project-local hooks
│   └── hooks.json                #   hook adapter (.claude/settings.json guard parity, PLAN-L7-139)
├── README.md                     # project overview / onboarding entrypoint
├── package.json                  # Node依存 + scripts（cutover中はBun known-goodも保持）
├── tsconfig.json                 # TypeScript strict
├── package-lock.json             # target npm lockfile（HDS-HIL-13 cutoverで生成）
├── bun.lock                      # cutover前known-good lock（terminal後はinactive historical）
├── vitest.config.ts              # Vitest coverage reporter config (G7 coverage-summary evidence)
├── vitest.workspace.ts           # Vitest fast/slow project 分割 (PLAN-L7-348)
├── .gitattributes                # 改行正規化 (eol=lf、*.ps1 は crlf)
├── .editorconfig                 # editor/agent shared whitespace and newline defaults
├── .gitignore
├── ハイブリッド設計ドキュメントv1-fixed.zip # ZIP/L12 採用の参照パッケージ (reference-only、PLAN-L3-13)
│
├── src/                          # ★ TypeScript/Node実行境界 (実装 = ② 実装コード)
│   ├── cli.ts                    #   エントリ (commander)
│   ├── schema/                   #   zod 単一正本 (enum / 契約。drift を型で抑止)
│   ├── plan/                     #   plan lint / validator
│   ├── vmodel/                   #   V-model 4 artifact trace
│   ├── runtime/                  #   mode 検出 (standalone/claude-only/codex-only/hybrid) / orchestration
│   ├── doctor/                   #   統合検証 / 横断検出
│   └── web/                      #   [予定] 中央 Web UI service (15 画面 / 全 project 横断 / GitHub backbone、ADR-005 D2。backend 詳細は L2 設計)
├── workers/                      # ★[未実体化target] Python恒久意味コア（authoritative side-effect禁止）
│   └── python/                   #   [未実体化target] semantic contract、entrypoint、schema、lock、package metadata
├── tests/                        # ★ ④ テストコード (vitest、*.test.ts、src を mirror)
├── scripts/                      # ★ 薄い OS entrypoint のみ (core logic を置かない)
│   ├── helix                    #   POSIX / Git Bash
│   ├── helix.ps1                #   Windows PowerShell
│   └── install-hooks.{sh,ps1}    #   [予定] hook installer
│
├── docs/
│   ├── governance/               # ★ 現行正本 (本書群)
│   │   ├── README.md             #   正本 / 参照 / archive 境界
│   │   ├── helix-harness-concept_v3.1.md       # 構想 (① 概念)
│   │   ├── helix-harness-requirements_v1.3.md  # L1〜L12 Vモデル＋Scrum要件 / 受入条件
│   │   ├── helix-harness-extraction-plan_v0.1.md
│   │   └── repository-structure.md                    # 本書 (構成正本)
│   ├── adr/                      # ADR-NNN-slug.md (決定記録)
│   ├── process/                  # ★ canonical L1〜L12工程 + 駆動モデル定義の正本（legacy L0〜L14互換入力を含む）
│   ├── design/                   # [予定] ① 設計 doc (D-API/D-DB 等)
│   ├── test-design/              # [予定] ③ テスト設計 doc
│   ├── research/                 # [予定] Research mode 成果 (research-memo。ADR は adr/、§2 参照)
│   ├── reference/                # 横断参照資料 (正本外、ai-agent-harness-directory-reference.md)
│   ├── skills/                   # [予定] HELIX 正本化 skill doc
│   ├── plans/                    # PLAN-NNN-slug.md (実装計画)
│   ├── templates/                # PLAN / prompt / state テンプレ
│   ├── migration/                # legacy source → HELIX 再設計資料 (旧 porting-map 等。code-port 部は ADR-001 で superseded)
│   ├── handover/                 # セッション handover
│   ├── memory/                   # 運用メモ
│   └── archive/                  # 旧版・superseded (正本ではない)
│
├── .claude/                      # Claude Code runtime / hook policy
│   ├── CLAUDE.md                 #   runtime / hook 方針
│   ├── settings.json             #   現状 hooks:{} の安全設定
│   ├── agents/                   #   subagent 定義 (code-reviewer 等)
│   └── hooks/                    #   hook script
│
├── .helix/                      # ★ HELIX runtime state + 監査証跡 (state 系 gitignored / 証跡系 tracked、§5)
│   ├── state/                    #   runtime.json 等 (generated、.gitkeep のみ tracked)
│   ├── audit/                    #   A-NNN-*.md / reports/*.md 監査記録 = tracked 証跡 (PO 決定 2026-06-10、A-128)。*.jsonl / escalation_state.json は gitignored
│   ├── evidence/                 #   verification-profiles 等の正規化 evidence JSON (tracked、secret/PII 禁止)
│   ├── cache/                    #   (.gitkeep のみ tracked)
│   ├── handover/                 #   CURRENT.* / *.bak は gitignored。provider/ (provider 間 handover 記録) は tracked
│   ├── teams/                    #   teams/*.yaml (local* は gitignored)
│   └── adapters/                 #   optional adapter 設定 (local* は gitignored)
│
├── .github/                      # workflows/harness-check.yml (Required Status Check)
│
└── legacy local state            # gitignored、正本にしない
```

`★` = 配置ルールが特に重要な領域。`[予定]` = **ディレクトリ実体 (`.gitkeep`) は作成済、中身は後続 PLANで起こす**。
`[未実体化target]` = 配置だけ確定し、pair-freeze／Forward PLANまでdirectory自体を作らない。

## 2. 配置ルール (どこに何を置くか)

| 対象 | 置き場 | ルール |
|------|--------|--------|
| TypeScript/Node実行境界 | `src/<domain>/` | DB/Git/GitHub副作用、lease/fence/audit/transactionのhome。Pythonの意味判断を重複実装しない |
| Python意味コア | `workers/python/<capability>/` | HDS-HIL-12/14でfreezeしたsemantic contract、entrypoint、schema、lockを置く。repository／DB／`.helix` writeは禁止 |
| 工程 / 駆動モデル定義 | `docs/process/` | **canonical L1〜L12工程 + 駆動モデル(Forward/Scrum/Scrum Reverse/Recovery/Add-feature/Retrofit/Design Refactor/Performance Refactor/Research)正本**。legacy L0〜L14はcompatibility inputに限定する |
| 中央 Web UI service | `src/web/` | [予定] 全 project 横断の管理 UI (15 画面、GitHub backbone、ADR-005 D2)。backend 配置・通信境界は L2 設計 (ADR-003 §IMP-031 参照) |
| テストコード | `tests/` | vitest、`*.test.ts`、src を mirror |
| OS entrypoint | `scripts/` | **薄いwrapperのみ**。cutover前はknown-good Bun、terminal後は同じNode artifactだけを呼び、core logicを持たない |
| enum / 契約 | `src/schema/` | **zod 単一正本**。enum を複数箇所に再定義しない (drift 防止、requirements §1.10 F) |
| 現行正本 doc | `docs/governance/` | concept v3.1 / requirements v1.3 / README / extraction-plan / 本書 |
| 決定記録 | `docs/adr/` | `ADR-NNN-slug.md` |
| 実装計画 | `docs/plans/` | `PLAN-NNN-slug.md`。superseded は archive で隠さず、後継 PLAN / errata / `supersedes` trace で扱う。`status: archived` への遷移は human approval と rejection/retirement rationale がある場合に限る |
| 移行資料 | `docs/migration/` | source capability reference。code-port 計画は ADR-001 で superseded |
| runtime state | `.helix/` (state/cache/logs/handover CURRENT/tmp/local*) | generated。**docs 目的で追跡しない** (CLAUDE.md 禁止事項) |
| 監査証跡 | `.helix/audit/*.md` / `.helix/audit/reports/*.md` / `.helix/evidence/` / `.helix/handover/provider/` | **tracked** (PO 決定 2026-06-10、A-128 F-1)。audit = A-NNN 監査記録、evidence = 正規化 JSON (secret/PII/raw transcript 禁止)。runtime state と区別する |
| 横断参照資料 | `docs/reference/` | tracked。参照用であり配置正本は本書 (例: `ai-agent-harness-directory-reference.md`) |

## 3. V-model 4 artifact の配置 (中核ルール、concept v3.1 §2.3)

4 artifact は**別物として別ディレクトリ**に置き、双方向 trace で結ぶ（混在禁止）。

| artifact | 置き場 |
|----------|--------|
| ① 設計 (文書) | `docs/design/` |
| ② 実装コード | `src/` |
| ③ テスト設計 (文書) | `docs/test-design/` |
| ④ テストコード | `tests/` |

## 4. 命名規約

- PLAN: `docs/plans/PLAN-NNN-slug.md` / ADR: `docs/adr/ADR-NNN-slug.md`
- TS source: `src/<domain>/<name>.ts` / test: `tests/<name>.test.ts`
- テスト設計: `docs/test-design/<feature>/<...>-test-design.md`
- ファイル名は英語（日本語ファイル名は Windows 文字化け回避のため禁止）

## 5. tracked / gitignored（追跡対象と除外対象）

- **gitignored**: `node_modules/` `dist/` `*.tsbuildinfo` `coverage/` / `.helix/` runtime state (state/cache/logs/tmp/handover CURRENT.*・*.bak/audit *.jsonl・escalation_state.json、local*) / legacy local state / `__pycache__` / `docs/plans/*.lock` / `CLAUDE.local.md` `AGENTS.override.md` `.claude/settings.local.json` / secret 系 (`.env*` `*.key` `*.pem` `credentials.json`)
- **active tracked**: `src/` `tests/` `docs/` (archive含む) `scripts/` `package.json` `tsconfig.json`、cutover中の`bun.lock`、Vitest／editor設定、監査証跡、参照資料。
- **target tracked（未実体化を含む）**: `workers/python/`、`package-lock.json`。対応pair-freeze／Forward PLANで生成後にactive trackedへ昇格する。

## 6. 境界

- **正本**: `docs/governance/*` + `docs/adr/*` + `docs/process/*` (工程/駆動モデル定義) + Python semantic contract + `src/` (Node実行境界)。
- **generated / 非正本**: `.helix/state` `dist/` `node_modules/` legacy local state。
- **historical**: `docs/archive/`（旧版）/ `docs/migration/`（移行資料、code-port 部は superseded）。

## 7. 禁止事項

- `src/`のNode実行境界にbash／Pythonを混在させない。Python意味コアは`workers/python/`へ配置し、versioned contract以外で副作用境界を迂回させない。
- enum / 契約を `src/schema/` 以外で再定義しない。
- `.helix/` **runtime state** (state/cache/logs/tmp/handover CURRENT/local*) を docs 目的で Git 追跡しない。**監査証跡** (`audit/*.md` / `audit/reports/*.md` / `evidence/` / `handover/provider/`) は例外として tracked (§5、A-128 F-1)。
- source process reference を工程定義の正本として参照しない (正本 = `docs/process/`)。
- 日本語ファイル名を使わない。
- **`[予定]` ディレクトリの中身を後続 PLAN 不在のまま実装しない**: ディレクトリ実体 (`.gitkeep`) は構成確定として一括作成済だが、中身 (機能コード・doc・workflow。特に `src/web/`) は対応 PLAN が確定してから起こす。`.gitkeep` があることを実装許可と誤読しない。

## 8. config 最小化方針 (root の散らかり防止)

- `LICENSE`: MIT License (RetryYN). 配布条件の canonical top-level file として tracked に含める。

JS/TS は「1 ツール = 1 設定ファイル」で root に config が溜まりやすい。**フォルダに隠す**のはツールが root を探すため不可（壊れる）。代わりに **ツールを減らす + package.json に集約** で抑える。

- **root configの下限**（target）: `package.json` / `package-lock.json` / `tsconfig.json` / `.editorconfig`。cutover中だけ`bun.lock`をknown-good証拠として保持する。
- **lint + format = Biome 1枚 (`biome.json`)**。`npm run lint` / `npm run format`をtarget commandとする。
- **test = vitest**。`vitest.config.ts` は G7 coverage-summary evidence (`json-summary`) を生成するための tracked exception とする。`vitest.workspace.ts` は fast/slow project 分割 (PLAN-L7-348) のための tracked exception。
- commitlint 等 **config-in-package.json 対応**のツールは package.json のキーに入れ、新規 dotfile を作らない。
- **新ツール導入時の判断順**: ① 既存ツール（Biome / Node / tsc）で代替できるか → ② package.jsonに同居できるか → ③ 単独configが必要か。license／SBOM未分類なら導入しない。

→ target root configは **`package.json` / `package-lock.json` / `tsconfig.json` / `.editorconfig` / `biome.json` / `vitest.config.ts` / `vitest.workspace.ts`**を上限とする。transition lockは分母外で別管理する。

## 9. 配布 3 層モデル (ADR-005)

harness の配置は 3 層で分離する。本書 §1 canonical ツリーは **① engine repo** の構成。

| 層 | 実体 | 配置 | 更新享受 |
|----|------|------|---------|
| **① engine repo (単一真実)** | harness engine + ルール + 工程/駆動モデル定義 (本 repo) | **GitHub repo**。consume側はgit dependencyをnpmで**tag-pin**しdevDependenciesへcommit | tagをnpmでbump。社内既定 = tag-pin + 定期bump |
| **② project 投影 (adapter)** | consume 側 project に展開される `CLAUDE.md` / `.claude/` / `AGENTS.md` 等 | `helix setup` が engine から **投影**。内容を複製せず engine を参照する adapter | engine の tag bump に追従 |
| **③ 中央 UI service** | 全 project 横断の管理 Web UI (15 画面) | **中央 / team server**。各 project の GitHub repo を data backbone に読む (project-local でない) | UI service コード自体も engine と同 GitHub repo (`src/web/`) で管理 |

- **public npm publish しない** (社内コード、GitHub-pull で足りる)。
- **engine は tool 非依存 package**: CLI / CI (Layer B-remote `.github/workflows`) / Codex / 将来ツールが同一 engine を GitHub から取得 (ルール同一性、concept §2.1.0)。Claude plugin は **任意の補助配信チャネル**で主軸でない (ADR-005 D3)。
- consume 側 project の投影レイアウト (CLAUDE.md/.claude/AGENTS.md + `.helix/` state) の詳細は `helix setup` 仕様 (L4 external-if / L5 if-detail) で確定。
