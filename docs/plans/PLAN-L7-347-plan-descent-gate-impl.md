---
plan_id: PLAN-L7-347-plan-descent-gate-impl
title: "PLAN-L7-347 (impl): plan-descent gate 実装 — 実装 PLAN の設計親付けを helix plan lint / doctor で fail-close 強制"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-54 で設計した plan-descent gate の実装。既存 PLAN は grandfather baseline で遡及 fail させず、gate 意味の変更ではなく起票経路の欠落検査を追加するのみ。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/plan-descent-gate.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE (Sonnet) - plan-descent lint 実装と baseline 機械生成"
  - role: tl
    slot_label: "TL - ratchet 不変条件（遡及 fail なし・新規違反 0）のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-347-plan-descent-gate-impl.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/plan-descent.ts
    artifact_type: source_module
  - artifact_path: docs/governance/plan-descent-baseline.json
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/plan-descent.test.ts
    artifact_type: test_code
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T09:06:48+09:00"
    tests_green_at: "2026-07-06T09:06:48+09:00"
    verdict: approve
    worker_model: claude-fable
    reviewer_model: claude-sonnet-5
    scope: "plan-descent gate 実装の 5 軸レビュー。U-PDESC-001..010 の 1:1 実装 (12/12 green)、fail-close (新規違反 1 件で ok=false、grandfather ratchet 増加不可)、doctor / plan lint 既定合成の ok 合成、baseline 214 件 unique 昇順の機械生成を確認。Critical/Important 0 件、Minor (grandfathered 表示件数の unique 化) は反映済み。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/plan-descent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T09:06:48+09:00"
        evidence_path: tests/plan-descent.test.ts
        output_digest: "sha256:d9bf108f37996f1f69d8c5ef041ce1a6cbf0c0044af6f417b05f2777c3c1fd3a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T09:06:48+09:00"
        evidence_path: src/lint/plan-descent.ts
        output_digest: "sha256:2a492cc4599b27e801dc1227fb948243f1efa93868c7b3de64304762682b3258"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate descent"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T09:06:48+09:00"
        evidence_path: docs/governance/plan-descent-baseline.json
        output_digest: "sha256:61a7dc95e31d464819b798beacf4cc217a7bf9b8541dcccce3ac4f84d54d0b1f"
dependencies:
  parent: docs/plans/PLAN-L6-54-plan-descent-gate.md
  references:
    - docs/plans/PLAN-L6-54-plan-descent-gate.md
    - docs/plans/PLAN-L7-341-coding-debt-reduction-roadmap.md
---

# PLAN-L7-347 (impl): plan-descent gate 実装

## 0. 目的

PLAN-L6-54 / `docs/design/harness/L6-function-design/plan-descent-gate.md` の設計どおり、
kind=impl / add-impl の PLAN に「`docs/design/` 配下の実在設計 doc への parent_design」を
fail-close で要求する lint + doctor gate を実装する。既存違反は grandfather baseline に固定し、
ratchet（増加禁止・減少可）で段階是正する。

## 1. スコープ（Sonnet 実装手順）

### Step 1: lint 本体（src/lint/plan-descent.ts 新設）

L6 設計 §2 の contract に従い実装する:

1. `DESIGN_PARENT_PREFIX = "docs/design/"` + `L6_DESIGN_SEGMENT = "L6-"` +
   `TEST_DESIGN_PREFIX = "docs/test-design/"`、対象 kind = `impl` / `add-impl`
   （`PLAN-DISCOVERY-*` と kind=design/add-design/reverse/troubleshoot/poc/recovery/
   research/charter/refactor は対象外）。検査は parent_design（L6 設計 doc 実在）と
   pair_artifact（test-design 実在）の二重。
2. `loadPlanDescentBaseline(root?)`: `docs/governance/plan-descent-baseline.json` を読む
   （形式: `{ "recorded": "<ISO date>", "grandfathered": ["<plan_id>", ...] }`。無ければ空）。
3. `analyzePlanDescent(docs, baseline)`: 純関数。plan frontmatter の抽出は既存
   plan-governance lint（`src/plan/lint.ts`）の loader を再利用し、二重パーサを作らない。
   違反 reason は `parent_design_absent` / `parent_design_not_l6_design_doc` /
   `pair_artifact_not_test_design` / `parent_design_not_confirmed`（confirmed/completed の
   impl PLAN の親 L6 doc が status: confirmed でない）/ `generates_missing_test_code`
   （impl PLAN の generates に test_code が 1 件も無い）の 5 種。
   baseline 記載 plan_id は grandfathered に分類。`ok = 新規違反 0 && grandfathered ≤ baseline 件数`。
4. `planDescentMessages(result)`: OK / 違反出力（`plan-schedule` の message 形式に合わせる）。

### Step 2: baseline の機械生成

1. 一時的に空 baseline で `analyzePlanDescent` を全 PLAN に対し実行し、違反 plan_id 一覧を
   そのまま `docs/governance/plan-descent-baseline.json` に書き出す（手書き禁止）。
   生成コマンド例: `bun run src/cli.ts plan lint --descent-baseline-write`（CLI option の追加が
   大きい場合は scripts/ の one-shot ではなく `src/cli.ts plan lint` 内の隠し flag とし、
   実装方式は SE 判断で最小に）。
2. 生成後、`analyzePlanDescent` が `ok=true`（新規違反 0）になることを確認する。

### Step 3: 配線

1. `helix plan lint`（`src/cli.ts` の plan lint action）に plan-descent 検査を追加し、
   違反時 exit 非 0。
2. doctor に `plan-descent` gate（hard / fail-close）を追加し `runDoctor.ok` へ接続
   （`plan-schedule` gate の配線位置に倣う）。

### Step 4: テスト（tests/plan-descent.test.ts）

L6 設計 §4 の U-PDESC-001..010 を 1:1 実装する（fixture は tmp dir に PLAN frontmatter を
書いて loader に食わせる方式。既存 `tests/plan-lint.test.ts` の fixture パターンに合わせる）。

## 2. 対象外

- 既存違反 PLAN の遡及是正（baseline 減少は別 PLAN の段階是正で扱う）。
- parent_design の layer 整合（L7 impl の親は L5/L6 に限る等の層番号検査）— 初版は
  docs/design/ 配下であることのみ。層番号検査は運用実績後の ratchet 強化で。
- descent-obligation（trace key 駆動）本体の変更。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): Step 1（lint 本体）→ Step 2（baseline 生成）→ Step 3（配線）。
- step 2 (mode: serial): Step 4（テスト）と統合検証。

## 4. 受入条件（falsifiable / 検証コマンド）

- `bun run vitest run tests/plan-descent.test.ts` green（U-PDESC-001..010）。
- `bun run typecheck` green。
- `bun run src/cli.ts plan lint` green（baseline 生成後、全 PLAN で新規違反 0）。
- `bun run src/cli.ts doctor` に `plan-descent` gate が現れ green。
- 検証用ネガティブ確認: parent_design 無しの kind=impl PLAN を一時作成すると
  `plan lint` が fail することをテスト（U-PDESC-002）で担保。

## 5. carry（持ち越し）

- baseline の段階削減（grandfathered PLAN への設計 doc 後付け整備）。
- 層番号整合検査（L7 impl → L5/L6 親限定）への ratchet 強化。
