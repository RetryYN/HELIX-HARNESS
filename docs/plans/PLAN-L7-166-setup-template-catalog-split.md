---
plan_id: PLAN-L7-166-setup-template-catalog-split
title: "PLAN-L7-166: setup template catalog 分割"
kind: refactor
layer: L7
drive: agent
status: confirmed
created: 2026-06-25
updated: 2026-06-25
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "setup built-in GitHub templates と generated file catalog の behavior-invariant な分割。setup workflow、CLI/API、GitHub operation、persisted schema は変更しない。"
agent_slots:
  - role: se
    slot_label: "SE - setup template catalog 分割"
  - role: tl
    slot_label: "TL - setup invariant review 確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-166-setup-template-catalog-split.md
    artifact_type: markdown_doc
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-164-agent-slots-roster-split.md
  requires:
    - docs/process/modes/refactor.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T20:49:29+09:00"
    tests_green_at: "2026-06-25T20:49:29+09:00"
    verdict: approve
    scope: "setup behavior を維持したまま、setup built-in templates と common file catalog を sidecar module へ抽出する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\setup.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:48:29+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\setup.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:48:29+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:418c5f478cfccae091d9f1df63125e1979593fb1733d315daa0365b09b94ebf1"
      - kind: unit_test
        command: "npx --no-install vitest run tests\\setup.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T20:48:29+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:6eeaa921a28cf0d9a2d528c0580307c23bfc1dd6ef1c914cf1953837e86749fd"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:48:53+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:418c5f478cfccae091d9f1df63125e1979593fb1733d315daa0365b09b94ebf1"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T20:48:55+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:6eeaa921a28cf0d9a2d528c0580307c23bfc1dd6ef1c914cf1953837e86749fd"
---

# PLAN-L7-166: setup template catalog 分割

## 目的

runtime orchestration module から built-in GitHub setup templates と common generated-file catalog を移し、
`src/setup/index.ts` に残っている `split-module` 圧力を減らす。

## スコープ

- `TemplateSet`、`BUILTIN_GITHUB_TEMPLATES`、`COMMON_FILES` を `src/setup/templates.ts` へ移す。
- `src/setup/index.ts` は detection、planning、emission、state recording、branch-protection application、node deps を担当し続ける。
- setup tests は template type を sidecar module から import するよう更新する。

## 受入条件

- Setup behavior は変更しない。
- `tests/setup.test.ts`、typecheck、lint、DB rebuild、doctor が pass する。
- refactor detector は `src/setup/index.ts` を `split-module` candidate として報告しなくなる。
