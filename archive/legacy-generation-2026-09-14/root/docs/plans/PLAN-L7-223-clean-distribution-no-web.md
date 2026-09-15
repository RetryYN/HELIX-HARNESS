---
plan_id: PLAN-L7-223-clean-distribution-no-web
title: "PLAN-L7-223 (add-impl): clean distribution no-web contract hardening"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - clean distribution no-web contract"
  - role: qa
    slot_label: "QA - clean artifact acceptance"
generates:
  - artifact_path: docs/plans/PLAN-L7-223-clean-distribution-no-web.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-223-clean-distribution-no-web.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
  - artifact_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L3-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-157-distribution-clean-pull.md
  requires:
    - docs/plans/PLAN-REVERSE-223-clean-distribution-no-web.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T10:23:04+09:00"
    tests_green_at: "2026-07-01T10:23:04+09:00"
    verdict: approve
    scope: "Clean distribution now treats no-web as a distribution contract: `src/web/`, `tests/web.test.ts`, and frontend residue are excluded from clean artifacts while source-repo web implementation remains intact. Core CLI no longer statically imports the optional web module, so clean artifact status/distribution/typecheck can run without UI files."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
      - kind: smoke
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:3c11dda19ff144068769244a9dd28f02ff0c06328a98a1b9a354d5879b80ae5c"
      - kind: smoke
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/web.test.ts
        output_digest: "sha256:5a3fd2544c6bfa21ea4f0b57c63e9601e9d53dc4b5162b32e97bda1e248a5352"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:7961c43a561d23e29399061699265a57ea8bc6e747cbeb69a32c646445611660"
      - kind: smoke
        command: "sha256sum src/setup/index.ts docs/plans/PLAN-L7-157-distribution-clean-pull.md docs/design/harness/L6-function-design/setup-solo-team.md docs/design/helix/L6-function-design/pillar-function-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:418c5f478cfccae091d9f1df63125e1979593fb1733d315daa0365b09b94ebf1"
---

# PLAN-L7-223: clean distribution no-web 契約の強化

## 目的

PLAN-L7-157 R2/AC2 の意味のずれを閉じる。"No screen" は、現在の dashboard route が未使用であることだけでなく、
clean distribution が central UI runtime、web-only tests、frontend residue を含まないことを意味する。

## 範囲

- `src/web/` の clean distribution allowlist 例外を削除する。
- clean artifact から `tests/web.test.ts` を除外する。
- source-repo の web implementation と `tests/web.test.ts` は動作を維持する。
- `cli web render` は web module を optional runtime module として読み込み、core clean CLI surfaces が
  `src/web/` に static depend しないようにする。
- PLAN-L7-157、L6 design、L7 unit test design、L3 acceptance test design、HELIX pillar test design へ、
  強化した no-web contract を backfill する。

## 対象外

- source repository から `src/web/` は削除しない。
- central UI/serverless distribution は ship せず activate しない。
- 外部 clean GitHub repo、tag、release、signed tarball は作成しない。
- `旧 state path -> .helix` identifier migration は適用しない。

## 完了条件

- [x] `buildCleanDistributionPlan` excludes `src/web/` and `tests/web.test.ts`.
- [x] local clean artifact acceptance により、`src/web/` なしで install/status/distribution/typecheck できることを示す。
- [x] source-repo の `tests/web.test.ts` は green を維持する。
- [x] PLAN-L7-157 R2/AC2 と対応する L6/L7/L3 test designs が、同じ no-web meaning を共有する。
