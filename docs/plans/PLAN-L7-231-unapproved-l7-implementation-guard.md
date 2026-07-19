---
plan_id: PLAN-L7-231-unapproved-l7-implementation-guard
title: "PLAN-L7-231 (troubleshoot): unapproved L7 implementation guard"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "IMP-125 は既存 Recovery / Reverse fullback で要求済みの工程逸脱防止を doctor gate へ落とす troubleshoot であり、新規 product requirement や外部 contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - IMP-125 workflow overstep prevention alignment"
  - role: tl
    slot_label: "TL - change-set integrity guard implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-231-unapproved-l7-implementation-guard.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/change-impact.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/change-impact.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/improvement-backlog.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-RECOVERY-03-codex-l7-overstep.md
  requires:
    - docs/plans/PLAN-RECOVERY-03-codex-l7-overstep.md
    - docs/plans/PLAN-REVERSE-31-codex-l7-overstep.md
    - docs/improvement-backlog.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:19:40+09:00"
    tests_green_at: "2026-07-09T18:19:40+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: unapproved L7 implementation guard / change-set integrity contract を現行 `tests/change-impact.test.ts` で再検証し、review_evidence.green_commands へ投影可能な実行証跡を追加する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "bunx vitest run --project fast tests/change-impact.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T18:19:40+09:00"
        evidence_path: tests/change-impact.test.ts
        output_digest: "sha256:6128840f61db294626b8e619542ef2558406c4486825193b21712647ba5dbd8d"
---

# PLAN-L7-231: 未承認 L7 implementation guard（unapproved L7 implementation guard）

## 0. 目的

IMP-125 は、Codex が L6 設計 / L7 PLAN / TDD Red entry を切らずに `src/**` 実装へ進んだ
Recovery 事象を再発防止へ落とす。既存の `change-impact` は source 変更に design/test が
同時にあるかは見るが、L7 実装 PLAN の種別、親 L6 設計、pair artifact、test evidence が揃うかまでは
見ていなかった。

この slice では `change-set-integrity` を doctor gate として強化し、`src/**` 変更時に L7 実装系 PLAN
契約が無い場合は fail-close する。

## 1. Scope

対象:

- `analyzeChangeSetIntegrity` に changed PLAN text を任意入力として渡せるようにする。
- `src/**` 変更があるとき、changed set 内に L7 実装系 PLAN (`impl` / `add-impl` / `refactor` /
  `retrofit` / `troubleshoot`) が無ければ `source-plan-missing` blocker を出す。
- L7 実装系 PLAN があっても parent L6 design / pair artifact / test evidence のいずれかを欠く場合、
  `source-plan-contract-missing` blocker を出す。
- doctor は `git status` の changed PLAN だけを読み、full repo scan ではなく current change set に限定して判定する。
- L6 function spec と L7 unit oracle を更新し、IMP-125 を backlog 上で implemented にする。

対象外:

- plan-lint の frontmatter schema 変更。
- historical PLAN の一括修正。
- `.helix` から HELIX への irreversible cutover。これは PLAN-M-02 の L14 承認後に扱う。

## 2. 受入条件

- `src/**` 変更 + L7 実装系 PLAN なしは doctor `change-set-integrity` で `ok=false`。
- `src/**` 変更 + L7 実装系 PLAN ありでも、parent/pair/test evidence が欠ける場合は `ok=false`。
- parent design、pair artifact、test evidence が揃う L7 実装系 PLAN は未承認 L7 blocker を出さない。
- docs-only / plan-only 変更は従来どおり warning surface に留まり、source 実装のない作業を過剰に block しない。

## 3. テスト設計接続

対応 oracle は `docs/test-design/harness/L7-unit-test-design.md` の `U-CHGIMPACT-005`、
`U-CHGIMPACT-006`、`U-CHGIMPACT-007`。実テストは `tests/change-impact.test.ts` に同 ID citation を持つ。

## 4. 完了条件

- [x] source 変更時の L7 PLAN 欠落を blocker 化している。
- [x] L7 PLAN の parent design / pair artifact / test evidence 欠落を blocker 化している。
- [x] doctor が changed PLAN text を `analyzeChangeSetIntegrity` に渡している。
- [x] L6 function spec / L7 unit test design / improvement backlog が同期している。
