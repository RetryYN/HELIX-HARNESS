---
plan_id: PLAN-L7-330-l1-l2-consistency-lint
title: "PLAN-L7-330 (impl): L1↔L2 consistency lint — 画面⇔要求の双方向被覆を fail-close で機械判定する"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-05
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "PLAN-DISCOVERY-11 (S4 confirmed) の forward_route で確定済みの enforcement 降下であり、新規 product requirement や上位設計の意味変更を追加しない。設計判断（A-40 接続 / IMP-039 self-pair 充足 / screen-impl-pair-freeze との別ロジック境界）は親 PLAN の s4_decision_record で確定済み。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - L1↔L2 双方向被覆 lint の設計整合（DISCOVERY-11 契約との一致）と doctor 配線"
  - role: qa
    slot_label: "QA - 双方向欠落 / dangling flow / mock ペア oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-330-l1-l2-consistency-lint.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/l1-l2-consistency.ts
    artifact_type: source_module
  - artifact_path: tests/l1-l2-consistency.test.ts
    artifact_type: test_code
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  requires:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    - docs/design/harness/L1-requirements/screen-requirements.md
  references:
    - docs/plans/PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback.md
    - src/lint/screen-impl-pair-freeze.ts
    - docs/design/harness/L2-screen/wireframe.md
review_evidence:
  - reviewer: TL self-review (Codex)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T00:00:00+09:00"
    tests_green_at: "2026-07-05T00:00:00+09:00"
    verdict: pass
    scope: "L1 screen-requirements と L2 screen-list/ui-element/screen-flow/wireframe の ID レベル双方向被覆を fail-close lint として実装し、IMP-039 self-pair と G2 Low-Fi 縮約を false-positive にしないことを確認した。"
    worker_model: claude
    reviewer_model: gpt-5
    green_commands:
      - kind: unit_test
        command: "bun test tests/l1-l2-consistency.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T00:00:00+09:00"
        evidence_path: tests/l1-l2-consistency.test.ts
        output_digest: "sha256:1ec4725febc4af1d669f635ca1b86953e9266bc520769b0ff868252fb9c210b8"
---

# PLAN-L7-330 (impl): L1↔L2 consistency lint — 双方向被覆の機械判定

## 目的

親設計 = [PLAN-DISCOVERY-11](PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md)（S4 confirmed、
`forward_route` が本降下を明示解禁）。同 PLAN §IN — enforcement の契約を L7 実装として着地する:

- **双方向被覆**: L1 `screen-requirements.md` の画面 ID ↔ L2 `screen-list.md` の画面 ID が一致
  （L1 にあって L2 に無い = mock 欠落、L2 にあって L1 に無い = dangling mock）。
- **L2 内被覆**: screen-list の全画面が `ui-element.md` §2 の固有コンポーネント行を持つ。
  wireframe は G2 PASS 済み設計が**意図的に主要画面のみ Low-Fi**（7 画面 + 共通レイアウト骨格）で
  凍結されているため、per-screen セクションを必須にしない（必須化は G2 設計への false-positive）。
- **dangling 検査**: `screen-flow.md` / `wireframe.md` / `ui-element.md` が参照する画面 ID は
  screen-list に実在する（存在しない画面の mock/遷移 = 宙に浮いた設計、fail-close）。
- **L2⟷L10 mock ペア**: `wireframe.md` frontmatter の `pair_artifact` が存在する。
  **IMP-039 self-pair（`pair_artifact: self`）は充足扱い**とし、G2 PASS 済 screen 設計へ
  false-positive を出さない（親 PLAN 契約）。
- `screen-impl-pair-freeze.ts` とは**別ロジック**（段階順序検査 vs 双方向被覆検査）。共有は
  純関数 + loader 分離という lint 共通様式のみで、実装は独立させる（誤共有しない）。

## ペア（pair artifact）と test evidence

- pair artifact = `tests/l1-l2-consistency.test.ts`（TDD red-first で先行作成、U-L1L2-001..005）。
- test evidence = 同テストの green 実行（`bun test tests/l1-l2-consistency.test.ts`）+
  live-repo oracle（現行 15 画面が green であること）。confirmed 昇格時に green_commands として記録する。

## スコープ

### IN
- `src/lint/l1-l2-consistency.ts`: 純関数 `analyzeL1L2Consistency(input)` + I/O loader
  `loadL1L2ConsistencyInput(repoRoot)`（lint 共通様式、architecture §3.2）。
- doctor 配線（`src/doctor/index.ts`、`lint-wiring` 死蔵 0 維持）。fail-close、baseline 0
  （現行 15 画面は ID 被覆 green を実測してから着地。万一 debt があれば grandfather を明示宣言）。
- L6 設計追補: `function-spec.md` へ「l1-l2-consistency lint 追補」節（関数契約表。単独 addendum ファイルは
  l6-completion の owning-plan 解決規約〔L6 doc は L6 PLAN 所有〕に合わせて廃し、既存 L6 正本へ統合）。
- `docs/test-design/harness/L7-unit-test-design.md` へ U-L1L2 oracle 追記。

### OUT / 非対象
- gap-check CLI / hook 結線（親 PLAN Step 4、別着地）。
- 観点表 8 項目の prose 内容検査（画面ごとの要求「内容」充足は人 + gap-check の領域。本 lint は
  ID レベルの構造被覆のみを機械判定する）。
- L10 側 doc の新設（wireframe self-pair の現行設計を変更しない）。

## 受入条件
- U-L1L2 unit tests green（欠落注入 fixture で fail-close、self-pair 充足、live repo green）。
- `helix doctor` green（lint-wiring 死蔵 0、coding-rules / module-boundary / ddd-tdd violation 0）。
- confirmed 前に review evidence + green_commands 記録（別 runtime 不可時は intra_runtime_subagent）。

## スケジュール
- mode: serial。Step 1: red テスト → Step 2: lint 実装 green → Step 3: doctor 配線 + L6/L7 設計追記
  （Codex in-flight の `src/doctor/index.ts` / `L7-unit-test-design.md` が commit された後に実施、
  foreign uncommitted への編集をしない）→ Step 4: 検証 → review → confirmed。

## 壊さない / 再発させない
- IMP-039 self-pair を孤児/欠落扱いしない（親 PLAN の false-positive 防止契約）。
- 既存 CI を赤にしない（着地時に live repo green を実測。debt があれば grandfather 明示）。
- Codex in-flight ファイルへ触れない（hybrid commit 協調規則、基準点 = HEAD）。
