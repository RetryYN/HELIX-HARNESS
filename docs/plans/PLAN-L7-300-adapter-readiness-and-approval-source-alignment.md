---
plan_id: PLAN-L7-300-adapter-readiness-and-approval-source-alignment
title: "PLAN-L7-300: adapter readiness and approval source alignment"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
owner: TL (Codex)
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
pair_artifact: tests/action-binding-approval-readiness.test.ts
backprop_decision: not_required
backprop_decision_reason: "既存 L6 / L7 の consumer readiness と action-binding approval source 契約へ実装・root adapter docs を合わせる修正。新しい外部 API、DB schema、認証、PII、secret、破壊的操作は追加しない。"
agent_slots:
  - role: tl
    slot_label: "TL - root instruction and approval packet alignment"
  - role: qa
    slot_label: "QA - consumer doctor false-green audit"
generates:
  - artifact_path: docs/plans/PLAN-L7-300-adapter-readiness-and-approval-source-alignment.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/lint/action-binding-approval-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/action-binding-approval-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/handover.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
dependencies:
  parent: docs/design/helix/L6-function-design/pillar-function-design.md
  requires:
    - docs/process/forward/L08-L14-verification-phase.md
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:59:59+09:00"
    tests_green_at: "2026-07-03T23:59:59+09:00"
    verdict: approve
    scope: "In-session subagent audits identified two autonomous gaps: consumer doctor passed readiness-repair setup state, and action-binding approval packet omitted the OWASP WSTG source row required by L6/L7 docs. This PLAN closes those semantic gaps and localizes root adapter docs to Japanese-first prose."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/handover.test.ts tests/doctor.test.ts tests/design-language.test.ts tests/rule-drift.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:59:00+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:1ae66eb13dbf8b23448a48cf1760071e5244ce2eb8c65068ac3e619d2e6fc9a1"
---

# PLAN-L7-300: adapter readiness and approval source alignment

## 目的

root adapter instructions、consumer doctor、action-binding approval packet を、既存の日本語-first / consumer readiness /
approval source ledger 契約へ合わせる。

## 問題

- `CLAUDE.md` / `AGENTS.md` に英語 prose が残り、docs 日本語原則と root instruction surface が揃っていなかった。
- fresh consumer repo の `project-setup.json` が `readinessOk=false` / `nextRoute=fix_consumer_readiness` でも、
  `ut-tdd doctor --profile consumer` が green になり得た。
- `approvalVerificationCommandMatrix[]` が OWASP WSTG row を出さず、L6/L7 正本 docs の security testing source 要求を
  approval packet 単体で確認できなかった。

## 受入条件

- root adapter docs の変更箇所は日本語-first prose で、`rule-drift` marker と `ut-tdd` 機械識別子を保持する。
- consumer doctor は setup readiness が未充足の場合に `consumer-project-setup-state` violation を返す。
- action-binding approval packet は `web-security-testing-boundary` row を持ち、OWASP WSTG の source metadata を出す。
- CLI / handover summary の matrix 件数は WSTG row を含む 11 件を示す。

## 検証

検証結果は commit 前に `review_evidence.green_commands` へ digest 付きで更新する。
