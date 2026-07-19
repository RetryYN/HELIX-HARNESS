---
plan_id: PLAN-L6-52-delegation-brief-substance
title: "PLAN-L6-52 (add-design): 委譲ブリーフ実質検査（thin-brief advisory）の機能設計"
kind: add-design
layer: L6
drive: agent
master_hub: true
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-337 で確定した委譲ブリーフ 4 marker 強制の advisory 拡張の L6 機能設計。guard の fail-close 挙動・gate 意味・L1/L3 要求は変更しない。"
owner: Claude (Fable)
parent_design: docs/skills/judgment-core.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - L6 機能設計（thin-brief contract / oracle 定義）"
  - role: tl
    slot_label: "TL - advisory 不変条件（allow/deny 不変）の境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-52-delegation-brief-substance.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/delegation-brief-substance.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - src/runtime/agent-guard-policy.ts
  references:
    - docs/plans/PLAN-L7-306-fable-advisor-roster-governance.md
    - docs/skills/judgment-core.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T00:20:00+09:00"
    tests_green_at: "2026-07-07T00:20:00+09:00"
    verdict: approve
    scope: "L6 thin-brief advisory 設計と L7 agent-guard oracle の対応を確認。allow/deny 不変を維持する補助設計ハブとして confirmed 化する。"
    worker_model: claude-fable
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/agent-guard-brief-substance.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T00:20:00+09:00"
        evidence_path: tests/agent-guard-brief-substance.test.ts
        output_digest: "sha256:5a88e5366962311c275aa32a028770fd02c9c2c25b5e95c92dc555e2d2af4708"
---

# PLAN-L6-52 (design): 委譲ブリーフ実質検査の機能設計

## 0. 目的

委譲ブリーフ 4 marker 強制（PLAN-L7-337）が marker 存在のみの検査で、空疎なブリーフを
素通りさせることを 2026-07-06 検査で確認した。実装前に `thinBriefMarkers` の contract・
advisory 不変条件（allow/deny 不変）・test oracle を L6 機能設計として確定する。

設計正本: `docs/design/harness/L6-function-design/delegation-brief-substance.md`
（contract: `thinBriefMarkers` / `BRIEF_MARKER_MIN_SUBSTANCE_CHARS` / allowlist 意図明文化。
oracle: U-BRIEF-001..005）。

## 1. 受入条件

- L6 設計 doc が §1 範囲 / §2 contract / §3 runtime 挙動 / §4 test oracle を備え、
  oracle ID（U-BRIEF-001..005）が PLAN-L7-344 のテストと 1:1 対応する。
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-52-delegation-brief-substance.md` green。
- 実装は本 PLAN では行わない（実装・検証は PLAN-L7-344 が担う）。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc 起草 → レビュー → confirm。
- step 2 (mode: serial): PLAN-L7-344 の実装解禁（design confirm 後）。
