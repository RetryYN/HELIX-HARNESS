---
plan_id: PLAN-L7-312-d-contract-dsl
title: "PLAN-L7-312 (impl): D-CONTRACT DSL 実装 (mode-routing.yaml / gate-checks.yaml + zod loader) — 上流突合で確定した LOCAL 自身の L7 carry を閉じる"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "L5 if-detail §8 の既存 carry を L7 実装で閉じる変更であり、新規 requirement や上位設計の意味変更は追加しない。実装済み backfill は if-detail と G8 evidence manifest に限定する。"
owner: Claude (Opus) / Codex
parent_design: docs/design/harness/L5-detailed-design/if-detail.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — routing-contracts.ts へ validateDContractDsl + 2 zod schema を追加、mode-routing.yaml / gate-checks.yaml loader を実装"
  - role: tl
    slot_label: "TL — LOCAL の現行 mode 集合 (docs/process/modes/) と G1-G14 gate ID への接地・enum verbatim 流用防止・recommendedCommandV1Schema 不変レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-312-d-contract-dsl.md
    artifact_type: markdown_doc
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: tests/routing-contracts.test.ts
    artifact_type: test_code
  - artifact_path: tests/fixtures/d-contract/mode-routing.yaml
    artifact_type: yaml_config
  - artifact_path: tests/fixtures/d-contract/gate-checks.yaml
    artifact_type: yaml_config
  - artifact_path: docs/design/harness/L5-detailed-design/if-detail.md
    artifact_type: design_doc
  - artifact_path: .helix/evidence/g8-integration/20260626-it-adapter-asset-expansion.json
    artifact_type: json_config
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    - docs/design/harness/L5-detailed-design/if-detail.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T03:05:00+09:00"
    tests_green_at: "2026-07-05T03:05:00+09:00"
    verdict: approve
    scope: "D-CONTRACT DSL validator を pure module として追加し、mode-routing / gate-checks fixture、unknown mode、missing required gate、next cycle、非 helix next_action の fail-close を検証した。既存 route evaluator の実行判断ロジック、CLI wiring、AI 呼び出し、PLAN-M-02 rename cutover は変更していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/routing-contracts.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:05:00+09:00"
        evidence_path: tests/routing-contracts.test.ts
        output_digest: "sha256:9c6f94dea7c3e00b108336df915f25640df362fdb700e86abad7b7ad592dd66d"
      - kind: unit_test
        command: "bun test tests/routing-contracts.test.ts tests/g8-integration-workflow.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:05:00+09:00"
        evidence_path: tests/g8-integration-workflow.test.ts
        output_digest: "sha256:2eab00f92a5bda76ff43a4b215d4620c117939e3221f808603492b5c7ed77d91"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:05:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:05:00+09:00"
        evidence_path: src/workflow/routing-contracts.ts
        output_digest: "sha256:fb80bb5f96694126a42ea3c8ad2febce1f3d682571edf5fbf332a1bd24b3d333"
      - kind: lint
        command: "./scripts/helix plan lint docs/plans/PLAN-L7-312-d-contract-dsl.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:05:00+09:00"
        evidence_path: docs/plans/PLAN-L7-312-d-contract-dsl.md
        output_digest: "sha256:bdfa400429a1aa27075ee6f61c682a1922df6c8a78bd10aedf34918141ec19ab"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:05:00+09:00"
        evidence_path: docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
        output_digest: "sha256:60bf2d5d0ec278ab5795f7deecc93d9a377134c3799dd853daa21cfe1d49717b"
---

# PLAN-L7-312 (impl): D-CONTRACT DSL 実装

## Objective

`docs/design/harness/L5-detailed-design/if-detail.md` §5/§8 が「D-CONTRACT DSL 実装
(mode-routing.yaml / gate-checks.yaml + loader) = L7」と carry 明記し、IMP-073 も参照する
LOCAL 自身の未了項目を閉じる。上流 `unison-ai-product/HELIX-HARNESS` の
`validateDContractDsl`（`src/workflow/routing-contracts.ts`）と同型の zod validate を、
LOCAL の既存 `routing-contracts.ts` に追加し、workflow 実行が fixture へ依存する前に
決定論で fail-close させる。上流 diff の bulk import ではなく HELIX 式に harden して差す。

## スコープ

### IN
- `src/workflow/routing-contracts.ts` に `validateDContractDsl({modeRoutingText, gateChecksText, requiredGateIds})` を追加。
- `dContractModeRoutingSchema`（`{signal, mode, priority, next[]}` の routes）と
  `dContractGateChecksSchema`（`gates: Record<gate_id, GateCheck[]>`、各 check の next_action は
  既存 `recommendedCommandV1Schema` 準拠）を zod で定義。
- mode-routing の `next` 循環検出、`requiredGateIds` の存在検証、非 `helix` next_action の reject。
- mode enum は LOCAL 現行 `docs/process/modes/`（add-feature/discovery/incident/recovery/refactor/
  research/retrofit/reverse/scrum/version-up + forward）へ接地。gate ID は G1-G14 へ接地。
- `mode-routing.yaml` / `gate-checks.yaml` fixture を LOCAL の mode/gate 定義から生成。

### OUT
- 上流の 11-mode enum を verbatim 流用しない（fork 独立進化のため LOCAL 現行へ再導出）。
- routing の実行判断ロジック自体（既存 `routeSignalToMode` 等）は変更しない。
- AI 呼び出しは追加しない（DSL validate は決定論）。

## 受入条件
- `validateDContractDsl` が unknown mode / missing required gate / `next` 循環 / 非 helix next_action を fail-close する。
- 既存 `routeSignalToMode` / `validateRouteConfigText` / `detectRouteEscalationBoundaries` を回帰させない。
- `recommendedCommandV1Schema` の契約（推奨コマンド型）を不変に保つ。
- 対象 test（`tests/routing-contracts.test.ts`）と `doctor` / `lint` / `typecheck` / `plan lint` が green。
- confirmed 前に review evidence（cross_agent または intra_runtime_subagent）を記録。

## スケジュール
- mode: serial。
- Step 1: LOCAL の mode 集合と G1-G14 gate ID を確認し、上流 enum との差分を吸収した mode/gate 語彙を確定（TL 接地）→ `D_CONTRACT_MODES` と `requiredGateIds` 入力へ接地。
- Step 2: 2 zod schema と `validateDContractDsl` を `routing-contracts.ts` に追加（Red→Green）→ 実装済み。
- Step 3: mode-routing.yaml / gate-checks.yaml fixture を生成し、循環・required gate・next_action 契約の test を追加 → 実装済み。
- Step 4: G8 evidence manifest（`g8-integration-workflow.ts`）へ IT-ADAPTER 相当 item として evidence 記録 → `IT-ADAPTER-03` を passed に更新。
- Step 5: 検証 → review → confirmed → 本 PLAN で confirmed。

## 壊さない / 再発させない
- 既存 routing API を破壊しない（追加のみ）。enum verbatim 流用による語彙 drift を作らない。
- if-detail §8 の carry を「実装済み」に更新し、prose claim を test/command で substantiate（PLAN claim 規律）。

## 着地結果

- `validateDContractDsl` は YAML parse → zod schema → cross-record validation の順で fail-close する。
- mode-routing は `signal` / `mode` / `priority` / `next[]` を検証し、重複 signal、unknown next、next 循環を検出する。
- gate-checks は `G1`〜`G14` 形式の gate ID と `recommendedCommandV1Schema` 準拠の `next_action` を検証する。
- `requiredGateIds` は呼び出し側が指定し、missing gate を実行前に error finding とする。
- `tests/routing-contracts.test.ts` と `tests/fixtures/d-contract/*.yaml` が valid fixture と negative fixture を固定する。
- L5 `if-detail.md` §8 と G8 evidence manifest の `IT-ADAPTER-03` を implementation evidence に backfill した。

## レビュー / 次工程
- 実装・targeted test・typecheck は green。PLAN-L7-312 は confirmed。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier1-#1。
