---
plan_id: PLAN-L7-324-toolchain-pin-lint
title: "PLAN-L7-324 (impl): toolchain-pin lint"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-05
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-319 の provisional lint 確認から切り出した小粒度の L7 実装であり、新規 product requirement や上位設計の意味変更を追加しない。L6/L7 の関数契約と oracle 追跡は本 PLAN 内で更新済み。"
owner: Codex
parent_design: docs/plans/PLAN-L7-319-upstream-adoption-small-items.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: tl
    slot_label: "TL - provisional lint の toolchain-pin 欠落確認と doctor 配線"
  - role: qa
    slot_label: "QA - Bun engine / lockfile / frozen install oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-324-toolchain-pin-lint.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-319-upstream-adoption-small-items.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/toolchain-pin.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/toolchain-pin.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-319-upstream-adoption-small-items.md
  requires:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:17:55+09:00"
    tests_green_at: "2026-07-05T01:17:55+09:00"
    verdict: approve
    scope: "PLAN-L7-319 の provisional lint 欠落のうち toolchain-pin を独立実装した。Bun engine、lockfile、frozen install、source harness-check の bun-version 整合を doctor hard gate に接続し、consumer template の setup-bun.with 不在契約とは衝突させない。配布 surface の実切替や PLAN-M-02 rename cutover は行っていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/toolchain-pin.test.ts tests/lint-wiring.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:17:55+09:00"
        evidence_path: tests/toolchain-pin.test.ts
        output_digest: "sha256:2942bf9bcd83b40b192dab8d9d8b3c088cec6f6dd4e7e66d6e032647a81674cf"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:17:55+09:00"
        evidence_path: src/lint/toolchain-pin.ts
        output_digest: "sha256:a2a4344d05239450eacff43b857257d3c7928cc66973b8c03092a3e40273053f"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:17:55+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:c60738645a875208a6c70b1249ceee72f9fb4cd65cea45e5a4d66cf10075b273"
---

# PLAN-L7-324: toolchain-pin lint 実装

## 目的

上流突合 completeness pass で `toolchain-pin` lint が LOCAL に無いことが確定した。既存の
consumer readiness は `bun install --frozen-lockfile` と lockfile を扱っているが、source package と
GitHub Actions / template の toolchain 前提を doctor hard gate として一箇所で検査していなかった。

## スコープ

- `src/lint/toolchain-pin.ts` を追加し、`package.json.engines.bun`、`bun.lock` / `bun.lockb`、
  workflow / template の frozen install、source `harness-check.yml` の `bun-version` 整合を検査する。
- `src/doctor/index.ts` に `checkToolchainPin` を追加し、doctor hard gate として実行する。
- `tests/toolchain-pin.test.ts` と `tests/lint-wiring.test.ts` で pure oracle と runtime 到達性を固定する。
- L6 function spec と L7 unit test design を日本語で追跡更新する。

## 対象外

- consumer template の `setup-bun.with` 不在契約は変更しない。
- `.helix` / `helix` の物理 rename、distribution cutover、remote apply は PLAN-M-02 承認まで行わない。

## 受入結果

- `U-TOOLCHAIN-PIN-001..004` は green。
- `lint-wiring` は `toolchain-pin` が runtime entrypoint から到達可能であることを確認する。
- `doctor` は `toolchain-pin - OK` を出し、source package の toolchain drift を fail-close できる。
