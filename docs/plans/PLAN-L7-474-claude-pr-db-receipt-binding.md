---
plan_id: PLAN-L7-474-claude-pr-db-receipt-binding
title: "PLAN-L7-474 (impl): Claude PR receiptのcanonical DB証拠束縛"
kind: impl
layer: L7
drive: agent
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-27 Issue #152を実案件としてClaude Code拡張の自動PR E2Eを実施する"
created: 2026-07-27
updated: 2026-07-27
owner: Codex / TL
github_issue_id: 152
engineering_discipline_required: true
behavior_contract_id: U-CPRCONV-004
responsibility_owner: claude-pr-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "Claudeがcurrent HEADのCI結果とreview verdictをpr-review-receiptへ渡す"
contract_postconditions: "approve receiptのDB証拠はrepository-owned logical DB verifierが同じprocessで生成したschema、projection/replay、checkpoint/replay、receipt digestへ束縛される"
contract_invariants: "caller supplied booleanまたは任意SHAをauthorityにせず、新command、新DB schema、新CI job、新dependencyを追加しない"
contract_failures: "canonical verifier非収束、schema不一致、projection/checkpoint replay不一致、caller claim不一致をfail-closeする"
tdd_red_required: true
red_at: "2026-07-27T22:50:00+09:00"
green_at: "2026-07-27T22:55:00+09:00"
mutation_oracle_evidence: "tests/claude-pr-convergence.test.ts のrowCounts-only ad-hoc digest反例が caller_db_claim_mismatch を検出する。caller supplied digestをそのままauthorityとして採用するmutationはこのoracleにkillされredになり、repository-owned receiptのprojection/checkpoint replay一致だけがapprove可能として残る"
complexity_effect: net_neutral
complexity_justification: "既存createL3G3LogicalDbReceiptをpr-review-receiptから直接再利用し、外部script、detector、永続schemaを増やさずcaller authorityを削除する"
removal_trigger: "Claude review receiptとlogical DB receiptが単一repository-owned typed evidence envelopeへ統合された時点でbinding helperを統合する"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-004, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — canonical DB receiptとClaude review receiptの束縛"
  - role: qa
    slot_label: "QA — ad-hoc digest、replay不一致、非収束反例"
  - role: tl
    slot_label: "TL — Claude Code拡張の実機PR E2E"
generates:
  - { artifact_path: docs/plans/PLAN-L7-474-claude-pr-db-receipt-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-27T13:55:00Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-27T14:18:00Z"
    evidence_digest: "sha256:9cae6e51e86fe20f903e458a77ac718d716bae974bd888824b94c8da4be5510e"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-27T14:18:00Z"
    tests_green_at: "2026-07-27T14:15:27Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #156 の current HEAD a4b3bc05 を clean detached worktree で独立レビューした。blocker 0。bindCanonicalLogicalDbReceipt は caller supplied 値が null/undefined 以外で canonical と相違すれば caller_db_claim_mismatch:<field> で fail-close し、返り値は常に repository-owned createL3G3LogicalDbReceipt の値で上書きするため caller authority が消える。approve path は schema helix-l3-g3-logical-db-bootstrap-receipt.v2、5 digest 全 present、projection/checkpoint の replay 一致、dbConverged を assertReviewReceiptInput で必須化する。verdict union は approve|block のみで、block は evaluateClaudePrMerge の review_not_approved により merge 0 のため、binding を approve に限定しても merge 経路に穴は無い。receipt schema v1→v2 昇格は line 247 の schemaVersion 検査で旧 receipt を fail-close する。実装 (src/、tests/) に blocker は無く、CI red は PLAN metadata 側に閉じていた: (1) evidence_digest プレースホルダ = plan-lint invalid_frontmatter (可視だった唯一の red)、(2) refactor_step: strengthen_contract が REFACTOR_STEPS enum 外、(3) mutation_oracle_evidence に kill signal 語が無く status=confirmed で発火、(4) src/cli.ts の import 追加による行ずれで config/digest-canonicalization-inventory.json 未再生成、(5) 同じ src/cli.ts 変更に対し docs/governance/feedback-refactor-disposition.json の source_file_sha256 (src/cli.ts を指す 8 binding) 未更新。(2)-(4) は plan-lint step で job が停止し doctor へ到達しなかったため未顕在だった latent red、(5) は full regression 到達後に顕在化した。全て本 PR 内で収束させた。非 blocker 2 件 (cli.ts の createL3G3LogicalDbReceipt 実配線に対する統合 oracle 不在、evaluateClaudePrMerge が dbConverged のみで replay 一致 field を再検査しない defense-in-depth) は Issue へ分離し current PR を収束させる。"
    green_commands:
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-27T14:12:00Z"
        evidence_path: src/runtime/claude-pr-convergence.ts
        output_digest: "sha256:3c1e18391f7b5a97325b7e54761daf9aef6f28a117c4b181d1f21e56b3020c1b"
        result: "exit 0"
      - kind: unit_test
        command: "npx --no-install vitest run tests/claude-pr-convergence.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-27T14:15:27Z"
        evidence_path: tests/claude-pr-convergence.test.ts
        output_digest: "sha256:72299339a39c02d9e70ab72284c58515fe725046196571c51ed208bd52bdaa2b"
        result: "10 passed"
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires:
    - docs/governance/l3-g3-logical-db-bootstrap-policy.json
    - src/doctor/l3-g3-logical-db-receipt.ts
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
  blocks:
    - G1/G3-PO-APPROVAL
---

# PLAN-L7-474: Claude PR receiptのcanonical DB証拠束縛

## 目的

Claudeのapprove receiptがcaller suppliedの`dbConverged=true`と任意SHAだけで成立する欠陥を閉じる。
既存のlogical DB verifierを`pr-review-receipt`自身が実行し、その完全な再現証拠をreview receiptへ束縛する。

## 非対象

- G1/G3承認または153件のdefinition freeze。
- 新しいdetector、DB schema、CI job、dependency。
- CI高速化またはClaude review laneの追加。

## 完了条件

- approve時にrepository-owned logical DB verifierがCLI process内で実行される。
- projection/checkpointのoriginalとreplayが一致し、`converged=true`の場合だけreceiptを発行する。
- schema versionとcanonical receipt digestをreview receiptへ含める。
- caller suppliedのrowCounts-only ad-hoc digestを拒否する。
- targeted test、typecheck、full CI、Claude Code拡張E2Eがgreenになる。
