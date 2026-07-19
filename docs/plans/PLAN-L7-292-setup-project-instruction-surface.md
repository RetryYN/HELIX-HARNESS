---
plan_id: PLAN-L7-292-setup-project-instruction-surface
title: "PLAN-L7-292: setup project instruction surface 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "root/runtime instruction の setup command 表記を正規 entrypoint へ揃える小変更。CLI 実装、D-API/D-DB、認証/secret、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup project instruction surface 固定"
  - role: qa
    slot_label: "QA - runtime instruction command surface 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-292-setup-project-instruction-surface.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-03-setup-solo-team.md
  requires:
    - docs/plans/PLAN-L7-03-setup-solo-team.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:45:00+09:00"
    tests_green_at: "2026-07-03T23:45:00+09:00"
    verdict: approve
    scope: "CLAUDE / AGENTS / .claude runtime instruction の setup command surface を `helix setup project` に揃え、legacy `helix setup` 表記へ戻らないようにする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/setup.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:45:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:b821623be01b93d264c3bb912b07bcb8e289f32e4d350e3ded3eff111f7e3350"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:45:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint --gate governance"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:45:00+09:00"
        evidence_path: docs/plans/PLAN-L7-292-setup-project-instruction-surface.md
        output_digest: "sha256:ba47a45c61e76af065d797717552aa148f87db32578aabf84dcc5ca803cbfac7"
---

## 目的

`helix setup project` が HELIX 導入済み VSCode で新規 project を始める正規 entrypoint になっている一方、root `CLAUDE.md` の Canonical Commands は `Setup: helix setup` のままだった。これは legacy solo/team adapter setup と HELIX project bootstrap を混同させる。

この PLAN では `CLAUDE.md` / `AGENTS.md` / `.claude/CLAUDE.md` の command surface を `helix setup project` に揃え、unit test で legacy setup 表記の復帰を fail-close する。

## DoD

- [x] `CLAUDE.md` の Canonical Commands は `Setup: helix setup project` を示す。
- [x] `AGENTS.md` と `.claude/CLAUDE.md` の runtime command surface も `helix setup project` を示す。
- [x] `Setup: helix setup` の legacy 表記が戻ると test が fail する。
- [x] CLI 実装、branch protection apply、secret / PII / external API apply、PLAN-M-02 cutover は変更しない。
