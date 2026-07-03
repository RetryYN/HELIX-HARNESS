---
plan_id: PLAN-L7-257-cutover-blast-radius-source-ledger
title: "PLAN-L7-257: cutover blast radius と concurrency source ledger 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "L14 identifier rename cutover の承認前 packet / source ledger / snapshot 束縛の強化。不可逆 rename apply、state move、承認記録は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - cutover blast radius hardening"
generates:
  - artifact_path: docs/plans/PLAN-L7-257-cutover-blast-radius-source-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/cutover-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/process/forward/L08-L14-verification-phase.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/cutover-readiness.ts
    - src/lint/identifier-rename.ts
    - tests/cutover-readiness.test.ts
    - tests/identifier-rename.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T13:41:04+09:00"
    tests_green_at: "2026-07-03T13:41:04+09:00"
    verdict: approve
    scope: "L14 identifier rename cutover packet について、path-only .ut-tdd runtime state hit を blast radius / snapshot に束ね、GitHub Actions concurrency source ledger row を current canonical official URL に固定した。不可逆 rename apply、state move、approval は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:41:04+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:5a47bcbd280d0aa1ade27fb87f4137886ed83b58b215c1c70e48d44b2401db27"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T13:41:04+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:756eb8c24c460336998eb174e25ac67ed2947e47f356ababf87a41553e26e342"
---

# PLAN-L7-257: cutover blast radius と concurrency source ledger 強化

## 目的

PLAN-M-02 の identifier rename cutover は不可逆な `.ut-tdd` から HELIX への名称変更を扱うため、
承認前 packet は runtime state の追加や source ledger の更新で必ず snapshot を変えなければならない。

既存の blast radius audit は本文中の token を数えていたが、`.ut-tdd/state/...` のように path だけが
旧識別子を含む runtime state を追加した場合、本文に token がないと `blastRadiusDigest` と
`cutoverSnapshot.snapshotId` が変わらない余地があった。これは承認済み snapshot の再利用を許すため、
L14 cutover の安全境界として不十分である。

また GitHub Actions concurrency の公式 URL は current canonical page を source ledger に固定し、
旧 how-to URL へ戻る退行を validator と test で検出する。

## 変更

- `auditIdentifierRenameBlastRadius` が file path 中の `ut-tdd` / `.ut-tdd` / `area=harness` も hit として数える。
- path-only `.ut-tdd/**` runtime state 追加で `cutoverCategoryChecklist`、`blastRadiusDigest`、
  `cutoverSnapshot.snapshotId` が変わる regression test を追加する。
- Cutover source ledger の GitHub Actions concurrency row を current canonical official URL へ更新する。
- `cutover-readiness` の expected source ledger binding と fixture test を同じ canonical URL に揃える。
- L6 function spec と L7 test design に、path-only blast radius と canonical concurrency URL の契約を追記する。

## 境界

- `rename apply`、state move、`.ut-tdd` 実 state の HELIX rename は実行しない。
- action-binding approval / cutover decision record は作成しない。
- 本番環境、外部 API、secret、PII、ライセンス判断には触れない。
- 残 frontier の PO/S4 判断、version-up activation 判断、不可逆 rename/cutover signoff は人間判断のまま残す。

## 完了条件

- path-only `.ut-tdd/**` hit が blast radius と snapshot に反映される。
- GitHub Actions concurrency row が current canonical official URL で検査される。
- targeted tests、typecheck、plan lint、doctor が green。
