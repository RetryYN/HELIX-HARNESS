---
plan_id: PLAN-L7-335-judgment-core
title: "PLAN-L7-335 (impl): 判断コア — Fable 判断規律の SSoT 化と全 agent 継承 + drift 機械検査"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "advisor-fable の 5 軸 (PLAN-L7-306) と model-effort 標準 (PLAN-L7-310) の意味を変えず、既存の判断規律を SSoT (docs/skills/judgment-core.md) へ昇格・集約して全 agent が参照する形に再配置する。frontmatter の新 key (judgment_core) は additive で既存 schema の意味を変更しない。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
pair_artifact: tests/judgment-core-coverage.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - 判断コア SSoT の正本整合と agent/command 配線"
  - role: qa
    slot_label: "QA - marker 同期 / allowlist 転記同期 / 共通化回帰 oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-335-judgment-core.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/judgment-core.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/SKILL_MAP.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/judgment-core-coverage.ts
    artifact_type: source_module
  - artifact_path: src/lint/allowlist-sync.ts
    artifact_type: source_module
  - artifact_path: src/lint/lint-wiring.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/judgment-core-coverage.test.ts
    artifact_type: test_code
  - artifact_path: tests/allowlist-sync.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/plan-artifact-existence.ts
    artifact_type: source_module
  - artifact_path: src/lint/plan-completion-drift.ts
    artifact_type: source_module
  - artifact_path: src/lint/merged-plan-status.ts
    artifact_type: source_module
  - artifact_path: .claude/agents/advisor-fable.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/code-reviewer.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/security-audit.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/qa-test.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/fe-lead.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/fe-ui.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/be-api.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/be-logic.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/db-schema.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/devops-deploy.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-sonnet.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-haiku.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-project-explorer.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-project-scout.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-tech-docs.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-tech-fork.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pmo-tech-news.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/refactor-scout.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-tech-innovation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-marketing-innovation.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/pdm-innovation-manager.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/build.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/spec.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/test.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/ship.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/sdd-plan.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/sdd-review.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/code-simplify.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
  requires:
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
    - src/lint/shared.ts
    - src/runtime/agent-guard-policy.ts
  references:
    - docs/plans/PLAN-L7-309-fe-roster-orchestration.md
    - docs/plans/PLAN-L3-07-requirements-binding-enforcement.md
related_adr:
  - docs/adr/ADR-001-helix-harness-redesign-and-language.md
related_docs:
  - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T01:25:35+09:00"
    tests_green_at: "2026-07-06T01:25:35+09:00"
    verdict: approve
    scope: "judgment-core SSoT を docs/skills に追加し、全 .claude/agents / .claude/commands へ judgment_core: v1 marker と SSoT 参照を展開した。allowlist-sync と judgment-core-coverage を doctor hard gate として配線し、lint-wiring の死蔵 module を解消した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/allowlist-sync.test.ts tests/judgment-core-coverage.test.ts tests/doctor.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T01:25:35+09:00"
        evidence_path: tests/judgment-core-coverage.test.ts
        output_digest: "sha256:2683a5fe6ab032ea257282cea94fabe2bb9b209ecfd5b2bfe3afc53ba31f5126"
      - kind: lint
        command: "bun src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-06T01:25:35+09:00"
        evidence_path: docs/plans/PLAN-L7-335-judgment-core.md
        output_digest: "sha256:0d38550ef52dea3aaa0f87446dfcf3e9040a76b89210274a694558868061a1d5"
---

# PLAN-L7-335 (impl): 判断コア — Fable 判断規律の SSoT 化と全 agent 継承 + drift 機械検査

## 目的（PO 要求 2026-07-06「Fable の遺書として全モデルへ最強の判断力を」）

Opus / Sonnet / Haiku / GPT 系の実装・レビュー agent が Fable 水準の判断規律で動くための
視点・観点・チェック項目を、prose の点在（5 軸レビュー 3 重記述、エスカレーション境界 6 箇所重複、
Codex 側 role 判断基準の欠落）から**単一正本（判断コア SSoT）へ昇格**し、配線の乖離を doctor で
fail-close する。SSoT の内容は 2026-07 時点の一次情報（Anthropic / OpenAI 公式 guide）を Web 調査で
裏付けた（出典は SSoT §6 に記録）。

## 設計（inventory-first の突合結果と対案）

- **SSoT の置き場所 = `docs/skills/judgment-core.md`**（skill pack）。既存 skill pack 群 +
  SKILL_MAP 索引 + `helix skill suggest` の scoring 資産に載る位置であり、agent/command は
  「差分（モデル別調整・役割固有の出力契約）だけを本文に持ち、普遍原則は SSoT 参照」とする。
- **対案比較（採用しなかった案）**: `docs/design/harness/L6-function-design/` への新設計書追加は
  l6-completion gate が owning PLAN-L6-* / confirmed status / L7 参照を即時要求し、既に PASS 済みの
  L6 完了状態を壊すため不採用。設計内容は SSoT pack（詳細版）+ 本 PLAN 設計節 + L7 test-design
  追補（U-JUDG / U-ALSYNC oracle）の 3 点で V-model trace を成立させる（PLAN-L7-332 と同型）。
- **モデル別調整の根拠**: Opus = overengineering / subagent 過剰召喚（Anthropic 公式に明文化）、
  Sonnet = 標準 medium・指示追従、Haiku = 具体指示必須（委譲 4 点セット）、GPT 系 = AGENTS.md
  adherence 高 + severity-first review + fail-forward 警戒（業界分析、参考扱いと明記）。
  effort の正本は既存 `src/team/model-effort.ts`（PLAN-L7-310）のままで変更しない。

## スコープ

### Step 1 — 判断コア SSoT（着地済み）
- `docs/skills/judgment-core.md` 新設: 普遍 7 原則（advisor-fable 5 軸の昇格 + inventory-first +
  スコープ規律）/ 工程別チェック（checklist=機械 gate、rubric=LLM 判断の二層）/ モデル別調整表 /
  レビュー規律（adversarial framing・false positive 抑制・severity-first・fresh context・oracle 強度）/
  委譲 4 点セット / 出典。`judgment_core_version: 1` を機械 marker の正本とする。
- SKILL_MAP.md へ trigger 行 + Core operating rules への正本宣言を追加。

### Step 2 — 全 agent / command / Codex 側への配線（着地済み）
- `.claude/agents/*.md` 全 21 体: frontmatter `judgment_core: v1` + 「判断コア」節
  （モデル帯別の差分 2-4 行 + SSoT 参照。普遍原則の再記述はしない）。
- `.claude/commands/*.md` 全 7 件: frontmatter marker + SSoT 参照 1-2 行。
- `AGENTS.md`: GPT 系判断規律節（green_commands 裏付け必須 / severity-first / bias to action /
  委譲 4 点セット）を managed marker 節の外へ追加。

### Step 3 — 検出系強化（lint 2 種、着地済み。doctor 配線は Step 5）
- `src/lint/judgment-core-coverage.ts`: SSoT version ⇔ agent/command marker + SSoT path 参照の
  同期を fail-close 検査（対象 0 件 = 配線消失も違反）。
- `src/lint/allowlist-sync.ts`: `SUBAGENT_ALLOWLIST`（正本）⇔ `.claude/CLAUDE.md` 転記の set 比較。
  parse 失敗は fail-close。asset-drift（agent .md 実在検査）が覆わない転記同期の穴を塞ぐ。

### Step 4 — 共通化リファクタ（着地済み、behavior-invariant）
- terminal status 集合の 3 重定義（plan-artifact-existence / plan-completion-drift /
  merged-plan-status の同一リテラル）を `shared.ts` の `isTerminalPlanStatus`
  （TERMINAL_PLAN_STATUSES 正本、既存・未使用だった）へ置換。既存 3 test files（40 oracle）を
  regression fence とする。

### Step 5 — doctor 配線（着地済み）
- `checkJudgmentCoreCoverage` / `checkAllowlistSync` を `runDoctor` の hard 群
  （呼び出し / ok 鎖 / messages の 3 箇所）へ配線する。
- `src/lint/lint-wiring.ts` では `judgment-core-coverage` を deferred から外し、runtime 到達性で
  wired として検査する。

### OUT / 非対象
- しきい値・観点表の config 外部化（`src/config/requirements-binding.ts` /
  `.helix/config/requirements-binding.yaml`）: Codex が PLAN-L3-07 で並行実装中のため本 PLAN は
  触れない（重複・衝突回避。方向性は同一で相補）。
- `src/team/model-effort.ts` の変更（effort 正本は PLAN-L7-310 のまま）。
- `helix team run` の team 定義スキーマへの委譲 4 点セット必須化（別 PLAN 候補として Web 調査
  レポートに記録。bulk 変更を避け段階導入）。

## 受入条件
- U-JUDG-001..005 / U-ALSYNC-001..006 が green であること
  （検証コマンド: `bun test tests/judgment-core-coverage.test.ts tests/allowlist-sync.test.ts`）。
  実 repo 同期は U-JUDG-005 / U-ALSYNC-006 の real-repo regression で立証する
  （prose claim ではなく gate run）。
- 共通化の behavior-invariant を既存 net（40 oracle green）で立証すること
  （検証コマンド: `bun test tests/plan-artifact-existence.test.ts tests/plan-completion-drift.test.ts tests/merged-plan-status.test.ts`）。
- `bun run typecheck` green。
- `helix doctor` が `judgment-core-coverage - OK` / `allowlist-sync - OK` を表示し exit 0。
- confirmed 昇格前に review evidence + green_commands（digest 付き）記録。

## スケジュール
- mode: serial。Step 1 SSoT → Step 2 配線 → Step 3 lint + テスト → Step 4 共通化 →
  レビュー → Step 5 doctor 配線 → 検証 → confirmed。

## 壊さない / 再発させない
- 既存 lint の検査・メッセージを変えない（Step 4 は同一集合への参照置換のみ、既存 40 oracle green）。
- requirements-binding config 外部化とは PLAN を分け、doctor/index.ts と tests/doctor.test.ts は
  共有編集として各 PLAN の責務を分離して記録する。
- SSoT 改訂時は `judgment_core_version` を上げ、全 marker を同一 commit で追随
  （judgment-core-coverage が乖離を fail-close し、5 軸 3 重記述と同型の drift 再発を機械で防ぐ）。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| 判断コア (judgment core) | 新規 | 実装/レビュー agent の判断規律 SSoT。5 軸 (PLAN-L7-306) の昇格 | 導入層 L7、concept §10.3 へ追記済み |
| judgment-core-coverage lint | 新規 | SSoT ⇔ marker 同期の fail-close 検査 (allowlist-sync と対) | 導入層 L7、concept §10.3 へ追記済み |

## §7 機能要求更新 (FR registry delta)

機能要求更新なし（既存 FR-L1-09 agent guard / FR-L1-21 cross-agent review の運用規律を SSoT 化する
governance 強化であり、新規機能エリアを追加しない）。
