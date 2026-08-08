---
plan_id: PLAN-L7-525-work-graph-receipt-acceptance
title: "PLAN-L7-525 (add-impl): work graphと三段receipt検収の機能設計と実装"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #213 work graphと三段receipt検収をMIC要件へexact traceして実装する"]
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 213
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: work-graph-receipt-acceptance
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-96のL5/L8 pairがconfirm・merge済み（PR #469）"
contract_postconditions: "delegation-request receiptとparent acceptance receiptのpure admissionが実装され、WORK_GRAPH_* 13 codeがexecutable oracleで到達可能になる"
contract_invariants: "既存worker-lifecycle-receipt／worker-review-receiptを入力契約として呼び出すのみで並行validatorを新設しない、DB／network／workflow変更0"
contract_failures: "U-WGR-001..045がexact set欠落・unknown field相殺・CAS stale・early release・ordering逆転・HEAD drift・self-acceptanceのmutantをRedにする"
tdd_red_required: true
red_at: "2026-08-08T10:09:16Z"
green_at: "2026-08-08T10:24:00Z"
mutation_oracle_evidence: "tracked runner `tests/tools/work-graph-mutation/run-mutation.ts` が source mutant 19 体を実生成して tests/work-graph-receipt-acceptance.test.ts を実行し、19/19 killed・survived 0・pattern_missing 0 で exit 0。U-WGR-044/045 は分岐到達 oracle であり、source mutation の裏付けは本 runner が担う"
complexity_effect: net_negative
complexity_justification: "pure functionの単一moduleへ集約し、既存receipt関数を再利用してwork graph側の重複判定を作らない"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md
pair_artifact: docs/test-design/helix/L8-work-graph-receipt-acceptance-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-001, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-002, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-003, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-004, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-005, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-006, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-007, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-008, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-009, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-010, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-011, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-012, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-013, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-014, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-015, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-016, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-017, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-018, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-019, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-020, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-021, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-022, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-023, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-024, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-025, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-026, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-027, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-028, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-029, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-030, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-031, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-032, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-033, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-034, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-035, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-036, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-037, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-038, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-039, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-040, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-041, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-042, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-043, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-044, test_path: tests/work-graph-receipt-acceptance.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, oracle_id: U-WGR-045, test_path: tests/work-graph-receipt-acceptance.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure admission実装と既存receipt関数への接続" }
  - { role: qa, slot_label: "QA — U-WGR-001..045のexecutable oracleとsource mutation" }
  - { role: tl, slot_label: "TL — L5契約との整合とfailure_reachability追随の監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/work-graph-receipt-acceptance.ts, artifact_type: source_module }
  - { artifact_path: tests/work-graph-receipt-acceptance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/work-graph-mutation/run-mutation.ts, artifact_type: script }
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-08T10:45:00Z"
  review_binding:
    reviewer: "code-reviewer independent subagent (AI-B)"
    reviewed_at: "2026-08-08T10:45:00Z"
    evidence_digest: "sha256:f23add648432c8267480c08de9f5a0675c68bbb41e38e3fb1e15272696ed445f"
  entries: []
review_evidence:
  - reviewer: "code-reviewer independent subagent (AI-B)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T10:45:00Z"
    tests_green_at: "2026-08-08T10:37:00Z"
    verdict: approve
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "worktree HEAD 0834d5bb の L6/L7 スライス（PLAN-L6-102、L6機能設計、src/runtime/work-graph-receipt-acceptance.ts、45 oracle test、mutation runner）を2ラウンド独立レビュー。Critical(parent acceptance receiptのtimestamp field名がL5正本sealed_atと乖離)→修正、Important(delegationのみWeakSet検証でtransport不可 / trust boundary未文書化)→verifyDelegationRequestReceiptのdigest fallback追加とL6 doc §6.1明文化、Minor(mutation claimの再現性 / U-WGR-016の弱いoracle)→tracked runner化と決定的期待値へ強化、を経て最終verdict=approve / blockers 0。レビュアーが45 oracle・tsc・mutation runner・plan lintを独立実測で再確認済み。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/work-graph-receipt-acceptance.test.ts tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/doc-consistency.test.ts tests/sub-doc-section-structure.test.ts tests/l3-g3-freeze-packet-v2.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T10:36:40Z", evidence_path: tests/work-graph-receipt-acceptance.test.ts, output_digest: "sha256:7420d122d377c01f194c8d8272b6ab08644f6a4dc8d3377af99c67fe08d3d634", result: "7 suites / 122 tests green" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-08T10:37:00Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
      - { kind: smoke, command: "npx --no-install tsx tests/tools/work-graph-mutation/run-mutation.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T10:30:00Z", evidence_path: tests/tools/work-graph-mutation/run-mutation.ts, output_digest: "sha256:1c64c9757f4b9cd6cc06592b9c02bf2fa62529afacb8f113cf7274aa7e84228f", result: "source mutant 19体 / killed 19 / survived 0 / pattern_missing 0" }
dependencies:
  parent: docs/plans/PLAN-L5-96-work-graph-receipt-acceptance.md
  requires:
    - docs/plans/PLAN-L5-96-work-graph-receipt-acceptance.md
  blocks:
    - issue:213
---

# work graphと三段receipt検収の実装（L7、pair は L6 機能設計）

## 目的

PLAN-L5-96 が固定した typed schema・判定契約・failure code を、pure function の単一 module として実装し、
L8 の unit oracle U-WGR-001..045 を Red→Green で通す。

## 範囲

- `src/runtime/work-graph-receipt-acceptance.ts`: delegation-request receipt と parent acceptance receipt の
  pure admission（exact set 検証・CAS/stale 判定・ordering 検証・同一 HEAD 検証・self-acceptance 拒否）。
- `docs/design/helix/L6-function-design/work-graph-receipt-acceptance.md`: 機能設計（関数分割と failure 到達表）。
- `tests/work-graph-receipt-acceptance.test.ts`: U-WGR 全 oracle の executable test。

## 範囲外

- DB projection・CLI 面・scheduler 連携（#214）・event projection/replay（#215）。
- 既存 `worker-lifecycle-receipt.ts` / `worker-review-receipt.ts` の schema 改変。

## 完了条件

- L8 の U-WGR-001..045 が executable test として green。
- `npx tsx tests/tools/work-graph-mutation/run-mutation.ts` が survived 0 で exit 0（source mutant 19 体）。
- L5 doc §7 design-reality-binding の `failure_reachability` を WORK_GRAPH_* 全 13 code で埋める。
- typecheck・doctor・plan lint green、独立 AI-B review approve。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L6 機能設計 doc 起草（関数分割・failure 到達表） | [直列] | downstream_dependency (実装は関数分割に依存) |
| 2 | Red test 先行（U-WGR 全 oracle）と pure admission 実装 | [直列] | downstream_dependency (Step1 の関数境界に従う) |
| 3 | failure_reachability 追随と全量検証（typecheck / doctor / plan lint） | [直列] | shared_state (実装確定後にのみ意味を持つ) |
| 4 | 独立 AI-B review と review_evidence 記録 | [直列] | shared_state (全量 green 後の判断) |
