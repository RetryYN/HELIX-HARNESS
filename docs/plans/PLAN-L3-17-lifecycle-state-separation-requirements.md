---
plan_id: PLAN-L3-17-lifecycle-state-separation-requirements
title: "PLAN-L3-17 (add-design): Design/Runtime/Release/Production Observation 4状態の別 entity・別 state machine 要件化"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-20 進捗値ではなく別entity・別state machineにする (harness memory key=requirements-nejire-fix-pending)"
created: 2026-07-20
updated: 2026-07-21
owner: Claude / TL
parent_design: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — 4状態 (design/runtime/release/production observation) の独立 state machine 設計レビュー"
  - role: qa
    slot_label: "QA — 状態昇格禁止 (設計済→運用観測済) の oracle 設計"
generates:
  - artifact_path: docs/plans/PLAN-L3-17-lifecycle-state-separation-requirements.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/lifecycle-state-separation.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/lifecycle-state-separation-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  requires:
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
  references:
    - docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  blocks: []
review_evidence:
  - reviewer: codex-tl
    review_kind: cross_agent
    reviewed_at: "2026-07-21T01:24:37+09:00"
    tests_green_at: "2026-07-21T01:24:22+09:00"
    verdict: approve_after_fixes
    scope: "PR #77: canonical L3↔L10 pair、design catalog、4状態分離と禁止昇格oracleをレビュー。指摘修正後 Blocker/High 0。L3 confirm は人間承認境界として未実施。"
    worker_model: claude-fable-5
    reviewer_model: codex-gpt-5
    green_commands:
      - kind: unit_test
        command: "vitest run design-coverage/design-language/l12-hybrid-recognition/vmodel-pair --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-21T01:24:22+09:00"
        evidence_path: tests/design-coverage.test.ts
        output_digest: "sha256:15b09b925033d57f78ff9361b28214f66171657abdc560065f991b3538fbf506"
        result: "94 passed"
---

# PLAN-L3-17: Design/Runtime/Release/Production Observation 4状態分離の要件化

## §0 位置づけ

現行 v1.3 は「実装済み能力と設計済み能力を同じ完成状態として表示しない」「`implemented` と `ux_verified` を
別々に導出する」という**表示・導出の分離原則**を持つが、Design / Runtime / Release / Production Observation の
4状態を**独立 entity・独立 state machine** として持つ要件は存在しない (2026-07-20 監査)。進捗値 (一次元
percent) による状態表現を禁じ、各状態を別 entity で管理し相互の昇格を receipt でのみ許す要件を L3 で定義する。

原則 (vmodel-docgen-fit §「設計済みであることを理由に運用観測済みへ昇格しない」を entity 規律へ昇格):

1. Design state: L1〜L5 設計資産の凍結状態。設計 green は他状態の根拠にならない。
2. Runtime state: L6〜L7 実装 / TDD closure。`implemented` は L6↔L7 receipt からのみ導出。
3. Release state: L8〜L11 検証と release evidence。CI green・approval receipt からのみ導出。
4. Production Observation state: L12 運用観測 (log/KPI/runtime verification/incident route)。real-data
   evidence からのみ導出し、設計・実装・release のいずれの green でも昇格しない。

## §工程表

### Step 1: 現行状態表現の棚卸し [直列]
- 直列理由 = **downstream_dependency** (Step 2 は棚卸し結果に依存)。
- vmodel-docgen-fit の `operation_observability_scope`、Design HARNESS の実装済み/設計済み/UX検証済み分離、
  PLAN-L7-56/REVERSE-56 (artifact progress state) を棚卸しし、進捗値表現が残る箇所を列挙する。

### Step 2: 4状態 entity / state machine 要件設計 [直列]
- 直列理由 = **downstream_dependency** (Step 1 が前提)。
- `lifecycle-state-separation.md` に 4 entity の状態・遷移・導出元 evidence 種別・禁止昇格 (cross-state
  promotion 禁止規則) と FR/AC を定義する。

### Step 3: acceptance test design [並列]
- `lifecycle-state-separation-acceptance.md` に禁止昇格 oracle (設計 green のみで observation 昇格 → 拒否、
  進捗値フィールドによる状態導出 → 拒否) を設計する。

### Step 4: v1.3 への要件昇格 [直列]
- 直列理由 = **file_conflict** (L3-15/16/18 と同一ファイル `helix-harness-requirements_v1.3.md` を編集)。
- 確定 FR/AC を v1.3 へ追記する。

### Step 5: 機械検証 + review [直列]
- 直列理由 = **downstream_dependency** (Step 2-4 green が前提)。
- `helix plan lint` / `helix doctor` green の後、review evidence を記録する。

## §進捗注記

- 2026-07-21: Step 1-3 完了 (設計 doc + acceptance test design 起草、PR #77)。Step 4 の v1.3 追記も同 PR に同梱。残 = Step 5 review。

## §受入条件 (falsifiable AC)

- AC-1: `lifecycle-state-separation.md` に 4 entity の独立 state machine (導出元 evidence 種別を含む) が存在する。
- AC-2: v1.3 に「単一進捗値による工程状態表現を canonical として禁止する」falsifiable AC が存在し、
  test design を cite する。
- AC-3: 「設計済みを理由に運用観測済みへ昇格しない」が entity 遷移規則 (禁止遷移) として AC 化される。
- AC-4: `helix plan lint` exit 0、変更対象に対応する `helix doctor` gate が green。変更外の既存 finding が
  残る場合は gate 名と非回帰根拠を review evidence に記録する。

## §6 用語更新 (§G.9)

- 新規語: 「lifecycle 4状態分離 (Design/Runtime/Release/Production Observation)」。design doc 確定時に
  L0 glossary へ登録する。
