---
plan_id: PLAN-L7-298-setup-bun-package-preflight-source
title: "PLAN-L7-298: setup Bun package preflight source metadata"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "HELIX project setup / distribution readiness の CI package preflight を構造化する限定修正。D-API/D-DB、認証/secret、外部 API apply、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: qa
    slot_label: "explorer - setup Bun package preflight source metadata"
  - role: tl
    slot_label: "TL - Bun official source metadata integration"
generates:
  - artifact_path: docs/plans/PLAN-L7-298-setup-bun-package-preflight-source.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
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
    reviewed_at: "2026-07-03T23:59:00+09:00"
    tests_green_at: "2026-07-03T23:59:00+09:00"
    verdict: approve
    scope: "consumerReadiness.ci.packagePreflight に Bun 公式 frozen-lockfile / lockfile / package scripts source metadata を追加し、setup / distribution acceptance / CLI surface / 設計 / テスト設計を同じ意味で固定する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:36428eef7618d14fd63ecf4aa1db4367f136cb0bf66c2a96ae84307a67b72348"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
---

## 目的

`harness-check.yml` と distribution acceptance は `bun install --frozen-lockfile`、`bun.lock` / `bun.lockb`、`package.json.scripts.helix` / `typecheck` / `test` を blocking preflight として扱っていた。

一方で `ConsumerReadinessPlan` / `distribution plan --json` の JSON surface は boolean check と command list だけを返しており、Bun 公式 source に基づく `--frozen-lockfile` の意味、lockfile 境界、package script 前提を構造化していなかった。

## Source 確認

- Bun `bun install` docs: `--frozen-lockfile` は lockfile の exact version を使い、lockfile を更新せず、`package.json` と `bun.lock` が不一致なら error。CI では `bun ci` と同等で、`bun.lock` commit が必要。
- Bun lockfile docs: 現行 default は text `bun.lock`、旧 binary lockfile は `bun.lockb`。
- Bun quickstart: `bun run <script>` は `package.json.scripts` を実行する。

## DoD

- [x] `ConsumerReadinessPlan.ci.packagePreflight` は install command、許容 lockfile、必須 scripts、対応 script command、Bun 公式 source metadata を返す。
- [x] `helix setup project --json` と `helix distribution plan --json` の readiness JSON で同じ metadata を確認できる。
- [x] setup unit、distribution acceptance、CLI surface のテストで source metadata を固定する。
- [x] L6 設計、HELIX L6 機能設計、L7 テスト設計を日本語で更新する。
- [x] 外部 API apply、secret、branch protection、identifier cutover は変更しない。
