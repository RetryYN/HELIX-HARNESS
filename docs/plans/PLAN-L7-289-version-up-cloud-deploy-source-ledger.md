---
plan_id: PLAN-L7-289-version-up-cloud-deploy-source-ledger
title: "PLAN-L7-289: version-up Cloud Deploy source ledger 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "version-up source ledger の必須行 enforcement を追加強化する。外部 activation 実行、D-API/D-DB、認証/secret、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/process/modes/version-up.md
pair_artifact: tests/version-up-readiness.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up source ledger 固定"
  - role: qa
    slot_label: "QA - Cloud Deploy source row 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-289-version-up-cloud-deploy-source-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-228-version-up-external-source-ledger.md
  requires:
    - docs/plans/PLAN-L7-228-version-up-external-source-ledger.md
    - docs/plans/PLAN-L7-265-version-up-security-checklist-evidence.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T22:15:00+09:00"
    tests_green_at: "2026-07-03T22:15:00+09:00"
    verdict: approve
    scope: "Google Cloud Deploy の deployment verification / canary / rollback を version-up source ledger の必須 row に固定し、prose-only の比較根拠へ戻らないようにした。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/version-up-readiness.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T22:15:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:eb589389c32052f2ccecc8a78bf7dad16b02e9d189af5f2c9e15e316721a2602"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T22:15:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:2a492cc4599b27e801dc1227fb948243f1efa93868c7b3de64304762682b3258"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T22:15:00+09:00"
        evidence_path: docs/plans/PLAN-L7-289-version-up-cloud-deploy-source-ledger.md
        output_digest: "sha256:d4423ea433e98e071becb21e6c89c2ff523f6086f02d541c39738f9f460b6b82"
---

## 目的

`docs/process/modes/version-up.md` は Google Cloud Deploy の deployment verification / canary / rollback を、version-up activation の検証・段階露出・rollback 比較根拠として本文で参照している。一方で source ledger の必須 row と analyzer binding が無いと、公式 source の URL や field impact が prose に残るだけで、表から落ちても検知できない。

この PLAN では 3 つの Google Cloud Deploy row を `Version-up source ledger` の必須行にし、`analyzeVersionUpReadiness` が row 欠落・URL drift・field impact 欠落を fail-close する。

## DoD

- [x] `Google Cloud Deploy verification` / `Google Cloud Deploy canary` / `Google Cloud Deploy rollback` が version-up source ledger の必須 row である。
- [x] 3 row が table から消えた fixture は `missingSourceLedgerRows` で fail-close する。
- [x] rollback row の URL drift は expected binding で fail-close する。
- [x] `PLAN-L7-146` は parked のままで、外部 activation / auth / secret / infra 変更を行わない。
