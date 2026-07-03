---
plan_id: PLAN-L7-299-drive-model-registration-and-review-bundle-alignment
title: "PLAN-L7-299: drive model registration and setup review-bundle alignment"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
owner: TL (Codex)
parent_design: docs/design/harness/L4-basic-design/function.md
pair_artifact: tests/drive-db-registration.test.ts
backprop_decision: not_required
backprop_decision_reason: "L4 の Forward spine + 10 駆動モデル契約と、既存 L6 setup completion review-bundle 契約に実装・テスト設計を合わせる修正。新しい外部 API、DB schema、認証、PII、secret、破壊的操作は追加しない。"
agent_slots:
  - role: tl
    slot_label: "TL - drive model registration closure"
  - role: qa
    slot_label: "QA - setup review-bundle contract alignment"
generates:
  - artifact_path: docs/plans/PLAN-L7-299-drive-model-registration-and-review-bundle-alignment.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/lint/drive-db-registration.ts
    artifact_type: source_module
  - artifact_path: tests/drive-db-registration.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
dependencies:
  parent: docs/design/harness/L4-basic-design/function.md
  requires:
    - docs/process/modes/README.md
    - docs/design/harness/L4-basic-design/function.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:59:59+09:00"
    tests_green_at: "2026-07-03T23:59:59+09:00"
    verdict: approve
    scope: "In-session subagent audit identified that drive-db-registration still enforced a 5-mode projection while L4 function.md defines Forward spine + 10 drive models. This PLAN closes that semantic gap and also aligns setup docs/test-design with completion review-bundle as a first-run verification command."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/drive-db-registration.test.ts tests/projection-writer.test.ts tests/setup.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: tests/drive-db-registration.test.ts
        output_digest: "sha256:4e3c91f3dbd591e2bd3bcba6dfbde18f33ec11c7c19b6316669948e609396698"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: docs/plans/PLAN-L7-299-drive-model-registration-and-review-bundle-alignment.md
        output_digest: "sha256:85afe75961f17879a3994fa2c5c93e5854c2ddbeba0e9b548f0dd96c947966ba"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild --json"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:383a3e4546d8ef984bf3adc418622c9d5aab2cea37f0196029fbcf574db038b3"
---

# PLAN-L7-299: drive model registration and setup review-bundle alignment

## 目的

L4 正本の「Forward spine + 10 駆動モデル」を `harness.db` の `drive_runs` projection と
`drive-db-registration` gate が意味どおり保証する。併せて、`ut-tdd setup project` の初回検証 command
一覧から `completion review-bundle` が落ちていた設計・テスト設計 drift を閉じる。

## 問題

- `drive-db-registration` は Discovery / Forward / Recovery / Reverse / Verification の5分類だけを必須にし、
  Scrum / Incident / Refactor / Retrofit / Add-feature / version-up / Research の欠落を検出できなかった。
- `projection-writer` は PLAN ID prefix を主根拠に mode を丸め、`kind`、`version_target`、mode 正本 doc
  への明示参照を `drive_runs.mode` に反映していなかった。
- setup の U-SETUP-017 は task 9本へ更新済みだったが、U-SETUP-013/015/019 と L6 HC-P6 prose に
  `completion review-bundle` を含まない古い baseline が残っていた。

## 受入条件

- `REQUIRED_DRIVE_MODELS` が L4 正本の10駆動モデルと一致する。
- `analyzeDriveDbRegistration` は10駆動モデルのどれかが欠けると `missing_required_mode` を返す。
- `rebuildHarnessDb` 後の `drive_runs` は10駆動モデルを含み、`version_target: future` PLAN を
  `version-up` として投影する。
- setup の design / test-design / setup test は `completion review-bundle` を first-run verification
  command として扱う。

## 検証

- `bun test tests/drive-db-registration.test.ts tests/projection-writer.test.ts tests/setup.test.ts --timeout 300000`
  は 78 pass、`sha256:4e3c91f3dbd591e2bd3bcba6dfbde18f33ec11c7c19b6316669948e609396698`。
- `bun run typecheck` は exit 0、`sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92`。
- `bun run src/cli.ts plan lint --gate governance` は exit 0、
  `sha256:85afe75961f17879a3994fa2c5c93e5854c2ddbeba0e9b548f0dd96c947966ba`。
- `bun run src/cli.ts db rebuild --json` は exit 0、
  `sha256:383a3e4546d8ef984bf3adc418622c9d5aab2cea37f0196029fbcf574db038b3`。
