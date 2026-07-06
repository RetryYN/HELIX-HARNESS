---
plan_id: PLAN-L7-352-plan-entry-routing-impl
title: "PLAN-L7-352 (impl): plan-entry routing gate 実装 — entry_signals 必須化・kind/signal 整合検査・classify の性能系語彙追加"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-06 Issue 起点が欠落し駆動モデルが正しく選ばれない穴を塞ぐ"
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-55 で設計した plan-entry routing gate の実装。routing 表・kind 体系は変更せず、既存 PLAN は grandfather baseline で遡及 fail させない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/plan-entry-routing.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - entry-routing lint / schema 追加 / classify lexicon"
  - role: tl
    slot_label: "TL - routeSignalToMode 再利用と ratchet 不変条件のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-352-plan-entry-routing-impl.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/plan-entry-routing-baseline.json
    artifact_type: json_config
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: src/schema/mode-catalog.ts
    artifact_type: source_module
  - artifact_path: src/schema/route-map.ts
    artifact_type: source_module
  - artifact_path: src/lint/plan-entry-routing.ts
    artifact_type: source_module
  - artifact_path: src/workflow/routing-contracts.ts
    artifact_type: source_module
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/task/classify-policy.ts
    artifact_type: source_module
  - artifact_path: tests/plan-entry-routing.test.ts
    artifact_type: test_code
review_evidence:
  - reviewer: codex
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T16:12:00+09:00"
    tests_green_at: "2026-07-06T16:12:00+09:00"
    verdict: approve
    scope: "PLAN-L7-352 plan-entry-routing gate 実装。U-PROUTE-001..012、baseline 機械生成、plan lint 配線、doctor gate 表示、性能語彙 classify を実測確認。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/plan-entry-routing.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:05:38+09:00"
        evidence_path: tests/plan-entry-routing.test.ts
        output_digest: "sha256:62fa6ca5e02f3ed4604f6fbbf0c0e2235c84532ab68baca7afab7662af30020f"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T16:05:59+09:00"
        evidence_path: src/lint/plan-entry-routing.ts
        output_digest: "sha256:a925af5073bc1707aa4f0775334a8cf1cbbc81adf3793f22196e137301094058"
      - kind: lint
        command: "bun run src/cli.ts plan lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T16:05:59+09:00"
        evidence_path: docs/governance/plan-entry-routing-baseline.json
        output_digest: "sha256:c823fce1991435160b544c751c8985eeb181a71ea0318b76ed913f2de18a83e0"
      - kind: doctor
        command: "bash -lc 'bun run src/cli.ts doctor | rg \"doctor: plan-entry-routing - OK\"'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-06T16:14:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:bc617bf39e4fa9f4b5e6a3cc6d0477afc7ca61b7d75f3c7c1e94395bd525f256"
      - kind: smoke
        command: "bun run src/cli.ts task classify --text \"テストと doctor が遅いので性能改善したい\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:05:59+09:00"
        evidence_path: src/task/classify-policy.ts
        output_digest: "sha256:518ce89971305dd6fdee732ad2c5e9a3dc6b66de69a9278c5f831da6e8bc3058"
dependencies:
  parent: docs/plans/PLAN-L6-55-plan-entry-routing.md
  references:
    - docs/plans/PLAN-L6-55-plan-entry-routing.md
    - docs/plans/PLAN-L7-347-plan-descent-gate-impl.md
    - docs/plans/PLAN-L7-322-harness-quality-tooling-backlog.md
---

# PLAN-L7-352 (impl): plan-entry routing gate 実装

## 起点 signal

- `po_directive:2026-07-06 「Issue 起点が欠落」「駆動モデルが正しく選ばれないのがそもそも穴」`
- 実証: `helix task classify --text "テストと doctor が遅いので性能改善したい"` → kind=unknown。

## 0. 目的

PLAN-L6-55 / `docs/design/harness/L6-function-design/plan-entry-routing.md` の設計どおり、
PLAN 起票時の (a) 起点宣言（`entry_signals`）必須化、(b) kind と signal の routing 整合検査、
(c) `task classify` の性能系語彙追加を実装する。実装様式は PLAN-L7-347（plan-descent gate、
同型の grandfather baseline + ratchet + plan lint / doctor 二重配線）に合わせる。

## 1. スコープ（Sonnet 実装手順）

### Step 1: schema — `route_mode` / `entry_signals` frontmatter 追加

1. `src/schema/frontmatter.ts` に `entry_signals: z.array(z.string().min(1)).optional()` と
   `route_mode: z.string().min(1).optional()` を追加
   （既存 PLAN は未宣言で valid のまま。必須化は lint 側の baseline ratchet が担う）。

### Step 1.5: 上流様式の移植（route certificate 基盤）

1. `src/schema/mode-catalog.ts` を新設し、上流 `workflowModeForPlan()` のフォールバック連鎖
   （`PLAN-M-*` → verification / `route_mode` 宣言 / `PLAN-DISCOVERY-*` 等 prefix / kind）を
   modes README §2 台帳と 1:1 で実装する（`unmappedModeCatalogDocs()` の doc 取りこぼし検出含む）。
   同ファイルに `MODE_ALLOWED_KINDS`（mode → 許容 kind 集合、README §2 台帳の machine 写し・
   SSoT）を export する。mode→kind 表はこの 1 箇所のみ（二重表禁止）。
2. `src/schema/route-map.ts` を新設し、`ROUTE_SIGNAL_MAP`（signal token → mode/command/
   preflight/requiresApproval）を README §4 表から機械化する。既存
   `routeSignalToMode`（`src/workflow/routing-contracts.ts`）はこの表を参照する形へ寄せる
   （挙動互換を既存テストで fence）。refactor エントリの token 集合には
   `refactor_candidate` を追加する（実在 feedback category `refactor_candidate:*` が
   no-route にならないようにする。U-PROUTE-004 の前提。L6 設計 §2）。

### Step 2: lint 本体（src/lint/plan-entry-routing.ts 新設）

L6 設計 §2 の contract どおり。`src/lint/plan-descent.ts` の構造（loader / baseline / analyze /
messages の 4 分割、violation reason 列挙、grandfather 分類）を踏襲する。

1. 検査対象スコープ = 全 kind。除外 = `PLAN-DISCOVERY-*` / `PLAN-M-*` prefix と
   `status: archived`（L6 設計 §2、oracle U-PROUTE-012）。
2. reason enum `PlanEntryRoutingReason` は 5 種: `entry_signal_absent` /
   `entry_signal_unresolvable` / `kind_signal_mismatch` / `route_mode_absent` /
   `kind_route_mode_mismatch`（1 oracle = 1 reason）。
3. **signal 種別の確定**（L6 設計 §2 のアルゴリズム）: `po_directive:` prefix は検査対象外種別。
   それ以外は値を id として DB / queue に照合し、hit した row の category / signal フィールド値を
   signal token とする（`refactor_candidate:*` は row 由来の token であり frontmatter 第 4 形式ではない）。
4. **kind 整合**: signal token → `routeSignalToMode`（`src/workflow/routing-contracts.ts`）で mode を
   導出 → `MODE_ALLOWED_KINDS`（Step 1.5 の mode-catalog）で許容 kind 集合と照合し
   `kind_signal_mismatch` を判定。`route_mode` 宣言も同じ `MODE_ALLOWED_KINDS` 照合で
   `kind_route_mode_mismatch` を判定する。
feedback source_id の実在検査は `.helix/harness.db` read-only 参照
（doctor の prebuilt projection と plan lint 単体で共通の read-only loader を使う）。
**DB 不在・読取不能時は unverifiable state として `entry_signal_unresolvable` を出す
（fail-close、guard 規則「unverifiable state は fail closed」と L6 設計 §2 に従う）**。
検証不能で誤 block になる場合の正規経路は `bun run src/cli.ts db rebuild` での DB 再生成。

### Step 3: baseline 機械生成 + 配線

1. 空 baseline で全 PLAN を検査し、違反 plan_id を
   `docs/governance/plan-entry-routing-baseline.json` へ機械生成（手書き禁止。生成フラグは
   plan-descent の前例に揃え `plan lint --gate entry-routing --write-baseline` 系の一貫命名）。
2. `lintPlanGate` の既定合成へ `entry-routing` を追加（`--gate entry-routing` 単独可）。
3. doctor に `plan-entry-routing` gate（hard / fail-close、`plan-descent` gate の配線位置に倣う）。

### Step 4: classify の性能系語彙追加（src/task/classify.ts）

「遅い / 性能 / パフォーマンス / latency / slow / 高速化」語彙 → kind=refactor
（signal=debt_degradation）候補を追加。既存分類の優先順位は変更しない（追加のみ）。

### Step 5: テスト（tests/plan-entry-routing.test.ts）

L6 設計 §4 の U-PROUTE-001..012 を 1:1 実装（fixture は tests/plan-descent.test.ts の
tmp-repo パターンに合わせる。DB 依存の U-PROUTE-003 は tmp sqlite fixture を用意）。

## 2. 対象外

- 既存 PLAN への entry_signals 遡及付与（baseline 減少は後続の段階是正）。
- GitHub Issue の実作成（issue queue は dry-run のまま。外部作成は既存承認フロー）。
- mode routing 表自体の改訂。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): Step 1（schema）→ Step 2（lint 本体）→ Step 3（baseline + 配線）。
- step 2 (mode: parallel): Step 4（classify）と Step 5（テスト）。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun run vitest run tests/plan-entry-routing.test.ts` green（U-PROUTE-001..012）。
- `bun run typecheck` green、`bun run src/cli.ts plan lint` green（baseline 生成後、新規違反 0）。
- `bun run src/cli.ts doctor` に `plan-entry-routing` gate が現れ green。
- `bun run src/cli.ts task classify --text "テストと doctor が遅いので性能改善したい"` が
  kind=refactor を返す（unknown でない）。

## 5. carry（持ち越し）

- baseline の段階削減（既存 PLAN への entry_signals 後付け）。
- drive の整合検査（kind に続く第 2 段。classify の drive confidence 向上後）。
