---
plan_id: PLAN-L3-18-worker-contract-benchmark-promotion
title: "PLAN-L3-18 (add-design): モデル worker 共通契約と blind benchmark の requirements v1.3 昇格"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-20 Claude/Codex/Kimi/将来のGrokを同じ委譲面・sandbox・receipt・blind benchmarkで比較できる契約を要件化する"
created: 2026-07-20
updated: 2026-07-21
owner: Claude / TL
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — provider 横断 worker 契約 (委譲面/sandbox/receipt/blind benchmark) の要件レビュー"
  - role: aim
    slot_label: "AIM — 外部 AI worker の non-authoritative 境界と secret deny の監査"
generates:
  - artifact_path: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/worker-common-contract.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/worker-common-contract-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  references:
    - docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
    - docs/plans/PLAN-DISCOVERY-12-grok-build-worktree-precedent.md
    - docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md
  blocks: []
review_evidence:
  - reviewer: codex-tl
    review_kind: cross_agent
    reviewed_at: "2026-07-21T01:24:37+09:00"
    tests_green_at: "2026-07-21T01:24:22+09:00"
    verdict: approve_after_fixes
    scope: "PR #77: worker共通契約、blind benchmark、canonical L3↔L10 pair、design catalogをレビュー。指摘修正後 Blocker/High 0。L3 confirm は人間承認境界として未実施。"
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

# PLAN-L3-18: モデル worker 共通契約と blind benchmark の v1.3 昇格

## §0 位置づけ

blind benchmark による worker 比較・admit/retire は L3 設計文書 (`HR-FR-HIL-22`) に存在するが、要件定義書
requirements v1.3 本文へ昇格していない (2026-07-20 監査で検出したねじれの一つ)。また v1.3 §4.10 は外部 AI
worker の境界 (versioned descriptor / 隔離 worktree / secret task deny / non-authoritative output /
schema・digest 検証) を定めるが、**複数 provider (Claude / Codex / Kimi / 将来の Grok) を同一の委譲面・
sandbox・receipt・blind benchmark で比較する共通契約**としては書かれていない。本 PLAN は HIL-22 を v1.3 へ
昇格し、provider 横断の worker 共通契約を L3 要件化する。

入力 (inventory-first):

- `PLAN-DISCOVERY-12-grok-build-worktree-precedent` / `PLAN-DISCOVERY-13-kimi-worker-cli-poc` の S2 PoC 知見
  (S4 decide 前の Discovery 成果は仮説として扱い、正本 claim にしない)。
- `infinity-loop-platform-basic-design.md` の `agent_contract_versions` / `agent_muster_members` table 様式、
  `harness-agent-lifecycle.md` の `BlindPacketV1` / `blind_policy` 契約。
- `archive/obsolete-requirements-authority-pre153` の worker evaluation contracts 草稿 (salvage 判定は
  PLAN-L3-16 Step 1 と共同で行い、二重棚卸しを避ける)。

## §工程表

### Step 1: HIL-22 と §4.10 の突き合わせ [直列]
- 直列理由 = **downstream_dependency** (Step 2 の契約設計は差分表に依存)。
- HR-FR-HIL-22 (blind bench / scorecard / admit・retire) と v1.3 §4.10 の被覆差分表を作り、昇格対象 FR を確定する。

### Step 2: worker 共通契約の要件設計 [直列]
- 直列理由 = **downstream_dependency** (Step 1 が前提)。
- `worker-common-contract.md` に委譲面 (delegation surface)、sandbox (隔離 worktree / network・secret deny)、
  receipt (schema/digest 検証・worker_model/reviewer_model 記録)、blind benchmark (fixed fixture/rubric、
  重大 failure 非相殺、用途別 admit/retire) の provider 非依存 FR/AC を定義し、Kimi/Grok を同契約の
  instance として位置づける。

### Step 3: acceptance test design [並列]
- `worker-common-contract-acceptance.md` に oracle (smoke-only 採用拒否、blind packet への author claim 混入 0、
  provider 縮退時の fail-close、非 allowlist provider の起動拒否) を設計する。

### Step 4: v1.3 への要件昇格 [直列]
- 直列理由 = **file_conflict** (L3-15/16/17 と同一ファイル `helix-harness-requirements_v1.3.md` を編集)。
- §4.10 を worker 共通契約へ拡張し、HIL-22 との trace を張る。

### Step 5: 機械検証 + review [直列]
- 直列理由 = **downstream_dependency** (Step 2-4 green が前提)。
- `helix plan lint` / `helix doctor` green の後、別 runtime review (cross_agent 優先) を記録する。

## §進捗注記

- 2026-07-21: Step 1-3 完了 (設計 doc + acceptance test design 起草、PR #77)。Step 4 の v1.3 追記も同 PR に同梱。残 = Step 5 review。

## §受入条件 (falsifiable AC)

- AC-1: `worker-common-contract.md` に provider 非依存の委譲面 / sandbox / receipt / blind benchmark 契約が
  存在し、HR-FR-HIL-22 との trace が明記される。
- AC-2: v1.3 §4.10 に blind benchmark による admit/retire 要件が存在し、test design を cite する
  (prose claim のみは不可)。
- AC-3: Discovery 12/13 の成果を S4 decide 前に正本 claim へ昇格しないことが AC 化される。
- AC-4: `helix plan lint` exit 0、変更対象に対応する `helix doctor` gate が green。変更外の既存 finding が
  残る場合は gate 名と非回帰根拠を review evidence に記録する。

## §6 用語更新 (§G.9)

- 新規語: 「worker 共通契約 (worker common contract)」「blind benchmark」(HIL-22 由来語の v1.3 昇格)。
  design doc 確定時に L0 glossary へ登録する。
