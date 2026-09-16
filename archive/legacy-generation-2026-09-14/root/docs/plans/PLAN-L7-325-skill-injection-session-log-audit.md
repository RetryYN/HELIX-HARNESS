---
plan_id: PLAN-L7-325-skill-injection-session-log-audit
title: "PLAN-L7-325 (impl): skill_injection session-log 監査"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-05
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-321 の completeness pass 欠落から切り出した session-log の観測性強化であり、新規 product requirement や上位設計の意味変更を追加しない。L6/L7 の関数契約と oracle 追跡は本 PLAN 内で更新済み。"
owner: Codex
parent_design: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: tl
    slot_label: "TL - skill context injection の silent fail-open 監査"
  - role: qa
    slot_label: "QA - session-log digest / secret leakage oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-325-skill-injection-session-log-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/session-log.ts
    artifact_type: source_module
  - artifact_path: tests/session-log.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-321-completeness-pass-gaps.md
  references:
    - docs/governance/upstream-helix-reconciliation-completeness-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T01:26:26+09:00"
    tests_green_at: "2026-07-05T01:26:26+09:00"
    verdict: approve
    scope: "PLAN-L7-321 の residual gap のうち skill context injection の監査ログ欠落だけを独立実装した。adapter 起動前の injected / no_match / missing / failed を session-log event と digest failure に投影し、skill 本文・provider prompt・secret-like 値を durable log に残さない。CLI wiring、物理 rename、PLAN-M-02 cutover は行っていない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/session-log.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T01:26:26+09:00"
        evidence_path: tests/session-log.test.ts
        output_digest: "sha256:ebb3cb45ef6807d0076c7d3bf14cc9801ea11a2ef073294ceac5d51197e8bb08"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:26:26+09:00"
        evidence_path: src/runtime/session-log.ts
        output_digest: "sha256:d5511d2103b8e2cf465c9c4a95a1952f6821e1d9b569d6f88c7fd792ad8de73e"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T01:26:26+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:5ae568bcc0a32cf2b5505831295bdbffdac69bb5e4fbc1ceb2ba350d7cf613fc"
---

# PLAN-L7-325: skill_injection session-log 監査実装

## 目的

上流突合 completeness pass で、skill context injection が adapter 起動前の opportunistic 処理として
失敗しても provider 起動を止めない一方、成功・no-match・missing・failed の結果が session-log / digest に
残らず、後続監査で silent fail-open になる余地があった。

## スコープ

- `src/runtime/session-log.ts` に `skill_injection` event と `recordSkillInjectionAttempt` を追加する。
- outcome は `injected` / `no_match` / `missing` / `failed` を区別し、`failed` だけ digest failures に残す。
- durable log の target は required / optional / missing の件数と sanitize 済み reason に限定し、skill 本文、
  provider prompt、secret-like 値を残さない。
- `tests/session-log.test.ts` に `U-SLOG-009` を追加し、event count、failure 投影、secret mask を固定する。
- L6 function spec と L7 unit test design を日本語で追跡更新する。

## 対象外

- `src/cli.ts` への runtime wiring は、同ファイルに他ランタイムの未コミット変更があるため本 PLAN では行わない。
- `.helix` / `helix` の物理 rename、distribution cutover、remote apply は PLAN-M-02 承認まで行わない。

## 受入結果

- `U-SLOG-009` は green。
- `compressPlanDigest` は `skill_injection` を event_counts に集計し、`failed` outcome を failures に投影する。
- reason に secret-like 値が含まれても `sanitize` 後の値だけが durable log / digest に残る。
