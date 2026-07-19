---
plan_id: PLAN-L7-402-class-method-contract-runtime-evidence
title: "PLAN-L7-402 (troubleshoot): class/method 契約の実行時証跡結合"
kind: troubleshoot
layer: L7
drive: be
status: completed
route_mode: incident
created: 2026-07-09
updated: 2026-07-09
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-09 ハイブリッド版への差し替え前に、L12 operation scope の class_method_contract 未観測を accepted runtime evidence で閉じる"
backprop_decision: not_required
backprop_decision_reason: "既存の direct design ID 結合ルールを使って runtime evidence を追加し、L6 function-spec と L7 unit test design への同期をこのPLANの generates に含めて完了する。追加の上位戻しPLANは不要。"
agent_slots:
  - role: tl
    slot_label: "TL - class/method 契約証跡の受理境界"
  - role: aim
    slot_label: "AIM - RUN & Debug evidence 投影"
  - role: qa
    slot_label: "QA - 単語一致誤昇格防止 oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-402-class-method-contract-runtime-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/current-location.test.ts
    artifact_type: test_code
  - artifact_path: tests/slow/doctor.test.ts
    artifact_type: test_code
  - artifact_path: .helix/evidence/run-debug/runtime-verification.jsonl
    artifact_type: doc_update
dependencies:
  parent: docs/plans/PLAN-L7-401-operation-test-evidence-tokenization.md
  requires:
    - docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
    - docs/plans/PLAN-L7-399-runtime-verification-schema-boundary.md
    - docs/plans/PLAN-L7-401-operation-test-evidence-tokenization.md
  references:
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T20:22:00+09:00"
    tests_green_at: "2026-07-09T20:22:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "class_method_contract を設計宣言だけで昇格せず、HOPS-VMFIT-CONTRACT-01 に結合した accepted runtime evidence で observed source へ接続した。単語一致だけでは昇格しない oracle を維持し、direct design ID 結合の positive oracle を追加した。"
    green_commands:
      - kind: smoke
        command: "bun src/cli.ts run-debug log --plan PLAN-L7-402-class-method-contract-runtime-evidence --claim observed --session codex-20260709-hybrid-vmodel --correlation class-method-contract-operation-scope-20260709 --evidence-path src/state-db/current-location.ts --requirement HOPS-VMFIT-CONTRACT-01 --occurred-at 2026-07-09T20:15:00.000+09:00 --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:15:00+09:00"
        evidence_path: .helix/evidence/run-debug/runtime-verification.jsonl
        output_digest: "sha256:a54cc31b1d859dce41bfe172c5d405964fb4d77908456430200feba5a57ebc0d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T20:10:13+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:b9bf0c8b3271279b9093018f851fa090139d503e934ca8af3ae2276f47f86c6c"
      - kind: unit_test
        command: "bun run test:fast -- tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:10:13+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:04db9b694c7d8379a6852bc83822d55d4728a4c84c722b4fcc266625077035c9"
      - kind: lint
        command: "bunx biome check tests/current-location.test.ts docs/design/harness/L6-function-design/function-spec.md docs/test-design/harness/L7-unit-test-design.md docs/plans/PLAN-L7-402-class-method-contract-runtime-evidence.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:10:13+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:17c22ab3b6013365360da7005fca33543e6062b55a2ef8b0c1bc7ed5fd115ca5"
      - kind: unit_test
        command: "bun run test:slow -- tests/slow/doctor.test.ts -t \"surfaces Project current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T20:17:20+09:00"
        evidence_path: tests/slow/doctor.test.ts
        output_digest: "sha256:4becf953fad6c3f69a956dc9dfbc8db9bc56132d8b163d643634fa5a9aef4522"
---

# PLAN-L7-402: class/method 契約の実行時証跡結合

## 目的

ハイブリッド版で要求された「クラスメソッドをちゃんと定義して短いコードで高品質に仕上げる」運用後 scope を、
設計宣言だけではなく RUN & Debug の accepted runtime evidence へ結合する。

## スコープ

- `HOPS-VMFIT-CONTRACT-01` に結合する runtime evidence を `.helix/evidence/run-debug/runtime-verification.jsonl` に追加する。
- `class_method_contract` は direct design ID に結合した accepted evidence で observed に昇格する。
- 単語一致だけの runtime evidence は observed に昇格させない。

## 受入条件

- `current-location --summary-json` の `operation_scope.observed_gap` が 0 になる。
- `doctor` の operation-scope watch は 0 になり、残る blocker は L14 claim と open L7 approval gate だけになる。
- `.helix/evidence/run-debug/runtime-verification.jsonl` は secret-like 値を含まず、`run-debug log` の completeness check を通過する。
