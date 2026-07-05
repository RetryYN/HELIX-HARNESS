---
plan_id: PLAN-L7-333-l1-l2-gap-check-readonly
title: "PLAN-L7-333 (impl): L1/L2 gap-check read-only packet — 観点表 8 項目と A-40 route の CLI 結線"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-DISCOVERY-11 S4 confirmed の forward_route / Step 4 で確定済みの read-only gap-check 結線であり、新規 product requirement を追加しない。AI は L1/L2 を起草・確定せず、欠落候補を surface するだけという charter §3 境界を維持する。"
owner: Codex
parent_design: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/l1-l2-gap-check.test.ts
agent_slots:
  - role: tl
    slot_label: "TL - read-only gap-check packet と A-40 route / 3 round bound の契約確認"
  - role: qa
    slot_label: "QA - packet shape / CLI surface / no-write boundary oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-333-l1-l2-gap-check-readonly.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/l1-l2-gap-check.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/l1-l2-gap-check.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
  requires:
    - docs/plans/PLAN-DISCOVERY-11-l1-l2-elicitation-cycle.md
    - docs/plans/PLAN-L7-330-l1-l2-consistency-lint.md
  references:
    - docs/plans/PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback.md
    - src/lint/l1-l2-consistency.ts
    - docs/process/forward/L00-L06-design-phase.md
    - docs/process/gates.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T00:50:55+09:00"
    tests_green_at: "2026-07-06T00:50:55+09:00"
    verdict: approve
    scope: "PLAN-DISCOVERY-11 Step 4 の read-only gap-check 結線を L7 に着地した。`helix l1-l2 gap-check --json` は観点表 8 項目、3 round bound、A-40 route、既存 l1-l2-consistency 結果を返し、writePolicy=no-write / mustNotMutate=true / completionClaimAllowed=false を固定する。AI は L1/L2 の起草・受入・freeze を決めない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/l1-l2-gap-check.test.ts tests/l1-l2-consistency.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: tests/l1-l2-gap-check.test.ts
        output_digest: "sha256:f3435b4f0c1127cf10ef330910081950421ebd31bfbf9d2510a11510570b9132"
      - kind: unit_test
        command: "bun test tests/cli-surface.test.ts -t \"U-L1L2-009\" --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:2a1bea12ee17126c4d9fd5886cf2119332c43f373ecd2cad09adc8bd63cbd23d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: src/lint/l1-l2-gap-check.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: smoke
        command: "bun src/cli.ts l1-l2 gap-check --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:52465f53377f16e84bcf3b3f3f7dc9d58e94f6f593dcd29a10d733ae53bee1de"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-333-l1-l2-gap-check-readonly.md --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T00:50:55+09:00"
        evidence_path: docs/plans/PLAN-L7-333-l1-l2-gap-check-readonly.md
        output_digest: "sha256:de16fb18ac74b900fe69ba64b93b6b107778ea19fb676c23639b2c9cdf069ac2"
---

# PLAN-L7-333: L1/L2 gap-check 読み取り専用 packet

## 目的

`PLAN-DISCOVERY-11` が S4 confirmed で採用した L1⟷L2 反復ループのうち、Step 4「gap-check の read-only
結線」を L7 実装として閉じる。`PLAN-L7-330` は ID レベルの構造被覆 lint を実装済みであるため、本 PLAN は
観点表 8 項目、3 round bound、A-40 route、人-AI 権限境界を CLI packet として surface する。

## 実装

- `src/lint/l1-l2-gap-check.ts`: `buildL1L2GapCheckPacket` / `loadL1L2GapCheckPacket` /
  `l1L2GapCheckMessages` を追加。
- `src/cli.ts`: `helix l1-l2 gap-check --json` を追加。書き込みは行わず、構造 gap があれば exit 1。
- `docs/design/harness/L6-function-design/function-spec.md`: L6 契約表を追補。
- `docs/test-design/harness/L7-unit-test-design.md`: U-L1L2-007..010 を追補。

Hook 判定: direct hook 自動起動は N/A。理由は、L1/L2 は人が直接作成・収束宣言するフェーズであり、
hook が自動実行や自動修正の契機になると charter §3 の人-AI 境界を曖昧にするため。正式 surface は
repo-local read-only CLI packet（`helix l1-l2 gap-check --json`）で、handover / status / review 時に人または
エージェントが明示実行する。

## 受入条件

- packet は `writePolicy=no-write`、`mustNotMutate=true`、`completionClaimAllowed=false` を固定する。
- 観点表は 8 項目すべてを持つ。
- `maxRounds=3` と A-40 change-log route を落とさない。
- AI は欠落候補の surface のみを担い、L1/L2 の起草・受入・freeze・scope 分割を決めない。

## DoD

- [x] U-L1L2-007..010 を追加し targeted test green。
- [x] CLI `helix l1-l2 gap-check --json` が live repo で exit 0。
- [x] L6 / L7 test-design に contract を反映。
- [x] review evidence / green commands 記録済み。
