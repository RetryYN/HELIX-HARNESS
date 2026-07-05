---
plan_id: PLAN-L7-337-delegation-brief-role-judgment
title: "PLAN-L7-337 (impl): 委譲ブリーフ強制 + role 判断ブリーフ注入 — subagent の賢さを委譲の質で機械保証する"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "judgment-core SSoT (PLAN-L7-335) §5 の委譲 4 点セットを機械強制へ昇格し、既存の agent-guard fail-close 契約と adapter stdin 帯域外契約 (U-ADAPTER-007/008) の意味を変えずに検査/注入を additive に追加する。上位設計の意味変更は無い。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-335-judgment-core.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
pair_artifact: tests/role-judgment.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - guard/adapter 契約の互換性と judgment-core §5 整合"
  - role: qa
    slot_label: "QA - marker 検査 / role ブリーフ注入 / 既存 stdin 契約回帰 oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-337-delegation-brief-role-judgment.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/role-judgment.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: tests/role-judgment.test.ts
    artifact_type: test_code
  - artifact_path: tests/agent-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-concept_v3.1.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/commands/ship.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-335-judgment-core.md
  requires:
    - docs/skills/judgment-core.md
    - src/runtime/review-guard.ts
  references:
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
related_adr:
  - docs/adr/ADR-001-helix-harness-redesign-and-language.md
related_docs:
  - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T04:38:35+09:00"
    tests_green_at: "2026-07-06T04:38:35+09:00"
    verdict: approve_after_fixes
    scope: "role 判断ブリーフ注入と委譲ブリーフ marker 強制をレビューした。subagent 監査で検出した runtime->task->runtime 循環は `role-judgment.ts` から task import を除去して解消し、PLAN-L7-337 は単一 PLAN に統合した。change-set-integrity / coding-rules / dependency-drift の赤は targeted test と doctor 事前確認で解消済み。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/role-judgment.test.ts tests/agent-guard.test.ts tests/runtime-adapter.test.ts tests/coding-rules.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T04:38:35+09:00"
        evidence_path: tests/role-judgment.test.ts
        output_digest: "sha256:e560ebe033b36dbb4a7a4f15240ef3d31efc1af1c2a8f4d10c81960336c87db8"
      - kind: unit_test
        command: "bun test tests/tool-adapter.test.ts tests/loop-bridge.test.ts tests/team-run.test.ts tests/provider-handover.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T04:38:35+09:00"
        evidence_path: tests/team-run.test.ts
        output_digest: "sha256:18a428c7ca1ada66a39bd9f216c723c2f6ea714eea4762bc32daa63f9a9caae8"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T04:38:35+09:00"
        evidence_path: src/runtime/role-judgment.ts
        output_digest: "sha256:785992838089d2748fccdd67e5f4935690a7f772b39068e9753e011a7343bd30"
      - kind: lint
        command: "bun src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-06T04:38:35+09:00"
        evidence_path: docs/plans/PLAN-L7-337-delegation-brief-role-judgment.md
        output_digest: "sha256:d357ba4d848b877221bedde18c93b9637c4b6b26b96ab5b646676a1b55b2efe5"
---

# PLAN-L7-337 (impl): 委譲ブリーフ強制 + role 判断ブリーフ注入

## 目的（PO 要求 2026-07-06「サブエージェントの大幅強化・賢いふるまい」）

subagent の賢さは委譲の質（brief の粒度）と役割規律の一貫性で決まる（judgment-core §5、
Anthropic multi-agent research system の実測知見）。PLAN-L7-335 で判断規律の**記述**は SSoT 化
したが、(1) Claude 側 Agent 呼び出しの prompt 品質、(2) Codex 側 role 委譲の判断基準、の 2 面は
依然として呼び出し側の手書き任せだった。本 PLAN はこの 2 面を**機構**で塞ぐ。

## 設計（対案比較）

- **強化 1 — 委譲ブリーフ guard**: `agent-guard` に「Agent prompt は委譲ブリーフ 4 marker
  （`【objective】【output format】【tool guidance】【task boundary】`、英日ラベル等価）を含む」
  検査を fail-close で追加。**対案 = LLM/ヒューリスティックによる prompt 品質判定**は false
  positive が制御できず guard の決定論性（同一入力→同一判定）を壊すため不採用。marker 方式は
  決定論・自己修正的（block message がそのまま修正指示になる）。bypass は既存
  `HELIX_ALLOW_RAW_AGENT=1` に統一（新 bypass 経路を作らない）。
- **強化 2 — role 判断ブリーフ注入**: `helix codex/claude --role` の委譲 prompt に、role
  archetype（tier-router の ROLE_ARCHETYPE + review-guard alias と同一語彙）別の判断ブリーフを
  adapter が機械注入（`formatAdapterPrompt`）。**対案 = AGENTS.md の prose 依存**は委譲単位の
  role 適合（worker には green 裏付け、verify には severity-first）を選べないため補助に留める。
  未知 role でも共通規律（正本参照 + escalation 境界）は必ず載せる（ブリーフ無し委譲を作らない）。
- **Codex spawn_agent 面は対象外**: Codex 内部の spawn surface は task body 必須の既存検査を維持
  し、marker 強制は Claude Agent 面から段階導入する（blast radius 制御。効果確認後に別 PLAN で拡張）。

## スコープ

### Step 1 — role-judgment 純関数（着地済み）
- `src/runtime/role-judgment.ts` 新設: `roleArchetypeFor`（runtime 内の role→archetype 写し +
  verify/consult alias）、`roleJudgmentBrief`（archetype 別規律 + 共通規律）、`ROLE_JUDGMENT_HEADER`。
  runtime から `task` / `team` へ依存すると `runtime -> task -> runtime` cycle を作るため、
  model/tier routing の正本には依存しない。

### Step 2 — adapter 注入（着地済み）
- `formatAdapterPrompt(task, injection, role)`: 全委譲 stdin = task 本文 + role 判断ブリーフ +
  skill 注入。stdin 帯域外契約（argv 非混入、U-ADAPTER-007/008）は維持。

### Step 3 — agent-guard 委譲ブリーフ検査（着地済み）
- `agent-guard-policy.ts` に `DELEGATION_BRIEF_MARKERS` / `DELEGATION_BRIEF_HINT`（正本）。
- `evaluateAgentGuard` に `missingDelegationBriefMarkers` 検査を追加（rule 6）。欠落 key を
  列挙し SSoT 参照付きで block。`Task` tool 面にも同一適用。

### Step 4 — docs 同期（着地済み）
- `.claude/CLAUDE.md` Subagent Guard rules へ rule 6 追記、`ship.md` fan-out 指示へ marker 明記、
  `AGENTS.md` 判断コア節へ role ブリーフ自動注入の受信側規約を追記。

### OUT / 非対象
- `docs/skills/judgment-core.md` の本文変更（§5 は既に 4 点セットを定義済み。version 据え置き）。
- Codex spawn_agent / bulk spawn への marker 強制（上記のとおり段階導入、別 PLAN）。
- `helix team run` team 定義スキーマへのブリーフ必須化（PLAN-L7-335 OUT を踏襲、別 PLAN 候補）。

## 受入条件
- U-ROLEJUDG-001..006 / U-AGUARD-BRIEF-001..004 / U-ADAPTER-010 が green であること
  （検証コマンド: `bun test tests/role-judgment.test.ts tests/agent-guard.test.ts tests/runtime-adapter.test.ts`）。
- 既存 stdin 帯域外契約（U-ADAPTER-007/008）と guard 既存 oracle が green のまま
  （同上コマンドに包含、47 oracle）。
- adapter 消費側（loop-bridge / team-run / provider-handover / tool-adapter）の回帰が green
  （検証コマンド: `bun test tests/tool-adapter.test.ts tests/loop-bridge.test.ts tests/team-run.test.ts tests/provider-handover.test.ts`）。
- `bun run typecheck` green、`helix doctor` exit 0。
- review evidence + green_commands（digest 付き）を記録する。

## スケジュール
- mode: serial。Step 1 純関数 → Step 2 注入配線 → Step 3 guard 検査 → Step 4 docs 同期 →
  検証 → レビュー → confirmed。

## 壊さない / 再発させない
- 既存 guard 契約（allowlist / model family / bypass 経路）を変えない（rule 6 は additive）。
- stdin 帯域外契約（argv にプロンプトを載せない）を変えない。ブリーフは stdin 内 append のみ。
- marker 語彙は `DELEGATION_BRIEF_MARKERS` の単一正本。docs 側の列挙は同期写しであり、
  変更時は policy → docs の順で追随する。
- `role-judgment.ts` は runtime module 内で閉じる。`task/tier-router-policy.ts` を import して
  role 表を共有すると循環依存 gate を悪化させるため、同期確認は test 側で扱う。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| 委譲ブリーフ (delegation brief) | 新規 | 委譲 prompt の最低要件 4 点セット + guard 4 marker 強制 | 導入層 L7、concept §10.3 へ追記済み |
| role 判断ブリーフ (role judgment brief) | 新規 | adapter が全 --role 委譲へ機械注入する archetype 別判断規律 | 導入層 L7、concept §10.3 へ追記済み |

## §7 機能要求更新 (FR registry delta)

機能要求更新なし（FR-L1-09 agent guard / FR-L1-12 injection の既存機能エリア内での検査・注入強化
であり、新規機能エリアを追加しない）。
