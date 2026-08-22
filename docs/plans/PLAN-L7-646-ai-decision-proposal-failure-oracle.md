---
plan_id: PLAN-L7-646-ai-decision-proposal-failure-oracle
title: "PLAN-L7-646 (test): AI判断proposalのfailure codeを個別oracleへ固定する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
entry_signals: ["po_directive:Issue #874 proposal failure exact oracle"]
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 874
behavior_contract_id: AI-DECISION-PROPOSAL-FAILURE-ORACLE-001
responsibility_owner: ai-decision-proposal-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "validatorは8 failure codeを返すが、6 semantic branchはok=falseだけで検査され、branch削除やcode取り違えを検出できない"
contract_postconditions: "8 branchそれぞれを単独fixtureで発火させ、exact codeかつ単一findingとして固定する"
contract_invariants: "production validatorの意味論を変更せず、既存のproposal-only authority境界を維持する"
contract_failures: "failure branch削除、guard反転、code取り違え、複数fixture条件の混在をoracleが拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #874のmutation auditで6 branchがsurviveした既存Redを根拠とし、未記録timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "既存test helperを再利用し、1 test tableで8 branchのexact contractを固定する"
removal_trigger: "validatorがtyped exhaustive resultへ置換され、同等以上のbranch mutation oracleを持つ場合"
parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
pair_artifact: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, oracle_id: U-UWPROP-006, test_path: tests/ai-decision-proposal.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — failure branch個別fixtureとmutation検証" }
  - { role: tl, slot_label: "TL — production semantics不変とexact contract確認" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-21T09:33:08Z"
    tests_green_at: "2026-08-21T09:32:06Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    scope: "Claude Code収束レーン（model=claude-opus-5）がPR #885 exact HEAD 54ac93579c964e46a94ff43986cc0bdc0c554e55を独立検収した。Issue #874起票時と同じmutationを再実行し8 failure codeを8/8 killed・survived 0、復元後6 tests green、production source digestがHEADと同値、net src diff 0を確認してblocker 0。CI run 32466443231はfull regression、Biome、post-test DB rebuild greenで、doctorのdraft PLAN confirmation待ちだけがexpected red。実投稿receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/885#issuecomment-5368138043"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/ai-decision-proposal.test.ts 2>&1 | tail -15"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-21T09:32:06Z"
        evidence_path: tests/ai-decision-proposal.test.ts
        output_digest: "sha256:85cbec761704449a6459a98a275fef7eb61fd7dd02f0c30aa7653c6004494b8b"
        result: "1 file / 6 tests green"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T09:33:08Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-21T09:33:08Z"
    evidence_digest: "sha256:3709a06827a1d02ea8119b67c29625efd1e977ba03cbafa465da32105ab617cc"
  entries: []
mutation_oracle_evidence: "2026-08-21T04:43Zに8 branchの返却codeを一件ずつ別codeへ置換した。U-UWPROP-006が全8変異を個別にredとして検出し、killed=8、survived=0。各変異をapply_patchで復元後、production source差分0かつ6 tests greenを実測した。"
generates:
  - { artifact_path: docs/plans/PLAN-L7-646-ai-decision-proposal-failure-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ai-decision-proposal-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/ai-decision-proposal.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/design/helix/L6-function-design/ai-decision-proposal-authority.md
  requires: []
  references:
    - docs/plans/PLAN-L7-558-ai-decision-proposal-authority.md
  blocks: []
---

# AI判断proposal failure oracle

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | 8 branchの単独fixtureを追加 | [直列] | U-UWPROP-006 green |
| 2 | 各branchへmutationを一件ずつ注入 | [直列] | killed=8 / survived=0 |
| 3 | targeted、PLAN lint、typecheck | [直列] | 同一HEAD green |
| 4 | 独立reviewとCI | [review] | blocker 0 |

## §境界

`validateAiDecisionProposal`のproduction semantics、schema、failure code集合は変更しない。
本sliceは既存契約の検出力だけを強化し、switching／routing／allocationを実装しない。
