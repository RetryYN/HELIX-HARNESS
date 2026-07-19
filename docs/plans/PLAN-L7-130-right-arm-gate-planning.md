---
plan_id: PLAN-L7-130-right-arm-gate-planning
title: "PLAN-L7-130: right-arm gate planning"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-23
updated: 2026-07-02
owner: Codex
parent_design: docs/governance/helix-harness-requirements_v1.2.md
agent_slots:
  - role: tl
    slot_label: "TL - right-arm gate planning"
generates:
  - artifact_path: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/right-arm-gate-planning.ts
    artifact_type: source_module
  - artifact_path: src/lint/right-arm-verification-strategy.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/right-arm-gate-planning.test.ts
    artifact_type: test_code
  - artifact_path: tests/right-arm-verification-strategy.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
  requires:
    - docs/plans/PLAN-L7-95-lint-wiring-meta-gate.md
    - docs/process/gates.md
    - docs/improvement-backlog.md
    - docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T01:32:10+09:00"
    tests_green_at: "2026-07-02T01:32:10+09:00"
    verdict: approve
    scope: "Right-arm verification strategy now includes W3C WCAG 2.2 and Playwright Test as official source-ledger rows for G10/G11 browser/accessibility evidence. G10 requires WCAG success-criteria mapping plus Playwright trace/report, and G11 keeps manual accessibility/inclusive-user review route, preventing screenshot-only or automated-a11y-only completion claims."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/right-arm-verification-strategy.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:32:10+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:28f463388a08d9c964b98d9b3d16a5e2cc8f01d590769838e36d4a679ce8c325"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:32:10+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:9c9e42720d346296e1ca35a4ecef8559d6980261d076c3d6e91c07b198c2798c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:32:10+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:b46250174bd3896ca3859ab790545f78da712f0e90514d0abde184e0dbf5d6b9"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:32:10+09:00"
        evidence_path: docs/process/forward/L08-L14-verification-phase.md
        output_digest: "sha256:42af11edc5b7c2a378376c165741bd6d85e4160ad7f6f565780d3504079c5469"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:32:10+09:00"
        evidence_path: docs/process/gates.md
        output_digest: "sha256:9c83ff135bcf0e7857fe9abfcd313829cf802c79a4fed95e38aa527b0ef0f76a"
      - kind: smoke
        command: "sha256sum docs/test-design/helix/L4-pillar-system-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:32:10+09:00"
        evidence_path: docs/test-design/helix/L4-pillar-system-test-design.md
        output_digest: "sha256:dcaefa047b5b10cc8c7498860da2d05067e54176b8d3bb44883013ac9669de24"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T14:27:02+09:00"
    tests_green_at: "2026-07-01T14:27:02+09:00"
    verdict: approve
    scope: "Right-arm verification strategy now binds each official source ledger row to its expected official URL(s) and gate-impact meaning. Freshness tests inject a fixed now value and the refresh regression no longer passes when the heading replacement is a no-op."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/projection-writer.test.ts tests/right-arm-verification-strategy.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:d61657777102ee65bab0c9d4c76eb026633afa69e14c9098925814079fda5351"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:7fc4e2ddfb6fa7f48781929e249b45f151d10ee60650c55c10fae08f19ea727c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:7fc4e2ddfb6fa7f48781929e249b45f151d10ee60650c55c10fae08f19ea727c"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: docs/process/gates.md
        output_digest: "sha256:3b19226ee2809a7537604f8924f09336724689b9348696b95dbcdc3150465d85"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:27:02+09:00"
        evidence_path: docs/process/forward/L08-L14-verification-phase.md
        output_digest: "sha256:fed00c1c3c8f85ce76ff3e93614edbbc1111828bfd4ed9cc71ce265da61d5d19"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T16:55:32+09:00"
    tests_green_at: "2026-06-30T16:55:32+09:00"
    verdict: approve
    scope: "Right-arm verification source ledger now hard-gates gate-impact semantics: official source rows must map to recognized G8-G14/S3/S4/action-binding routes, and the ledger must cover every G8-G14 gate."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/right-arm-verification-strategy.test.ts tests/right-arm-gate-planning.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T16:55:32+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:d61657777102ee65bab0c9d4c76eb026633afa69e14c9098925814079fda5351"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T16:55:32+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:7fc4e2ddfb6fa7f48781929e249b45f151d10ee60650c55c10fae08f19ea727c"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:21:41+09:00"
    tests_green_at: "2026-06-30T14:21:41+09:00"
    verdict: approve
    scope: "Official source ledger hardening for the right-arm verification strategy."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/right-arm-verification-strategy.test.ts tests/right-arm-gate-planning.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:19:36+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:d61657777102ee65bab0c9d4c76eb026633afa69e14c9098925814079fda5351"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:31+09:00"
        evidence_path: tests/right-arm-verification-strategy.test.ts
        output_digest: "sha256:d61657777102ee65bab0c9d4c76eb026633afa69e14c9098925814079fda5351"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:21:41+09:00"
        evidence_path: src/lint/right-arm-verification-strategy.ts
        output_digest: "sha256:7fc4e2ddfb6fa7f48781929e249b45f151d10ee60650c55c10fae08f19ea727c"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T16:30:00+09:00"
    tests_green_at: "2026-06-23T16:30:00+09:00"
    verdict: approve
    scope: "G8-G14 carry is routed to concrete PLAN evidence and doctor fail-close coverage."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\right-arm-gate-planning.test.ts tests\\lint-wiring.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: tests/right-arm-gate-planning.test.ts
        output_digest: "sha256:f321df37a40bc2ea221a2a2ab9d07c36ff6c8be0e02524791c40d198e8e9fb3b"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T16:30:00+09:00"
        evidence_path: src/lint/right-arm-gate-planning.ts
        output_digest: "sha256:5c5df976593649215c875d844ac067a99e6a5f3bbe107843f565be01f97caacd"
---

# PLAN-L7-130: 右腕ゲート計画

## 目的

G8-G14 の右腕ゲート機械化 carry が、未計画または trace 不能な状態に残ることを防ぐ。

## スコープ

- IMP-052 carry に具体的な PLAN 証跡があることを確認する `doctor` hard gate を追加する。
- Treat `docs/plans/PLAN-L7-130-right-arm-gate-planning.md` and
  `docs/plans/PLAN-REVERSE-130-right-arm-gate-planning.md` を、この carry の最初の
  machine-readable route として扱う。
- G9-G14 の executable gate 全体実装は child PLAN の作業に残す。本 PLAN は route と
  evidence-profile の regression fence を担当し、G8-G14 が concept-only prose へ戻らないようにする。
- 右腕検証戦略を、URL、採用 version/date、最新の公式 status、採用判断、検証用途、gate impact を含む
  公式 `source-ledger` に基づける。外部標準は、名称だけの marker や古い version claim ではなく、
  意味を持つ根拠として取り込む。
- `source-ledger` の `gate impact` 値は、認識済みの G8-G14 / S3 / S4 /
  action-binding route へ対応させる。ledger 全体でも全 G8-G14 gate を覆うことを要求し、
  稼働中の公式 source table が、根拠づけるべき右腕検証 band から drift しないようにする。
- `source-ledger` の `workflow_route_impact` 意味レビューでは、G8-G14 / S4 /
  version-up / action-binding / cutover / completion を明示必須にする。source
  refresh が version-up activation や他の completion frontier route を暗黙に
  迂回しないための fail-close 条件として扱う。
- `source-ledger` の `checked` date は未来日でなく、90 日以内であることを要求する。行、URL、
  採用判断が存在していても、古い公式 `source-ledger` は G8-G14 証跡として無効とする。
- `source-ledger` の見出しは単一の hard-coded date ではなく、`checked YYYY-MM-DD` 形式で parse する。
  公式 source audit date を更新しても ledger rows が消えないようにする。
- 未計画、古い concept-only、profile-row 欠落、route 済みの各 case に targeted tests を追加する。

## 受入条件

- G8-G14 carry に具体的な PLAN reference が無い場合、`doctor` は fail する。
- carry が具体的な PLAN artifact で裏付けられている場合、`doctor` は pass する。
- `gates.md` が古い concept-only wording を再導入した場合、または
  `L08-L14-verification-phase.md` から G8-G14 evidence-profile row、公式 external
  source ledger entry、external test-basis marker、L14->L0 feedback evidence のいずれかが失われた場合、
  `doctor` は fail する。
- 右腕戦略から公式 URL、採用 version/date、最新の公式 status、採用判断、検証用途、gate impact、
  または agentic workflow completion claim に対する OWASP LLM06 human-approval boundary が失われた場合、
  `doctor` は fail する。
- `source-ledger` の `gate impact` 値が認識済みの G8-G14 / S3 / S4 /
  action-binding route でない場合、または source ledger が G8-G14 verification band 全体を覆わなくなった場合、
  `doctor` は fail する。
- `source-ledger` 意味レビューが `workflow_route_impact` から version-up または
  他の completion frontier route を落とした場合、`doctor` は fail する。
- 右腕検証 `source-ledger` の `checked` date が未来日、または 90 日より古い場合、`doctor` は fail する。
- 右腕検証 `source-ledger` が新しい有効な `checked` date へ更新され、各 row が維持されている場合、
  `doctor` は引き続き pass する。
- `lint-wiring` は runtime entrypoint を通じて、両方の right-arm lint module に到達する。
- reverse record は、これが G8-G14 gate 全体実装ではなく planning fail-close slice である理由を説明する。
