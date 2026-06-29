---
title: "HELIX L3 要件 back-fill — old HELIX extension adoption"
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
---

# HELIX L3 要件 back-fill — old HELIX extension adoption

旧 HELIX `RetryYN/ai-dev-kit-vscode` の read-only inventory から、現行 HELIX-HARNESS に採用する機能候補を
L3 要件へ降ろす。旧 Python/Bash runtime、`.helix` state、個人 workspace path は採用しない。機能概念だけを
TS/Bun harness、PLAN、現行 state/projection へ翻案する。

## §0 source inventory

| legacy source | 採用する意味 | 採用しない旧前提 |
|---------------|--------------|------------------|
| `helix/HELIX_RUNTIME_RULES.md` | 実行前に目的、工程、Forward 接続先、合格基準、作業正本、許可範囲を固定する runtime discipline | `.helix/handover` / `helix` CLI 直結 |
| `helix/CLAUDE_RUNTIME_ADAPTER.md` + `.claude/hooks/pretooluse-askuserquestion.sh` | 技術判断をユーザー質問へ逃がす前に TL advisor へ通す fail-close | Claude 固有 hook shell 実装の移植 |
| `cli/lib/detectors/registry.py` + `detectors/axis_*.py` | drift / coverage / plan debt / orchestration などを axis registry と gate routing で扱う | Python detector 実装の移植 |
| `cli/lib/skill_recommender.py` / `code_recommender.py` / `command_catalog.py` | skill / code / command を catalog 化し、recommender で候補を出す | Codex raw wrapper、`.helix/cache` 依存 |
| `cli/helix-debug` / `cli/helix-test-debug` | RUN & Debug で実行 trace、action coverage、missing action を診断する | legacy task log format と shell parser |

## §1 L3 要件

| ID | 要件 | acceptance |
|----|------|------------|
| HLX-FR-01 | runtime discipline は、作業前に目的、workflow/layer、Forward return、acceptance/verification、作業正本、許可範囲を固定し、矛盾する自己判断を fail-close または escalation にする | HLX-AC-01a / HLX-AC-01b |
| HLX-FR-02 | technical user question gate は、設計・契約・構造・配置・移行など TL 判断が必要な質問をユーザーへ出す前に TL advisor evidence を要求する。ユーザー選好だけの質問は理由付き bypass を許可する | HLX-AC-02a / HLX-AC-02b |
| HLX-FR-03 | detector axis registry は drift、coverage erosion、plan debt、relation graph、regression、orchestration integrity などの axis を gate / workflow routing へ接続し、stub / advisory / fail-close を区別する | HLX-AC-03a / HLX-AC-03b |
| HLX-FR-04 | recommender catalog は skill / code / command 候補を task、layer、phase、agent role、references に紐づけ、bulk import ではなく候補提示と採用証跡に限定する | HLX-AC-04a / HLX-AC-04b |
| HLX-FR-05 | RUN & Debug trace は、実行ログを action / command / adapter surface / expected keyword / missing action に分解し、L7.5 verification evidence と改善候補へ接続する | HLX-AC-05a / HLX-AC-05b |

## §2 Acceptance Criteria

| AC-ID | Given | When | Then |
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

## §3 降下先

- L4: `docs/design/helix/L4-basic-design/legacy-helix-extension.md`
- L5: `docs/design/helix/L5-detail/legacy-helix-extension.md`
- L6: `docs/design/helix/L6-function-design/legacy-helix-extension.md`
- test-design: `docs/test-design/helix/legacy-helix-extension.md`
