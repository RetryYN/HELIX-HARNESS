---
plan_id: PLAN-RECOVERY-64-derived-trace-failure-code-oracles
title: "PLAN-RECOVERY-64: derived trace failure identity oracleをsite別に回復する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewer_session_id: 3a72c9e2-7bc9-451e-acae-ed368fbf0422
    reviewed_at: "2026-08-22T01:40:08Z"
    tests_green_at: "2026-08-22T01:38:17Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewed_head_sha: 25a7c354f5ac5057f0c0dfb1965c59287af9dc7d
    scope: "PR #921 HEAD 25a7c354をClaude Code OpusがIssue #892の正本8 failure identityへ限定してexact-HEAD reviewした。code substitution／guard・condition／path-site bindingを32 injectionで再実測しsurvivor 0、2 files／14 tests、typecheck、Biome、PLAN lint green、production source diff 0を確認した。targeted再実行後も同sessionのread-afterでAPPROVE／blocker 0を維持。canonical review comment: https://github.com/RetryYN/HELIX-HARNESS/pull/921#issuecomment-5377128693"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/derived-requirement-trace.test.ts tests/derived-requirement-trace-reviewed-safe.test.ts && npm run typecheck && npx --no-install biome check tests/derived-requirement-trace.test.ts && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-RECOVERY-64-derived-trace-failure-code-oracles.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-22T01:38:17Z"
        evidence_path: tests/derived-requirement-trace.test.ts
        output_digest: "sha256:e460ce3fcc4014d9b2e2921308c629cedc4ecc2eb16b63c5da83309def2d4c38"
        result: "2 files／14 tests、typecheck、Biome、PLAN lint green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: ["po_directive:Issue #892 derived requirement trace failure-code mutation survivors"]
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 892
behavior_contract_id: DERIVED-TRACE-FAILURE-CODE-ORACLE-002
responsibility_owner: derived-requirement-trace
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "既存validatorの8 failure siteでcode substitutionに加えてguard removal／condition inversion／path定数化mutationが生存する"
contract_postconditions: "8 failure siteを複数transitionの原因固有fixture、exact finding集合、exact pathへ束縛し、3 operatorのsite別mutationを全てkillする"
contract_invariants: "production compiler／validator semanticsを変更せず、compile入口2 codeの#877 oracleを再実装しない"
contract_failures: "別guardの同一codeによる偽kill、code集合だけの弱いassertion、production semantics変更、旧ADD_FEATURE identityへの回帰を拒否する"
tdd_red_required: true
red_at: "2026-08-21T07:03:10Z"
green_at: "2026-08-21T22:39:01Z"
mutation_oracle_evidence: "tests/derived-requirement-trace.test.tsで初回code substitution 8/8 kill後のClaude Opus exact-HEAD review（session 4ac5e40d-3605-4eba-9009-c388adaa56c8）がguard removal／condition weakening／path定数化4 survivorを実測した。U-DTRACE-006へworkflow／revision／snapshotの3 leg、U-DTRACE-007／012へ随伴findingを含むexact集合とliteral path、U-DTRACE-009／010へ第2transitionの欠落／重複両側、U-DTRACE-013へ全envelope pathを追加した。2026-08-21T22:37:36Z〜22:39:01Zに(1)graph identityのrevision＋snapshot leg除去、(2)validator path定数化、(3)cardinality `!== 1`→`< 1`、(4)artifact duplicate path定数化を各注入し全てexit 1、さらにcondition inversion `!== 1`→`=== 1`が8 failed／exit 1となることを実測した。再review session d3ffefcc-9f75-4689-a914-16936aec9dccで検出した欠落側 `.length !== 1`→`.length > 1` survivorは、U-DTRACE-009／010の0件leg追加後に2 tests failed／exit 1でkillした。current-main再review session ae0cb88f-94cc-4a7a-b110-ff64cec36a50で検出したtrace loop側の`source_snapshot_mismatch`／`source_transition_orphan` substitution survivorを回収し、session 45db6dcf-80b9-41dc-8815-ae44163ecc9fで検出したindex 0 literalization survivorを非先頭indexへ移した。site網羅review session 85b0b778-a928-4d52-a9a2-3029baaf4b0aで残ったartifact orphan/revision、trace revision、placement path、pair duplicate、reverse multiplicityをU-DTRACE-008／011／012へ追加し、code／guard／pathの兄弟siteまで回収した。各注入はrepo外scratchまたはapply_patchで即時復元し、production source diff 0を維持した"
complexity_effect: net_neutral
complexity_justification: "既存pure validatorを変更せず、L8 fixtureとexact assertionだけを追加する"
removal_trigger: "failure identityを型付きdiscriminated unionへ移行し、同等以上のsite別mutation oracleを後継suiteが所有した時点"
parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-006, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-007, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-008, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-009, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-010, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-011, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-012, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-013, test_path: tests/derived-requirement-trace.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — Issue #892 Recovery authorityとfailure identity境界" }
  - { role: qa, slot_label: "QA — 8 failure siteの原因固有fixtureとmutation kill" }
  - { role: se, slot_label: "SE — production semantics不変監査" }
  - { role: tl, slot_label: "TL — #186／#188 dependency解放判断" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-64-derived-trace-failure-code-oracles.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/derived-requirement-trace.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-559-derived-requirement-trace.md
  requires:
    - docs/plans/PLAN-L7-559-derived-requirement-trace.md
    - docs/plans/PLAN-L7-645-derived-trace-entry-failure-oracle.md
  references:
    - docs/plans/PLAN-REVERSE-186-derived-requirement-trace-backfill.md
  blocks: [issue:188]
---

# derived trace failure identity oracleのRecovery

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | Issue #892の旧ADD_FEATURE identityとstale dependencyをRecovery正本へ是正 | [直列] | Issue authority一致 |
| 2 | 8 failure siteの原因固有fixtureとexact assertionを追加 | [直列] | U-DTRACE-006〜013 green |
| 3 | code substitution／guard removal／condition inversionをsite別注入 | [直列] | mutation survivor 0 |
| 4 | targeted／全回帰／doctor／DB convergence | [直列] | current HEAD green |
| 5 | Claude Opus exact-HEAD独立review | [review] | blocker 0 |

## §責務境界

本Recoveryは`src/workflow/derived-requirement-trace.ts`を変更しない。#877が固定したcompile入口の
`source_envelope_invalid`とvalidate入口の`trace_schema_invalid`を再実装せず、同じcode文字列を返す
validator側envelope不正分岐は別siteとしてU-DTRACE-013で固定する。
