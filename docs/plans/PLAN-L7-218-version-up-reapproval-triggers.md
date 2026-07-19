---
plan_id: PLAN-L7-218-version-up-reapproval-triggers
title: "PLAN-L7-218 (add-impl): version-up activation reapproval triggers"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up reapproval triggers"
  - role: qa
    slot_label: "QA - activation packet drift regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-218-version-up-reapproval-triggers.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-211-version-up-readiness-gate.md
  requires:
    - docs/plans/PLAN-REVERSE-218-version-up-reapproval-triggers.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:50:58+09:00"
    tests_green_at: "2026-07-01T07:50:58+09:00"
    verdict: approve
    scope: "Version-up activation packets now expose reapprovalTriggers[] so HEAD/scope/source/evidence drift invalidates stale activation packets, dry-runs, and action-binding approvals. The packet remains plan-only and does not activate PLAN-L7-146, lift version_target, or touch external infra/secrets."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:a2be76547fa5120719aafcbd12f5acb6c7e250fa0f3ae88a1a3693fb87ecc5a2"
---

# PLAN-L7-218: version-up activation 再承認トリガー

## 目的

`version-up` の activation workflow で、packet、dry-run、approval evidence が一度 review された後、
`HEAD`、scope、source ledger、rehearsal evidence の drift 後にも再利用できてしまう穴を閉じる。
今後の activation は、action-binding execution の前に、同一の evidence snapshot を必ず再確認する。

## スコープ

- `version-up-activation-packet.v1` に `reapprovalTriggers[]` を追加する。
- `HEAD` と `release trigger` の `drift`、`approval scope` と `params` の `drift`、`source` と
  `external limit` の `drift`、`rehearsal` と `rollback evidence` の `drift` を対象にする。
- `version-up` mode docs と HR-FR-P1-02 / HC-P1 / HAT/HU test design を更新する。

## 非スコープ

- `PLAN-L7-146` は activate しない。
- `version_target` は削除しない。
- apply command や外部 Cloudflare / GitHub / secret action は追加しない。

## 外部根拠

この rule は既存の source ledgers に従う。release work は特定の version / release trigger に結び付く必要があり、
concurrency と approval scope は drift してはならない。rollback / provenance evidence は再現可能である必要があり、
source ledger の変更は date-only refresh ではなく workflow へ戻して扱う。

## 完了条件

- [x] Activation packet JSON に `reapprovalTriggers[]` を含める。
- [x] CLI activation packet smoke で trigger list を確認する。
- [x] Version-up process docs と対応する L3/L6 design / test-design を更新する。
- [x] Packet は plan-only のままとし、activation / apply permission は持たせない。
