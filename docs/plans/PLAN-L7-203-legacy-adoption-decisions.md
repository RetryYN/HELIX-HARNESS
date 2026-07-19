---
plan_id: PLAN-L7-203-legacy-adoption-decisions
title: "PLAN-L7-203 (add-impl): old HELIX の意味的採用判断契約"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/helix/L6-function-design/legacy-helix-extension.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - legacy HELIX semantic anti-corruption boundary"
  - role: se
    slot_label: "SE - pure decision contracts"
  - role: qa
    slot_label: "QA - U-HLX oracle coverage"
generates:
  - artifact_path: docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/legacy-adoption.ts
    artifact_type: source_module
  - artifact_path: tests/legacy-adoption.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
  requires:
    - docs/plans/PLAN-REVERSE-203-legacy-adoption-decisions.md
    - docs/design/helix/L3-requirements/legacy-helix-extension.md
    - docs/design/helix/L4-basic-design/legacy-helix-extension.md
    - docs/design/helix/L5-detail/legacy-helix-extension.md
    - docs/design/helix/L6-function-design/legacy-helix-extension.md
    - docs/test-design/helix/legacy-helix-extension.md
  references:
    - docs/design/helix/L6-function-design/legacy-helix-extension.md
    - docs/test-design/helix/legacy-helix-extension.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:00:00+09:00"
    tests_green_at: "2026-06-30T03:00:00+09:00"
    verdict: approve
    scope: "Old HELIX semantic adoption L6 contracts now have pure L7 decision helpers and U-HLX-001..013 unit coverage. The implementation rejects legacy runtime/state assumptions instead of porting Python/Bash code."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/legacy-adoption.test.ts tests/vmodel-pair.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: tests/legacy-adoption.test.ts
        output_digest: "sha256:c5b300b1fc82a220b8ccc11d3e4d0f14c9b8817654c1ad046c2b1525e976ece5"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: src/runtime/legacy-adoption.ts
        output_digest: "sha256:dc68d604d6fe36db8727e8f427622ccea283d2bcf88ff96030eaa3026783078e"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: src/runtime/legacy-adoption.ts
        output_digest: "sha256:dc68d604d6fe36db8727e8f427622ccea283d2bcf88ff96030eaa3026783078e"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: .helix/evidence/green-command/20260630-legacy-adoption-doctor.json
        output_digest: "sha256:5d88ccad441f6522019b75d4f72b9387ab9c347d9ad125cf4bf33b5b1800ccf5"
---

# PLAN-L7-203: old HELIX の意味的採用判断契約

## 目的

`legacy-helix-extension.md` で L6 に降ろした old HELIX の意味的採用契約について、
L7 の実装を行う。目的は旧 Python/Bash の runtime code を移植することではない。
反腐敗の判断を実行可能かつテスト可能にし、HELIX が legacy の runtime 前提を拒否しつつ、
有用な capability の意味は保持できるようにすることにある。

## 範囲

- `src/runtime/legacy-adoption.ts` に `U-HLX-001..013` 向けの純粋な判断 helper を実装する。
- `tests/legacy-adoption.test.ts` に絞った unit test を追加する。
- L7 の unit-test design に implementation oracle を登録する。
- 実装は既存の `runtime` building block の中に収め、新しい module-drift を避けつつ、
  provider-neutral な判断境界を保つ。

## 非対象

- この PLAN では old HELIX の Python modules、shell commands、`.helix` state、
  個人 workspace path は移植しない。
- この PLAN では新しい public CLI command は公開しない。helper は後続の
  CLI / doctor / adapter wiring に向けた純粋な L7 契約である。
- この PLAN では old-HELIX の product parity を完全一致とはみなさない。
  runtime parity は別スコープとして扱う。

## 受入条件

- `src/runtime/legacy-adoption.ts` が old HELIX L6 extension design で定義された
  全 function を実装していること。
- `tests/legacy-adoption.test.ts` covers `U-HLX-001..013`.
- legacy の personal/global path は current truth として拒否されること。
- stub / advisory の detector result では hard gate を閉じられないこと。
- unknown workflow と raw な legacy DB/state import は fail closed になること。
- continuous run には stop condition と verification evidence が必要であること。
- learning feedback だけでは acceptance を閉じられないこと。
- typecheck、lint、targeted V-model tests、doctor、full test suite が pass すること。
