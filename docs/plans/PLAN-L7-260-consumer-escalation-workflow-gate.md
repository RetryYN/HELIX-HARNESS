---
plan_id: PLAN-L7-260-consumer-escalation-workflow-gate
title: "PLAN-L7-260: consumer escalation workflow gate 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "consumer setup 生成 workflow の placeholder/noop を no-write route audit 契約へ置換する実装強化。外部 write や承認実行は行わない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - consumer escalation workflow gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-260-consumer-escalation-workflow-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - src/setup/templates.ts
    - src/setup/index.ts
    - src/doctor/index.ts
    - tests/setup.test.ts
    - tests/doctor.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T16:35:00+09:00"
    tests_green_at: "2026-07-03T16:35:00+09:00"
    verdict: approve
    scope: "consumer escalation workflow を placeholder/noop から read-only no-write route audit へ置換し、setup readiness と consumer doctor の fail-close 契約を追加した。外部 write、branch protection、rename/cutover apply は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/setup.test.ts tests/doctor.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:35:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:8d60a7e68c9ef3a4f1844db00db923a433476c97506b6d62cbb0fbd4dd65f4df"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:35:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:3b094c3de62b75ca9ac68aa6d197a1d9a2549f62e3e886fbde08fd5ea901f4a3"
external_source_basis:
  - name: GitHub Actions secure use
    url: https://docs.github.com/en/actions/reference/security/secure-use
    checked_at: 2026-07-03
    usage: "GITHUB_TOKEN minimum permissions / read-only contents 境界"
  - name: GitHub Actions GITHUB_TOKEN permissions
    url: https://docs.github.com/actions/reference/authentication-in-a-workflow
    checked_at: 2026-07-03
    usage: "workflow token の最小権限設定"
  - name: GitHub Actions pull_request_target secure use
    url: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
    checked_at: 2026-07-03
    usage: "pull_request_target を consumer setup 既定 workflow へ混ぜない根拠"
---

# PLAN-L7-260: consumer escalation workflow gate 強化

## 目的

HELIX project setup は `.github/workflows/escalation-stale.yml` も consumer repo に生成する。ここに
`echo escalation policy placeholder` のような placeholder/noop が残ると、運用入口が存在しているように見えても
handover / completion boundary / consumer doctor を実際には検証しない。

この PLAN は、配布 escalation workflow を schedule 起動の no-write route audit に置き換え、setup readiness と
consumer doctor の両方で退行を検出する。

## 変更

- built-in `common/escalation-stale.yml` を placeholder step から read-only HELIX route audit へ置換する。
- `analyzeConsumerEscalationWorkflowContract` を追加し、schedule、permission、secret、placeholder、固定 command set を検査する。
- `runHelixProjectSetup.consumerReadiness.artifactReadiness` が escalation workflow drift を `fix_consumer_readiness` へ戻す。
- `runConsumerDoctor --profile consumer` が `.github/workflows/escalation-stale.yml` の欠落・write 権限・placeholder を fail-close する。
- L6 setup design / L7 unit test design に U-SETUP-024 として契約を追記する。

## 境界

- GitHub issue 作成、label 変更、branch protection、ruleset、secret、外部 API 書き込みは実行しない。
- workflow は no-write evidence command のみを生成する。
- `PLAN-M-02` の rename/cutover approval と `.helix` 実移行は扱わない。

## 完了条件

- `escalation-stale.yml` が placeholder/noop ではなく no-write route audit になる。
- setup readiness が placeholder / write-capable escalation workflow を green にしない。
- consumer doctor が同じ退行を fail-close する。
- targeted tests、typecheck、plan lint、doctor が green。
