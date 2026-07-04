---
plan_id: PLAN-L7-313-g9-g10-workflow-gate
title: "PLAN-L7-313 (impl): G9 system-workflow / G10 UX-workflow gate 機械化 — right-arm-gate-planning が追跡する自己 carry を閉じる"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "G9/G10 の右腕 child gate を実装し、L9/L10 master と gates/process docs へ同時 backfill しただけで、上流 L0-L6 requirement は変更していないため。"
owner: Claude (Opus) / Codex
parent_design: docs/process/gates.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — g9-system-workflow.ts / g10-ux-workflow.ts + 共有 gN-evidence-manifest helper を実装し lint-wiring/doctor へ配線"
  - role: tl
    slot_label: "TL — ST-*/UXV-* family を LOCAL の L9 test-design / L10 visual-design へ接地、verification-profile 経由配線、G8 との一貫性レビュー"
  - role: qa
    slot_label: "QA — evidence manifest schema の fail-close 回帰 (mandatory 未 pass / stale defer / digest 欠落)"
generates:
  - artifact_path: docs/plans/PLAN-L7-313-g9-g10-workflow-gate.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/gn-evidence-manifest.ts
    artifact_type: source_module
  - artifact_path: src/lint/g9-system-workflow.ts
    artifact_type: source_module
  - artifact_path: src/lint/g10-ux-workflow.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/g9-system-workflow.test.ts
    artifact_type: test_code
  - artifact_path: tests/g10-ux-workflow.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
  - artifact_path: .ut-tdd/evidence/g9-system/20260705-selected-system-evidence.json
    artifact_type: json_config
  - artifact_path: .ut-tdd/evidence/g10-ux/20260705-selected-ux-evidence.json
    artifact_type: json_config
  - artifact_path: docs/design/harness/L9-system/system-evidence-boundary.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L10-ux/visual-design.md
    artifact_type: design_doc
  - artifact_path: docs/plans/PLAN-L9-00-system-verification-master.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L10-00-ux-verification-master.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    - docs/plans/PLAN-L9-00-system-verification-master.md
    - docs/plans/PLAN-L10-00-ux-verification-master.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T04:20:00+09:00"
    tests_green_at: "2026-07-05T04:20:00+09:00"
    verdict: approve
    scope: "G9/G10 selected workflow gate を実装し、manifest schema、mandatory coverage、stale defer、G10 advisor evidence、doctor/lint-wiring 接続を確認した。G10 PO signoff、全面 real render、accessibility closure、PLAN-M-02 rename cutover は別 blocker として残す。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/g9-system-workflow.test.ts tests/g10-ux-workflow.test.ts tests/lint-wiring.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T04:20:00+09:00"
        evidence_path: tests/lint-wiring.test.ts
        output_digest: "sha256:0b63719f0973df03a5333a8c348dd1cf63d61ab7ce465eb61345b0f45cb878a2"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T04:20:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T04:20:00+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:c56b8e2304b8173d8a61075c5488a2531eb45327b15d1fed82ee8f62736c068c"
      - kind: lint
        command: "./scripts/ut-tdd plan lint docs/plans/PLAN-L7-313-g9-g10-workflow-gate.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T04:20:00+09:00"
        evidence_path: .ut-tdd/evidence/g9-system/20260705-selected-system-evidence.json
        output_digest: "sha256:0c04c80832cf8f124f3cd7f562de3df829e2d27055ce9a164e4952f92d9e8b18"
      - kind: doctor
        command: "./scripts/ut-tdd doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T04:20:00+09:00"
        evidence_path: docs/process/gates.md
        output_digest: "sha256:8b822330d3142798c57f05e7192cf5d90e1c5685c1af8638e3ceccd3d5c91281"
---

# PLAN-L7-313 (impl): G9 / G10 workflow gate 機械化

## Objective

`docs/process/gates.md` §1 が「G9-G14 は evidence profile 定義済・子 PLAN 実装待ち」と明記し、
`src/lint/right-arm-gate-planning.ts` + IMP-052 が fail-close 追跡している自己 carry のうち、
G9（総合テスト品質）と G10（UX 磨き品質）の executable evidence gate を、上流実装を参考に
HELIX 式で機械化する。G8（`g8-integration-workflow.ts`）と同じ profile-driven 配線に揃える。

## スコープ

### IN
- `src/lint/g9-system-workflow.ts`: L9 test-design の必須 marker + ST-* rows（LOCAL family へ接地）+
  `.ut-tdd/evidence/g9-system/*.json` manifest（digest / in-repo evidence path / mandatory 被覆 / stale defer 0 / exit_criteria）を検証。
- `src/lint/g10-ux-workflow.ts`: L10 visual-design の marker + UXV-* rows + `.ut-tdd/evidence/g10-ux/*.json` を同型検証。
- G9/G10 は ~90% ロジック共通のため **共有 helper `gN-evidence-manifest.ts`** を切り出して重複排除。
- `verification-profile.ts` / `verification-profile-catalog.ts` 経由で profile-driven 選択、`lint-wiring.ts` / `doctor/index.ts` へ配線。
- G10 の UXV 判断 item は `advisor-fable` evidence record と紐付け（traceability）。

### OUT
- 上流の ST-*/UXV-* family 語彙を verbatim 流用しない（LOCAL 現行 test-design/visual-design へ再導出）。
- G11-G14 の機械化は本 PLAN 対象外（別 child PLAN）。

## 受入条件
- G9/G10 lint が marker 欠落 / mandatory 未 pass / stale defer / digest 欠落 / evidence path 不在を fail-close。
- `PLAN-L9-00` / `PLAN-L10-00` master を延長（重複 PLAN を作らない）、`right-arm-gate-planning` の carry を減らす。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: LOCAL の L9 test-design / L10 visual-design の現行 ST-*/UXV-* 分類を確認し family 語彙を接地（TL）→ done。
- Step 2: 共有 `gN-evidence-manifest.ts` helper を実装（Red→Green）→ done。
- Step 3: `g9-system-workflow.ts` を実装・配線・test → done。
- Step 4: `g10-ux-workflow.ts` を実装・配線・test（advisor-fable evidence 紐付け含む）→ done。
- Step 5: master PLAN 延長 + gates.md 注記更新 → review → confirmed。

## 壊さない / 再発させない
- G8 の profile 配線と一貫させ、独自 flat model を持ち込まない。
- IMP-052 を carry へ戻さない（implemented を維持しつつ子 gate を close）。

## レビュー / 次工程
- 実装は Codex intra-runtime review で確認した。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier1-#2/#3。

## レビュー証跡

- レビュー担当: Codex intra-runtime review
- 判定: pass
- 確認日: 2026-07-05
- notes: G9/G10 は selected evidence gate であり、G10 PO signoff、全面 real render、accessibility closure は別 blocker として残す。

### Green command 証跡

| コマンド | 種別 | exit | evidence | output_digest |
|---|---:|---:|---|---|
| `bun test tests/g9-system-workflow.test.ts tests/g10-ux-workflow.test.ts tests/lint-wiring.test.ts --timeout 180000` | test | 0 | `tests/lint-wiring.test.ts` | `sha256:0b63719f0973df03a5333a8c348dd1cf63d61ab7ce465eb61345b0f45cb878a2` |
| `bun test tests/design-language.test.ts --timeout 180000` | test | 0 | `tests/design-language.test.ts` | `sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322` |
| `bun run typecheck` | typecheck | 0 | `src/doctor/index.ts` | `sha256:c56b8e2304b8173d8a61075c5488a2531eb45327b15d1fed82ee8f62736c068c` |
| `./scripts/ut-tdd plan lint docs/plans/PLAN-L7-313-g9-g10-workflow-gate.md` | lint | 0 | `.ut-tdd/evidence/g9-system/20260705-selected-system-evidence.json` | `sha256:0c04c80832cf8f124f3cd7f562de3df829e2d27055ce9a164e4952f92d9e8b18` |
| `./scripts/ut-tdd doctor` | doctor | 0 | `docs/process/gates.md` | `sha256:8b822330d3142798c57f05e7192cf5d90e1c5685c1af8638e3ceccd3d5c91281` |

## 着地結果

- `gn-evidence-manifest` helper で G9/G10 共通 manifest schema、digest、repo 内 path、mandatory coverage、stale defer、exit criteria を fail-close 化した。
- `g9-system-workflow` と `g10-ux-workflow` を `doctor` と `lint-wiring` に接続し、manifest 不在、marker 欠落、mandatory 未 pass、G10 advisor evidence 欠落を検出する。
- L9/L10 master と L08-L14/gates docs を更新し、G9/G10 は executable gate、G11-G14 は child PLAN 待ちとして境界を分けた。
