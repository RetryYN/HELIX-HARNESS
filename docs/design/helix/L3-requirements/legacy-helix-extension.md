---
title: "HELIX L3 要件補完 — 旧 HELIX 拡張採用"
layer: L3
kind: add-design
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: AIM + TL (Codex)
plan: PLAN-L3-06-helix-pillar-descent
pair_artifact: docs/test-design/helix/legacy-helix-extension.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
source_legacy_repo: RetryYN/ai-dev-kit-vscode
source_legacy_commit: 1cb4c3e
source_legacy_commit_full: 1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23
---

# HELIX L3 要件補完 — 旧 HELIX 拡張採用

旧 HELIX `RetryYN/ai-dev-kit-vscode` の read-only inventory から、現行 HELIX-HARNESS に採用する機能候補を
L3 要件へ降ろす。旧 Python/Bash runtime、`.helix` state、個人 workspace path は採用しない。機能概念だけを
TS/Bun harness、PLAN、現行 state/projection へ翻案する。

## §0 ソース棚卸し

| 旧ソース | 採用する意味 | 採用しない旧前提 |
|---------------|--------------|------------------|
| `helix/HELIX_RUNTIME_RULES.md` | 実行前に目的、工程、Forward 接続先、合格基準、作業正本、許可範囲を固定する runtime discipline | `.helix/handover` / `helix` CLI 直結 |
| `helix/CLAUDE_RUNTIME_ADAPTER.md` + `.claude/hooks/pretooluse-askuserquestion.sh` | 技術判断をユーザー質問へ逃がす前に TL advisor へ通す fail-close | Claude 固有 hook shell 実装の移植 |
| `cli/lib/detectors/registry.py` + `detectors/axis_*.py` | drift / coverage / plan debt / orchestration などを axis registry と gate routing で扱う | Python detector 実装の移植 |
| `cli/lib/skill_recommender.py` / `code_recommender.py` / `command_catalog.py` | skill / code / command を catalog 化し、recommender で候補を出す | Codex raw wrapper、`.helix/cache` 依存 |
| `cli/helix-debug` / `cli/helix-test-debug` | RUN & Debug で実行 trace、action coverage、missing action を診断する | legacy task log format と shell parser |

## §0.1 source-family disposition（ソース family の扱い）

旧 HELIX は file 数をそのまま機能一覧にしない。`1cb4c3e9e73e3d2933b353ccaa2b1f64fffa9f23`
で確認した主要 family を、HELIX-HARNESS の既存 pillar と今回の `HLX-FR-*` へ以下のように分類する。
分類の目的は「採用漏れを隠す」ことではなく、bulk import を避けて、既存正本に接続済みのものと
新規拡張を分けることである。

| 旧 family | 確認数 | 扱い | 理由 |
|---------------|----------------|-------------|-----------|
| `HELIX-workflows/helix-process/*.md` | 49 docs | existing-pillar-covered | V model / 9 mode / DB convergence / workflow routing は現行 HELIX L0-L6 pillar docs にすでに中核として取り込まれている。今回の追加は `HLX-FR-09` workflow inventory で分類証跡を持ち、runtime discipline / detector / learning との差分を `HLX-FR-01` / `HLX-FR-03` / `HLX-FR-12` へ接続する |
| `cli/helix*` command files | 82 commands | harden-via-current-cli | 旧 command surface は `ut-tdd` 現行 CLI / PLAN-M-02 rename 方針に従属させる。個別 command 名を直接移植せず、catalog/recommender と RUN & Debug trace の意味だけを `HLX-FR-04` / `HLX-FR-05` に採る |
| `cli/lib/*.py` | 139 modules | concept-only-ts-reimplementation | Python runtime は採用しない。DB、handover、gate、workflow、setup、telemetry の多くは現行 TS/Bun harness に既存実装があるため、今回の採用は 12 semantic groups を L3-L6 contract 化し、既存 pillar covered / harden required / defer / reject を明示する |
| `cli/lib/detectors/*.py` | 17 files | adopt-as-HLX-FR-03 | detector axis registry と routeable finding の意味を採用する。axis の Python 実装や `.helix` state 依存は移植しない |
| `cli/lib/builders/*.py` | 14 files | existing-pillar-covered | builder / workflow builder / verify script の概念は現行 task routing、team run、adapter plan、verification profile に接地済み。旧 builder 実装は採用せず、recommendation candidate 化は `HLX-FR-04` に含める |
| `.claude/agents/*.md` and `cli/roles/*.conf` | 19 agents / 31 roles | adapter-template-covered | Claude/Codex adapter template と team/role routing で HELIX 版に再構成済み。旧 persona files は `HLX-FR-08` の role/model/slot inventory source であり、直接 current path にしない |
| `.claude/hooks/*` | 18 hooks | adapter-guard-covered | ask-user-question、agent guard、session summary などは現行 hook/adapter parity と hosted API preflight 境界へ翻案する。`pretooluse-askuserquestion.sh` は `HLX-FR-02`、hook/guard suite 全体は `HLX-FR-07` の source |
| `skills/**/SKILL.md` | 130 skills | catalog-not-bulk-import | skill は一括 import しない。task/layer/phase/role/reference による候補提示と採用証跡を `HLX-FR-04` とし、個別 skill は後続 skill catalog/curation の対象にする |
| `verify/*.sh` and `cli/tests/*.bats` | 35 scripts / 98 Bats | oracle-source-only | 旧検証 script は regression idea / oracle source。現行 TypeScript/Vitest/doctor へ直接移植せず、必要な検証概念だけを test-design に写す |

## §1 L3 要件

| ID | 要件 | acceptance |
|----|------|------------|
| HLX-FR-01 | runtime discipline は、作業前に目的、workflow/layer、Forward return、acceptance/verification、作業正本、許可範囲を固定し、矛盾する自己判断を fail-close または escalation にする | HLX-AC-01a / HLX-AC-01b |
| HLX-FR-02 | technical user question gate は、設計・契約・構造・配置・移行など TL 判断が必要な質問をユーザーへ出す前に TL advisor evidence を要求する。ユーザー選好だけの質問は理由付き bypass を許可する | HLX-AC-02a / HLX-AC-02b |
| HLX-FR-03 | detector axis registry は drift、coverage erosion、plan debt、relation graph、regression、orchestration integrity などの axis を gate / workflow routing へ接続し、stub / advisory / fail-close を区別する | HLX-AC-03a / HLX-AC-03b |
| HLX-FR-04 | recommender catalog は skill / code / command 候補を task、layer、phase、agent role、references に紐づけ、bulk import ではなく候補提示と採用証跡に限定する | HLX-AC-04a / HLX-AC-04b |
| HLX-FR-05 | RUN & Debug trace は、実行ログを action / command / adapter surface / expected keyword / missing action に分解し、L7.5 verification evidence と改善候補へ接続する | HLX-AC-05a / HLX-AC-05b |
| HLX-FR-06 | core injection / runtime adapter distribution は、旧 `HELIX_CORE.md` と Claude/Codex adapter を repo-local 正本へ射影し、個人 absolute path や global file 欠落を current truth と混同しない | HLX-AC-06a / HLX-AC-06b |
| HLX-FR-07 | hook / guard suite は、AskUserQuestion だけでなく agent guard、fire/stop guard、context bundle、plan auto-register、skill catalog rebuild を guard-surface registry へ分類し、wired/deferred/rejected を証跡化する | HLX-AC-07a / HLX-AC-07b |
| HLX-FR-08 | agent / role / model roster は、旧 persona file と role config を typed roster、slot policy、model-family constraint に変換し、過剰権限 role や自己評価 delegation を fail-close する | HLX-AC-08a / HLX-AC-08b |
| HLX-FR-09 | workflow process inventory は、49 workflow docs を HELIX pillar / workflow mode / gate へ意味分類し、未知 workflow を自動実行せず existing-pillar-covered または new-plan-required に分ける | HLX-AC-09a / HLX-AC-09b |
| HLX-FR-10 | DB / registry / telemetry / HTTP API surface は、旧 `helix_db.py`、registry、catalog、HTTP route を harness.db projection / read-model / provenance boundary へ翻案し、raw state import を禁止する | HLX-AC-10a / HLX-AC-10b |
| HLX-FR-11 | continuous-run / scheduler / job / budget は、heartbeat、job queue、auto-run、budget windows を loop/job control と verification profile budget に接続し、無制御な継続実行を禁止する | HLX-AC-11a / HLX-AC-11b |
| HLX-FR-12 | learning / feedback / recipe loop は、feedback event、recipe、learning result を improvement backlog / skill telemetry / verification evidence へ送るが、AI 自身による設計承認や acceptance close には使わない | HLX-AC-12a / HLX-AC-12b |

## §2 受入基準

| AC-ID | 前提 | 操作 | 期待結果 |
|-------|-------|------|------|
| HLX-AC-01a | PLAN / handover / layer artifact がある | work preflight を実行 | 目的、工程、Forward return、acceptance、作業正本、allowed scope が揃う |
| HLX-AC-01b | 作業要求が正本や allowed scope と矛盾する | apply 前に評価 | 勝手に進めず blocker / escalation / new PLAN に送る |
| HLX-AC-02a | 技術判断を含む質問をユーザーへ出す | question gate を評価 | 直近 TL advisor evidence が無ければ deny |
| HLX-AC-02b | ユーザー選好だけの質問である | bypass を要求 | bypass reason、actor、timestamp、question class を evidence に残す |
| HLX-AC-03a | detector axis が登録される | gate routing を rebuild | axis id、phase gate、kind、severity、workflow route が得られる |
| HLX-AC-03b | detector が stub/advisory のまま fail-close claim に使われる | gate を評価 | claim を拒否し、stub/advisory として表示する |
| HLX-AC-04a | task に使える skill/code/command がある | recommender を実行 | candidate、score/reason、references、recommended role が残る |
| HLX-AC-04b | recommender が旧 runtime path や raw wrapper を返す | adoption gate を評価 | candidate は hardening/defer され、current path として採用されない |
| HLX-AC-05a | RUN & Debug 対象 command が実行される | trace analyzer を実行 | expected action、matched evidence、missing action が structured output になる |
| HLX-AC-05b | action が欠落する | verification close を評価 | L7.5 evidence は incomplete になり、acceptance close に使えない |
| HLX-AC-06a | core / adapter 配布物を作る | distribution contract を評価 | repo-local 正本、generated target、required marker、missing global file risk が分離される |
| HLX-AC-06b | 個人 path または global HELIX file を current truth として参照する | adoption gate を評価 | public artifact への採用を拒否し、setup/runtime adapter の hardening 対象にする |
| HLX-AC-07a | legacy hook capability が見つかる | guard-surface registry を作る | source、surface、runtime、wired/deferred/rejected、reason、test oracle が残る |
| HLX-AC-07b | guard が未配線なのに fail-close 済みと主張する | gate を評価 | claim を拒否し、explicit deferred risk として扱う |
| HLX-AC-08a | agent / role / model entry を採用する | roster policy を評価 | role kind、allowed model family、slot、delegation boundary、review substitute が決まる |
| HLX-AC-08b | self-review / overpowered execution / unbounded subagent を要求する | policy gate を評価 | deny または escalate になり、ユーザー承認なしに実行しない |
| HLX-AC-09a | workflow doc を inventory に入れる | workflow mapping を評価 | pillar、workflow mode、gate、current status、existing/new/defer が決まる |
| HLX-AC-09b | 未知 workflow を自動 routing しようとする | mapping gate を評価 | new-plan-required になり、既存 workflow として扱わない |
| HLX-AC-10a | legacy DB / registry / API concept を採用する | data-surface classifier を実行 | harness.db table/projection/read-model/API boundary と provenance が決まる |
| HLX-AC-10b | raw legacy DB/state/API を current runtime state として import する | adoption gate を評価 | reject され、migration source only として記録される |
| HLX-AC-11a | continuous run / scheduler / budget を有効化する | run-control gate を評価 | trigger、timebox、queue lock、budget profile、stop condition、verification evidence が必須になる |
| HLX-AC-11b | stop condition なしで自動継続する | run-control gate を評価 | deny され、manual resume または new PLAN に送る |
| HLX-AC-12a | feedback / recipe / learning result が生成される | learning-feedback gate を評価 | event source、evidence link、improvement target、human/TL review state が残る |
| HLX-AC-12b | learning result だけで acceptance close しようとする | acceptance gate を評価 | reject され、独立した test / runtime verification evidence を要求する |

## §3 降下先

- L4: `docs/design/helix/L4-basic-design/legacy-helix-extension.md`
- L5: `docs/design/helix/L5-detail/legacy-helix-extension.md`
- L6: `docs/design/helix/L6-function-design/legacy-helix-extension.md`
- test-design: `docs/test-design/helix/legacy-helix-extension.md`
