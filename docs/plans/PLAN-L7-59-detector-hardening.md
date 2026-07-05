---
plan_id: PLAN-L7-59-detector-hardening
title: "PLAN-L7-59: verification-profile と DB trace projection の detector hardening"
kind: impl
layer: L7
drive: db
parent_design: docs/design/harness/L4-basic-design/architecture.md
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
    scope: "verification-profile hard gate 配線、trace_edges projection、db-projection-ingestion meta tests、doctor hard-gate 集約 meta test"
agent_slots:
  - role: tl
    slot_label: "TL - detector hardening 対応"
generates:
  - artifact_path: src/lint/verification-profile.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/lint/db-projection-ingestion.ts
    artifact_type: source_module
  - artifact_path: tests/verification-profile.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
dependencies:
  requires:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-59: verification-profile と DB trace projection の detector hardening

## 目的

すべての green check は、harness detector が advisory summary を表示するだけでなく、実装 surface を実際に強制していることを意味しなければならない。この PLAN は、発見済みの detector gap を閉じる。

- `verification-profile` は surface-only message ではなく、doctor hard gate として動作する。
- External verification profile は既定で disabled のまま維持しつつ、detector が明示的な approval/refusal routing の存在を証明する。
- `trace_edges` は relation graph projection から投入され、空の場合は DB ingestion を失敗させる。
- 正当に 0 件になり得る optional telemetry/evidence table は、0 rows が偶発ではなく意図的であることを明示分類する。

## スコープ

- 純粋関数として `analyzeVerificationProfileGate` hard-gate analyzer を追加する。
- `verificationProfile.ok` を `runDoctor.ok` に配線する。
- relation graph node を `artifact_registry` へ、graph edge を `trace_edges` へ projection する。
- automatic DB projection ingestion requirements に `trace_edges` を追加する。
- `model_evaluations` と `retry_events` を evidence-gated zero table として分類する。
- gate 配線、fail-closed behavior、trace projection ingestion の meta test を追加する。

## 検証

- [x] `bunx vitest run tests\verification-profile.test.ts tests\db-projection-ingestion.test.ts tests\doctor.test.ts`
- [x] `bun run typecheck`
- [x] `bun run lint`
- [x] `bun src\cli.ts db rebuild --json`
- [x] `bun src\cli.ts db status --json`
- [x] `bun src\cli.ts doctor`

## DoD

- [x] `verification-profile` が `runDoctor.ok` に接続されている。
- [x] repo input を読めない場合、`checkVerificationProfile` は fail closed する。
- [x] Disabled/external profile recommendation は、implicit execution なしで approval/refusal routing を要求する。
- [x] DB rebuild 後、`trace_edges` が non-empty である。
- [x] DB rebuild 後、`orphanTraceEdges` は 0 のまま残る。
- [x] `trace_edges` が空の場合、DB ingestion detector は失敗する。
- [x] Zero evidence table は silent omission ではなく明示的に扱われる。
