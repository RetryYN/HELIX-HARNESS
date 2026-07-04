---
plan_id: PLAN-L7-312-d-contract-dsl
title: "PLAN-L7-312 (impl): D-CONTRACT DSL 実装 (mode-routing.yaml / gate-checks.yaml + zod loader) — 上流突合で確定した LOCAL 自身の L7 carry を閉じる"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/design/harness/L5-detailed-design/if-detail.md
related_l0: docs/governance/ut-tdd-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — routing-contracts.ts へ validateDContractDsl + 2 zod schema を追加、mode-routing.yaml / gate-checks.yaml loader を実装"
  - role: tl
    slot_label: "TL — LOCAL の現行 mode 集合 (docs/process/modes/) と G1-G14 gate ID への接地・enum verbatim 流用防止・recommendedCommandV1Schema 不変レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-312-d-contract-dsl.md
    artifact_type: markdown_doc
  - artifact_path: tests/routing-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-uttdd-reconciliation-audit-2026-07-04.md
    - docs/design/harness/L5-detailed-design/if-detail.md
---

# PLAN-L7-312 (impl): D-CONTRACT DSL 実装

## Objective

`docs/design/harness/L5-detailed-design/if-detail.md` §5/§8 が「D-CONTRACT DSL 実装
(mode-routing.yaml / gate-checks.yaml + loader) = L7」と carry 明記し、IMP-073 も参照する
LOCAL 自身の未了項目を閉じる。上流 `unison-ai-product/UT-TDD_AGENT-HARNESS` の
`validateDContractDsl`（`src/workflow/routing-contracts.ts`）と同型の zod validate を、
LOCAL の既存 `routing-contracts.ts` に追加し、workflow 実行が fixture へ依存する前に
決定論で fail-close させる。上流 diff の bulk import ではなく HELIX 式に harden して差す。

## スコープ

### IN
- `src/workflow/routing-contracts.ts` に `validateDContractDsl({modeRoutingText, gateChecksText, requiredGateIds})` を追加。
- `dContractModeRoutingSchema`（`{signal, mode, priority, next[]}` の routes）と
  `dContractGateChecksSchema`（`gates: Record<gate_id, GateCheck[]>`、各 check の next_action は
  既存 `recommendedCommandV1Schema` 準拠）を zod で定義。
- mode-routing の `next` 循環検出、`requiredGateIds` の存在検証、非 `ut-tdd` next_action の reject。
- mode enum は LOCAL 現行 `docs/process/modes/`（add-feature/discovery/incident/recovery/refactor/
  research/retrofit/reverse/scrum/version-up + forward）へ接地。gate ID は G1-G14 へ接地。
- `mode-routing.yaml` / `gate-checks.yaml` fixture を LOCAL の mode/gate 定義から生成。

### OUT
- 上流の 11-mode enum を verbatim 流用しない（fork 独立進化のため LOCAL 現行へ再導出）。
- routing の実行判断ロジック自体（既存 `routeSignalToMode` 等）は変更しない。
- AI 呼び出しは追加しない（DSL validate は決定論）。

## 受入条件
- `validateDContractDsl` が unknown mode / missing required gate / `next` 循環 / 非 ut-tdd next_action を fail-close する。
- 既存 `routeSignalToMode` / `validateRouteConfigText` / `detectRouteEscalationBoundaries` を回帰させない。
- `recommendedCommandV1Schema` の契約（推奨コマンド型）を不変に保つ。
- 対象 test（`tests/routing-contracts.test.ts`）と `doctor` / `lint` / `typecheck` / `plan lint` が green。
- confirmed 前に review evidence（cross_agent または intra_runtime_subagent）を記録。

## スケジュール
- mode: serial。
- Step 1: LOCAL の mode 集合と G1-G14 gate ID を確認し、上流 enum との差分を吸収した mode/gate 語彙を確定（TL 接地）。
- Step 2: 2 zod schema と `validateDContractDsl` を `routing-contracts.ts` に追加（Red→Green）。
- Step 3: mode-routing.yaml / gate-checks.yaml fixture を生成し、循環・required gate・next_action 契約の test を追加。
- Step 4: G8 evidence manifest（`g8-integration-workflow.ts`）へ IT-ADAPTER 相当 item として evidence 記録。
- Step 5: 検証 → review → confirmed。

## 壊さない / 再発させない
- 既存 routing API を破壊しない（追加のみ）。enum verbatim 流用による語彙 drift を作らない。
- if-detail §8 の carry を「実装済み」に更新し、prose claim を test/command で substantiate（PLAN claim 規律）。

## レビュー / 次工程
- 実装は Codex in-flight（大規模作業）の着地後に harness workflow（plan→pair-freeze→implement→
  trace-freeze→review→accept）で行う。基準点は HEAD。
- 出典: [[upstream-uttdd-reconciliation]] audit §5 Tier1-#1。
</content>
