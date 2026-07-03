---
plan_id: PLAN-L7-248-setup-version-up-trace-backfill
title: "PLAN-L7-248: setup version-up trace backfill"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-247 で実装済みの version-up dry-run 初回証跡に対する trace backfill。L1/L3 の要求意味は変えず、L3 acceptance / L6 design / L7 test design の古い 8 行・7 task・11 command 記述を実装済み 9 行・8 task・12 command 契約へ追従する。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup/version-up trace backfill"
generates:
  - artifact_path: docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
  requires:
    - docs/plans/PLAN-L7-247-setup-version-up-first-run-evidence.md
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T11:52:15+09:00"
    tests_green_at: "2026-07-03T11:52:15+09:00"
    verdict: approve
    scope: "PLAN-L7-247 後に残った L3/L6/L7 の古い first-run verification 数と phase 列挙を backfill し、setup version-up dry-run を要求・設計・テスト設計の同じ意味に揃えた。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T11:52:15+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:2a50db686420b65591a416e3ebf37c63dfe787e9b4e749bddfcd59af4b4ba152"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T11:52:15+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:a701d132008767d49a39d1569fe68b54b906c0aac6baed82409d5b61915805a0"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-03T11:52:15+09:00"
        evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: smoke
        command: "bun run src/cli.ts db rebuild"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T11:52:15+09:00"
        evidence_path: .ut-tdd/harness.db
        output_digest: "sha256:6030fad56a7b1c4f8435677bcc4826dd1ed01d47dc16e8cb0aaf9088787cefc2"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-03T11:52:15+09:00"
        evidence_path: docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
        output_digest: "sha256:9e82bb97dad33c8ed8c62ef7b70a39e22bf12a46de673b7c4215867d22a1c2e1"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T11:52:15+09:00"
        evidence_path: docs/plans/PLAN-L7-248-setup-version-up-trace-backfill.md
        output_digest: "sha256:f04f0737d1bce7490401fcbc8b0db0a2526e881bcaa23dde1eaad06b58df47d6"
---

# PLAN-L7-248: setup version-up trace backfill

## 目的

PLAN-L7-247 で `ut-tdd setup project` の初回 workflow に
`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.3 --json` を追加した。
実装・テンプレ・テストは 9 行の first-run verification に進んだが、L3 acceptance / L6 design /
L7 test design の一部に、古い 8 行 matrix、7 task、11 command の説明が残っていた。

この PLAN では、その意味ずれを修正し、HELIX project setup の version-up dry-run が
「consumer repo で no-write / plan-only に確認する初回証跡」であることを設計層へ戻す。

## 変更

- L3 `HAC-P6-03a` の ready next action に version-up dry-run を追加した。
- L6 `setup-solo-team.md` の VSCode task、CI command 数、verification command、verification matrix、
  doctorBaseline、distribution acceptance の記述を 9 行 matrix / 8 task / 12 command 契約へ更新した。
- L7 `U-SETUP-013` / `U-SETUP-015` / `U-SETUP-017` / `U-SETUP-018` / `U-SETUP-019` を
  version-up dry-run 付きの実装済み契約へ更新した。

## 採用判断

- 採用: 設計・テスト設計を実装済みの `version-up-dry-run` phase に合わせる。
- 不採用: `version-up activation-packet` を consumer first-run 必須 command に昇格する。
- 不採用: `.ut-tdd` から `.helix` への cutover 記述を完了扱いに変える。PLAN-M-02 の approval gate は維持する。

## 完了条件

- `rg` で setup/version-up trace に残る古い matrix/task/command 件数表現が検出されない。
- `bun test tests/setup.test.ts tests/cli-surface.test.ts --timeout 180000` が green。
- `bun test tests/design-language.test.ts --timeout 180000` が green。
- `git diff --check` が green。
