---
plan_id: PLAN-L7-108-review-green-command-evidence
title: "PLAN-L7-108: review_evidence green command evidence gate 証跡ゲート"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L6-function-design/test-before-review.md
agent_slots:
  - role: tl
    slot_label: "TL - review_evidence green command evidence gate 確認"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-108-review-green-command-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-108-review-green-command-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/test-before-review.md
    artifact_type: design_doc
  - artifact_path: src/lint/review-evidence.ts
    artifact_type: source_module
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts.ts
    artifact_type: source_module
  - artifact_path: tests/review-evidence.test.ts
    artifact_type: test_code
  - artifact_path: tests/frontmatter.test.ts
    artifact_type: test_code
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
  requires:
    - docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
    - docs/plans/PLAN-REVERSE-108-review-green-command-evidence.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23"
    tests_green_at: "2026-06-23"
    verdict: approve
    scope: "IMP-108 green command evidence gate: 2026-06-23 以降に confirmed/completed となる review_evidence は構造化 command evidence を必須とし、schema、lint、design、requirements、tests を同時に更新する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\review-evidence.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: tests/review-evidence.test.ts
        output_digest: "sha256:dfbf0e3feee78280b464dbae6e28bc3b5c0a652e416c6587f14c2d90c95f6af2"
      - kind: unit_test
        command: "bun test tests\\frontmatter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: tests/frontmatter.test.ts
        output_digest: "sha256:b46430994b78734df2bb5fb9181fbb3719a14ad2fde17c82df2c7e874c50fdab"
      - kind: unit_test
        command: "bun test tests\\workflow-contracts.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: tests/workflow-contracts.test.ts
        output_digest: "sha256:3a7fba46f9ca618b4f1a6de1d58aad471aabdc0a9f254464bbeeae993bd6f5b2"
      - kind: doctor
        command: "bun run src\\cli.ts doctor"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: src/lint/review-evidence.ts
        output_digest: "sha256:e4709a1807e1532f2b31d9baa54773707355859ae06acd73e7214b434e830d44"
---

# PLAN-L7-108: review_evidence green command evidence gate 証跡ゲート

## 目的

`review_evidence.tests_green_at` が時刻順序だけを証明し、どの定量的な command set が
green だったかを示さない gap を閉じる。2026-06-23 以降に更新される新しい
review evidence は、構造化された green command evidence を持たなければならない。

## スコープ

- `review_evidence` parsing を `green_commands[]` で拡張する。
- 2026-06-23 以降に更新された confirmed/completed PLAN で、review entry が green command evidence を欠く場合、
  または nonzero/invalid command record を含む場合は fail させる。
- 同じ構造を frontmatter schema で扱えるようにする。
- `test_runs.output_digest` を追加し、workflow projection contract 経由で保持する。
- この rule を requirements と L6 function design へ back-propagate する。

## 受入条件

- legacy 2026-06-22 timestamp-only review evidence は valid のまま扱う。
- `green_commands[]` を持たない新しい 2026-06-23 confirmed review evidence は fail する。
- exit 0 の structured green command evidence は pass する。
- nonzero command exit code は fail する。
- `frontmatterSchema` は valid shape を受け入れ、nonzero exits を reject する。
- `recordTestRunEvidence` は `output_digest` を `test_runs` へ persist する。
- `bun test tests\review-evidence.test.ts` が pass する。
- `bun test tests\frontmatter.test.ts` が pass する。
- `bun test tests\workflow-contracts.test.ts` が pass する。
- `bun run typecheck`、`bun run lint`、`bun run src\cli.ts doctor` が pass する。
