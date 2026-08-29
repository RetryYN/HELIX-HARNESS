---
plan_id: PLAN-L7-645-derived-trace-entry-failure-oracle
title: "PLAN-L7-645 (impl): derived trace入口failure codeをexact固定する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 877
behavior_contract_id: DERIVED-TRACE-ENTRY-ORACLE-001
responsibility_owner: derived-trace-entry-failure-oracle
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L7-559のderived requirement trace compiler／validatorがmainへ統合済みである"
contract_postconditions: "malformed envelopeとmalformed trace graphが原因別のexact failure codeへ束縛される"
contract_invariants: "production compiler／validator semanticsを変更せず、入口failure identityだけをoracle化する"
contract_failures: "code substitution、guard removal、condition inversionでU-DTRACE-005をredにする"
tdd_red_required: true
red_test: "U-DTRACE-005でsource_envelope_invalid／trace_schema_invalid置換mutationを個別検出する"
red_at: "2026-08-21T04:33:44Z"
green_at: "2026-08-21T04:34:13Z"
mutation_oracle_evidence: "tests/derived-requirement-trace.test.ts: compile入口のsource_envelope_invalidをtrace_schema_invalidへ置換し2026-08-21T04:33:44ZにU-DTRACE-005がred。復元後、validator入口のtrace_schema_invalidをsource_envelope_invalidへ置換し2026-08-21T04:34:00Zに同oracleの別assertionがred。両方を復元し2026-08-21T04:34:13Zに5/5 green、src/workflow/derived-requirement-trace.tsのsource diff 0を確認した。"
complexity_effect: net_negative
complexity_justification: "実装分岐を増やさず、未識別だった二入口を一つのcharacterization oracleで固定する"
removal_trigger: "derived trace parserが置換され同等の入口failure-code mutation oracleへ移行した時"
parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #877 derived trace入口failure code oracle不足を回収する"
dependencies:
  parent: docs/design/helix/L6-function-design/derived-requirement-trace.md
  requires:
    - docs/plans/PLAN-L7-559-derived-requirement-trace.md
    - docs/plans/PLAN-REVERSE-186-derived-requirement-trace-backfill.md
  blocks:
    - issue:188
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-005, test_path: tests/derived-requirement-trace.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — derived trace入口failure code oracle検証" }
  - { role: tl, slot_label: "TL — production semantics不変とexact contract確認" }
generates:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/plans/PLAN-L7-645-derived-trace-entry-failure-oracle.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/derived-requirement-trace.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-21T07:02:18Z"
    tests_green_at: "2026-08-21T07:02:01Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    scope: "PR #890 exact HEAD 5ecb95be27f649f83e43985643af8d61f56a2a10を独立検収。Issue #877の入口2 code mutationを同じ手順で再実行し、source_envelope_invalid／trace_schema_invalidを2/2 killed、復元後5 tests green、production source bytesのHEAD一致を確認してblocker 0。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/890#issuecomment-5366337317。既存7 codeのmutation survivorは非blockerとしてIssue #892へ分離した。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/derived-requirement-trace.test.ts tests/ddd-tdd-rules.test.ts tests/plan-descent-specific-parent-binding.test.ts --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-21T07:02:01Z"
        evidence_path: tests/derived-requirement-trace.test.ts
        output_digest: "sha256:db370e3af987013333822f588192559117e4f50fdc39868b7b0c23adba65a92a"
        result: "3 files / targeted suite green; exact stdout digest recorded"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T07:02:18Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-21T07:02:18Z"
    evidence_digest: "sha256:b9df2cb09961b18d0105005527b23287d6eec11dcc55b06d7c1c2b1b087d633c"
  entries: []
---

# PLAN-L7-645: derived trace入口failure code oracle

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | malformed envelope fixtureを追加 | `source_envelope_invalid`だけを返す |
| 2 | malformed trace fixtureを追加 | `trace_schema_invalid`だけを返す |
| 3 | 入口別mutationを実測 | code substitutionが各assertionでred |
| 4 | targeted／typecheck／PLAN lint | 全gate green |
| 5 | Claude exact-HEAD独立review | blocker 0を確認 |

## 非対象

compiler／validatorのproduction semantics、#871のReverse観測、#186の終端stateは変更しない。
