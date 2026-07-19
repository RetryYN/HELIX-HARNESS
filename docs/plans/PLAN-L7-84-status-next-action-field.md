---
plan_id: PLAN-L7-84-status-next-action-field
title: "PLAN-L7-84 (impl): helix status --json に nextAction フィールドを additive 付加 — A-138 ITEM-1 carry discharge (taxonomy=current、camelCase 公開契約)"
kind: impl
layer: L7
drive: agent
status: confirmed
parent_design: docs/design/harness/L6-function-design/function-spec.md
created: 2026-06-19
updated: 2026-07-01
owner: PM (Opus) / PO (人間)
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T12:30:00+09:00"
    tests_green_at: "2026-07-01T12:30:00+09:00"
    verdict: pass
    scope: "Continuation: status now exposes additive `judgmentReview` so mode-level `nextAction` guidance is machine-routable to concrete judgment gate review evidence. `judgmentReviewPlanForMode` returns required review kind, cross-agent availability, gate command template, and required evidence for hybrid, single-runtime, and standalone modes. JSON and text status surfaces are covered by U-DETECT-006 without weakening the separate workflowNextAction completion blocker."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/gate-review-tier.test.ts tests/runtime.test.ts tests/cli-surface.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T12:30:00+09:00"
        evidence_path: tests/gate-review-tier.test.ts
        output_digest: "sha256:3a15c35ac6b2051c9e1558dbc9634136b54c913a7ee78047a74072e013094d06"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T12:30:00+09:00"
        evidence_path: src/gate/review-tier.ts
        output_digest: "sha256:b52900c9516bde834d18c683191db2bacc2d7f3cd1ad3c9956af17f7d99c6f2c"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T12:30:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:f144f678a22ad94189913c473d36fd8f22f76e94bd2cfe559b247c64a0b09d84"
  - reviewer: claude-code-reviewer (intra_runtime_subagent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "A-138 ITEM-1 の carry (next_action status field) を discharge。正式フィールド名は既存 6 フィールドの camelCase 公開契約に揃え nextAction で確定 (status --json は currentRuntime/availableRuntimes/missingRuntimes と全て camelCase ゆえ規約上一意に決まる、snake_case 別名なし)。値域は mode→judgment-gate guidance の安定機械契約文字列 (standalone=human-review-required / 単一 runtime=single-runtime intra_runtime_subagent / hybrid=cross-review-ready)、先頭 token で機械 switch でき後続が人間可読、公開 JSON ゆえ ASCII のみ (machine-surface-language と整合)。純関数 nextActionForMode + SSoT NEXT_ACTION_BY_MODE を detect.ts に追加し、status action が 6 検出フィールドへ additive に付加 (既存契約不変・後方互換)。U-DETECT-001..005 が 4 mode 値・接頭契約・value-domain を被覆。requirements §6 を carry→current へ、function-spec §1.2 に nextActionForMode 行を back-fill。typecheck/Biome/Vitest/doctor green。"
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
    green_commands:
      - kind: unit_test
        command: "typecheck / Biome / Vitest / doctor green (legacy PLAN-L7-84 evidence)"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-19"
        evidence_path: tests/runtime.test.ts
        output_digest: "sha256:b618ee6222587d12f34167ff761dfbbd963d489c41f7e51a9ec864d1b5c27b9b"
agent_slots:
  - role: se
    slot_label: "SE - status nextAction field additive implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-84-status-next-action-field.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/detect.ts
    artifact_type: source_module
  - artifact_path: src/gate/review-tier.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/runtime.test.ts
    artifact_type: test_code
  - artifact_path: tests/gate-review-tier.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-84 (impl): status --json nextAction フィールド

## 0. 目的

A-138 ITEM-1 (cross_agent TL/Codex 裏取り済) が `helix status --json` の
`next_action` を **carry** (能動 defer + 追跡 PLAN/gate) に区分し、PO 残課題として
「carry を PLAN 化する優先度」+「正式フィールド名 (`next_action` / `nextAction`) の
確定」を残していた。PO 指示 (2026-06-19「両方修正を」) を受け本 PLAN で carry を
discharge する。

正式フィールド名は **PO 判断を要しない**: 既存 `status --json` の 6 フィールドは全て
camelCase (`currentRuntime` / `availableRuntimes` / `missingRuntimes`) ゆえ、公開契約規約上
`nextAction` に一意に決まる (snake_case 別名は付さない)。

## 1. 範囲

対象範囲:

- **`src/runtime/detect.ts`** — `NEXT_ACTION_BY_MODE: Record<ExecutionMode, string>`
  (値域 SSoT) + 純関数 `nextActionForMode(mode): string` を追加。値は mode→判断ゲート
  guidance の安定した機械契約文字列。`RuntimeDetection` 型は不変 (detection は純粋に保つ)。
- **`src/gate/review-tier.ts`** — `judgmentReviewPlanForMode(mode)` を追加し、`nextAction`
  の人間可読 guidance を `requiredReviewKind` / `crossAgentReview` / `requiredAction` /
  `gateCommandTemplate` / `requiredEvidence[]` の machine-readable route へ落とす。
  hybrid は `cross_agent` + worker/reviewer model、単一 runtime は `intra_runtime_subagent`
  + checklist、standalone は human approval を要求する。
- **`src/cli.ts`** — `status` action が `{ ...detectMode(), nextAction }` を JSON 出力
  (additive)。さらに `runtimeNextAction` を同値 alias、`completionNextAction` を
  `workflowNextAction` alias として出し、runtime/judgment guidance と whole-program/L14
  completion guidance を分離する。さらに `judgmentReview` を JSON 出力し、plain 出力には
  `runtime-next:` / `completion-next:` / `judgment-review:` 行を付加する。

対象外:

- `optional_adapters` / `enabled_commands` / `disabled_commands` (taxonomy=`future`、
  adapter/command surface 設計が固まるまで実装しない)。
- handover CURRENT.json の `next_action` (別概念=session-level next action、本 PLAN 対象外)。
- snake_case 別名 / 値域の i18n。

## 2. 受入条件

- `helix status --json` が 7 フィールド目 `nextAction` を含み、既存 6 フィールドは不変
  (後方互換・additive)。
- `helix status --json` は `runtimeNextAction === nextAction` と
  `completionNextAction === workflowNextAction` を返し、runtime guidance と completion
  blocker guidance を機械的に分離する。
- `helix status --json` が `judgmentReview` を additive に含み、mode ごとに必要な
  review tier、gate command template、required evidence を返す。
- `helix status` text は `runtime-next:` と `completion-next:` を出し、曖昧な `next:` 行を出さない。
- `nextActionForMode` は 4 mode 全てに `NEXT_ACTION_BY_MODE` の値を返す純関数。
- 値は先頭 token (`:` 手前) で機械 switch でき、ASCII のみ (公開 JSON 契約 /
  machine-surface-language 整合)。standalone は human-review-required、単一 runtime は
  single-runtime (intra_runtime_subagent)、hybrid は cross-review-ready。
- requirements §6 が `next_action`=current へ更新、function-spec §1.2 に
  `nextActionForMode` 行が存在 (descent / change-impact 整合)。
- typecheck / Biome / 全 Vitest / `helix doctor` green。

## 3. テスト設計との対応

単体テスト設計: `docs/test-design/harness/L7-unit-test-design.md`
(U-DETECT-001..006、PLAN-L7-84 status nextAction フィールド追補)。
`tests/runtime.test.ts` の `nextActionForMode` describe が 4 mode 値・接頭契約・
value-domain を被覆する。`tests/gate-review-tier.test.ts` が `judgmentReviewPlanForMode`
の mode 別 route を被覆し、`tests/cli-surface.test.ts` が status JSON / text surface の
`judgmentReview` / `judgment-review:` を被覆する。

## 4. 状態

Confirmed。2026-06-19 に実装・検証済み。2026-07-01 continuation で
`judgmentReview` additive surface を追加し、`cross-review-ready` を具体的な
`helix gate <gate-id>` review tier route に接続した。
