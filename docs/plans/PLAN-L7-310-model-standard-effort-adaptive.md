---
plan_id: PLAN-L7-310-model-standard-effort-adaptive
title: "PLAN-L7-310 (impl): モデル別 標準 effort と適応調整ルール"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Claude
parent_design: docs/plans/PLAN-DISCOVERY-02-roster-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
backprop_decision: not_required
backprop_decision_reason: "既存 reasoning-effort (REASONING_EFFORTS / recommendModelEffort) と model SSoT (PLAN-L7-58/309) の上で、モデル別標準 effort と適応調整ルールを追加する運用ロジック。新規 L1/L3 要求は追加しない。"
agent_slots:
  - role: tl
    slot_label: "TL - model 標準 effort と適応ルール境界"
  - role: qa
    slot_label: "QA - shallow 昇格 / too-slow 降格の境界検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
    artifact_type: markdown_doc
  - artifact_path: src/team/model-effort.ts
    artifact_type: source_module
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/agents/fe-ui.md
    artifact_type: markdown_doc
  - artifact_path: tests/model-effort.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-309-fe-roster-orchestration.md
  requires:
    - docs/plans/PLAN-L7-309-fe-roster-orchestration.md
review_evidence:
  - reviewer: codex-locke
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-04T03:26:49+09:00"
    tests_green_at: "2026-07-04T03:26:49+09:00"
    verdict: approve
    scope: "model 標準 effort registry / 適応ルール / fe-ui effort=medium の整合をレビュー。gpt-5.5=high、gpt-5.4=medium、claude-sonnet-5=medium、claude-sonnet-4-6=high、未知 model=medium fallback を確認。provider API / 課金計算 / 認証・認可 / secrets / PII / production infra への実変更なし。"
    worker_model: claude
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/model-effort.test.ts tests/team-model-policy.test.ts tests/agent-model-ssot.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T03:26:49+09:00"
        evidence_path: tests/model-effort.test.ts
        output_digest: "sha256:fd6d855365575970728d378a15919bf0f98c8137f0948266c0e1105211bd6ad5"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T03:26:49+09:00"
        evidence_path: src/team/model-effort.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T03:26:49+09:00"
        evidence_path: docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
        output_digest: "sha256:4c0741083bc42d2b00bd0c8267e8ee4ddba1f7102048ffd39a802c93c413c226"
---

# PLAN-L7-310: モデル別 標準 effort と適応調整ルール

## 0. 目的

PO ルール (2026-07-04): モデル世代で reasoning effort の置き方が違う (claude-sonnet-5 の標準は
`medium` で、旧 claude-sonnet-4-6 とは異なる)。したがって「各モデルの標準 effort を調べ、基本は
それで投げる。浅い回答なら effort を上げ、思考時間が長すぎるなら下げる」ルールを敷く。

## 1. スコープ

- `src/team/model-effort.ts` (SSoT):
  - `FAMILY_STANDARD_EFFORT` / `EXACT_MODEL_STANDARD_EFFORT`: family + 世代上書きの標準 effort。
    fable/opus=high、sonnet=medium (claude-sonnet-5)、haiku=low、frontier=high、worker=medium、spark=low。
    `gpt-5.5` / `gpt-5.4` は model id に family token を含まないため exact mapping で固定する。
    旧 claude-sonnet-4-6=high (世代差)。未知 model は安全側 medium。
  - `standardEffortForModel(model)`: exact 上書き → family 既定 → medium fallback。
  - `adaptReasoningEffort(current, {shallow, tooSlow})`: shallow→一段上げ、tooSlow→一段下げ、
    矛盾/無信号→維持、境界 (high/low) は据え置き。
  - `resolveAdaptiveEffort(model, obs)`: 標準起点で観測を 1 段適応 (既定は標準そのまま)。
- `.claude/CLAUDE.md`: モデル別標準 effort と適応ルールを運用として明記。
- `.claude/agents/fe-ui.md`: sonnet-5 worker の effort を標準 medium に設定 (exemplar)。

## 2. 対象外

- runtime での shallow / too-slow 自動判定 (本 PLAN は registry + 決定論ルール。観測は呼び出し側)。
- 既存 agent frontmatter の effort 一括変更 (明示 override は各 agent の意図として尊重。標準運用は registry)。
- recommendModelEffort (task-size ベース) の置き換え (別軸。共存)。

## 3. 受入条件

- U-EFFORT-001..007: sonnet-5=medium / sonnet-4-6=high の世代差、family 既定、未知=medium、
  shallow 昇格・tooSlow 降格・境界据え置き・矛盾維持、resolveAdaptiveEffort の合成
  (tests/model-effort.test.ts)。
- `bun run typecheck` green、`bun run vitest run tests/model-effort.test.ts` green、`ut-tdd doctor` green。

## 4. carry

- runtime の shallow / too-slow 観測シグナルの自動収集と effort 自動再投入は後続 (loop-effort-budget 連携)。
