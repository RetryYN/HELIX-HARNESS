---
plan_id: PLAN-L5-98-event-projection-checkpoint-replay
title: "PLAN-L5-98 (add-design): orchestration event projectionとcheckpoint replayの詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals: ["po_directive:Issue #215 event projectionとcheckpoint replayをMIC要件へexact traceして実装する"]
created: 2026-08-09
updated: 2026-08-09
owner: Claude / TL
github_issue_id: 215
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: event-projection-checkpoint-replay
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L4-72（orchestration event projectionとcheckpoint replayの基本設計）がconfirmedであり、8 componentの責務境界とfail-close 8系統、canonicalization契約とscope選択の責務分割が凍結済みである"
contract_postconditions: "event envelope／append-only log snapshot／projection snapshot／checkpoint record／checkpoint scope／recovery budgetのtyped schema、判定関数8種と各関数の判定順序、EVENT_* failure code 19種（うちEVENT_RECOVERY_REQUIREDはroute値でありunion memberは18種）、L8 unit oracle U-EPR-001..088を固定する"
contract_invariants: "append-only列を書き換えない、同一event_idのside effectは1回だけ、正規化とsha256算出はsrc/runtime/digest.tsのcanonicalJson／sha256Digestを使い第二の算出系を作らない、createL3G3LogicalDbReceiptを呼び出さない、scope未指定時に全体スコープへ暗黙フォールバックしない、#213／#214のreceipt・lease・accounting authorityを再実装しない"
contract_failures: "event片肺、exact set欠落とunknown field相殺、append-only違反、duplicate side effect、causal inversion、illegal transition、projection drift、orphan lane、checkpoint／HEAD／parent欠落、全体スコープdigest流用、non-idempotent replay、無制限retry"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "receipt検証・lease CAS・slot会計は#213／#214のexportへ委譲し、正規化とsha256算出はsrc/runtime/digest.tsの既存exportをそのまま使う。新規はpure judgementの6 schemaと8関数に限定し、新規DB table・新規CLI・network呼び出しを作らない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed schema・判定順序・digest責務分割の詳細設計" }
  - { role: qa, slot_label: "QA — U-EPR-001..088のunit oracle設計とmutation方針" }
  - { role: tl, slot_label: "TL — #213／#214資産との接続点監査とfailure code体系の重複排除" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md, artifact_type: test_design }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md
  requires:
    - docs/plans/PLAN-L4-72-event-projection-checkpoint-replay.md
  blocks:
    - issue:215
---

# orchestration event projectionとcheckpoint replayの詳細設計（L5/L8 pair）

## 目的

PLAN-L4-72 で凍結した責務境界を、typed schema・判定関数契約・failure code 体系へ降ろす。
event envelope の exact set 11 field、各関数の判定順序、checkpoint scope 選択と replay 照合の分離、
Recovery routing の bounded 性を固定し、L8 unit test design と pair で凍結する。

## 範囲

- typed schema 6 種。内訳は event envelope と append-only log snapshot、projection snapshot、
  そして checkpoint record・checkpoint scope・recovery budget の 6 件である。
- 判定関数 8 種（`admitEventEnvelope` / `evaluateCausalOrder` / `evaluateIdempotentIngest` /
  `evaluateLifecycleTransition` / `evaluateProjectionDrift` / `selectCheckpointScope` /
  `evaluateCheckpointReplay` / `routeRecovery`）の契約と判定順序。
- `EVENT_*` failure code 19 種（うち `EVENT_RECOVERY_REQUIRED` は route 値であり union member は 18 種）と、`WORK_GRAPH_*` / `WORKER_LIFECYCLE_*` / `SCHEDULER_*` を
  再定義しない透過契約。
- L8 unit oracle U-EPR-001..088 と mutation 方針。

## 範囲外

- 判定関数の実装本体と mutation runner の実行（後続 L6/L7 PLAN）。
- DB projection、CLI surface、GitHub Projects API 呼び出しの追加。
- MIC-R-01..04（#213）と MIC-R-05..06（#214）の再定義。

## 再利用資産

- `src/runtime/digest.ts`: `canonicalJson` と `sha256Digest`。正規化と算出のプリミティブとして
  そのまま使い、第二の canonicalization 規則・第二の sha256 算出系を定義しない。
- `src/runtime/work-graph-receipt-acceptance.ts`: `acquireWorkGraphLease` の fence token CAS。
  event の lease 系譜として参照するだけで、本層は lease を取得も解放もしない。
- `src/runtime/worker-lifecycle-receipt.ts`: `verifyWorkerLifecycleReceipt` による terminal 判定。
- `src/runtime/slot-scheduler-quota-handover.ts`: `admitSlotAccountingRow` による slot 会計。
- `src/doctor/l3-g3-logical-db-receipt.ts`: `createL3G3LogicalDbReceipt` は同じプリミティブを使う
  既存 authority だが、**本設計からは呼び出さない**（doctor 専用の重量関数であり、lane / event
  境界の scope 選択も持たない）。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L5 詳細設計 doc 起草（typed schema・判定順序・digest 責務分割・failure code） | [直列] | downstream_dependency (L8 oracle は L5 の failure code と判定順序に依存) |
| 2 | L8 unit test design 起草（U-EPR oracle と eligible 束縛表） | [直列] | downstream_dependency (Step1 の判定関数に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
