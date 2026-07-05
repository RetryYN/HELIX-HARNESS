---
plan_id: PLAN-L7-202-run-debug-runtime-verification
title: "PLAN-L7-202 (add-impl): L7.5 RUN & Debug runtime verification gate"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - RUN & Debug verification contract"
  - role: se
    slot_label: "SE - runtime evidence classifier and log event helpers"
  - role: qa
    slot_label: "QA - projection-only rejection and completeness oracles"
generates:
  - artifact_path: docs/plans/PLAN-L7-202-run-debug-runtime-verification.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/run-debug.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/run-debug.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L6-01-function-spec.md
    - docs/plans/PLAN-REVERSE-202-run-debug-runtime-verification.md
    - docs/plans/PLAN-L7-43-implementation-verification-group.md
    - docs/plans/PLAN-L7-157-distribution-clean-pull.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  references:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/test-design/helix/L6-pillar-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:15:00+09:00"
    tests_green_at: "2026-06-30T02:15:00+09:00"
    verdict: approve
    scope: "L7.5 RUN & Debug is now an explicit runtime-verification gate: projection-only rows cannot close runtime claims, runtime claims require session/source/surface/timestamp/evidence provenance, and log events reject secret-like values."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/run-debug.test.ts tests/impl-plan-trace.test.ts tests/vmodel-pair.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: tests/run-debug.test.ts
        output_digest: "sha256:192bd5a2bed49493d64134d64343d9f1a243fee8aa8a3933ab5b67aeeeda3ebc"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: src/runtime/run-debug.ts
        output_digest: "sha256:217764259a121913527a17c247616a3c50c4cf32bea4a3b4367dbd46a20db145"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:0ac405fdb8ca550ec1b235325c300564ae50b38a8cdc6929e4d225aab862feb2"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:15:00+09:00"
        evidence_path: tests/run-debug.test.ts
        output_digest: "sha256:192bd5a2bed49493d64134d64343d9f1a243fee8aa8a3933ab5b67aeeeda3ebc"
---

# PLAN-L7-202: L7.5 実行・デバッグ runtime 検証ゲート

## 目的

静的な実装テストと runtime acceptance の間に欠けていた L7.5 境界を追加する。
現状の harness は runtime-adjacent な多くの機能について DB projection と unit-test coverage を持つが、
projection row は hook が `fired` したこと、provider が実行されたこと、または debug recovery が実際に
起きたことの証明ではない。この PLAN はその区別を明示する。

## 設計契約

runtime-behavior claim は、実 runtime surface 上で何かが `fired` した、`used` された、`works` した、
`blocked` された、`recovered` された、`observed` された、または `executed` されたという主張である。
これらの主張は、次の全項目が存在する場合にのみ close できる:

- non-empty `session_id`
- runtime `source` such as `runtime-hook`, `adapter-command`, `run-debug`, or `hosted-preflight`
- runtime surface such as `claude-hook`, `codex-hook`, `adapter-cli`, `team-runner`, `handover`, or `hosted-api-preflight`
- timestamp
- concrete evidence path

projection-only data は indexing、dashboard、trace support には有用なままだが、
`projection_only_unverified` と分類され、runtime acceptance を close できない。
runtime provenance の欠落は blocked verification state であり、暗黙の pass ではない。

## Scope

- runtime evidence の分類、RUN & Debug の責務計算、projection-only の拒否、
  runtime verification log event の作成、log completeness validation の L6 function contract を追加する。
- 完全な runtime verification event を `.helix/evidence/run-debug/runtime-verification.jsonl` へ
  append する CLI evidence producer (`helix run-debug log`) を追加する。
- Add L7 unit oracles `U-RUNDEBUG-001..006`.
- contract を `src/runtime/run-debug.ts` に実装する。
- projection-only の拒否、pure helper の適用除外、secret-like value の拒否、
  completeness validation、append-only evidence write に焦点を当てた unit test を追加する。

## 非目標

- この PLAN は外部 Claude/Codex provider CLI を起動しない。`run-debug log` は、すでに観測済みの
  runtime/debug action が生成した evidence を記録する。
- この PLAN は `helix` や `.helix` を rename しない。mechanical identifier migration は引き続き
  `PLAN-M-02-helix-identifier-rename` の責務である。
- この PLAN は database schema を変更しない。log event type は append-only evidence producer と
  将来の DB projection のための implementation contract である。

## 受入条件

- `src/runtime/run-debug.ts` がこの PLAN へ trace され、impl-plan orphan がない。
- projection-only evidence は runtime behavior acceptance を close できない。
- runtime claim には runtime provenance と evidence が必要である。
- unit-only helper が L7.5 RUN & Debug を skip できるのは、reason と substitute oracle が記録されている場合だけである。
- runtime verification log event は storage 前に secret-like value を reject する。
- `helix run-debug log` は完全な runtime verification event を append し、projection-only または不完全な
  runtime acceptance claim を write 前に拒否する。
- この PLAN の追加後に lint、typecheck、doctor、full test suite が pass する。
