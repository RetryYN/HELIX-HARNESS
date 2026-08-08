---
plan_id: PLAN-L5-97-slot-scheduler-quota-handover
title: "PLAN-L5-97 (add-design): 8-slot schedulerとquota handoverの詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals: ["po_directive:Issue #214 8-slot schedulerとquota handoverをMIC要件へexact traceして実装する"]
created: 2026-08-08
updated: 2026-08-08
owner: Claude / TL
github_issue_id: 214
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: slot-scheduler-quota-handover
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L4-71（8-slot schedulerとquota handoverの基本設計）がconfirmedであり、責務境界とfail-close 8系統、MIC-R-02の権限非移譲が凍結済みである"
contract_postconditions: "slot accounting row／bounded queue snapshot／quota handover packet／capacity evidence／conflict scopeのtyped schema、dispatch判定順序8段と各関数の判定順序、conflict exclusion 4軸、lease二重所有の判定キー、SCHEDULER_* failure code 16種、L8 unit oracle U-SSQ-001..065を固定する"
contract_invariants: "同時稼働slot ≦ capacity（1..8）、queue_limit必須、lease二重所有0、#213のlease／terminal receipt契約を破壊しない、per-task判定を再実装しない"
contract_failures: "exact set欠落とunknown field相殺、capacity超過、dependency前倒し、unbounded queue、lease二重所有、事後handover、handover packet欠落、ack再配送、failure isolation breach、undersized capacity evidence、時刻逆行、merge authority侵害"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "lease取得／解放とterminal判定は#213の既存exportをそのまま呼び、新規はpure judgementの5 schemaと7関数に限定する。新CASアルゴリズム・新DB table・新workflowを作らない"
removal_trigger: "not_applicable"
pair_artifact: docs/test-design/helix/L8-slot-scheduler-quota-handover-unit-test-design.md
agent_slots:
  - { role: aim, slot_label: "AIM — typed schema・判定順序・conflict exclusion 4軸の詳細設計" }
  - { role: qa, slot_label: "QA — U-SSQ-001..065のunit oracle設計とmutation方針" }
  - { role: tl, slot_label: "TL — #213 lease資産との接続点監査とfailure code体系の重複排除" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/slot-scheduler-quota-handover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-slot-scheduler-quota-handover-unit-test-design.md, artifact_type: test_design }
review_evidence:
  - reviewer: "code-reviewer independent subagent (AI-B)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-09T01:29:00+09:00"
    tests_green_at: "2026-08-09T01:07:18+09:00"
    verdict: approve
    worker_model: claude-opus-5
    reviewer_model: claude-sonnet-5
    scope: "L5/L8 pair（PLAN-L5-97、L5詳細設計、L8 unit test design）を3ラウンド独立レビュー。Round1（HEAD e7d33309）: Critical 3件（conflict exclusion 4軸の判定材料がaccounting row exact setにもdispatchシグネチャにも無く実装不能／acquireWorkGraphLeaseのfence_tokenがlane内カウンタのため単純比較では別laneを誤検出しhandover未解放を検出できない／SCHEDULER_QUEUE_BACKPRESSUREとSCHEDULER_MERGE_AUTHORITY_VIOLATIONに到達分岐が無い）とImportant 3件・Minor 2件を検出しrequest_changes。fix commit 792111b6で全件解消。Round2（HEAD 792111b6）: Critical 0、Important 3件（U-SSQ-030の文言が新判定キー未追随、admitQueueEntry判定順序1のoracle欠落、evaluateFrontierRecalculation判定順序3のnegative oracle欠落）とMinor 1件を検出しrequest_changes。fix commit aeb20dfbで全件解消。Round3（本ブランチHEAD 8645b0b0）: aeb20dfbの解消内容を独立検証し、L5詳細設計とL8 unit test designがaeb20dfbとバイト単位で一致すること、L8 §1と§4がU-SSQ-001..065で完全一致すること、design-reality-binding digestが実測一致することを確認してverdict=approve / blockers 0。reviewerはRequiredCellBindingV1の12 field exact setとacquireWorkGraphLeaseのfence_token算出を実読して確認し、16 failure code全てに到達関数と判定ステップが割り当たっていることを機械的に突合済み。なお本PLANのL5詳細設計は、後続のPLAN-L7-527（L6/L7実装スライス）の独立レビューで実装側のCAS wiring欠陥が検出されたことを受け、§2/§2.2/§5を実装の全分岐に合わせて同PLANで追補している（契約の変更ではなく、判定順序と透過規定の明文化）。"

    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-language.test.ts tests/design-reality-binding.test.ts tests/design-coverage.test.ts tests/sub-doc-section-structure.test.ts tests/doc-consistency.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-09T01:07:18+09:00", evidence_path: tests/design-reality-binding.test.ts, output_digest: "sha256:26491eb94a33d53fc2b4f4dbed2299ff007a224308a98af5c878b2a0a4c46960", result: "5 suites / 65 tests green" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-09T01:07:00+09:00", evidence_path: docs/plans/PLAN-L5-97-slot-scheduler-quota-handover.md, output_digest: "sha256:b1cd782b3f4c0f90ddda50c738da6695cea61fb864bce67f27e777378a401546", result: "PLAN checked=854、violation 0" }
dependencies:
  parent: docs/plans/PLAN-L4-71-slot-scheduler-quota-handover.md
  requires:
    - docs/plans/PLAN-L4-71-slot-scheduler-quota-handover.md
  blocks:
    - issue:214
---

# 8-slot schedulerとquota handoverの詳細設計（L5/L8 pair）

## 目的

PLAN-L4-71 で凍結した責務境界を、typed schema・判定関数契約・failure code 体系へ降ろす。
slot accounting row の exact set 9 field、dispatch 判定順序 8 段、conflict exclusion 4 軸、
quota handover packet の 5 必須要素、capacity evidence の lane 数検査を固定し、
L8 unit test design と pair で凍結する。

## 範囲

- typed schema 5 種（slot accounting row、bounded queue snapshot、quota handover packet、
  capacity evidence、conflict scope の各 schema 定義）。
- 判定関数 7 種（`admitSlotAccountingRow` / `evaluateDispatchAdmission` / `admitQueueEntry` /
  `evaluateQuotaHandover` / `evaluateSlotFailureIsolation` / `evaluateFrontierRecalculation` /
  `admitCapacityEvidence`）の契約と判定順序。
- `SCHEDULER_*` failure code 16 種と、#213 の `WORK_GRAPH_*` を再定義しない透過契約。
- L8 unit oracle U-SSQ-001..065 と mutation 方針。

## 範囲外

- 判定関数の実装本体と mutation runner の実行（後続 L6/L7 PLAN）。
- DB projection と CLI surface の追加。
- event projection と checkpoint replay の実装（#215）。
- GitHub Projects projection（MIC-R-07 系）。

## 再利用資産

- `src/runtime/work-graph-receipt-acceptance.ts`: `acquireWorkGraphLease` / `releaseWorkGraphLease`
  の fence token CAS と `WorkGraphLeaseV1` / `RequiredCellBindingV1`。
- `src/runtime/worker-lifecycle-receipt.ts`: `verifyWorkerLifecycleReceipt` による terminal 判定。

## §工程表 schedule

| Step | 作業内容 | 並列/直列 | 直列理由 |
|------|------|-----------|----------|
| 1 | L5 詳細設計 doc 起草（typed schema・判定順序・conflict exclusion・failure code） | [直列] | downstream_dependency (L8 oracle は L5 の failure code と判定順序に依存) |
| 2 | L8 unit test design 起草（U-SSQ oracle と eligible 束縛表） | [直列] | downstream_dependency (Step1 の判定関数に 1:1 対応させる) |
| 3 | review（独立 AI-B）と pair-freeze 準備 | [直列] | shared_state (両 doc 完成後の全体整合レビュー) |
