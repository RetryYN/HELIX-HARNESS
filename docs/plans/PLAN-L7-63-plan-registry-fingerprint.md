---
plan_id: PLAN-L7-63-plan-registry-fingerprint
title: "PLAN-L7-63: plan registry source fingerprint stale gate"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
status: completed
created: 2026-06-16
updated: 2026-06-16
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    worker_model: gpt-5.4
    reviewer_model: gpt-5.4
    tests_green_at: "2026-06-16"
    reviewed_at: "2026-06-16"
    verdict: pass
    scope: "plan_registry source_hash projection and drive-db-registration same-count stale detection"
agent_slots:
  - role: tl
    slot_label: "TL - plan registry fingerprint stale gate"
generates:
  - artifact_path: src/schema/harness-db.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/state-db/drive-registration.ts
    artifact_type: source_module
  - artifact_path: src/lint/drive-db-registration.ts
    artifact_type: source_module
  - artifact_path: tests/drive-db-registration.test.ts
    artifact_type: test_code
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
  - artifact_path: tests/state-db.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L7-59
  requires:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-63: PLAN 登録 source fingerprint の stale gate

## Objective

永続化された `harness.db` の PLAN 登録鮮度を、件数だけでなく内容にも基づいて判定できるようにする。

`drive-db-registration` は、DB 行の欠落と PLAN 件数 drift をすでに検出している。永続化された
`plan_registry` の PLAN 件数が `docs/plans/*.md` と同じでも、古い markdown 内容から構築されている場合は
fail しなければならない。

## Scope

- 各 PLAN markdown file の sha256 として `plan_registry.source_hash` を追加する。
- `rebuildHarnessDb` の実行中に `source_hash` を projection する。
- `drive-db-registration` で、DB 側の aggregate fingerprint と現在の doc 側の aggregate fingerprint を比較する。
- 件数が同じまま内容だけが stale な場合の violation として、専用の `stale_plan_registry_fingerprint` を追加する。
- detector を direct metatest と projection/schema tests でカバーする。

## Verification

- [x] `bunx vitest run tests\drive-db-registration.test.ts tests\projection-writer.test.ts tests\state-db.test.ts`

## DoD

- [x] PLAN count drift は引き続き `stale_plan_registry` を報告する。
- [x] 件数が変わらない PLAN content drift は `stale_plan_registry_fingerprint` を報告する。
- [x] rebuild された DB rows は `source_hash` values を保持する。
- [x] 既存 DB migration は追加された `source_hash` column を修復する。
