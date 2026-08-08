---
plan_id: PLAN-L7-527-slot-scheduler-quota-handover
title: "PLAN-L7-527 (add-impl): 8-slot schedulerとquota handoverの機能設計と実装"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue #214 8-slot schedulerとquota handoverをMIC要件へexact traceして実装する"]
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 214
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: slot-scheduler-quota-handover
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-97のL5/L8 pairがconfirm済みであり、判定関数7種・判定順序・SCHEDULER_* failure code 16種が凍結されている"
contract_postconditions: "slot accounting／dispatch／queue／handover／failure isolation／frontier再計算／capacity evidenceのpure judgementが実装され、SCHEDULER_* 16 codeがexecutable oracleで到達可能になる"
contract_invariants: "#213のacquireWorkGraphLeaseを唯一のCASとして呼び出し第二のlease実装を作らない、DB／network／workflow変更0、agent-slotsのfail-open観測を判定入力にしない"
contract_failures: "U-SSQ-001..074がexact set欠落・unknown field相殺・capacity超過・dependency前倒し・unbounded queue・lease二重所有・事後handover・handover喪失・failure isolation breach・undersized capacity evidence・merge authority侵害のmutantをRedにする"
tdd_red_required: true
mutation_oracle_evidence: "tracked runner `tests/tools/slot-scheduler-mutation/run-mutation.ts` が source mutant 47 体を実生成して tests/slot-scheduler-quota-handover.test.ts を実行し、47/47 killed・survived 0・pattern_missing 0 で exit 0。初回 39 体では 2 体が生存し（exact set の surplus field 未カバー、handover 必須キー走査の到達不能な二重判定）oracle 追加と分岐削除で解消。独立レビューが検出した CAS 自己参照・failure code 再命名・未カバー分岐に対して mutant 8 体（handover-cas-observed-lease-self-referential 等）と oracle U-SSQ-066..074 を追加した"
complexity_effect: net_negative
complexity_justification: "pure judgementの単一moduleへ集約し、#213のlease CASとterminal receipt検証を再利用してscheduler側の重複判定を作らない"
removal_trigger: "not_applicable"
parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md
pair_artifact: docs/test-design/helix/L8-slot-scheduler-quota-handover-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-001, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-002, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-003, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-004, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-005, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-006, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-007, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-008, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-009, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-010, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-011, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-012, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-013, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-014, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-015, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-016, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-017, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-018, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-019, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-020, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-021, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-022, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-023, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-024, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-025, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-026, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-027, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-028, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-029, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-030, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-031, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-032, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-033, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-034, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-035, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-036, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-037, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-038, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-039, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-040, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-041, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-042, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-043, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-044, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-045, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-046, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-047, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-048, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-049, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-050, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-051, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-052, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-053, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-054, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-055, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-056, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-057, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-058, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-059, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-060, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-061, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-062, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-063, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-064, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-065, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-066, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-067, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-068, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-069, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-070, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-071, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-072, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-073, test_path: tests/slot-scheduler-quota-handover.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, oracle_id: U-SSQ-074, test_path: tests/slot-scheduler-quota-handover.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 判定順序とconflict exclusion 4軸のpure実装" }
  - { role: qa, slot_label: "QA — U-SSQ-001..074のexecutable oracleとmutation runner" }
  - { role: tl, slot_label: "TL — #213 lease資産の再利用境界と到達不能分岐の監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-slot-scheduler-quota-handover-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/slot-scheduler-quota-handover.ts, artifact_type: source_module }
  - { artifact_path: tests/slot-scheduler-quota-handover.test.ts, artifact_type: test_code }
  - { artifact_path: tests/tools/slot-scheduler-mutation/run-mutation.ts, artifact_type: script }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md
  requires:
    - docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md
  blocks:
    - issue:214
---

# 8-slot schedulerとquota handoverの実装（L7、pair は L6 機能設計）

## 目的

PLAN-L5-97 で凍結した typed schema と判定関数契約を、pure judgement の単一 module と
executable oracle へ降ろす。capacity 会計、dependency-aware dispatch、bounded queue の
backpressure、quota threshold 前 handover、slot 単位 failure isolation、merge authority の
非移譲、capacity evidence の lane 数検査を実装し、分岐網羅を mutation runner で機械裏付けする。

## 範囲

- `src/runtime/slot-scheduler-quota-handover.ts` の 7 export と `SCHEDULER_*` 16 failure code。
- `tests/slot-scheduler-quota-handover.test.ts` の U-SSQ-001..074（静的タイトルの `it()` と 1:1）。
- `tests/tools/slot-scheduler-mutation/run-mutation.ts` の mutant 47 体。
- L6 機能設計と L6 機能単体テスト設計の pair。

## 範囲外

- DB projection、CLI surface、GitHub Projects への投影。
- event projection と checkpoint replay の実装（#215）。
- 実運用の 8-lane 負荷 fixture 実行（capacity evidence の受理判定だけを実装する）。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L6 機能設計と L6 機能単体テスト設計の起草 | [直列] | downstream_dependency (実装は L6 の責務割付に従う) |
| 2 | pure judgement 7 関数の実装と 74 oracle の Red→Green | [直列] | downstream_dependency (Step1 の判定順序に写像する) |
| 3 | mutation runner の作成と生存 mutant の解消 | [直列] | shared_state (実装と oracle の両方を触るため) |
| 4 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (実装・oracle・doc の全体整合レビュー) |
