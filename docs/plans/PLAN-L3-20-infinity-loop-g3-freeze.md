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
updated: 2026-07-26
owner: Codex / TL
github_issue_id: 30
behavior_contract_id: G3-FREEZE-FINAL
responsibility_owner: g1-g3-freeze-packet
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
  - artifact_path: docs/governance/l3-g3-logical-db-bootstrap-policy.json
    artifact_type: config
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
    - docs/plans/PLAN-L3-22-github-ci-performance-recovery.md
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
    - docs/plans/PLAN-L3-33-downstream-queue-numbering.md
    - docs/plans/PLAN-L3-34-residual-responsibility-recount.md
    - docs/plans/PLAN-L3-35-downstream-queue-correction.md
    - docs/plans/PLAN-L3-36-atomic-development-contract.md
    - docs/plans/PLAN-L3-37-atomic-downstream-queue.md
    - docs/plans/PLAN-L3-38-freeze-issue-projection-sync.md
    - docs/plans/PLAN-L3-39-po-decision-reflection.md
    - docs/plans/PLAN-L3-40-delivery-route-selection.md
    - docs/plans/PLAN-L3-42-delivery-route-downstream-queue.md
    - docs/plans/PLAN-L7-465-g3-logical-db-bootstrap-verifier.md
    - docs/governance/helix-harness-requirements_v1.3.md
    - tests/l3-g3-freeze-packet-v2.test.ts
  blocks: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-26T14:04:02Z"
    tests_green_at: "2026-07-26T13:48:49Z"
    verdict: advisory_approve_pending_l3_confirm
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #144 HEAD c189180a3a63efd3ee01f53dfab63865f59e3b8b のfreeze packet最終再束縛をclean detached checkoutで独立検証した。material HEAD/tree、28 artifact digest、exact 3-path scope、CI run 30203826582、logical DB checkpoint sha256:f60b674e05813ee5ad0ca1a991efd40a6488f48cba7ce4c4ccc0564cdb6b855e、stale/orphan/finding 0/0/0、converged=trueを確認し、Blocker/High 0でmergeを支持した。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/144#issuecomment-5083810101"
    green_commands:
      - kind: integration_test
        command: "npx --no-install vitest run && npx --no-install tsx src/cli.ts doctor"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-26T13:48:49Z"
        evidence_path: "https://github.com/RetryYN/HELIX-HARNESS/actions/runs/30203826582"
        output_digest: "sha256:fcf2fbf270df57c6d850ad79fcb104dae46f95c0d0d5cbb48219e8ae99fd31c4"
        result: "windows-durability-smoke and harness-check passed"
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

> 2026-07-26最終再束縛境界: 旧snapshotはPR #94以降の正本変更で失効した。PR #142までの採用済みmainを
> material snapshotとして一度だけ再束縛し、5問単位のPO認識合わせ、回答即時反映、未解決ゼロ監査、
> 全revision提示を経てから
> G1/G3最終承認を求める。packet PR current HEADの外部same-HEAD review・CI・DB receiptと
> merge tree同一性が揃うまでは承認不能である。

## §0 位置づけ

PO 判断 2026-07-20 (工程を L3 へ戻して全面改修) の先行successor群は、requirements v1.3 の
正本チェーン接続、Scrum→V entity model (SRV-FR-101〜112)、lifecycle 4 状態分離 (LSS-FR-01〜08)、
worker 共通契約 (WCC-FR-01〜08)、GitHub 運用投影 (GOP-FR-01〜14) を main へ着地させた。
本PLANは後続改訂も下記exact setにより **一つのsnapshot-bound G1/G3 packet** へ束ね、POの最終承認
(人間承認境界) で
L3 requirements freeze を成立させる。Issue #30 が予約していた freeze PLAN 名 `PLAN-L3-15-infinity-loop-g3-freeze`
は plan_id 衝突のため本 PLAN (L3-20) が正式名である (Issue #30 コメントで記録済み)。

承認は不可逆操作として action-binding とし、AI は packet 提示までを自走する (承認自体は実行しない)。
`src/doctor/l3-g3-logical-db-receipt.ts`はG3 packetの主張を反証可能にするbootstrap verification commandであり、
L6 canonical product implementationの分母へ算入しない。実行可能成果物の責務は
`PLAN-L7-465-g3-logical-db-bootstrap-verifier`へ分離し、本L3 freeze PLANはpolicyとpacketだけを所有する。

### Freeze対象PLAN exact set

次のJSON manifestをfreeze対象PLANの機械可読な正本とする。`PLAN-L3-20`は本packetのownerであり対象集合には
含めず、欠番`PLAN-L3-41`を範囲表現で補完しない。

<!-- freeze-target-plan-set:start -->
```json
{
  "schema_version": "helix-l3-g3-freeze-target-plan-set.v1",
  "plans": [
    "PLAN-L3-15-requirements-authority-chain-remediation",
    "PLAN-L3-16-scrum-reverse-entity-requirements",
    "PLAN-L3-17-lifecycle-state-separation-requirements",
    "PLAN-L3-18-worker-contract-benchmark-promotion",
    "PLAN-L3-19-github-operations-projection",
    "PLAN-L3-21-contextual-pr-review-db-convergence",
    "PLAN-L3-22-github-ci-performance-recovery",
    "PLAN-L3-23-github-approval-recovery",
    "PLAN-L3-24-github-environment-promotion",
    "PLAN-L3-25-github-update-lifecycle",
    "PLAN-L3-26-github-plan-workflow-governance",
    "PLAN-L3-27-github-trace-authority-hygiene",
    "PLAN-L3-28-feedback-test-owner-closure-disposition",
    "PLAN-L3-29-feedback-test-owner-recognition-disposition",
    "PLAN-L3-30-feedback-test-owner-direct-disposition",
    "PLAN-L3-31-feedback-test-owner-residual-disposition",
    "PLAN-L3-32-feedback-refactor-disposition",
    "PLAN-L3-33-downstream-queue-numbering",
    "PLAN-L3-34-residual-responsibility-recount",
    "PLAN-L3-35-downstream-queue-correction",
    "PLAN-L3-36-atomic-development-contract",
    "PLAN-L3-37-atomic-downstream-queue",
    "PLAN-L3-38-freeze-issue-projection-sync",
    "PLAN-L3-39-po-decision-reflection",
    "PLAN-L3-40-delivery-route-selection",
    "PLAN-L3-42-delivery-route-downstream-queue"
  ]
}
```
<!-- freeze-target-plan-set:end -->

## §工程表

### Step 1: freeze packet 起草 [直列]
- 直列理由 = **downstream_dependency** (packet は上記freeze対象PLAN exact setのmain着地HEADが前提)。
- `docs/governance/l3-rebaseline-g3-freeze-packet.md` を起草し、以下を bind する:
  reviewed commit (merge 済み HEAD SHA)、requirements v1.3 の版と digest、freeze対象PLAN exact set、
  design doc / acceptance doc一覧、FR集合 (SRV/LSS/WCC/GOP/GH)、既知の残debt、
  Issue #30/#73/#74/#75 disposition。

### Step 2: freeze対象PLAN exact setのconfirm昇格準備 [並列]
- manifestに列挙した各PLANの最終review evidenceを、PO承認後の同一episode commitで
  `approve_after_fixes` へ昇格する手順と対象行を packet に列挙する (silent overwrite 防止)。

### Step 3: 機械検証 [直列]
- 直列理由 = **downstream_dependency** (Step 1-2 の成果物を検証)。
- `helix plan lint` と `helix doctor` (plan-supersession / review-evidence / merged-plan-status /
  objective-evidence-audit) を green にする。

### Step 4: review 前置 [直列]
- 直列理由 = **downstream_dependency** (Step 3 green が前提)。
- packetをauthoring runtimeと異なる独立AI-Bがcross-reviewし、review_evidenceを記録する。
  その後 PO へ G1/G3 承認を提示する (承認は PO のみ、AI は実行しない)。

## §受入条件 (falsifiable AC)

- AC-1: `docs/governance/l3-rebaseline-g3-freeze-packet.md` が存在し、reviewed HEAD SHA・requirements v1.3
  digest・freeze対象PLAN exact set・design/acceptance doc一覧を含む (oracleで検証可能)。
- AC-2: packet の digest 群が実ファイルの sha256 と一致する (再計算で検証可能)。
- AC-3: `helix plan lint` exit 0、`helix doctor` exit 0。
- AC-4: cross-runtime review_evidence が本 PLAN frontmatter に記録される (tests_green_at ≤ reviewed_at)。
- AC-5: POのG1/G3承認はpacket記載のsnapshotへbindされ、承認前にmanifest記載PLANのverdict昇格や
  freeze 完了 claim を行わない (review-evidence gate IMP-080 で機械検査)。
- AC-6: 5問単位のPO回答が関連要件へ即時反映され、未解決ゼロ監査、全revision提示、Issue #30/#73/#74/#75
  disposition、packet PR current HEADの同一HEAD文脈review・CI・DB rebuild x2 receiptと
  merge tree同一性が揃うまでPO最終承認資料として提示しない。
- AC-7: G3用bootstrap verifierがversioned policyのcanonical JSON、table/column/row sort、
  正規化列exact set、checkpoint exact setを実計算し、同一HEADの2回rebuildでprojection/checkpoint digest一致、
  schema revision一致、stale/orphan/finding 0をexit code 0のtyped receiptとして出力する。
  policy/verifier digestと再現値はGitHub same-HEAD receiptへ固定する。freezeの主証拠はcheckpoint digest、
  table別row数、schema revision、stale/orphan/finding 0、converged=trueとし、projection/receipt digestの
  contract外runtime間一致は要求しない。L6実装完了とは扱わない。

## §6 用語更新 (§G.9)

- 新規語なし。「snapshot-bound approval」「action-binding approval」は既存 governance 語彙を使う。
