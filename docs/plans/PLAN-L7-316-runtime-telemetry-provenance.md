---
plan_id: PLAN-L7-316-runtime-telemetry-provenance
title: "PLAN-L7-316 (impl): runtime telemetry provenance 配線 — test_runs / guardrail_decisions / skill_invocations の session-log 由来化 + doctor model_runs overlay"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "上流 A-146 telemetry provenance gap を L7 の runtime projection 配線として閉じる。既存の session-log / harness.db projection / doctor model_runs overlay 境界に runtime-hook provenance rows を追加するだけで、L1-L6 の要求・設計意味は変更しない。"
owner: Claude (Opus) / Codex
parent_design: docs/design/helix/L6-function-design/upstream-substance-gap.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — 既存 classifyTelemetryProvenance + session-log parser で 4 派生を projection-writer/doctor へ配線"
  - role: tl
    slot_label: "TL — projection-only(facade) と runtime-hook provenance の分離・runtime_verification_events superset との整合レビュー"
  - role: qa
    slot_label: "QA — provenance 混入防止 (static review_evidence 由来を runtime と誤標識しない) の回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-316-runtime-telemetry-provenance.md
    artifact_type: markdown_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/projection-writer.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    - docs/design/helix/L6-function-design/upstream-substance-gap.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T03:45:00+09:00"
    tests_green_at: "2026-07-05T03:45:00+09:00"
    verdict: approve
    scope: "PLAN-L7-316 は session-log 由来の runtime telemetry provenance を projection-only rows から分離して配線した。Bash verification event は runtime-hook の test_runs、forced_stop event は runtime-hook の guardrail_decisions、helix skill suggest Bash event は runtime-hook:skill-suggest の skill_invocations として投影される。doctor model_runs overlay は既存の loadRuntimeSessionUsage / projectTokenUsage 配線を維持し、README は gate・証跡・完了条件に紐づけていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/projection-writer.test.ts tests/doctor.test.ts tests/token-tracker.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T03:45:00+09:00"
        evidence_path: tests/projection-writer.test.ts
        output_digest: "sha256:222e903caa49ec08e21d8d38dda0d140a50f0089cb4fb71a6bff8d65e604e980"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:45:00+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:45:00+09:00"
        evidence_path: docs/plans/PLAN-L7-316-runtime-telemetry-provenance.md
        output_digest: "sha256:11325bc719c7513ef369c127f79f1d45a214eac2fb89c3221d6c0c2674a858b5"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T03:45:00+09:00"
        evidence_path: docs/plans/PLAN-L7-316-runtime-telemetry-provenance.md
        output_digest: "sha256:dcbb805cbdf2cd1755c17ad17fceeae7cf08915fb1332db30049cf7cfd94fd31"
---

# PLAN-L7-316 (impl): runtime telemetry provenance 配線

## Objective

上流が confirmed で閉じた provenance 硬化（L7-193/199/200/201）に相当する gap が LOCAL に残る。
LOCAL の `test_runs` / `guardrail_decisions` / `skill_invocations` は projection-only（session-log 由来の
runtime-hook provenance を自動生成しない）で、`doctor` は `model_runs` runtime overlay を自動更新しない
（primitive `loadRuntimeSessionUsage` / `projectTokenUsage` は存在するが doctor 未配線）。LOCAL は既に
`src/runtime/upstream-adoption.ts` `classifyTelemetryProvenance` と `runtime_verification_events`（superset 設計）を
持つが **未配線**。上流 diff の bulk import ではなく、この既存 helper と session-log parser で 4 派生を配線する。

## スコープ

### IN
- `test_runs`: session-log の verification Bash event から runtime-hook 由来 row（session_id / runtime 明示）を派生。
- `guardrail_decisions`: session-log の `forced_stop` event から runtime-hook 由来 row を派生。
- `skill_invocations`: `helix skill suggest` Bash event を分類し runtime-hook 由来 row を派生。
- `doctor`: `loadRuntimeSessionUsage` / `projectTokenUsage` を doctor 実行内に配線し `model_runs` overlay を自動更新。
- 既存 `classifyTelemetryProvenance` / `RuntimeVerificationLogEvent` plumbing を再利用。

### OUT
- 上流の literal diff を bulk import しない（LOCAL の session-log utility で再実装）。
- projection-only row を runtime と誤標識しない（provenance を厳密分離）。

## 受入条件
- 4 派生が session_id / runtime-hook provenance を持ち、static review_evidence 由来と区別される。
- `doctor` 実行で model_runs runtime provenance が自動更新される。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: 既存 `classifyTelemetryProvenance` と session-log parser の再利用点を確認（TL）。
- Step 2: test_runs / guardrail_decisions / skill_invocations の runtime-hook 派生を実装（Red→Green）。
- Step 3: doctor へ model_runs overlay を配線。
- Step 4: provenance 混入防止 test → review → confirmed。

## 壊さない / 再発させない
- projection-only と runtime-hook を混同しない（facade を runtime と偽らない）。
- 既存 `runtime_verification_events` 設計と整合させる。

## レビュー / 次工程
- 実装は Codex で着地済み。基準点は `f38a2ba` 以降の HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2-#7 / §3.4。
- README は gate / evidence / completion surface ではなく、利用者導線の補助 doc として扱う。
