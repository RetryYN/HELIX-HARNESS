---
plan_id: PLAN-L7-279-review-bundle-and-version-target-gates
title: "PLAN-L7-279: review-bundle bridge と version-up target drift gate"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion claim 前の gate 強化。D-API/D-DB、実 rename、approval 記録、外部 activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: tests/doc-consistency.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - review-bundle / setup version target gate 設計"
  - role: qa
    slot_label: "QA - doc-consistency / doctor bridge 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-279-review-bundle-and-version-target-gates.md
    artifact_type: markdown_doc
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/doc-consistency.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/doc-consistency.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/plans/PLAN-L7-278-completion-review-bundle.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T20:19:14+09:00"
    tests_green_at: "2026-07-03T20:19:14+09:00"
    verdict: approve
    scope: "completion review-bundle を dedicated packet bridge まで hard gate 化し、setup first-run の version-up dry-run target が Pack 最新 tag / release remote から drift した場合に doc-consistency と doctor で fail-close する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/doc-consistency.test.ts tests/doctor.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T20:19:14+09:00"
        evidence_path: tests/doc-consistency.test.ts
        output_digest: "sha256:050b745e5135455d6ba63684fc241957f859e8a03bfecdad2225f57c99b55bc0"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:19:14+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:f3c45932e34ff72b80f3cfdcd69ac2633b21cd9e0e364e8cac63d587ba28e7de"
---

## 目的

G-10 の人間判断待ちを越えずに、完了判断前のレビュー材料と HELIX project setup の version-up 証跡を強化する。

- `completion review-bundle` が decision packet の summary 整合だけで止まらず、S4 / version-up / rename / action-binding の dedicated packet bridge まで live 検査する。
- setup first-run の `version-up dry-run` は配布 target tag `v0.1.4` と配布 release remote を同時に指す。古い target や remote 欠落が L3/L6/test-design/source/template/doctor surface に戻った場合は `doc-consistency` で fail-close する。

## 実装メモ

- `checkCompletionReviewBundle` は `completionDedicatedPacketBridgeViolations` を呼び、review-bundle が古い dedicated packet 導線を隠せないようにした。
- `doc-consistency` は `helixSetupVersionUpTargetMissing[]` を返し、doctor の hard gate 判定へ接続した。
- `src/setup/index.ts` の `CONSUMER_VERSION_UP_DRY_RUN_COMMAND` は `HELIX_DISTRIBUTION_REFERENCE.targetTag` から組み立てる。
- L6 設計と L7 テスト設計の短縮 command を配布 `--release-remote` 付きに揃えた。

## DoD

- [x] review-bundle doctor bridge が current live packet で green。
- [x] review-bundle doctor bridge が stale / unscoped dedicated packet を検出。
- [x] setup version-up dry-run target drift が doc-consistency で検出。
- [x] `npm test tests/doc-consistency.test.ts tests/doctor.test.ts --timeout 300000` が green。
- [x] `npm run typecheck` が green。
