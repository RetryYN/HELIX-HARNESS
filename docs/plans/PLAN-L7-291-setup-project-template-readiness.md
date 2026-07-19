---
plan_id: PLAN-L7-291-setup-project-template-readiness
title: "PLAN-L7-291: setup project docs/templates readiness 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "実配布テンプレの readiness drift を閉じる小変更。D-API/D-DB、認証/secret、外部 API apply、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup project docs/templates readiness 固定"
  - role: qa
    slot_label: "QA - 実配布テンプレ readiness 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-291-setup-project-template-readiness.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: docs/templates/adapter/AGENTS.md
    artifact_type: template
  - artifact_path: docs/templates/adapter/CLAUDE.md
    artifact_type: template
  - artifact_path: docs/templates/adapter/.claude/CLAUDE.md
    artifact_type: template
  - artifact_path: docs/templates/adapter/.claude/settings.json
    artifact_type: template
  - artifact_path: docs/templates/adapter/.claude/agents/
    artifact_type: template
  - artifact_path: docs/templates/adapter/.claude/commands/
    artifact_type: template
  - artifact_path: docs/templates/github/common/harness-check.yml
    artifact_type: template
  - artifact_path: docs/templates/github/common/escalation-stale.yml
    artifact_type: template
dependencies:
  parent: docs/plans/PLAN-L7-03-setup-solo-team.md
  requires:
    - docs/plans/PLAN-L7-03-setup-solo-team.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:25:00+09:00"
    tests_green_at: "2026-07-03T23:25:00+09:00"
    verdict: approve
    scope: "docs/templates 実体を `setup project` readiness contract に同期し、built-in fallback だけが green で実配布テンプレが stale になる経路を閉じる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/setup.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:25:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:2f70ab40feedf1212ac579b796585383e02863c18e4124f2b124c7653bdb84a6"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:25:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:25:00+09:00"
        evidence_path: docs/plans/PLAN-L7-291-setup-project-template-readiness.md
        output_digest: "sha256:f2d2a094de848ca749a6cf6dcf91174704d14c876ae1a957f1cf7647b2af7bd6"
---

## 目的

`src/setup/templates.ts` の built-in fallback は最新の HELIX project bootstrap 契約を持っていたが、`loadTemplates()` は `docs/templates/*` の現物を優先する。そのため、実配布テンプレが古いままだと built-in fallback の test が green でも、実際の `helix setup project` は `consumerReadiness.ok=false` になり得る。

この PLAN では `docs/templates/*` の adapter / workflow 実体を、completion review-bundle、version-up dry-run、team run dry-run、read-only escalation audit を含む setup readiness 契約へ同期し、`loadTemplates(process.cwd())` 経由の dry-run test で固定する。

## DoD

- [x] `docs/templates/github/common/harness-check.yml` が completion review-bundle、version-up dry-run、team run dry-run を含む read-only consumer smoke である。
- [x] `docs/templates/github/common/escalation-stale.yml` が write permission / placeholder / manual mutating trigger を持たない no-write route audit である。
- [x] adapter docs / Claude agent / slash command templates が completion review-bundle と `v0.1.4 --release-remote` の初回証跡導線を持つ。
- [x] `loadTemplates(process.cwd())` を使う `runHelixProjectSetup(...dryRun)` が `consumerReadiness.ok=true` を返す test を持つ。
- [x] branch protection apply、secret / PII / external API apply、PLAN-M-02 cutover は実行しない。
