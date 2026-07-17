---
plan_id: PLAN-L7-454-plan-parent-existence-gate-coverage
title: "PLAN-L7-454 (troubleshoot): PLAN dependencies.parent 実在チェックの kind 網羅性拡張"
kind: troubleshoot
layer: L7
drive: be
status: draft
route_mode: incident
entry_signals: ["po_directive:2026-07-14 /goal 全システム監査 (3回独立調査 + Codex worker gpt-5.6-terra 検証で確定)"]
created: 2026-07-14
updated: 2026-07-14
backprop_decision: not_required
backprop_decision_reason: "既存 PLAN lint (`src/plan/lint.ts`) の parent existence gate の適用範囲を要件どおりに拡張するものであり、要件文書の意味自体は変更しない。"
owner: TL (Codex/Claude)
parent_design: docs/governance/helix-harness-requirements_v1.2.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — dependencies.parent 実在チェックを kind 非限定 (plan_id 形式全般) へ拡張"
  - role: qa
    slot_label: "QA — 674 PLAN 全数での回帰確認 + 欠落 parent の fail-close 回帰テスト"
generates:
  - artifact_path: docs/plans/PLAN-L7-454-plan-parent-existence-gate-coverage.md
    artifact_type: markdown_doc
  - artifact_path: src/plan/lint.ts
    artifact_type: source_module
  - artifact_path: tests/ddd-tdd-rules.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-454 (troubleshoot): PLAN dependencies.parent 実在チェックの kind 網羅性拡張

## 0. 背景 (PO `/goal` 全システム監査で発見)

PO 指示「全システム監査して不足があれば起票すること。3回調べてTeraで検証すること」に基づく監査で、
独立 subagent 監査 (3回目、ガバナンス整合性レンズ) が発見し、Codex worker (gpt-5.6-terra) が
adversarial 検証で確認済み (real gap) と判定した defect。

`src/plan/lint.ts:744-760` の `dependencies.parent` 実在チェック (`parent_missing` violation) は
`kind === "add-design" || kind === "add-impl"` の条件下でのみ実行されている。`kind=design` /
`kind=impl` / `kind=troubleshoot` / `kind=refactor` 等、他の kind の PLAN が `dependencies.parent` に
plan_id 形式の参照 (path 形式ではなく `PLAN-Lx-NN-...` 形式) を書いても、この条件外のため存在検証の対象に
ならない。

`docs/governance/helix-harness-requirements_v1.2.md:396` は kind を限定せず「parent が指定されている場合は
リポジトリ内に実在しなければならない」という主旨の要件を定めており、実装の `add-design`/`add-impl` 限定は
この要件と不整合である。

Terra 検証で、存在しない `parent: PLAN-L4-404-does-not-exist` を持つ `kind: design` の最小 PLAN を
in-memory で lint し、`ok: true` (violation なし) となることを実測確認済み。

現状 (2026-07-14 時点) 674 PLAN 全数をサンプリング検証した結果、`dependencies.parent` に plan_id 形式の
参照を持つ既存 PLAN はいずれも実在する parent を指しており、顕在化した違反は 0 件。ただし将来 PLAN の
rename・削除が起きた場合にこの blind spot は検出されず、fail-close の網羅性に穴がある。

## 1. 実装範囲 (Scope)

- `src/plan/lint.ts` の `parent_missing` violation チェックを、`kind === "add-design" || kind === "add-impl"`
  限定から、`dependencies.parent` が plan_id 形式 (path 形式 `docs/...` ではない) を持つ全 kind へ拡張する。
- path 形式の `parent` (`docs/design/...`、`docs/plans/...` 等の既存ファイルパス参照) は現行どおり別の
  存在チェック経路 (もしあれば) を維持する。plan_id 形式のみを対象にした拡張であることを明確にする。
- 674 PLAN 全数で新チェックを走らせ、regression が出ないことを確認する (現状 0 件のため regression は
  想定されないが、念のため全数確認する)。

## 2. 受入条件 (Acceptance Criteria)

- [ ] `kind` を問わず、`dependencies.parent` が plan_id 形式で実在しない場合に `parent_missing` violation
      が発生することを確認する回帰テストを追加 (`kind: design`/`kind: impl` 等、add-* 以外のケースを含む)。
- [ ] 既存 674 PLAN 全数で `helix plan lint` が引き続き green であることを確認する (新規違反が出ないこと)。
- [ ] `docs/governance/helix-harness-requirements_v1.2.md:396` の要件文言と実装が整合することを確認する
      (必要なら要件文言側も明確化する)。
- [ ] `bun run typecheck` / 該当 vitest green。

## 3. 範囲外 (Out of scope)

- path 形式 parent 参照の存在チェックロジック自体の変更 (現状維持)。
- `plan-supersession` (別 gate、双方向 back-reference) への影響なし。

## 4. 追跡 (Trace)

- 起点: PO `/goal` 全システム監査 (2026-07-14)。3パス独立調査 (governance整合性レンズ) + Codex worker
  (gpt-5.6-terra) adversarial 検証で確定。
- 実装: `src/plan/lint.ts:744-760`。
- 要件: `docs/governance/helix-harness-requirements_v1.2.md:396`。

## 5. 用語更新

用語更新なし。
