---
plan_id: PLAN-L3-20-infinity-loop-g3-freeze
title: "PLAN-L3-20 (add-design): L3 rebaseline snapshot-bound G1/G3 freeze packet v2"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-20 L3 rebaseline 改修完了後に G1/G3 を一回の snapshot-bound 承認へ束ねる (Issue #30 / #73)"
created: 2026-07-21
updated: 2026-07-24
owner: Claude / TL
github_issue_id: 30
parent_design: docs/design/helix/L3-requirements/scrum-reverse-entity-model.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — freeze packet の snapshot binding と AC 網羅のレビュー"
  - role: po
    slot_label: "PO — G1/G3 confirmation gate の一回承認 (人間承認境界)"
generates:
  - artifact_path: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  requires: []
  references:
    - docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
    - docs/plans/PLAN-L3-16-scrum-reverse-entity-requirements.md
    - docs/plans/PLAN-L3-17-lifecycle-state-separation-requirements.md
    - docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
    - docs/plans/PLAN-L3-19-github-operations-projection.md
    - docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md
    - docs/plans/PLAN-L3-22-github-ci-performance.md
    - docs/plans/PLAN-L3-23-github-approval-recovery.md
    - docs/plans/PLAN-L3-24-github-environment-promotion.md
    - docs/plans/PLAN-L3-25-github-update-lifecycle.md
    - docs/plans/PLAN-L3-26-github-plan-workflow-governance.md
    - docs/plans/PLAN-L3-27-github-trace-authority-hygiene.md
    - docs/plans/PLAN-L3-28-feedback-test-owner-closure-disposition.md
    - docs/plans/PLAN-L3-29-feedback-test-owner-recognition-disposition.md
    - docs/plans/PLAN-L3-30-feedback-test-owner-direct-disposition.md
    - docs/plans/PLAN-L3-31-feedback-test-owner-residual-disposition.md
    - docs/plans/PLAN-L3-32-feedback-refactor-disposition.md
    - docs/plans/PLAN-L3-39-po-decision-reflection.md
    - docs/governance/helix-harness-requirements_v1.3.md
    - tests/l3-g3-freeze-packet-v2.test.ts
  blocks: []
review_evidence:
  - reviewer: codex-tl
    review_kind: cross_agent
    reviewed_at: "2026-07-21T08:48:45+09:00"
    tests_green_at: "2026-07-21T08:48:31+09:00"
    verdict: advisory_approve_pending_l3_confirm
    scope: "PR #86 の freeze packet を cross-runtime review。material snapshot と packet review HEAD の混同を修正し、§2 digest 全件一致、L3正本成果物の後続変更なし、Blocker/High 0 を確認。PO の G1/G3 action-binding approval は未実施。"
    worker_model: claude-fable-5
    reviewer_model: codex-gpt-5
    green_commands:
      - kind: unit_test
        command: "detached HEAD cea9ebac で vitest run design-coverage/design-language/l12-hybrid-recognition/vmodel-pair/goal-evidence-audit --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-21T08:48:31+09:00"
        evidence_path: tests/design-coverage.test.ts
        output_digest: "sha256:9d58dbb39fd79d0d67f15ab14fc0b0c6767a4a2399456ad7f0fcd60c22fc6c5c"
        result: "108 passed"
---

# PLAN-L3-20: L3 rebaseline の snapshot 固定 G1/G3 freeze packet

> 2026-07-24再生成境界: 旧snapshotはPR #94以降の正本変更で失効した。L3-21〜39を含むv2 packetを
> 最終main HEADへ再束縛し、5問単位のPO認識合わせ、回答即時反映、未解決ゼロ監査、全revision提示を経てから
> G1/G3最終承認を求める。packet PR current HEADの外部same-HEAD review・CI・DB receiptと
> merge tree同一性が揃うまでは承認不能である。

## §0 位置づけ

PO 判断 2026-07-20 (工程を L3 へ戻して全面改修) の successor 群 PLAN-L3-15〜19 は、requirements v1.3 の
正本チェーン接続、Scrum→V entity model (SRV-FR-101〜112)、lifecycle 4 状態分離 (LSS-FR-01〜08)、
worker 共通契約 (WCC-FR-01〜08)、GitHub 運用投影 (GOP-FR-01〜14) を main へ着地させた。
本 PLAN はL3-21〜39の後続改訂も **一つの snapshot-bound G1/G3 packet** へ束ね、PO の最終承認 (人間承認境界) で
L3 requirements freeze を成立させる。Issue #30 が予約していた freeze PLAN 名 `PLAN-L3-15-infinity-loop-g3-freeze`
は plan_id 衝突のため本 PLAN (L3-20) が正式名である (Issue #30 コメントで記録済み)。

承認は不可逆操作として action-binding とし、AI は packet 提示までを自走する (承認自体は実行しない)。

## §工程表

### Step 1: freeze packet 起草 [直列]
- 直列理由 = **downstream_dependency** (packet は L3-15〜19 の main 着地 HEAD が前提)。
- `docs/governance/l3-rebaseline-g3-freeze-packet.md` を起草し、以下を bind する:
  reviewed commit (merge 済み HEAD SHA)、requirements v1.3 の版と digest、L3-16〜39 の design doc /
  acceptance doc 一覧、FR 集合 (SRV/LSS/WCC/GOP/GH)、既知の残 debt、Issue #30/#73/#74/#75 disposition。

### Step 2: L3-15〜39 の confirm 昇格準備 [並列]
- 各 PLAN の最終review evidenceを、PO 承認後の同一episode commitで
  `approve_after_fixes` へ昇格する手順と対象行を packet に列挙する (silent overwrite 防止)。

### Step 3: 機械検証 [直列]
- 直列理由 = **downstream_dependency** (Step 1-2 の成果物を検証)。
- `helix plan lint` と `helix doctor` (plan-supersession / review-evidence / merged-plan-status /
  objective-evidence-audit) を green にする。

### Step 4: review 前置 [直列]
- 直列理由 = **downstream_dependency** (Step 3 green が前提)。
- packet を別 runtime (Codex) が cross-review し、review_evidence を記録する。
  その後 PO へ G1/G3 承認を提示する (承認は PO のみ、AI は実行しない)。

## §受入条件 (falsifiable AC)

- AC-1: `docs/governance/l3-rebaseline-g3-freeze-packet.md` が存在し、reviewed HEAD SHA・requirements v1.3
  digest・L3-16〜19 design/acceptance doc 一覧を含む (grep で検証可能)。
- AC-2: packet の digest 群が実ファイルの sha256 と一致する (再計算で検証可能)。
- AC-3: `helix plan lint` exit 0、`helix doctor` exit 0。
- AC-4: cross-runtime review_evidence が本 PLAN frontmatter に記録される (tests_green_at ≤ reviewed_at)。
- AC-5: PO の G1/G3 承認は packet 記載の snapshot へ bind され、承認前に L3-15〜39 の verdict 昇格や
  freeze 完了 claim を行わない (review-evidence gate IMP-080 で機械検査)。
- AC-6: 5問単位のPO回答が関連要件へ即時反映され、未解決ゼロ監査、全revision提示、Issue #30/#73/#74/#75
  disposition、packet PR current HEADの同一HEAD文脈review・CI・DB rebuild x2 receiptと
  merge tree同一性が揃うまでPO最終承認資料として提示しない。

## §6 用語更新 (§G.9)

- 新規語なし。「snapshot-bound approval」「action-binding approval」は既存 governance 語彙を使う。
