---
plan_id: PLAN-L7-272-cutover-readiness-ledger-parity
title: "PLAN-L7-272: cutover readiness ledger parity"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-271 の Cutover source ledger 期待値を cutover-readiness gate へ同期する additive change。"
owner: TL (Codex)
parent_design: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: tests/cutover-readiness.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "QA - Euler cutover ledger parity audit"
  - role: tl
    slot_label: "TL - cutover readiness parity implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-272-cutover-readiness-ledger-parity.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/cutover-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/cutover-source-ledger.ts
    artifact_type: source_module
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/test-design/harness/L7-unit-test-design.md
  requires:
    - src/lint/cutover-readiness.ts
    - src/lint/cutover-source-ledger.ts
    - tests/cutover-readiness.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T15:59:00+09:00"
    tests_green_at: "2026-07-03T15:59:00+09:00"
    verdict: approve
    scope: "Cutover source ledger の必須 row と expected URL / required field impact を cutover-readiness gate へ同期する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/cutover-readiness.test.ts tests/identifier-rename.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T15:59:00+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:fdc1acf48c6566d59c742f7f09da87cc2bae8eb0a5f5e758449963dda80e79c8"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T15:59:00+09:00"
        evidence_path: src/lint/cutover-source-ledger.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts tests/oracle-test-trace.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T15:59:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:28b6803140e428990607f745810ec982f2b171f739b30f8d13706de0392a17b7"
---

# PLAN-L7-272: cutover readiness ledger の parity

## 目的

PLAN-L7-271 で `rename plan` 側の Cutover source ledger は 10 row に強化されたが、`cutover-readiness`
gate 側は旧 7 row の必須期待に残っていた。これでは L14 cutover の承認前 evidence を確認する surface 間で
source ledger の意味がズレる。

この PLAN は、`cutover-readiness` gate でも Google SRE canarying、Microsoft safe deployment、Microsoft
testing strategy を必須 row として扱い、expected URL と required field impact の drift を fail-close する。

## 変更

- `src/lint/cutover-readiness.ts` の必須 Cutover source ledger row を 10 row に揃える。
- 同 gate の expected URL / required field impact に Google SRE canarying と Microsoft source を追加する。
- `tests/cutover-readiness.test.ts` の fixture と drift test を同じ 10 row へ更新する。

## 境界

- `.helix -> .helix` の実 cutover / state move / alias enablement は実行しない。
- `cutover-readiness` は承認前 evidence gate であり、PO/action-binding approval の代替判断をしない。

## 完了条件

- `cutover-readiness` が新 3 source の欠落を missing row として返す。
- 新 3 source の expected URL / required field impact drift を violation として返す。
- targeted cutover-readiness test、typecheck、design-language、plan governance、doctor が green。
