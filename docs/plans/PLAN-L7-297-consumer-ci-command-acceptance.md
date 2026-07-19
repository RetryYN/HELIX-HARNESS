---
plan_id: PLAN-L7-297-consumer-ci-command-acceptance
title: "PLAN-L7-297: consumer CI command acceptance 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "HELIX project setup の生成 CI と distribution acceptance の意味ずれを閉じる限定修正。D-API/D-DB、認証/secret、外部 API apply、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/distribution-acceptance.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "explorer - distribution acceptance command coverage"
  - role: tl
    slot_label: "TL - consumer CI command acceptance 固定"
generates:
  - artifact_path: docs/plans/PLAN-L7-297-consumer-ci-command-acceptance.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/design/harness/L6-function-design/setup-solo-team.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:26:00+09:00"
    tests_green_at: "2026-07-03T23:26:00+09:00"
    verdict: approve
    scope: "setup が生成する harness-check.yml / consumerReadiness.ci.requires / CONSUMER_CI_RUN_COMMANDS の command set を distribution acceptance で exact 比較し、consumer repo 上で全件実行する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/setup.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:26:00+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:2591188a0e6c2d93ebb4cb05727d189acfcdf0eb737c4ad6508fe12780719526"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:26:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`harness-check.yml` は `CONSUMER_CI_RUN_COMMANDS` として `bun install --frozen-lockfile`、version-up dry-run、`npm run typecheck`、`npm test` まで要求していた。

一方で distribution acceptance は手書きの `npm run helix ...` サブセットだけを実行しており、生成 CI と受入検証が同じ command set だと証明できていなかった。

この PLAN では、生成 workflow の `run:`、`consumerReadiness.ci.requires`、`CONSUMER_CI_RUN_COMMANDS` を exact に揃え、consumer fixture 上で全 command を実行する。`code --profile HELIX .` は manual-local のまま自動実行しない。

## DoD

- [x] `buildConsumerReadinessPlan()` は `bun.lock` / `bun.lockb`、`scripts.typecheck`、`scripts.test` 欠落を blocking readiness check にする。
- [x] `distribution plan` は packageRoot の lockfile と package scripts を readiness に渡す。
- [x] distribution acceptance は generated workflow の `run:` を `CONSUMER_CI_RUN_COMMANDS` と exact 比較する。
- [x] distribution acceptance は `bun install --frozen-lockfile`、version-up dry-run、`npm run typecheck`、`npm test` を含む全 command を consumer repo 上で実行する。
- [x] `postSetupWorkflow.verificationCommands` / `manualVerificationCommands` / `dryRunVerificationCommands` / `postApplyVerificationCommands` を exact 検証する。
- [x] 外部 network に依存しないよう、version-up dry-run の remote tag 検査は test-local fake git で固定する。
